import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppStore } from '@/stores/appStore';

let syncTimeout: NodeJS.Timeout | null = null;
let unsubscribeFromStore: (() => void) | null = null;
let isHydrating = false;

/**
 * Initializes the sync engine when a user logs in.
 * 1. Fetches remote data from Firestore and updates local Zustand state.
 * 2. Subscribes to local Zustand changes to push updates to Firestore (debounced).
 */
export const initSyncEngine = async (userId: string) => {
  if (unsubscribeFromStore) {
    unsubscribeFromStore();
  }

  isHydrating = true;
  
  try {
    // 1. Fetch remote data from Firestore
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const remoteData = docSnap.data();
      // Hydrate Zustand with remote data
      // Only updating core persistent data, ignoring ephemeral notifications/pulse
      useAppStore.setState({
        products: remoteData.products || [],
        customers: remoteData.customers || [],
        sales: remoteData.sales || [],
      });
      console.log('✅ Remote data synced to local store.');
    } else {
      console.log('ℹ️ No remote data found for this user. Starting fresh.');
      // Optionally, push local data to remote if local has data but remote doesn't
      // This helps if they used it offline then signed up.
      const currentState = useAppStore.getState();
      if (currentState.products.length > 0 || currentState.sales.length > 0) {
        await setDoc(userDocRef, {
          products: currentState.products,
          customers: currentState.customers,
          sales: currentState.sales,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('❌ Failed to sync data from Firestore:', error);
  } finally {
    isHydrating = false;
  }

  // 2. Subscribe to local changes and push to Firestore debounced
  unsubscribeFromStore = useAppStore.subscribe((state, prevState) => {
    // Prevent pushing data back up immediately if we are in the middle of hydrating
    if (isHydrating) return;

    // Only sync if actual core data changed
    const coreDataChanged = 
      state.products !== prevState.products ||
      state.customers !== prevState.customers ||
      state.sales !== prevState.sales;

    if (coreDataChanged) {
      if (syncTimeout) clearTimeout(syncTimeout);
      
      // Debounce the write to Firestore (e.g., save 2 seconds after last edit)
      syncTimeout = setTimeout(async () => {
        try {
          const userDocRef = doc(db, 'users', userId);
          await setDoc(userDocRef, {
            products: state.products,
            customers: state.customers,
            sales: state.sales,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log('☁️ Local changes saved to cloud.');
        } catch (error) {
          console.error('❌ Failed to save changes to Firestore:', error);
        }
      }, 2000);
    }
  });
};

/**
 * Cleanup function, typically called on user logout.
 */
export const stopSyncEngine = () => {
  if (unsubscribeFromStore) {
    unsubscribeFromStore();
    unsubscribeFromStore = null;
  }
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }
};
