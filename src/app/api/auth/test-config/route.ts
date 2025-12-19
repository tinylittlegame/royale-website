import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;

    const config = {
      hasJwtSecret: !!process.env.JWT_SECRET || !!process.env.NEXTAUTH_SECRET,
      hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasFirebaseClientEmail: !!process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      hasFirebasePrivateKey: !!privateKey,
      firebasePrivateKeyLength: privateKey?.length || 0,
      jwtSecretLength: (process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET)?.length || 0,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseClientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      privateKeyStartsWith: privateKey?.substring(0, 30),
      privateKeyHasNewlines: privateKey?.includes('\n'),
      privateKeyHasEscapedNewlines: privateKey?.includes('\\n'),
    };

    console.log('[Test Config]', config);

    return NextResponse.json({
      success: true,
      config,
      message: 'Configuration check completed'
    });
  } catch (error: any) {
    console.error('[Test Config] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
