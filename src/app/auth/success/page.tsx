'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthSuccess() {
    const { token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (token) {
            router.push('/');
        }
    }, [token, router]);

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
