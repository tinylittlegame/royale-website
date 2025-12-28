'use client';

import { motion } from 'framer-motion';
import { copyToClipboard } from '@/lib/browser-utils';

interface PortraitOverlayProps {
  isInAppBrowser: boolean;
  browserName: string;
  onContinueAnyway: () => void;
}

export function PortraitOverlay({
  isInAppBrowser,
  browserName,
  onContinueAnyway,
}: PortraitOverlayProps) {
  const handleCopyLink = async () => {
    const currentUrl = window.location.href;
    const success = await copyToClipboard(currentUrl);

    if (success) {
      alert('✓ Link copied! Paste it in Safari or Chrome for the best experience.');
    } else {
      alert(`Copy this link and open in Safari/Chrome:\n\n${currentUrl}`);
    }
  };

  return (
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
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
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

        {/* In-app browser specific message and bypass option */}
        {isInAppBrowser && (
          <div className="mt-8 bg-orange-900/30 border border-orange-500/50 rounded-lg p-4 w-full max-w-sm mx-auto">
            <div className="flex items-start gap-2 mb-3">
              <svg
                className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5"
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
              <p className="text-orange-200 text-sm">
                <strong>{browserName}</strong> browser doesn't support screen rotation.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Link for Browser
              </button>
              <button
                onClick={onContinueAnyway}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs font-medium transition-colors"
              >
                Continue in Portrait (Not Recommended)
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-gray-500 text-sm">Landscape mode required • Width × Height</div>
    </div>
  );
}
