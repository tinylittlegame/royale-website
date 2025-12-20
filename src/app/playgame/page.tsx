"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getGameToken, getGuestToken, updateGuestToken } from "@/lib/api";
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
    const response = await getGameToken(GAME_ID);
    return {
      token: response.token,
      userId: response.userId,
      username: response.username,
    };
  };

  const updateToken = async (): Promise<InfoType> => {
    const response = await updateGuestToken(
      GAME_ID,
      getCookie("userId") || "",
      getCookie("username") || ""
    );
    return {
      token: response.token,
      userId: response.userId,
      username: response.username,
    };
  };

  const guestUser = async (): Promise<InfoType> => {
    const response = await getGuestToken(GAME_ID);
    return {
      token: response.token,
      userId: response.userId,
      username: response.username,
    };
  };

  const initialize = useCallback(async () => {
    try {
      if (jwtToken && jwtToken !== "unauthenticated") {
        const data = await authenUser();
        setStateAndCookie(data);
      } else {
        if (getCookie("userId")) {
          const data = await updateToken();
          setStateAndCookie(data);
        } else if (jwtToken === "unauthenticated" || status === "unauthenticated") {
          const data = await guestUser();
          setStateAndCookie(data);
        }
      }
    } catch (error: any) {
      console.error("Initialization error:", error);
      try {
        // Fallback to guest if something fails
        const data = await guestUser();
        setStateAndCookie(data);
      } catch (fallbackError: any) {
        setErrorMsg("Failed to initialize game session");
      }
    }
  }, [jwtToken, status, setStateAndCookie]);

  useEffect(() => {
    if (!authLoading && status !== "loading") {
      initialize();
    }
  }, [authLoading, status, initialize]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "signup") {
        router.push("/");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  if (authLoading || status === "loading" || !token) {
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
