"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState<boolean>(false); // Show fullscreen prompt on mobile
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false); // Track fullscreen state
  const [iframeError, setIframeError] = useState<boolean>(false); // Track iframe load errors
  const [showInAppBrowserWarning, setShowInAppBrowserWarning] = useState<boolean>(false); // Show warning for in-app browsers
  const [isPortrait, setIsPortrait] = useState<boolean>(false); // Track if device is in portrait orientation
  const initializingRef = useRef<boolean>(false); // Prevent concurrent initializations
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout for loading screen
  const gameContainerRef = useRef<HTMLDivElement | null>(null); // Reference to game container
  const hasRedirectedRef = useRef<boolean>(false); // Prevent multiple redirects
  const iframeTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout for iframe loading

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

  // Handle iframe loading
  useEffect(() => {
    if (token && userId) {
      setIframeLoading(true);
      setIframeError(false);

      // Set a max timeout for iframe loading (30 seconds)
      iframeTimeoutRef.current = setTimeout(() => {
        console.error("[PlayGame] Iframe loading timeout - game did not load in 30 seconds");
        setIframeError(true);
        setIframeLoading(false);
      }, 30000);
    }

    return () => {
      if (iframeTimeoutRef.current) {
        clearTimeout(iframeTimeoutRef.current);
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

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && isMobile()) {
        // User exited fullscreen on mobile, show prompt again
        setShowFullscreenPrompt(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Check for in-app browser on mount
  useEffect(() => {
    if (isInAppBrowser()) {
      console.log('[PlayGame] In-app browser detected:', getInAppBrowserName());
      // Show warning after a short delay so user sees the game first
      setTimeout(() => {
        setShowInAppBrowserWarning(true);
      }, 1000);
    }
  }, []);

  // Detect and track device orientation
  useEffect(() => {
    const checkOrientation = () => {
      // Check if device is in portrait mode
      const portrait = window.innerHeight > window.innerWidth;
      console.log('[PlayGame] Orientation check:', {
        width: window.innerWidth,
        height: window.innerHeight,
        isPortrait: portrait
      });
      setIsPortrait(portrait);
    };

    // Check on mount
    checkOrientation();

    // Listen for orientation and resize changes
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    // Also check after a short delay to catch delayed browser UI changes
    const timeoutId = setTimeout(checkOrientation, 100);

    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
      clearTimeout(timeoutId);
    };
  }, []);

  // Detect if user is on mobile
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Detect if user is on iOS
  const isIOS = () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  };

  // Check if running in standalone mode (added to home screen)
  const isStandalone = () => {
    if (typeof window === 'undefined') return false;
    return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
  };

  // Detect if user is in an in-app browser (Telegram, LINE, Facebook, etc.)
  const isInAppBrowser = () => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Check for common in-app browsers
    const inAppPatterns = [
      /FBAN|FBAV/i, // Facebook
      /Instagram/i, // Instagram
      /Line/i, // LINE
      /Twitter/i, // Twitter
      /Telegram/i, // Telegram (might be TelegramBot or other variants)
      /micromessenger/i, // WeChat
      /snapchat/i, // Snapchat
      /LinkedInApp/i, // LinkedIn
      /FB_IAB/i, // Facebook in-app browser
      /FBIOS/i, // Facebook iOS
    ];

    return inAppPatterns.some(pattern => pattern.test(ua));
  };

  // Get the name of the in-app browser for user-friendly messages
  const getInAppBrowserName = () => {
    if (typeof window === 'undefined') return 'in-app browser';
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return 'Facebook';
    if (/Instagram/i.test(ua)) return 'Instagram';
    if (/Line/i.test(ua)) return 'LINE';
    if (/Twitter/i.test(ua)) return 'Twitter';
    if (/Telegram/i.test(ua)) return 'Telegram';
    if (/micromessenger/i.test(ua)) return 'WeChat';
    if (/snapchat/i.test(ua)) return 'Snapchat';
    if (/LinkedInApp/i.test(ua)) return 'LinkedIn';

    return 'in-app browser';
  };

  // Enter fullscreen mode
  const enterFullscreen = async () => {
    try {
      const container = gameContainerRef.current;
      if (!container) return;

      console.log('[PlayGame] Attempting to enter fullscreen...');

      // iOS doesn't support Fullscreen API on iPhone Safari
      if (isIOS() && !isStandalone()) {
        console.log('[PlayGame] iOS detected - fullscreen not supported in browser');
        // For iOS, we rely on viewport meta tags and CSS
        // Show message about adding to home screen for better experience
        setShowFullscreenPrompt(true);
        return;
      }

      // Request fullscreen for supported devices
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        await (container as any).webkitRequestFullscreen(); // Safari on iPad
      } else if ((container as any).webkitEnterFullscreen) {
        await (container as any).webkitEnterFullscreen(); // iOS Safari (video elements only)
      } else if ((container as any).mozRequestFullScreen) {
        await (container as any).mozRequestFullScreen(); // Firefox
      } else if ((container as any).msRequestFullscreen) {
        await (container as any).msRequestFullscreen(); // IE/Edge
      }

      // Try to lock orientation to landscape on mobile (not supported on iOS)
      if ('orientation' in screen && 'lock' in screen.orientation && !isIOS()) {
        try {
          await (screen.orientation as any).lock('landscape');
          console.log('[PlayGame] Orientation locked to landscape');
        } catch (err) {
          console.log('[PlayGame] Could not lock orientation:', err);
        }
      }

      setShowFullscreenPrompt(false);
      setIsFullscreen(true);
      console.log('[PlayGame] Fullscreen entered successfully');
    } catch (err) {
      console.error('[PlayGame] Failed to enter fullscreen:', err);
      // If automatic fullscreen fails, show the prompt
      if (isMobile()) {
        setShowFullscreenPrompt(true);
      }
    }
  };

  const handleIframeLoad = () => {
    console.log("[PlayGame] Game iframe loaded successfully");

    // Clear the timeout since iframe loaded successfully
    if (iframeTimeoutRef.current) {
      clearTimeout(iframeTimeoutRef.current);
      iframeTimeoutRef.current = null;
    }

    // Hide website loading screen and show game (game will handle its own loading)
    setIframeLoading(false);
    setIframeError(false);

    // On mobile, automatically try to enter fullscreen after loading
    if (isMobile() && !isFullscreen && !isIOS()) {
      setTimeout(() => {
        enterFullscreen();
      }, 300);
    }

    // On iOS, try to hide the address bar by scrolling
    if (isIOS()) {
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 100);
    }
  };

  const handleIframeError = () => {
    console.error("[PlayGame] Iframe failed to load");
    setIframeError(true);
    setIframeLoading(false);
    if (iframeTimeoutRef.current) {
      clearTimeout(iframeTimeoutRef.current);
    }
  };

  if (authLoading || status === "loading") {
    return <LoadingScreen message="Checking Authentication" />;
  }

  if (!token) {
    return <LoadingScreen message="Initializing Game Session" />;
  }

  if (errorMsg) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white gap-4 p-6">
        <p className="text-red-500 font-bold text-xl uppercase tracking-widest">Initialization Error</p>
        <p className="text-gray-400 text-center max-w-md">{errorMsg}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-bold uppercase transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (iframeError) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white gap-6 p-6">
        <svg
          className="w-20 h-20 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="text-center max-w-md">
          <p className="text-red-500 font-bold text-2xl uppercase tracking-widest mb-3">Game Failed to Load</p>
          <p className="text-gray-400 mb-2">The game could not be loaded. This might be due to:</p>
          <ul className="text-gray-500 text-sm list-disc list-inside mb-4 space-y-1">
            <li>Network connectivity issues</li>
            <li>Game server is unavailable</li>
            <li>Your browser blocking the game</li>
          </ul>
          <p className="text-gray-400 text-sm">
            Please check your internet connection and try again.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold uppercase transition-all"
          >
            Reload Page
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold uppercase transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const branch = process.env.BRANCH === "develop" ? "&branch=develop" : "";
  // Pass viewport dimensions to game so it can scale properly
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const finalGameUrl = `${GAME_URL}?user=${userId}&login-token=${token}${branch}&vw=${viewportWidth}&vh=${viewportHeight}`;

  console.log("[PlayGame] Rendering game with:", {
    GAME_URL,
    userId,
    hasToken: !!token,
    finalGameUrl,
    iframeLoading,
    iframeError
  });

  return (
    <div
      ref={gameContainerRef}
      className="fixed inset-0 w-full h-full bg-black overflow-hidden"
      style={{
        // Use dynamic viewport height for all devices to account for browser UI
        height: '100dvh',
        minHeight: '100dvh',
        maxHeight: '100dvh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        touchAction: 'none', // Prevent pull-to-refresh and other gestures
        overscrollBehavior: 'none', // Prevent overscroll effects
      } as React.CSSProperties}
    >
      {/* Portrait mode overlay - force landscape orientation */}
      {isPortrait && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-8">
          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: [0, -90, -90, -90] }}
            transition={{ duration: 1, times: [0, 0.3, 0.7, 1] }}
            className="mb-8"
          >
            <svg
              className="w-24 h-24 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </motion.div>

          <div className="text-center max-w-sm">
            <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-wider">
              Rotate Your Device
            </h2>
            <p className="text-gray-400 text-lg mb-6">
              Please rotate your device to landscape mode for the best gaming experience
            </p>

            {/* Rotation icon animation */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <svg
                className="w-16 h-16 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </motion.div>
          </div>

          <div className="mt-8 text-gray-500 text-sm">
            Landscape mode required • Width × Height
          </div>
        </div>
      )}

      {/* In-app browser warning - compact banner at top */}
      {showInAppBrowserWarning && !iframeLoading && !isPortrait && (
        <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg">
          <div className="flex items-center gap-2 px-3 py-2">
            <svg
              className="w-5 h-5 text-white flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs">
                <span className="font-semibold">In {getInAppBrowserName()}</span> - For better fullscreen, open in Safari/Chrome
              </p>
            </div>
            <button
              onClick={() => {
                const currentUrl = window.location.href;
                navigator.clipboard.writeText(currentUrl).then(() => {
                  alert('Link copied! Paste in your browser.');
                }).catch(() => {
                  alert(`Copy this link:\n${currentUrl}`);
                });
              }}
              className="px-2 py-1 bg-white text-orange-700 font-bold text-xs rounded hover:bg-orange-50 transition-colors flex-shrink-0"
            >
              Copy
            </button>
            <button
              onClick={() => setShowInAppBrowserWarning(false)}
              className="text-white/90 hover:text-white flex-shrink-0 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {iframeLoading && !isPortrait && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black gap-4 cursor-pointer"
          onClick={() => {
            if (isMobile() && !isFullscreen && !isIOS()) {
              enterFullscreen();
            }
          }}
        >
          <LoadingScreen message="Loading Game..." />
          {isMobile() && !isFullscreen && !isIOS() && (
            <p className="text-yellow-500 text-sm text-center px-4 animate-pulse">
              Tap anywhere to enter fullscreen
            </p>
          )}
          {isIOS() && !isStandalone() && (
            <p className="text-gray-400 text-sm text-center px-4 max-w-xs">
              💡 Tip: Add to Home Screen for fullscreen experience
            </p>
          )}
          {(!isMobile() || isFullscreen) && (
            <p className="text-gray-500 text-sm text-center px-4">
              For best experience, play in landscape mode
            </p>
          )}
        </div>
      )}

      {/* Fullscreen prompt for mobile - only shows if auto-fullscreen failed */}
      {showFullscreenPrompt && !iframeLoading && !isPortrait && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-zinc-900 border border-yellow-500/30 rounded-2xl p-8 text-center"
          >
            {isIOS() && !isStandalone() ? (
              // iOS specific message - Add to Home Screen
              <>
                <div className="mb-6">
                  <div className="relative">
                    <svg
                      className="w-16 h-16 mx-auto text-yellow-500 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">For Best Experience on iOS</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    Safari on iPhone doesn't support fullscreen. For the best experience:
                  </p>
                  <div className="bg-black/40 rounded-lg p-4 text-left space-y-2 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-500 font-bold">1.</span>
                      <p className="text-gray-300 text-sm">
                        Tap the <span className="text-blue-400">Share</span> button
                        <svg className="inline-block w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .9 2 2z"/>
                        </svg>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-500 font-bold">2.</span>
                      <p className="text-gray-300 text-sm">Select "Add to Home Screen"</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-500 font-bold">3.</span>
                      <p className="text-gray-300 text-sm">Open from your home screen</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">
                    This will launch the game in fullscreen mode without the Safari UI
                  </p>
                </div>
                <button
                  onClick={() => setShowFullscreenPrompt(false)}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider"
                >
                  Got it, Continue Playing
                </button>
              </>
            ) : (
              // Android and other devices - regular fullscreen
              <>
                <div className="mb-6">
                  <div className="relative">
                    <svg
                      className="w-16 h-16 mx-auto text-yellow-500 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-ping" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Play in Fullscreen!</h2>
                  <p className="text-gray-400 text-sm">
                    Get the best gaming experience with fullscreen mode in landscape orientation
                  </p>
                </div>

                <button
                  onClick={enterFullscreen}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider shadow-lg shadow-yellow-500/20"
                >
                  🎮 Enter Fullscreen Now
                </button>

                <button
                  onClick={() => setShowFullscreenPrompt(false)}
                  className="mt-3 text-gray-500 hover:text-gray-400 text-sm underline"
                >
                  Maybe later
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Game iframe - fullscreen */}
      <iframe
        src={finalGameUrl}
        onLoad={handleIframeLoad}
        className="absolute inset-0 w-full h-full border-none"
        style={{
          border: 'none',
          outline: 'none',
          margin: 0,
          padding: 0,
          display: (iframeLoading || isPortrait) ? 'none' : 'block', // Hide iframe while loading or in portrait mode
          width: '100%',
          height: '100%',
          minWidth: '100%',
          minHeight: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          objectFit: 'fill' as any, // Try to fill the entire space
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        scrolling="no"
        title="Tiny Little Royale"
      />

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono max-w-sm">
          <div>Game URL: {GAME_URL}</div>
          <div>User ID: {userId?.substring(0, 8)}...</div>
          <div>Token: {token ? '✓' : '✗'}</div>
          <div>Loading: {iframeLoading ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}
