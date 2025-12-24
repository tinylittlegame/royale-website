import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TestTelegramAuthRequest {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

interface BackendAuthResponse {
  token: string;
  id: string;
  authUserId: string;
  email: string;
  displayName: string;
  photo: string;
  country: string;
  authProviders: Array<{
    providerId: string;
    uid: string;
  }>;
}

/**
 * Test Telegram Authentication API Route (Development Only)
 *
 * Bypasses hash verification for testing purposes.
 * Should only be used in development/testing environments.
 */
export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        success: false,
        message: "Test endpoint not available in production",
      },
      { status: 403 }
    );
  }

  try {
    const body: TestTelegramAuthRequest = await req.json();
    const { telegramId, firstName, lastName, username, photoUrl } = body;

    console.log("[Test Telegram Auth] Received test authentication request", {
      telegramId,
      username: username || "no username",
      firstName,
    });

    // Validate required fields
    if (!telegramId || !firstName) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters: telegramId, firstName",
        },
        { status: 400 }
      );
    }

    // Prepare user data for backend
    const displayName = username || firstName || `telegram_${telegramId}`;
    const email = `${telegramId}@telegram.me`;

    console.log("[Test Telegram Auth] Calling backend:", {
      displayName,
      email: email.substring(0, 3) + "***",
    });

    // Call backend to authenticate and get JWT
    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: displayName,
        image: photoUrl || "",
        email,
        provider: "telegram",
        sub: telegramId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Test Telegram Auth] Backend authentication failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Backend authentication failed",
          error: response.statusText,
        },
        { status: response.status }
      );
    }

    const userData: BackendAuthResponse = await response.json();

    // Validate response
    if (!userData.token || !userData.id) {
      throw new Error(
        "Invalid response from backend: missing token or user ID"
      );
    }

    console.log("[Test Telegram Auth] Authentication successful for user:", {
      id: userData.id,
      displayName: userData.displayName,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Test Telegram authentication successful",
        user: {
          id: userData.id,
          authUserId: userData.authUserId,
          email: userData.email,
          displayName: userData.displayName,
          photo: userData.photo,
          country: userData.country,
          authProviders: userData.authProviders,
        },
        token: userData.token,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Test Telegram Auth] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Test Telegram authentication failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
