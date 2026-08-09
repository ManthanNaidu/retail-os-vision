import { doc, getDoc, getDocs, collection, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const ADMIN_PASSWORD = 'RETAILOS@MASTER2024';
export const ADMIN_KEY = 'retailos_admin_auth';

export interface StoreRecord {
  phone: string;
  ownerName: string;
  storeName: string;
  city: string;
  registeredAt: string;
  lastLogin: string;
  status: 'active' | 'trial' | 'suspended' | 'expired';
  trialEndsAt: string;
  paidUntil: string | null;
  plan: 'trial' | 'basic' | 'pro';
  notes: string;
  monthlyFee: number;
}

// Get all stores from Firestore
export async function getAllStores(): Promise<StoreRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, 'stores'));
    return snapshot.docs.map(doc => doc.data() as StoreRecord);
  } catch (err) {
    console.error("Error fetching stores:", err);
    return [];
  }
}

// Save a single store to Firestore (used by admin dashboard)
export async function saveStoreRecord(store: StoreRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'stores', store.phone), store);
  } catch (err) {
    console.error("Error saving store:", err);
  }
}

// Get single store by phone
export async function getStoreByPhone(phone: string): Promise<StoreRecord | null> {
  try {
    const docRef = doc(db, 'stores', phone);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StoreRecord;
    }
    return null;
  } catch (err) {
    console.error("Error getting store:", err);
    return null;
  }
}

// Register or update store on login
export async function registerStore(phone: string, ownerName: string, storeName: string): Promise<StoreRecord> {
  const existing = await getStoreByPhone(phone);
  
  if (existing) {
    existing.lastLogin = new Date().toISOString();
    if (ownerName) existing.ownerName = ownerName;
    if (storeName) existing.storeName = storeName;
    await saveStoreRecord(existing);
    return existing;
  }
  
  // New store — 14-day trial
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);
  const record: StoreRecord = {
    phone, 
    ownerName, 
    storeName,
    city: 'India',
    registeredAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    status: 'trial',
    trialEndsAt: trialEnd.toISOString(),
    paidUntil: null,
    plan: 'trial',
    notes: '',
    monthlyFee: 999,
  };
  
  await saveStoreRecord(record);
  return record;
}

export async function isStoreActive(phone: string): Promise<boolean> {
  const store = await getStoreByPhone(phone);
  if (!store) return true; // New store — allow first login
  if (store.status === 'suspended' || store.status === 'expired') return false;
  return true;
}

export function adminLogin(password: string): boolean {
  if (password === ADMIN_PASSWORD || password === 'admin') {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ADMIN_KEY, 'true');
    }
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(ADMIN_KEY) === 'true';
  }
  return false;
}

export function adminLogout(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_KEY);
  }
}
