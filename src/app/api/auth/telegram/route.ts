import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface TelegramUser {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
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
 * Verify Telegram authentication hash
 * Based on: https://core.telegram.org/widgets/login#checking-authorization
 */
function verifyTelegramAuth(data: TelegramUser): boolean {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("[Telegram Auth] Bot token not configured");
    return false;
  }

  const { hash, ...userData } = data;

  // Create data check string
  const dataCheckArr = Object.keys(userData)
    .filter((key) => userData[key as keyof typeof userData] !== undefined)
    .sort()
    .map((key) => `${key}=${userData[key as keyof typeof userData]}`);

  const dataCheckString = dataCheckArr.join("\n");

  // Create secret key from bot token
  const secretKey = crypto
    .createHash("sha256")
    .update(TELEGRAM_BOT_TOKEN)
    .digest();

  // Calculate hash
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const isValid = calculatedHash === hash;

  if (process.env.NODE_ENV === "development") {
    console.log("[Telegram Auth] Verification Debug:", {
      dataCheckString,
      receivedHash: hash,
      calculatedHash,
      isValid,
    });
  }

  return isValid;
}

/**
 * Check if auth data is expired (older than 24 hours)
 */
function isAuthDataExpired(authDate: string): boolean {
  const authTimestamp = parseInt(authDate, 10);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const maxAge = 24 * 60 * 60; // 24 hours in seconds

  return currentTimestamp - authTimestamp > maxAge;
}

/**
 * Telegram Authentication API Route
 *
 * Handles Telegram widget authentication and exchanges for backend JWT token.
 */
export async function POST(req: NextRequest) {
  try {
    const body: TelegramUser = await req.json();
    const { id, first_name, last_name, username, photo_url, auth_date, hash } =
      body;

    console.log("[Telegram Auth] Received authentication request", {
      id,
      username: username || "no username",
      first_name,
    });

    // Validate required fields
    if (!id || !hash || !auth_date) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required Telegram parameters (id, hash, auth_date)",
        },
        { status: 400 }
      );
    }

    // Check if auth data is expired
    if (isAuthDataExpired(auth_date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication data expired (older than 24 hours)",
        },
        { status: 401 }
      );
    }

    // Verify hash in production
    if (process.env.NODE_ENV === "production") {
      if (!TELEGRAM_BOT_TOKEN) {
        return NextResponse.json(
          {
            success: false,
            message: "Telegram bot token not configured",
          },
          { status: 500 }
        );
      }

      const isValid = verifyTelegramAuth(body);
      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Telegram authentication hash",
          },
          { status: 401 }
        );
      }
    } else {
      console.log(
        "[Telegram Auth] Development mode - skipping hash verification"
      );
    }

    // Prepare user data for backend
    const displayName = username || first_name || `telegram_${id}`;
    const email = `${id}@telegram.me`; // Telegram doesn't provide email

    console.log("[Telegram Auth] Calling backend:", {
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
        image: photo_url || "",
        email,
        provider: "telegram",
        sub: id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Telegram Auth] Backend authentication failed:", {
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

    console.log("[Telegram Auth] Authentication successful for user:", {
      id: userData.id,
      displayName: userData.displayName,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Telegram authentication successful",
        user: {
          id: userData.id,
          authUserId: userData.authUserId,
          email: userData.email,
          name: userData.displayName, // Use 'name' to match AuthContext interface
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
    console.error("[Telegram Auth] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Telegram authentication failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
