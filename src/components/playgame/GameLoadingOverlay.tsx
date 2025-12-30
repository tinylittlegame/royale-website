"use client";

import { isMobile, isIOS, isStandalone } from "@/lib/browser-utils";

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
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black gap-6 cursor-pointer"
      onClick={() => {
        if (mobile && !isFullscreen && !ios) {
          onEnterFullscreen();
        }
      }}
    >
      {/* Loading spinner */}
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-yellow-500 animate-spin"></div>
      </div>

      {/* Loading text - Thai primary, English secondary */}
      <div className="text-center animate-pulse">
        <h2 className="text-yellow-500 text-2xl font-bold tracking-wide">
          กำลังโหลดเกม...
        </h2>
        <p className="text-yellow-400 text-sm mt-2">
          Loading Game...
        </p>
      </div>

      {/* Bouncing dots */}
      <div className="flex gap-2">
        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-bounce"></div>
      </div>

      {/* Mobile fullscreen prompt */}
      {mobile && !isFullscreen && !ios && (
        <div className="text-center px-4 animate-pulse mt-4">
          <p className="text-yellow-500 text-base font-medium">
            แตะเพื่อเข้าสู่โหมดเต็มหน้าจอ
          </p>
          <p className="text-yellow-200 text-xs mt-1">
            Tap anywhere to enter fullscreen
          </p>
        </div>
      )}

      {/* iOS home screen tip */}
      {ios && !standalone && (
        <div className="text-center px-4 max-w-xs mt-4">
          <p className="text-gray-400 text-sm">
            💡 เพิ่มไปที่หน้าจอหลักเพื่อประสบการณ์แบบเต็มหน้าจอ
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Add to Home Screen for fullscreen experience
          </p>
        </div>
      )}

      {/* Landscape mode tip */}
      {(!mobile || isFullscreen) && (
        <div className="text-center px-4 mt-4">
          <p className="text-gray-400 text-sm">
            เล่นในโหมดแนวนอนเพื่อประสบการณ์ที่ดีที่สุด
          </p>
          <p className="text-gray-500 text-xs mt-1">
            For best experience, play in landscape mode
          </p>
        </div>
      )}
    </div>
  );
}
