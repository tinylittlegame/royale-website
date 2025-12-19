import { NextRequest, NextResponse } from 'next/server';
import { getDb, getAuth } from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';

// JWT configuration (same as backend)
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '30d'; // 30 days (same as backend: 2592000000ms)

interface OAuthLoginRequest {
  email: string;
  name: string;
  image?: string;
  provider: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: OAuthLoginRequest = await req.json();
    const { email, name, image, provider } = body;

    if (!email || !name || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, provider' },
        { status: 400 }
      );
    }

    // Check if JWT_SECRET is available
    if (!JWT_SECRET) {
      console.error('[OAuth Login] JWT_SECRET is not set!');
      return NextResponse.json(
        { error: 'Server configuration error: JWT_SECRET not set' },
        { status: 500 }
      );
    }

    // Get Firebase instances
    let auth, db;
    try {
      auth = getAuth();
      db = getDb();
    } catch (firebaseError: any) {
      console.error('[OAuth Login] Firebase initialization error:', firebaseError);
      return NextResponse.json(
        {
          error: 'Firebase initialization failed',
          message: firebaseError.message,
          details: process.env.NODE_ENV === 'development' ? firebaseError.stack : undefined
        },
        { status: 500 }
      );
    }

    // Step 1: Get or create Firebase Auth user
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email);
    } catch (error) {
      // User doesn't exist, create new Firebase Auth user
      firebaseUser = await auth.createUser({
        email,
        displayName: name,
        photoURL: image,
      });
    }

    // Step 2: Get or create user document in Firestore
    const usersRef = db.collection('users');
    const userDoc = await usersRef.doc(firebaseUser.uid).get();

    let userData: any;

    if (userDoc.exists) {
      // User exists, get data
      userData = userDoc.data() || {};

      // Update auth providers if needed
      const authProviders = userData.authProviders || [];
      const providerExists = authProviders.some((p: any) => p.providerId === provider);

      if (!providerExists) {
        authProviders.push({
          providerId: provider,
          uid: firebaseUser.uid,
        });

        await usersRef.doc(firebaseUser.uid).update({
          authProviders,
          updateAt: new Date(),
        });
      }
    } else {
      // Create new user document
      userData = {
        id: firebaseUser.uid,
        authUserId: firebaseUser.uid,
        email: email,
        displayName: name,
        photo: image || '',
        country: 'unknown', // Will be set from IP later
        authProviders: [
          {
            providerId: provider,
            uid: firebaseUser.uid,
          },
        ],
        registerAt: new Date(),
        createAt: new Date(),
        updateAt: new Date(),
      };

      await usersRef.doc(firebaseUser.uid).set(userData);
    }

    // Step 3: Generate JWT token (same format as backend)
    const tokenPayload = {
      type: 'PASSPORT_TOKEN',
      user: {
        id: userData?.id || firebaseUser.uid,
        authUserId: firebaseUser.uid,
        email: userData?.email || email,
        displayName: userData?.displayName || name,
        photo: userData?.photo || image || '',
        country: userData?.country || 'unknown',
        authProviders: userData?.authProviders || [],
      },
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET!, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Step 4: Return response (same format as backend)
    const response = {
      token,
      user: tokenPayload.user,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('[OAuth Login] Error:', error);
    return NextResponse.json(
      {
        error: 'OAuth login failed',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
