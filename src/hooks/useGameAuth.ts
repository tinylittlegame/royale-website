import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSession } from 'next-auth/react';
import { getGameToken, getGuestToken, updateGuestToken, manageGuestUser } from '@/lib/api';
import { getCookie, setCookie, addMinutesToDate } from '@/lib/cookie';

interface GameAuthState {
  token: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
}

interface InfoType {
  token: string;
  userId: string;
  username: string;
}

/**
 * Hook to manage game authentication (authenticated user or guest)
 */
export function useGameAuth(gameId: string) {
  const { token: jwtToken, loading: authLoading } = useAuth();
  const { status } = useSession();

  const [state, setState] = useState<GameAuthState>({
    token: null,
    userId: null,
    loading: true,
    error: null,
  });

  const [authFailed, setAuthFailed] = useState<boolean>(false);
  const initializingRef = useRef<boolean>(false);
  const hasRedirectedRef = useRef<boolean>(false);

  const setStateAndCookie = useCallback(({ token, userId, username }: InfoType) => {
    if (token && userId && username) {
      setCookie('token', token, addMinutesToDate(new Date(), 5));
      setCookie('userId', userId, 365);
      setCookie('username', username, 365);

      setState((prev) => ({
        ...prev,
        token,
        userId,
        loading: false,
        error: null,
      }));
    }
  }, []);

  const authenUser = async (): Promise<InfoType> => {
    const data = await getGameToken(gameId, jwtToken || undefined);

    // Check if guest user needs promotion
    if (data.username && data.username.toLowerCase().includes('guest')) {
      console.log('[useGameAuth] Authenticated user identified as guest, promoting...');
      await manageGuestUser(data.userId);
    }

    return {
      token: data.token,
      userId: data.userId,
      username: data.username,
    };
  };

  const updateToken = async (): Promise<InfoType> => {
    const data = await updateGuestToken(
      gameId,
      getCookie('userId') || '',
      getCookie('username') || ''
    );
    return {
      token: data.token,
      userId: data.userId,
      username: data.username,
    };
  };

  const guestUser = async (): Promise<InfoType> => {
    const data = await getGuestToken(gameId);
    return {
      token: data.token,
      userId: data.userId,
      username: data.username,
    };
  };

  const initialize = useCallback(async () => {
    // Prevent concurrent initializations
    if (initializingRef.current) {
      console.log('[useGameAuth] Already initializing, skipping...');
      return;
    }
    initializingRef.current = true;

    console.log('[useGameAuth] Initializing with:', {
      gameId,
      hasJwtToken: !!jwtToken,
      jwtTokenPrefix: jwtToken ? jwtToken.substring(0, 10) + '...' : 'none',
      status,
      authFailed,
      hasLocalUserId: !!getCookie('userId'),
    });

    try {
      // Skip authenticated flow if auth already failed (401) to prevent retry loops
      if (jwtToken && jwtToken !== 'unauthenticated' && !authFailed) {
        console.log('[useGameAuth] Attempting Authenticated Flow');
        const data = await authenUser();
        setStateAndCookie(data);
      } else {
        // Guest flow - create or update guest user
        if (getCookie('userId')) {
          console.log('[useGameAuth] Attempting Guest Update Flow (UserId exists)');
          const data = await updateToken();
          setStateAndCookie(data);
        } else {
          console.log('[useGameAuth] Attempting New Guest Flow');
          const data = await guestUser();
          setStateAndCookie(data);
        }
      }
    } catch (error: any) {
      console.error('[useGameAuth] Initialization Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        configUrl: error.config?.url,
      });

      // On 401 Unauthorized, mark auth as failed and fall back to guest
      if (error.response?.status === 401) {
        console.log(
          '[useGameAuth] 401 Unauthorized - Clearing stale JWT and creating guest account'
        );
        setAuthFailed(true);
        // Clear the stale JWT token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user_data');
        }
        // Try to create guest account
        try {
          const guestData = await guestUser();
          setStateAndCookie(guestData);
        } catch (guestError: any) {
          console.error('[useGameAuth] Failed to create guest account:', guestError);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'Failed to initialize game session. Please try again.',
          }));
        }
      } else {
        // For other errors, show error message
        setState((prev) => ({
          ...prev,
          loading: false,
          error: `Failed to initialize game session: ${error.message}. Please try again.`,
        }));
      }
    } finally {
      initializingRef.current = false;
    }
  }, [jwtToken, status, authFailed, gameId, setStateAndCookie]);

  useEffect(() => {
    // Don't re-initialize if we already have a token
    if (state.token) {
      console.log('[useGameAuth] Already have token, skipping initialization');
      return;
    }

    // Don't do anything if already redirected
    if (hasRedirectedRef.current) {
      return;
    }

    // Wait for both auth loading states to settle
    if (authLoading || status === 'loading') {
      console.log('[useGameAuth] Still loading auth state...', { authLoading, status });
      return;
    }

    console.log('[useGameAuth] Auth state settled:', {
      hasJwtToken: !!jwtToken,
      sessionStatus: status,
      authFailed,
    });

    // If we have a JWT token and auth hasn't failed, initialize
    if (jwtToken && jwtToken !== 'unauthenticated' && !authFailed) {
      initialize();
      return;
    }

    // If there's an authenticated NextAuth session but no JWT token yet,
    // wait for AuthContext to exchange it (give it a moment)
    if (status === 'authenticated' && !jwtToken) {
      console.log('[useGameAuth] NextAuth session exists, waiting for JWT exchange...');
      return;
    }

    // If unauthenticated, just initialize (will create guest account)
    if (status === 'unauthenticated' && !jwtToken && !authFailed) {
      console.log('[useGameAuth] Unauthenticated - Initializing guest account');
      initialize();
    }
  }, [authLoading, status, jwtToken, state.token, initialize, authFailed]);

  return {
    token: state.token,
    userId: state.userId,
    loading: state.loading || authLoading || status === 'loading',
    error: state.error,
  };
}
