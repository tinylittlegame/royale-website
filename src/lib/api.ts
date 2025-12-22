import axios from "axios";

/**
 * Axios instance configured for the Tiny Little backend API
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to automatically include JWT token in requests
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("jwt_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor for global error handling
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const url = error.config?.url;
      const method = error.config?.method?.toUpperCase();
      console.error(
        `[API Error] ${method} ${url} returned ${status}`,
        error.response?.data,
      );
    }
    return Promise.reject(error);
  },
);

/**
 * Authenticate user with email and password
 */
export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/credentials/login", {
    email,
    password,
  });
  return response.data;
};

/**
 * Register a new user
 */
export const register = async (data: any) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

/**
 * Generate a game token for authenticated users
 * @param gameId - The game identifier
 * @param jwtToken - Optional JWT token to override the default from localStorage
 */
export const getGameToken = async (gameId: string, jwtToken?: string) => {
  const config = jwtToken
    ? {
        headers: { Authorization: `Bearer ${jwtToken}` },
      }
    : undefined;

  const response = await api.post(`/game-stats/${gameId}`, {}, config);
  const data = response.data?.data || response.data;

  if (!data || !data.token) {
    throw new Error("Invalid game token response: missing token");
  }

  return data;
};

/**
 * Generate a guest token for unauthenticated users
 */
export const getGuestToken = async (gameId: string) => {
  const response = await api.post(`/game-stats/${gameId}/unprotected`);
  const data = response.data?.data || response.data;

  if (!data || !data.token) {
    throw new Error("Invalid guest token response: missing token");
  }

  return data;
};

/**
 * Update guest user credentials
 */
export const updateGuestToken = async (
  gameId: string,
  userId: string,
  username: string,
) => {
  const response = await api.put(`/game-stats/${gameId}/unprotected`, {
    userId,
    username,
  });

  const data = response.data?.data || response.data;

  if (!data || !data.token) {
    throw new Error("Invalid guest token update response: missing token");
  }

  return data;
};

/**
 * Manage guest user account (promote to full account)
 */
export const manageGuestUser = async (userId: string) => {
  const response = await api.put(`/api/users/${userId}/manage-guest-user`);
  return response.data;
};

/**
 * Fetch leaderboard for a specific game and tournament type
 */
export const getLeaderboard = async (
  gameId: string,
  type: string = "monthly-deathmatch",
  limit: number = 20,
) => {
  try {
    const response = await api.get(
      `/games/${gameId}/tournaments/${type}/leaderboard`,
      {
        params: { limit },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
};

export default api;
