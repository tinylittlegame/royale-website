'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { TikTokTracking } from '@/lib/tiktok-client';

export default function AuthSuccess() {
    const { token } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const trackedRef = useRef(false);

    useEffect(() => {
        if (token && !trackedRef.current) {
            // Track successful registration with TikTok
            trackedRef.current = true;

            // Get user data from localStorage if available
            const userData = localStorage.getItem('user_data');
            let userId, userEmail;
            if (userData) {
                try {
                    const parsed = JSON.parse(userData);
                    userId = parsed.uid;
                    userEmail = parsed.email;
                } catch (e) {
                    console.error('Failed to parse user data:', e);
                }
            }

            TikTokTracking.completeRegistration(userId, userEmail, {
                method: searchParams.get('provider') || 'unknown',
            });

            // User is authenticated, redirect to callback URL
            const callbackUrl = searchParams.get('callbackUrl') || '/';
            router.push(callbackUrl);
        }
    }, [token, router, searchParams]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-yellow-500 animate-spin" />
                <h1 className="text-2xl font-bold text-white">Logging you in...</h1>
                <p className="text-gray-400">Please wait while we redirect you.</p>
            </div>
        </div>
    );
}
