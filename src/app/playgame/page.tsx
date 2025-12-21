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
  const [showChoice, setShowChoice] = useState<boolean>(false);
  const [authFailed, setAuthFailed] = useState<boolean>(false); // Track if auth already failed to prevent retry loops
  const initializingRef = useRef<boolean>(false); // Prevent concurrent initializations

  const setStateAndCookie = useCallback(({ token, userId, username }: InfoType) => {
    if (token && userId && username) {
      setCookie("token", token, addMinutesToDate(new Date(), 5));
      setCookie("userId", userId, 365);
      setCookie("username", username, 365);

      setToken(token);
      setUserId(userId);
      setShowChoice(false);
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

    console.log("[PlayGame] Initializing v2 with:", {
      GAME_ID,
      hasJwtToken: !!jwtToken,
      jwtTokenPrefix: jwtToken ? jwtToken.substring(0, 10) + "..." : "none",
      status,
      showChoice,
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
        // Only auto-initialize if we aren't explicitly showing choice
        // If unauthenticated and no choice made yet, show choice
        if (!showChoice && !token) {
          console.log("[PlayGame] Unauthenticated - Showing Choice View");
          setShowChoice(true);
          initializingRef.current = false;
          return;
        }

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

      // On 401 Unauthorized, mark auth as failed and clear stale token
      if (error.response?.status === 401) {
        console.log("[PlayGame] 401 Unauthorized - Clearing stale JWT and falling back to guest");
        setAuthFailed(true);
        // Clear the stale JWT token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt_token');
        }
      }

      // Strict v2 fallback: always try guest if any flow fails (as per documentation)
      try {
        console.log("[PlayGame] Any initialization failure results in Guest fallback (as per docs)");
        const data = await guestUser();
        setStateAndCookie(data);
      } catch (fallbackError: any) {
        console.error("[PlayGame] Fallback Error:", fallbackError);
        setErrorMsg("Failed to initialize game session even after guest fallback. Please check your internet connection and refresh.");
      }
    } finally {
      initializingRef.current = false;
    }
  }, [jwtToken, status, setStateAndCookie, showChoice, token, authFailed]);

  useEffect(() => {
    // Don't re-initialize if we already have a token
    if (token) {
      console.log("[PlayGame] Already have token, skipping initialization");
      return;
    }

    if (!authLoading && status !== "loading") {
      // If authenticated and auth hasn't failed, try authenticated flow
      if (jwtToken && jwtToken !== "unauthenticated" && !authFailed) {
        initialize();
      } else if (!token && !showChoice) {
        // If unauthenticated or auth failed, show choice
        setShowChoice(true);
      }
    }
  }, [authLoading, status, jwtToken, token, showChoice, initialize, authFailed]);

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

  if (showChoice) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="max-w-md w-full mx-4 p-8 bg-zinc-900 border border-yellow-500/30 rounded-2xl shadow-2xl shadow-yellow-500/10 text-center">
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Ready for Battle?</h2>
          <p className="text-gray-400 mb-8">Choose how you want to enter the Royale</p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/auth/signin?callbackUrl=/playgame")}
              className="group relative px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <span className="uppercase tracking-widest">Login to Account</span>
              </div>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="h-px flex-1 bg-zinc-800"></div>
              <span className="text-zinc-600 uppercase text-xs font-bold">OR</span>
              <div className="h-px flex-1 bg-zinc-800"></div>
            </div>

            <button
              onClick={() => {
                setShowChoice(false);
                initialize();
              }}
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl border border-zinc-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="uppercase tracking-widest opacity-80 group-hover:opacity-100">Play as Guest</span>
            </button>
          </div>

          <p className="mt-8 text-zinc-500 text-xs uppercase tracking-widest leading-relaxed">
            Guest sessions do not save progress<br />or leaderboard statistics
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <LoadingScreen message="Initializing Royale Session" />;
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

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-black relative">
      <iframe
        src={finalGameUrl}
        className="w-full h-full border-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Tiny Little Royale"
      />
    </div>
  );
}
