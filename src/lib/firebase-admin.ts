import * as admin from 'firebase-admin';
import * as path from 'path';

// Lazy initialization - only initialize when actually used (not at build time)
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  try {
    // Use service account JSON file (more reliable than env vars)
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

    console.log('[Firebase Admin] Initializing with service account file:', serviceAccountPath);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://tiny-little-backend-develop-default-rtdb.asia-southeast1.firebasedatabase.app',
    });
  } catch (error: any) {
    console.error('[Firebase Admin] Initialization error:', error.message);
    throw error;
  }
}

// Export functions that initialize on first use
export function getDb() {
  initializeFirebaseAdmin();
  return admin.firestore();
}

export function getAuth() {
  initializeFirebaseAdmin();
  return admin.auth();
}

export default admin;
