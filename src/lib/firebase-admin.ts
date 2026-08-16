import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function initFirebaseAdmin() {
  if (!getApps().length) {
    try {
      const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
      
      // Only initialize if we have the credentials
      if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        initializeApp({
          credential: cert(serviceAccount),
        });
      } else {
        console.warn('Firebase Admin SDK credentials missing. API routes will fail.');
        // Initialize a dummy app so that the build doesn't crash
        initializeApp({ projectId: 'dummy-project' });
      }
    } catch (error: any) {
      console.error('Firebase admin initialization error', error.stack);
    }
  }
}

initFirebaseAdmin();

export const isAdminConfigured = !!(process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL);
export const getAdminDb = () => getFirestore();
export const getAdminAuth = () => getAuth();
