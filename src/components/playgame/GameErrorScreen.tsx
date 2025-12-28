'use client';

import { useRouter } from 'next/navigation';

interface GameErrorScreenProps {
  error: string;
  type?: 'init' | 'iframe';
}

export function GameErrorScreen({ error, type = 'init' }: GameErrorScreenProps) {
  const router = useRouter();

  if (type === 'iframe') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white gap-6 p-6">
        <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="text-center max-w-md">
          <p className="text-red-500 font-bold text-2xl uppercase tracking-widest mb-3">
            Game Failed to Load
          </p>
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

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white gap-4 p-6">
      <p className="text-red-500 font-bold text-xl uppercase tracking-widest">
        Initialization Error
      </p>
      <p className="text-gray-400 text-center max-w-md">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-bold uppercase transition-all"
      >
        Try Again
      </button>
    </div>
  );
}
