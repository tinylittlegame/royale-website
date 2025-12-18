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

    const GAME_URL = process.env.NEXT_PUBLIC_GAME_URL || "https://tinylittlefly.io/";
    const GAME_ID = 'tiny-little-royale'; // or derived from env/params

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
                    } catch (error) {
                        console.error("Failed to get game token", error);
                        // Handle error (maybe show error message or retry)
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

    if (!gameToken || !gameUserId) {
        return (
            <div className="w-full h-[calc(100vh-64px)] bg-black flex items-center justify-center text-white">
                Failed to load game token. Please try refreshing.
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
