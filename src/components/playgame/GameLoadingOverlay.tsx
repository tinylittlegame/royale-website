'use client';

import LoadingScreen from '@/components/LoadingScreen';
import { isMobile, isIOS, isStandalone } from '@/lib/browser-utils';

interface GameLoadingOverlayProps {
  isFullscreen: boolean;
  onEnterFullscreen: () => void;
}

export function GameLoadingOverlay({
  isFullscreen,
  onEnterFullscreen,
}: GameLoadingOverlayProps) {
  const mobile = isMobile();
  const ios = isIOS();
  const standalone = isStandalone();

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black gap-4 cursor-pointer"
      onClick={() => {
        if (mobile && !isFullscreen && !ios) {
          onEnterFullscreen();
        }
      }}
    >
      <LoadingScreen message="Loading Game..." />
      {mobile && !isFullscreen && !ios && (
        <p className="text-yellow-500 text-sm text-center px-4 animate-pulse">
          Tap anywhere to enter fullscreen
        </p>
      )}
      {ios && !standalone && (
        <p className="text-gray-400 text-sm text-center px-4 max-w-xs">
          💡 Tip: Add to Home Screen for fullscreen experience
        </p>
      )}
      {(!mobile || isFullscreen) && (
        <p className="text-gray-500 text-sm text-center px-4">
          For best experience, play in landscape mode
        </p>
      )}
    </div>
  );
}
