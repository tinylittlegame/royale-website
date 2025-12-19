'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import api, { login as apiLogin, register as apiRegister } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status: sessionStatus } = useSession();

    // Handle NextAuth session changes (OAuth login)
    useEffect(() => {
        const handleOAuthSession = async () => {
            if (sessionStatus === 'loading') {
                setLoading(true);
                return;
            }

            if (session?.user && !token) {
                // OAuth login successful, exchange for backend JWT token via our Next.js API route
                try {
                    // Call our Next.js API route (not the backend directly)
                    const response = await fetch('/api/auth/oauth-login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: session.user.email,
                            name: session.user.name,
                            image: session.user.image,
                            provider: (session as any).provider || 'google',
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('OAuth login failed:', errorData);
                        throw new Error(errorData.error || 'OAuth login failed');
                    }

                    const data = await response.json();

                    const { token: jwtToken, user: userData } = data;

                    if (jwtToken && userData) {
                        setToken(jwtToken);
                        setUser(userData);

                        localStorage.setItem('jwt_token', jwtToken);
                        localStorage.setItem('user_data', JSON.stringify(userData));
                    } else {
                        console.error('Invalid token or user data received. Response:', data);
                    }
                } catch (error: any) {
                    console.error('Failed to exchange OAuth for JWT:', error);
                }
            }

            setLoading(false);
        };

        handleOAuthSession();
    }, [session, sessionStatus, token]);

    // Check localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        const storedUser = localStorage.getItem('user_data');

        // Validate token - must exist and not be "undefined" or "null" strings
        if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
            setToken(storedToken);
        }

        // Validate user data - must exist, not be invalid strings, and be parseable JSON
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Validate that parsed data has required User fields
                if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email) {
                    setUser(parsedUser);
                } else {
                    console.warn("Invalid user data format, clearing storage");
                    localStorage.removeItem('user_data');
                    localStorage.removeItem('jwt_token');
                }
            } catch (e) {
                console.error("Failed to parse stored user data, clearing storage:", e);
                // Clear corrupted data
                localStorage.removeItem('user_data');
                localStorage.removeItem('jwt_token');
            }
        }

        // Always set loading to false after initial check
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiLogin(email, password);
            // Response structure from doc: { token, user: { ... } }
            const { token, user } = response;

            if (token && user) {
                setToken(token);
                setUser(user);

                localStorage.setItem('jwt_token', token);
                localStorage.setItem('user_data', JSON.stringify(user));

                router.push('/');
            } else {
                throw new Error('Invalid response from login API');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            await apiRegister(data);
            // Auto login or redirect to login? 
            // Doc says: Register -> Response { ... }
            // Usually requires login after. existing signin page flow might handle this.
            router.push('/auth/signin');
        } catch (error) {
            throw error;
        }
    }

    const logout = async () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');

        // Sign out from NextAuth session
        await nextAuthSignOut({ redirect: false });

        router.push('/auth/signin');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
