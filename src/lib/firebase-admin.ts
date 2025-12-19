import * as admin from 'firebase-admin';

// Lazy initialization - only initialize when actually used (not at build time)
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  // Get private key and handle newlines
  const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY is not set');
  }

  // Remove quotes if present and replace escaped newlines
  const cleanPrivateKey = privateKey
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/\\n/g, '\n'); // Replace \n with actual newlines

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'tiny-little-backend-develop',
    clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL || 'google-api@tiny-little-backend.iam.gserviceaccount.com',
    privateKey: cleanPrivateKey,
  };

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://tiny-little-backend-develop-default-rtdb.asia-southeast1.firebasedatabase.app',
  });
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
