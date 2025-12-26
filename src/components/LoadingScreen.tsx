'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 w-full h-screen bg-gradient-to-b from-black via-gray-900 to-black flex flex-col items-center justify-center text-white">
            <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-yellow-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-yellow-500 animate-pulse" />
                </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold tracking-wider animate-pulse uppercase text-center px-4">
                {message}
            </h2>

            <div className="mt-8 flex gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-bounce"></div>
            </div>

            <p className="mt-6 text-gray-400 text-sm italic text-center px-4 max-w-md">
                Preparing your Battle Royale experience...
            </p>

            {/* Helpful tip */}
            <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-sm mx-4">
                <p className="text-yellow-400 text-xs text-center">
                    💡 Tip: For best experience, rotate your device to landscape mode
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
