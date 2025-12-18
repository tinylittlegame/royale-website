'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

    useEffect(() => {
        // Check for token in URL (OAuth redirect)
        const urlToken = searchParams.get('token');
        const urlUser = searchParams.get('user'); // Assuming backend might pass user data as JSON string or we fetch it

        // Check localStorage
        const storedToken = localStorage.getItem('jwt_token');
        const storedUser = localStorage.getItem('user_data');

        if (urlToken) {
            setToken(urlToken);
            localStorage.setItem('jwt_token', urlToken);

            // Clear params from URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // If we have user data in URL or need to fetch it
            // For now, assume we might need to fetch it or it's passed
            // If not passed, we might need a /me endpoint. 
            // Let's rely on stored user or decode if possible, but for now just set token.
        } else if (storedToken) {
            setToken(storedToken);
        }

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user data");
            }
        }

        setLoading(false);
    }, [searchParams]);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiLogin(email, password);
            // Response structure from doc: { token, user: { ... } }
            const { token, user } = response;

            setToken(token);
            setUser(user);

            localStorage.setItem('jwt_token', token);
            localStorage.setItem('user_data', JSON.stringify(user));

            router.push('/');
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

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
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
