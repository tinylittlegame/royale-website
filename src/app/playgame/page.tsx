'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getGameToken } from '@/lib/api';

export default function PlayGame() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [gameToken, setGameToken] = useState<string | null>(null);
    const [gameUserId, setGameUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const GAME_URL = process.env.NEXT_PUBLIC_GAME_URL || "https://tinylittlefly.io/";
    const GAME_ID = 'tiny-little-royale';

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/auth/signin?callbackUrl=/playgame');
            } else {
                // Fetch Game Token
                const fetchToken = async () => {
                    try {
                        const data = await getGameToken(GAME_ID);
                        setGameToken(data.token);
                        setGameUserId(data.userId);
                    } catch (error: any) {
                        console.error("Failed to get game token", error);
                        const msg = error.response?.data?.message || error.message || "Failed to load game token";
                        setErrorMsg(`${msg} (Status: ${error.response?.status})`);
                    } finally {
                        setLoading(false);
                    }
                };
                fetchToken();
            }
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="w-full h-[calc(100vh-64px)] bg-black flex items-center justify-center text-white">
                Loading Game...
            </div>
        );
    }

    if (errorMsg || !gameToken || !gameUserId) {
        return (
            <div className="w-full h-[calc(100vh-64px)] bg-black flex flex-col items-center justify-center text-white gap-4">
                <p className="text-red-500 font-bold text-xl">Error Loading Game</p>
                <p className="text-gray-400">{errorMsg || "Failed to load game token"}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-bold"
                >
                    Try Refreshing
                </button>
            </div>
        );
    }

    // Append token to Game URL
    // Supports Login V2 which requires userId
    const finalGameUrl = `${GAME_URL}?token=${gameToken}&userId=${gameUserId}&username=${encodeURIComponent(user?.name || '')}`;

    return (
        <div className="w-full h-[calc(100vh-64px)] bg-black relative">
            <iframe
                src={finalGameUrl}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}
