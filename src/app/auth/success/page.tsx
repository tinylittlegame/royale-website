'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState('');

    useEffect(() => {
        const handleOAuthCallback = () => {
            try {
                // Get token and user data from URL params (sent by backend)
                const token = searchParams.get('token');
                const userData = searchParams.get('user');

                console.log('OAuth callback received:', { token: !!token, userData: !!userData });

                if (token && userData) {
                    // Parse user data
                    const user = JSON.parse(decodeURIComponent(userData));

                    // Store in localStorage
                    localStorage.setItem('jwt_token', token);
                    localStorage.setItem('user_data', JSON.stringify(user));

                    console.log('OAuth login successful, user:', user);

                    // Get the callback URL from sessionStorage (set before OAuth redirect)
                    const callbackUrl = sessionStorage.getItem('oauth_callback_url') || '/';
                    sessionStorage.removeItem('oauth_callback_url');

                    // Redirect to the original destination
                    router.push(callbackUrl);
                } else {
                    // No token in params, check if we already have one in localStorage
                    const existingToken = localStorage.getItem('jwt_token');
                    if (existingToken) {
                        const callbackUrl = sessionStorage.getItem('oauth_callback_url') || '/';
                        sessionStorage.removeItem('oauth_callback_url');
                        router.push(callbackUrl);
                    } else {
                        setError('No authentication data received. Please try again.');
                        console.error('No token or user data in OAuth callback');
                        setTimeout(() => router.push('/auth/signin'), 3000);
                    }
                }
            } catch (err) {
                console.error('Failed to process OAuth callback:', err);
                setError('Failed to complete login. Please try again.');
                setTimeout(() => router.push('/auth/signin'), 3000);
            }
        };

        handleOAuthCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4">
                {error ? (
                    <>
                        <div className="text-red-500 text-center">
                            <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
                            <p>{error}</p>
                            <p className="text-sm mt-2 text-gray-400">Redirecting to login...</p>
                        </div>
                    </>
                ) : (
                    <>
                        <Loader2 className="h-12 w-12 text-yellow-500 animate-spin" />
                        <h1 className="text-2xl font-bold text-white">Logging you in...</h1>
                        <p className="text-gray-400">Please wait while we redirect you.</p>
                    </>
                )}
            </div>
        </div>
    );
}
