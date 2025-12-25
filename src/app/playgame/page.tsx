"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getGameToken, getGuestToken, updateGuestToken, manageGuestUser } from "@/lib/api";
import { getCookie, setCookie, addMinutesToDate } from "@/lib/cookie";
import LoadingScreen from "@/components/LoadingScreen";
import { useSession } from "next-auth/react";

type InfoType = { token: string; userId: string; username: string };

const GAME_URL = process.env.NEXT_PUBLIC_GAME_URL || "https://tinylittleroyale.io/";
const GAME_ID = process.env.NEXT_PUBLIC_GAME_ID || "tiny-little-royale";

export default function PlayGame() {
  const { token: jwtToken, loading: authLoading } = useAuth();
  const { status } = useSession();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authFailed, setAuthFailed] = useState<boolean>(false); // Track if auth already failed to prevent retry loops
  const [iframeLoading, setIframeLoading] = useState<boolean>(true); // Track iframe loading state
  const initializingRef = useRef<boolean>(false); // Prevent concurrent initializations
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout for loading screen

  const setStateAndCookie = useCallback(({ token, userId, username }: InfoType) => {
    if (token && userId && username) {
      setCookie("token", token, addMinutesToDate(new Date(), 5));
      setCookie("userId", userId, 365);
      setCookie("username", username, 365);

      setToken(token);
      setUserId(userId);
    }
  }, []);

  const authenUser = async (): Promise<InfoType> => {
    // Pass the JWT token directly from AuthContext to the API call
    const data = await getGameToken(GAME_ID, jwtToken || undefined);

    // Check if guest user needs promotion
    if (data.username && data.username.toLowerCase().includes('guest')) {
      console.log("[PlayGame] Authenticated user identified as guest, promoting...");
      await manageGuestUser(data.userId);
    }

    return {
      token: data.token,
      userId: data.userId,
      username: data.username,
    };
  };

  const updateToken = async (): Promise<InfoType> => {
    const data = await updateGuestToken(
      GAME_ID,
      getCookie("userId") || "",
      getCookie("username") || ""
    );
    return {
      token: data.token,
      userId: data.userId,
      username: data.username,
    };
  };

  const guestUser = async (): Promise<InfoType> => {
    const data = await getGuestToken(GAME_ID);
    return {
      token: data.token,
      userId: data.userId,
      username: data.username,
    };
  };

  const initialize = useCallback(async () => {
    // Prevent concurrent initializations
    if (initializingRef.current) {
      console.log("[PlayGame] Already initializing, skipping...");
      return;
    }
    initializingRef.current = true;

    console.log("[PlayGame] Initializing with:", {
      GAME_ID,
      hasJwtToken: !!jwtToken,
      jwtTokenPrefix: jwtToken ? jwtToken.substring(0, 10) + "..." : "none",
      status,
      authFailed,
      hasLocalUserId: !!getCookie("userId")
    });

    try {
      // Skip authenticated flow if auth already failed (401) to prevent retry loops
      if (jwtToken && jwtToken !== "unauthenticated" && !authFailed) {
        console.log("[PlayGame] Attempting Authenticated Flow");
        const data = await authenUser();
        setStateAndCookie(data);
      } else {
        // Guest flow - create or update guest user
        if (getCookie("userId")) {
          console.log("[PlayGame] Attempting Guest Update Flow (UserId exists)");
          const data = await updateToken();
          setStateAndCookie(data);
        } else {
          console.log("[PlayGame] Attempting New Guest Flow");
          const data = await guestUser();
          setStateAndCookie(data);
        }
      }
    } catch (error: any) {
      console.error("[PlayGame] Initialization Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        configUrl: error.config?.url
      });

      // On 401 Unauthorized, mark auth as failed and fall back to guest
      if (error.response?.status === 401) {
        console.log("[PlayGame] 401 Unauthorized - Clearing stale JWT and creating guest account");
        setAuthFailed(true);
        // Clear the stale JWT token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user_data');
        }
        // Try to create guest account
        try {
          const guestData = await guestUser();
          setStateAndCookie(guestData);
        } catch (guestError: any) {
          console.error("[PlayGame] Failed to create guest account:", guestError);
          setErrorMsg(`Failed to initialize game session. Please try again.`);
        }
      } else {
        // For other errors, show error message
        setErrorMsg(`Failed to initialize game session: ${error.message}. Please try again.`);
      }
    } finally {
      initializingRef.current = false;
    }
  }, [jwtToken, status, setStateAndCookie, token, authFailed]);

  const hasRedirectedRef = useRef<boolean>(false); // Prevent multiple redirects

  useEffect(() => {
    // Don't re-initialize if we already have a token
    if (token) {
      console.log("[PlayGame] Already have token, skipping initialization");
      return;
    }

    // Don't do anything if already redirected
    if (hasRedirectedRef.current) {
      return;
    }

    // Wait for both auth loading states to settle
    if (authLoading || status === "loading") {
      console.log("[PlayGame] Still loading auth state...", { authLoading, status });
      return;
    }

    console.log("[PlayGame] Auth state settled:", {
      hasJwtToken: !!jwtToken,
      sessionStatus: status,
      authFailed
    });

    // If we have a JWT token and auth hasn't failed, initialize
    if (jwtToken && jwtToken !== "unauthenticated" && !authFailed) {
      initialize();
      return;
    }

    // If there's an authenticated NextAuth session but no JWT token yet,
    // wait for AuthContext to exchange it (give it a moment)
    if (status === "authenticated" && !jwtToken) {
      console.log("[PlayGame] NextAuth session exists, waiting for JWT exchange...");
      return;
    }

    // If unauthenticated, just initialize (will create guest account)
    if (status === "unauthenticated" && !jwtToken && !authFailed) {
      console.log("[PlayGame] Unauthenticated - Initializing guest account");
      initialize();
    }
  }, [authLoading, status, jwtToken, token, initialize, authFailed, router]);

  // Handle iframe loading with minimum display time
  useEffect(() => {
    if (token && userId) {
      // Show loading screen for at least 2 seconds so users know something is happening
      setIframeLoading(true);

      loadingTimeoutRef.current = setTimeout(() => {
        console.log("[PlayGame] Minimum loading time elapsed");
        // Loading screen will be hidden when iframe loads
      }, 2000);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [token, userId]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "signup") {
        console.log("[PlayGame] Received signup event from game");

        // Extract referral code from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const referralCode = params.get('referral');

        if (referralCode) {
          router.push(`/#referral=${referralCode}`);
        } else {
          router.push("/");
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  if (authLoading || status === "loading") {
    return <LoadingScreen message="Checking Authentication" />;
  }

  if (!token) {
    return <LoadingScreen message="Initializing Game Session" />;
  }

  if (errorMsg) {
    return (
      <div className="w-full h-[calc(100vh-64px)] bg-black flex flex-col items-center justify-center text-white gap-4">
        <p className="text-red-500 font-bold text-xl uppercase tracking-widest">Initialization Error</p>
        <p className="text-gray-400">{errorMsg}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-bold uppercase transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const branch = process.env.BRANCH === "develop" ? "&branch=develop" : "";
  const finalGameUrl = `${GAME_URL}?user=${userId}&login-token=${token}${branch}`;

  const handleIframeLoad = () => {
    // Wait for minimum loading time before hiding loading screen
    const timeElapsed = loadingTimeoutRef.current ? 2000 : 0;

    setTimeout(() => {
      console.log("[PlayGame] Game iframe loaded");
      setIframeLoading(false);
    }, Math.max(0, timeElapsed));
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
      {/* Loading overlay */}
      {iframeLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black gap-4">
          <LoadingScreen message="Loading Game..." />
          <p className="text-gray-500 text-sm text-center px-4">
            For best experience, play in landscape mode
          </p>
        </div>
      )}

      {/* Game iframe - fullscreen */}
      <iframe
        src={finalGameUrl}
        onLoad={handleIframeLoad}
        className="absolute inset-0 w-full h-full border-none"
        style={{ border: 'none', margin: 0, padding: 0 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title="Tiny Little Royale"
      />
    </div>
  );
}
