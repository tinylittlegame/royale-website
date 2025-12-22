import { NextRequest, NextResponse } from "next/server";

// Backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

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

    console.log("[OAuth Login] Forwarding OAuth login to backend:", {
      email,
      name,
      provider,
      backendUrl: BACKEND_API_URL,
    });

    // Call backend API to handle OAuth login and JWT generation
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/oauth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        displayName: name,
        photo: image,
        provider,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error("[OAuth Login] Backend returned error:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorData,
      });

      return NextResponse.json(
        {
          error: "Backend OAuth login failed",
          message: errorData.message || backendResponse.statusText,
          details:
            process.env.NODE_ENV === "development" ? errorData : undefined,
        },
        { status: backendResponse.status },
      );
    }

    // Backend returns { token, user }
    const data = await backendResponse.json();

    console.log("[OAuth Login] Backend response received:", {
      hasToken: !!data.token,
      hasUser: !!data.user,
      userId: data.user?.id,
    });

    return NextResponse.json(data, { status: 200 });
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
