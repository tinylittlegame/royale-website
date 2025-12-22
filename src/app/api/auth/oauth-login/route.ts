import { NextRequest, NextResponse } from "next/server";

// Backend API URL - same as tinylittlefly uses
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tinylittle.io/api';

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
        { error: "Missing required fields: email, name, provider" },
        { status: 400 },
      );
    }

    console.log("[OAuth Login] Calling backend /api/auth/login with:", {
      email,
      name,
      provider,
    });

    // Call backend /api/auth/login (same as tinylittlefly does)
    // Backend will generate the JWT token
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
        sub: "", // Optional, can be added if needed
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OAuth Login] Backend error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      return NextResponse.json(
        {
          error: "Backend authentication failed",
          message: response.statusText,
          details: errorText,
        },
        { status: response.status },
      );
    }

    // Backend returns user object with JWT token
    const userData = await response.json();

    console.log("[OAuth Login] Backend returned user data:", {
      hasToken: !!userData.token,
      hasUser: !!userData.id,
      email: userData.email,
    });

    // Return the same format as tinylittlefly expects
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
    console.error("[OAuth Login] Error:", error);
    return NextResponse.json(
      {
        error: "OAuth login failed",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
