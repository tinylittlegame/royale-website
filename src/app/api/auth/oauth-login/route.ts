import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface OAuthLoginRequest {
  email: string;
  name: string;
  image?: string;
  provider: string;
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
 * OAuth Login API Route
 *
 * Exchanges OAuth provider data (from NextAuth) for a backend JWT token.
 * The backend handles user creation/update and JWT generation.
 */
export async function POST(req: NextRequest) {
  try {
    const body: OAuthLoginRequest = await req.json();
    const { email, name, image, provider } = body;

    // Validate required fields
    if (!email || !name || !provider) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, provider" },
        { status: 400 },
      );
    }

    // Call backend to authenticate and get JWT
    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        image: image || "",
        email,
        provider,
        sub: "",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OAuth Login] Backend authentication failed:", {
        status: response.status,
        statusText: response.statusText,
      });

      return NextResponse.json(
        {
          error: "Backend authentication failed",
          message: response.statusText,
        },
        { status: response.status },
      );
    }

    const userData: BackendAuthResponse = await response.json();

    // Validate response has required fields
    if (!userData.token || !userData.id) {
      throw new Error(
        "Invalid response from backend: missing token or user ID",
      );
    }

    // Return normalized user data
    return NextResponse.json(
      {
        token: userData.token,
        user: {
          id: userData.id,
          authUserId: userData.authUserId,
          email: userData.email,
          displayName: userData.displayName,
          photo: userData.photo,
          country: userData.country,
          authProviders: userData.authProviders,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[OAuth Login] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "OAuth login failed",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
