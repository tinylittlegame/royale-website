'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/AuthContext';

type Props = {
    children: React.ReactNode;
};

export const Providers = ({ children }: Props) => {
    return (
        <SessionProvider>
            <AuthProvider>{children}</AuthProvider>
        </SessionProvider>
    );
};
