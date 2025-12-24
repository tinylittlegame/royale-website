'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Apple, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signIn } from 'next-auth/react';

export default function SignIn() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login, loading: authLoading, user } = useAuth();

    // Get error from URL params (NextAuth errors)
    const errorParam = searchParams.get('error');

    // Redirect if already logged in
    useEffect(() => {
        if (user && !authLoading) {
            const callbackUrl = searchParams.get('callbackUrl') || '/';
            router.push(callbackUrl);
        }
    }, [user, authLoading, router, searchParams]);

    const [loading, setLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [telegramScriptLoaded, setTelegramScriptLoaded] = useState(false);

    // Set error from URL params
    useEffect(() => {
        if (errorParam) {
            const errorMessages: Record<string, string> = {
                'OAuthSignin': 'Error starting OAuth sign in. Please try again.',
                'OAuthCallback': 'Error during OAuth callback. Please try again.',
                'OAuthCreateAccount': 'Could not create account. Please try again.',
                'EmailCreateAccount': 'Could not create account. Please try again.',
                'Callback': 'Error during login callback. Please try again.',
                'OAuthAccountNotLinked': 'This email is already linked to another account.',
                'AccessDenied': 'Access denied. You may have cancelled the login.',
                'Verification': 'Token expired or invalid.',
                'Default': 'An error occurred during sign in. Please try again.',
            };
            setError(errorMessages[errorParam] || errorMessages['Default']);
        }
    }, [errorParam]);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLoadingProvider('email');
        setError('');
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err?.message || 'Invalid credentials');
            setLoading(false);
            setLoadingProvider(null);
        }
    };

    const handleOAuthLogin = async (provider: string) => {
        setLoading(true);
        setLoadingProvider(provider);
        setError('');

        const callbackUrl = searchParams.get('callbackUrl') || '/';

        await signIn(provider, {
            redirect: true,
            callbackUrl: callbackUrl
        });
    };

    const isProviderLoading = (provider: string) => loadingProvider === provider;

    // Handle Telegram authentication callback
    useEffect(() => {
        // Define global callback for Telegram widget
        (window as any).onTelegramAuth = async (user: any) => {
            setLoading(true);
            setLoadingProvider('telegram');
            setError('');

            try {
                console.log('[Telegram Auth] Received user data from widget:', user);

                // Call our backend API
                const response = await fetch('/api/auth/telegram', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: user.id.toString(),
                        first_name: user.first_name,
                        last_name: user.last_name,
                        username: user.username,
                        photo_url: user.photo_url,
                        auth_date: user.auth_date.toString(),
                        hash: user.hash,
                    }),
                });

                const data = await response.json();

                if (data.success && data.token) {
                    console.log('[Telegram Auth] Authentication successful');

                    // Store user data in localStorage (use same keys as AuthContext)
                    localStorage.setItem('jwt_token', data.token);
                    localStorage.setItem('user_data', JSON.stringify(data.user));

                    // Redirect to callback URL or home
                    const callbackUrl = searchParams.get('callbackUrl') || '/';
                    window.location.href = callbackUrl; // Force full page reload to trigger AuthContext update
                } else {
                    setError(data.message || 'Telegram authentication failed');
                    setLoading(false);
                    setLoadingProvider(null);
                }
            } catch (err: any) {
                console.error('[Telegram Auth] Error:', err);
                setError(err?.message || 'Failed to authenticate with Telegram');
                setLoading(false);
                setLoadingProvider(null);
            }
        };

        // Cleanup
        return () => {
            delete (window as any).onTelegramAuth;
        };
    }, [router, searchParams]);

    const handleTelegramLogin = () => {
        setLoading(true);
        setLoadingProvider('telegram');
        setError('');

        // Load Telegram widget script if not already loaded
        if (!telegramScriptLoaded) {
            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.async = true;
            script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'your_bot_username');
            script.setAttribute('data-size', 'large');
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');
            script.setAttribute('data-request-access', 'write');

            script.onload = () => {
                setTelegramScriptLoaded(true);
                console.log('[Telegram] Widget script loaded');
            };

            script.onerror = () => {
                setError('Failed to load Telegram widget');
                setLoading(false);
                setLoadingProvider(null);
            };

            document.body.appendChild(script);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-neutral-900 border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Image
                            src="/images/Logo/Logo_140x70.png"
                            alt="Tiny Little Royale"
                            width={140}
                            height={70}
                            className="h-16 w-auto hover:scale-105 transition-transform"
                        />
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h1>
                <p className="text-gray-400 text-center mb-8">Choose your login method to start playing</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4 text-center text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Email/Password Form */}
                    <form onSubmit={handleCredentialsLogin} className="space-y-4 mb-6 border-b border-white/10 pb-6">
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                                required
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || authLoading}
                            className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProviderLoading('email') ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <span>Login with Email</span>
                            )}
                        </button>
                    </form>

                    {/* Google */}
                    <button
                        onClick={() => handleOAuthLogin('google')}
                        disabled={loading}
                        className="w-full h-14 bg-white hover:bg-gray-100 text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-colors relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProviderLoading('google') ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Image src="https://authjs.dev/img/providers/google.svg" width={24} height={24} alt="Google" />
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    {/* Facebook */}
                    <button
                        onClick={() => handleOAuthLogin('facebook')}
                        disabled={loading}
                        className="w-full h-14 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProviderLoading('facebook') ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Image src="https://authjs.dev/img/providers/facebook.svg" width={24} height={24} alt="Facebook" />
                                <span>Continue with Facebook</span>
                            </>
                        )}
                    </button>

                    {/* Line */}
                    <button
                        onClick={() => handleOAuthLogin('line')}
                        disabled={loading}
                        className="w-full h-14 bg-[#06C755] hover:bg-[#05b54d] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProviderLoading('line') ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Image src="https://authjs.dev/img/providers/line.svg" width={24} height={24} alt="Line" />
                                <span>Continue with Line</span>
                            </>
                        )}
                    </button>

                    {/* Apple - Coming Soon */}
                    <button
                        disabled
                        className="w-full h-14 bg-white/5 text-white/40 font-bold rounded-xl flex items-center justify-center gap-3 border border-white/10 cursor-not-allowed"
                    >
                        <Apple size={24} />
                        <span>Apple - Coming Soon</span>
                    </button>

                    {/* Telegram */}
                    <button
                        onClick={handleTelegramLogin}
                        disabled={loading}
                        className="w-full h-14 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProviderLoading('telegram') ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.665 3.717L2.946 10.554C1.944 10.954 1.942 11.512 2.753 11.761L7.303 13.18L17.834 6.541C18.332 6.237 18.789 6.406 18.415 6.738L9.888 14.432V14.431L9.88 14.444L9.567 19.123C10.024 19.123 10.226 18.913 10.481 18.667L12.677 16.53L17.243 19.904C18.085 20.368 18.691 20.129 18.9 19.123L21.905 5.034C22.212 3.804 21.436 3.245 20.665 3.717Z" fill="currentColor" />
                                </svg>
                                <span>Continue with Telegram</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    By logging in, you agree to our <Link href="/terms" className="underline hover:text-white">Terms</Link> and <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
                </div>
            </motion.div>
        </div>
    );
}
