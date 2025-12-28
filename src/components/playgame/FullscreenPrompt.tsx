'use client';

import { motion } from 'framer-motion';
import { isIOS, isStandalone } from '@/lib/browser-utils';

interface FullscreenPromptProps {
  onEnterFullscreen: () => void;
  onDismiss: () => void;
}

export function FullscreenPrompt({ onEnterFullscreen, onDismiss }: FullscreenPromptProps) {
  const isIOSDevice = isIOS();
  const isStandaloneMode = isStandalone();

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900 border border-yellow-500/30 rounded-2xl p-8 text-center"
      >
        {isIOSDevice && !isStandaloneMode ? (
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
                    <svg
                      className="inline-block w-4 h-4 mx-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .9 2 2z" />
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
              onClick={onDismiss}
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
              onClick={onEnterFullscreen}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider shadow-lg shadow-yellow-500/20"
            >
              🎮 Enter Fullscreen Now
            </button>

            <button
              onClick={onDismiss}
              className="mt-3 text-gray-500 hover:text-gray-400 text-sm underline"
            >
              Maybe later
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
