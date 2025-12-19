import axios from 'axios';

// Create an axios instance with the base URL
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://tinybackend-dev.tinylittle.xyz/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/credentials/login', { email, password });
    return response.data;
};

export const register = async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const getGameToken = async (gameId: string) => {
    // Use /unprotected endpoint per LOGIN_TOKEN_SYSTEM.md
    // This works for both guest and authenticated users without JWT
    const response = await api.post(`/game-stats/${gameId}/unprotected`);
    return response.data;
};

export const getLeaderboard = async (gameId: string, type: string = 'monthly-deathmatch', limit: number = 20) => {
    try {
        console.log(`Fetching leaderboard for ${gameId}/${type}...`);
        const response = await api.get(`/games/${gameId}/tournaments/${type}/leaderboard`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        return [];
    }
};

export const syncUser = async (user: any, account: any) => {
    // Deprecated with new auth flow, keeping for backward compatibility if needed temporarily
    return true;
};

export default api;
