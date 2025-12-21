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

// Add a response interceptor for global error logging
api.interceptors.response.use((response) => response, (error) => {
    if (typeof window !== 'undefined') {
        const status = error.response?.status;
        const url = error.config?.url;
        const method = error.config?.method?.toUpperCase();
        console.error(`[API Error] ${method} ${url} returned ${status}`, error.response?.data);
    }
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
    console.log('[API Debug] getGameToken called with gameId:', gameId);
    console.log('[API Debug] Auth header:', api.defaults.headers.common?.Authorization ? 'Bearer ***' : 'none');

    const response = await api.post(`/game-stats/${gameId}`);

    console.log('[API Debug] getGameToken raw response:', {
        status: response.status,
        hasData: !!response.data,
        hasNestedData: !!response.data?.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        nestedDataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        fullData: response.data
    });

    // Handle both response.data.data and response.data structures
    const data = response.data?.data || response.data;
    if (!data || !data.token) {
        console.error('[API Debug] getGameToken - Missing token in response:', data);
        throw new Error('Invalid game token response: missing token');
    }
    return data;
};

export const getGuestToken = async (gameId: string) => {
    console.log('[API Debug] getGuestToken called with gameId:', gameId);

    const response = await api.post(`/game-stats/${gameId}/unprotected`);

    console.log('[API Debug] getGuestToken raw response:', {
        status: response.status,
        hasData: !!response.data,
        hasNestedData: !!response.data?.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        nestedDataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        fullData: response.data
    });

    // Handle both response.data.data and response.data structures
    const data = response.data?.data || response.data;
    if (!data || !data.token) {
        console.error('[API Debug] getGuestToken - Missing token in response:', data);
        throw new Error('Invalid guest token response: missing token');
    }
    return data;
};

export const updateGuestToken = async (gameId: string, userId: string, username: string) => {
    console.log('[API Debug] updateGuestToken called with:', { gameId, userId, username });

    const response = await api.put(`/game-stats/${gameId}/unprotected`, {
        userId,
        username
    });

    console.log('[API Debug] updateGuestToken raw response:', {
        status: response.status,
        hasData: !!response.data,
        hasNestedData: !!response.data?.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        nestedDataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        fullData: response.data
    });

    // Handle both response.data.data and response.data structures
    const data = response.data?.data || response.data;
    if (!data || !data.token) {
        console.error('[API Debug] updateGuestToken - Missing token in response:', data);
        throw new Error('Invalid guest token update response: missing token');
    }
    return data;
};

export const manageGuestUser = async (userId: string) => {
    const response = await api.put(`/api/users/${userId}/manage-guest-user`);
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
