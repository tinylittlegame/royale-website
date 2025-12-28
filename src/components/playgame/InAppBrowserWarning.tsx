'use client';

import { copyToClipboard } from '@/lib/browser-utils';

interface InAppBrowserWarningProps {
  browserName: string;
  onDismiss: () => void;
}

export function InAppBrowserWarning({ browserName, onDismiss }: InAppBrowserWarningProps) {
  const handleCopyLink = async () => {
    const currentUrl = window.location.href;
    const success = await copyToClipboard(currentUrl);

    if (success) {
      alert('Link copied! Paste in your browser.');
    } else {
      alert(`Copy this link:\n${currentUrl}`);
    }
  };

  return (
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
            <span className="font-semibold">In {browserName}</span> - For rotation & fullscreen,
            open in Safari/Chrome
          </p>
        </div>
        <button
          onClick={handleCopyLink}
          className="px-2 py-1 bg-white text-orange-700 font-bold text-xs rounded hover:bg-orange-50 transition-colors flex-shrink-0"
        >
          Copy
        </button>
        <button
          onClick={onDismiss}
          className="text-white/90 hover:text-white flex-shrink-0 p-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
