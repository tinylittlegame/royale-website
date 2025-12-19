'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Apple } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signIn } from 'next-auth/react';

export default function SignIn() {
    const searchParams = useSearchParams();
    const { login, loading: authLoading } = useAuth(); // rename loading to avoid conflict
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid credentials');
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: string) => {
        setLoading(true);

        // Get the final destination from URL params (e.g., /playgame)
        const callbackUrl = searchParams.get('callbackUrl') || '/';

        // Use NextAuth signIn - it will handle OAuth flow and redirect back to this domain
        await signIn(provider, {
            redirect: true,
            callbackUrl: callbackUrl
        });
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
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || authLoading}
                            className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-colors"
                        >
                            <span>Login with Email</span>
                        </button>
                    </form>

                    {/* Google */}
                    <button
                        onClick={() => handleOAuthLogin('google')}
                        disabled={loading}
                        className="w-full h-14 bg-white hover:bg-gray-100 text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-colors relative overflow-hidden group"
                    >
                        <Image src="https://authjs.dev/img/providers/google.svg" width={24} height={24} alt="Google" />
                        <span>Continue with Google</span>
                    </button>

                    {/* Facebook */}
                    <button
                        onClick={() => handleOAuthLogin('facebook')}
                        disabled={loading}
                        className="w-full h-14 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors"
                    >
                        <Image src="https://authjs.dev/img/providers/facebook.svg" width={24} height={24} alt="Facebook" />
                        <span>Continue with Facebook</span>
                    </button>

                    {/* Line */}
                    <button
                        onClick={() => handleOAuthLogin('line')}
                        disabled={loading}
                        className="w-full h-14 bg-[#06C755] hover:bg-[#05b54d] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors"
                    >
                        <Image src="https://authjs.dev/img/providers/line.svg" width={24} height={24} alt="Line" />
                        <span>Continue with Line</span>
                    </button>

                    {/* Apple - Placeholder for now / Lower Priority */}
                    <button
                        onClick={() => handleOAuthLogin('apple')} // assuming apple endpoint exists or placeholder logic
                        disabled={loading}
                        className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors border border-white/10"
                    >
                        <Apple fill="white" size={24} />
                        <span>Continue with Apple</span>
                    </button>

                    {/* Telegram - Placeholder */}
                    <button
                        onClick={() => alert("Telegram Login Coming Soon!")}
                        disabled={loading}
                        className="w-full h-14 bg-[#229ED9] hover:bg-[#1f8ec2] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors"
                    >
                        {/* Telegram Icon SVG */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.665 3.717L2.946 10.554C1.944 10.954 1.942 11.512 2.753 11.761L7.303 13.18L17.834 6.541C18.332 6.237 18.789 6.406 18.415 6.738L9.888 14.432V14.431L9.88 14.444L9.567 19.123C10.024 19.123 10.226 18.913 10.481 18.667L12.677 16.53L17.243 19.904C18.085 20.368 18.691 20.129 18.9 19.123L21.905 5.034C22.212 3.804 21.436 3.245 20.665 3.717Z" fill="white" />
                        </svg>
                        <span>Continue with Telegram</span>
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    By logging in, you agree to our <a href="#" className="underline hover:text-white">Terms</a> and <a href="#" className="underline hover:text-white">Privacy Policy</a>.
                </div>
            </motion.div>
        </div>
    );
}
