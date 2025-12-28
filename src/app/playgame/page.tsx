"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { useGameAuth } from "@/hooks/useGameAuth";
import { useOrientation } from "@/hooks/useOrientation";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useInAppBrowser } from "@/hooks/useInAppBrowser";
import { PortraitOverlay } from "@/components/playgame/PortraitOverlay";
import { InAppBrowserWarning } from "@/components/playgame/InAppBrowserWarning";
import { FullscreenPrompt } from "@/components/playgame/FullscreenPrompt";
import { GameLoadingOverlay } from "@/components/playgame/GameLoadingOverlay";
import { GameErrorScreen } from "@/components/playgame/GameErrorScreen";
import { isMobile, isIOS } from "@/lib/browser-utils";
import { TikTokTracking } from "@/lib/tiktok-client";

const GAME_URL = process.env.NEXT_PUBLIC_GAME_URL || "https://tinylittleroyale.io/";
const GAME_ID = process.env.NEXT_PUBLIC_GAME_ID || "tiny-little-royale";

export default function PlayGame() {
  const router = useRouter();
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const iframeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Custom hooks for state management
  const { token, userId, loading: authLoading, error: authError } = useGameAuth(GAME_ID);
  const { isPortrait, setIsPortrait } = useOrientation();
  const { isFullscreen, showPrompt, setShowPrompt, enterFullscreen } = useFullscreen(
    gameContainerRef
  );
  const { isInApp, browserName, showWarning, setShowWarning } = useInAppBrowser();

  // Local state
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [iframeError, setIframeError] = useState<boolean>(false);

  // Handle iframe loading timeout
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

  // Handle messages from iframe (signup event)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "signup") {
        console.log("[PlayGame] Received signup event from game");

        // Track signup click with TikTok
        TikTokTracking.clickButton('game-signup', {
          source: 'in_game',
          user_id: userId,
        });

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
  }, [router, userId]);

  // Handle iframe load success
  const handleIframeLoad = () => {
    console.log("[PlayGame] Game iframe loaded successfully");

    // Clear the timeout since iframe loaded successfully
    if (iframeTimeoutRef.current) {
      clearTimeout(iframeTimeoutRef.current);
      iframeTimeoutRef.current = null;
    }

    // Hide website loading screen and show game
    setIframeLoading(false);
    setIframeError(false);

    // Track game start event with TikTok
    if (userId) {
      TikTokTracking.gameStart(userId, {
        game_id: GAME_ID,
        platform: isMobile() ? 'mobile' : 'desktop',
      });
    }

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

  // Handle iframe load error
  const handleIframeError = () => {
    console.error("[PlayGame] Iframe failed to load");
    setIframeError(true);
    setIframeLoading(false);
    if (iframeTimeoutRef.current) {
      clearTimeout(iframeTimeoutRef.current);
    }
  };

  // Show loading while authenticating
  if (authLoading) {
    return <LoadingScreen message="Checking Authentication" />;
  }

  // Show loading if no token yet
  if (!token) {
    return <LoadingScreen message="Initializing Game Session" />;
  }

  // Show error screen if authentication failed
  if (authError) {
    return <GameErrorScreen error={authError} type="init" />;
  }

  // Show error screen if iframe failed to load
  if (iframeError) {
    return <GameErrorScreen error="Game failed to load" type="iframe" />;
  }

  // Build game URL with parameters
  const branch = process.env.BRANCH === "develop" ? "&branch=develop" : "";
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
        touchAction: 'none',
        overscrollBehavior: 'none',
      } as React.CSSProperties}
    >
      {/* Portrait mode overlay */}
      {isPortrait && (
        <PortraitOverlay
          isInAppBrowser={isInApp}
          browserName={browserName}
          onContinueAnyway={() => setIsPortrait(false)}
        />
      )}

      {/* In-app browser warning banner */}
      {showWarning && !iframeLoading && !isPortrait && (
        <InAppBrowserWarning browserName={browserName} onDismiss={() => setShowWarning(false)} />
      )}

      {/* Loading overlay */}
      {iframeLoading && !isPortrait && (
        <GameLoadingOverlay isFullscreen={isFullscreen} onEnterFullscreen={enterFullscreen} />
      )}

      {/* Fullscreen prompt */}
      {showPrompt && !iframeLoading && !isPortrait && (
        <FullscreenPrompt
          onEnterFullscreen={enterFullscreen}
          onDismiss={() => setShowPrompt(false)}
        />
      )}

      {/* Game iframe */}
      <iframe
        src={finalGameUrl}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className="absolute inset-0 w-full h-full border-none"
        style={{
          border: 'none',
          outline: 'none',
          margin: 0,
          padding: 0,
          display: (iframeLoading || isPortrait) ? 'none' : 'block',
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
          objectFit: 'fill' as any,
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
