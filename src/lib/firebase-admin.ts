import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Lazy initialization - only initialize when actually used (not at build time)
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  try {
    // Try to use JSON file first (for local development)
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      console.log('[Firebase Admin] Using service account JSON file');

      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://tiny-little-backend-develop-default-rtdb.asia-southeast1.firebasedatabase.app',
      });
    }

    // Fallback to environment variables (for production)
    console.log('[Firebase Admin] Using environment variables');

    const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY is not set and JSON file not found');
    }

    // Clean up private key - handle escaped newlines
    let cleanPrivateKey = privateKey.replace(/^["']|["']$/g, '');

    // Replace literal \n with actual newlines
    if (cleanPrivateKey.includes('\\n')) {
      cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, '\n');
    }

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      privateKey: cleanPrivateKey,
    };

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
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
