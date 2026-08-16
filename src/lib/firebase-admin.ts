export const isAdminConfigured = !!(process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL);

export async function initFirebaseAdmin() {
  if (!isAdminConfigured) return;
  
  const { getApps, initializeApp, cert } = await import('firebase-admin/app');
  
  if (!getApps().length) {
    try {
      const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
      
      if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        initializeApp({
          credential: cert(serviceAccount),
        });
      }
    } catch (error: any) {
      console.error('Firebase admin initialization error', error.stack);
    }
  }
}

export async function getAdminDb() {
  await initFirebaseAdmin();
  const { getFirestore } = await import('firebase-admin/firestore');
  return getFirestore();
}

export async function getAdminAuth() {
  await initFirebaseAdmin();
  const { getAuth } = await import('firebase-admin/auth');
  return getAuth();
}
