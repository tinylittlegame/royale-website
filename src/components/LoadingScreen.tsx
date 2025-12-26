'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center text-white w-full h-full">
            <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-yellow-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-yellow-500 animate-pulse" />
                </div>
            </div>

            <h2 className="text-2xl font-bold tracking-wider animate-pulse uppercase">
                {message}
            </h2>

            <div className="mt-8 flex gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-bounce"></div>
            </div>

            <p className="mt-4 text-gray-500 text-sm italic">
                Preparing your Royale experience
            </p>
        </div>
    );
};

export default LoadingScreen;
