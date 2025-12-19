import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (singleton pattern)
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'tiny-little-backend-develop',
    clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL || 'google-api@tiny-little-backend.iam.gserviceaccount.com',
    privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://tiny-little-backend-develop-default-rtdb.asia-southeast1.firebasedatabase.app',
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

export default admin;
