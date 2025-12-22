# Authentication and Game Flow Documentation

This document explains the authentication system and game flow for the Tiny Little Royale application. Use this as a reference when implementing similar logic in other frontends.

---

## Table of Contents

1. [Authentication System Overview](#authentication-system-overview)
2. [Login Flow](#login-flow)
3. [Play Game Flow](#play-game-flow)
4. [API Reference](#api-reference)
5. [Code Examples](#code-examples)

---

## Authentication System Overview

### Architecture

The authentication system uses a combination of:
- **Next.js App Router** for routing and API routes
- **NextAuth.js** for OAuth provider management and session handling
- **Custom Backend JWT tokens** for API authorization
- **React Context** for global state management
- **localStorage** for persisting user data and JWT tokens

### Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| Auth Context | `/src/context/AuthContext.tsx` | Global auth state management |
| useAuth Hook | (exported from AuthContext) | Access auth context |
| NextAuth Config | `/src/lib/auth.ts` | OAuth provider configuration |
| NextAuth Route | `/src/app/api/auth/[...nextauth]/route.ts` | NextAuth API handler |
| OAuth Login Route | `/src/app/api/auth/oauth-login/route.ts` | Exchanges OAuth for backend JWT |
| API Client | `/src/lib/api.ts` | Axios instance with auth interceptors |
| Cookie Utilities | `/src/lib/cookie.ts` | Browser cookie management |

### Auth Context State

```typescript
interface AuthContextType {
    user: User | null;           // User data from backend
    token: string | null;        // JWT token from backend
    loading: boolean;            // Auth initialization status
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (data: any) => Promise<void>;
}

interface User {
    id: string;
    email: string;
    name: string;
    [key: string]: any;
}
```

### Token Storage

1. **NextAuth Session Cookie**: `next-auth.session-token` (HttpOnly, managed by NextAuth)
2. **Backend JWT Token**: Stored in `localStorage` as `jwt_token`
3. **User Data**: Stored in `localStorage` as `user_data` (JSON)
4. **Game Cookies** (for iframe communication):
   - `token` - Game authentication token (5 min TTL)
   - `userId` - User ID (1 year TTL)
   - `username` - Username (1 year TTL)

---

## Login Flow

### 1. Login Page

**File**: `/src/app/auth/signin/page.tsx`

Supported login methods:
- Email/Password
- Google (OAuth)
- Facebook (OAuth)
- Line (OAuth)
- Apple (placeholder)
- Telegram (placeholder)

```typescript
export default function SignIn() {
    const { login, loading, user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user && !loading) {
            const callbackUrl = searchParams.get('callbackUrl') || '/';
            router.push(callbackUrl);
        }
    }, [user, loading, router, searchParams]);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    const handleOAuthLogin = async (provider: string) => {
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        await signIn(provider, {
            redirect: true,
            callbackUrl: callbackUrl
        });
    };
}
```

### 2. Authentication Flows

#### Email/Password Flow

```
1. User submits email/password on /auth/signin
   ↓
2. AuthContext.login(email, password) called
   ↓
3. API client calls: POST /auth/credentials/login
   ↓
4. Backend returns { token, user }
   ↓
5. Context updates state and stores in localStorage:
   - localStorage.setItem('jwt_token', token)
   - localStorage.setItem('user_data', JSON.stringify(user))
   ↓
6. User redirected to home or callbackUrl
```

#### OAuth (Social) Login Flow

```
1. User clicks social login button (Google, Facebook, Line)
   ↓
2. NextAuth signIn(provider) redirects to OAuth provider
   ↓
3. User authorizes on provider's page
   ↓
4. Provider redirects back with authorization code
   ↓
5. NextAuth exchanges code and creates session
   ↓
6. AuthContext detects session change in useEffect
   ↓
7. AuthContext calls: POST /api/auth/oauth-login
   Body: { email, name, image, provider }
   ↓
8. oauth-login route calls backend: POST /auth/login
   ↓
9. Backend creates/updates user, returns { token, user }
   ↓
10. Context stores token and user in localStorage
    ↓
11. User redirected to callbackUrl
```

### 3. Session Persistence

**AuthContext Initialization** (`/src/context/AuthContext.tsx`):

```typescript
// Check localStorage on mount
useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user_data');

    if (storedToken && storedToken !== 'undefined') {
        setToken(storedToken);
    }

    if (storedUser && storedUser !== 'undefined') {
        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.id && parsedUser?.email) {
                setUser(parsedUser);
            }
        } catch (e) {
            localStorage.removeItem('user_data');
            localStorage.removeItem('jwt_token');
        }
    }

    setLoading(false);
}, []);

// Handle NextAuth session changes
useEffect(() => {
    const handleOAuthSession = async () => {
        if (session?.user && !token) {
            // Exchange OAuth session for backend JWT
            const response = await fetch('/api/auth/oauth-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: session.user.email,
                    name: session.user.name,
                    image: session.user.image,
                    provider: session.provider || 'google',
                }),
            });

            const { token: jwtToken, user: userData } = await response.json();
            setToken(jwtToken);
            setUser(userData);

            localStorage.setItem('jwt_token', jwtToken);
            localStorage.setItem('user_data', JSON.stringify(userData));
        }
    };

    handleOAuthSession();
}, [session, sessionStatus, token]);
```

### 4. Logout

```typescript
const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');

    // Sign out from NextAuth session
    await nextAuthSignOut({ redirect: false });

    router.push('/auth/signin');
};
```

---

## Play Game Flow

### Overview

The `/playgame` route handles three types of users:
1. **Authenticated Users** - Logged-in users with JWT tokens
2. **Returning Guest Users** - Guest users with stored cookies
3. **New Guest Users** - First-time visitors

### File Structure

**Main Page**: `/src/app/playgame/page.tsx`

### Configuration

```typescript
const GAME_URL = process.env.NEXT_PUBLIC_GAME_URL || "https://tinylittleroyale.io/";
const GAME_ID = process.env.NEXT_PUBLIC_GAME_ID || "tiny-little-royale";
```

### Complete Flow

```
User navigates to /playgame
        ↓
1. PAGE LOADS
   - Check authLoading and session status
   - If loading → Show "Checking Authentication" screen
        ↓
2. AUTHENTICATION CHECK
   A) If jwtToken exists and authFailed is false:
      → Attempt authenticated flow
   B) If no token OR auth failed:
      → Show choice screen (Login vs Play as Guest)
        ↓
3. CHOICE SCREEN
   - "Login to Account" → Redirect to /auth/signin?callbackUrl=/playgame
   - "Play as Guest" → Continue to guest flow
        ↓
4. API CALL (based on user type)

   A) AUTHENTICATED USER (has jwtToken):
      POST /game-stats/{gameId}
      Headers: { Authorization: Bearer {jwtToken} }

      If response.username contains "guest":
        → PUT /api/users/{userId}/manage-guest-user

   B) RETURNING GUEST (has userId cookie):
      PUT /game-stats/{gameId}/unprotected
      Body: {
        userId: getCookie('userId'),
        username: getCookie('username')
      }

   C) NEW GUEST (no cookies):
      POST /game-stats/{gameId}/unprotected

   D) ON 401 ERROR:
      → Clear stale JWT from localStorage
      → Show choice screen
        ↓
5. RESPONSE HANDLING
   - API returns: { token, userId, username }
   - Call setStateAndCookie(token, userId, username)
        ↓
6. STORE CREDENTIALS
   - setCookie('token', token, 5 minutes)
   - setCookie('userId', userId, 365 days)
   - setCookie('username', username, 365 days)
   - setToken(token)
   - setUserId(userId)
        ↓
7. RENDER GAME
   - Construct URL: {GAME_URL}?user={userId}&login-token={token}&branch={develop}
   - Render iframe with game URL
        ↓
8. LISTEN FOR GAME EVENTS
   - addEventListener('message') for 'signup' event
   - If user signs up from game:
     → Extract referral from URL hash
     → Redirect to /#referral={code}
```

### Code Implementation

**Main PlayGame Component** (`/src/app/playgame/page.tsx`):

```typescript
export default function PlayGame() {
    const { token: jwtToken, loading: authLoading } = useAuth();
    const { status } = useSession();

    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [showChoice, setShowChoice] = useState<boolean>(false);
    const [authFailed, setAuthFailed] = useState<boolean>(false);

    const setStateAndCookie = useCallback(({ token, userId, username }) => {
        setCookie("token", token, addMinutesToDate(new Date(), 5));
        setCookie("userId", userId, 365);
        setCookie("username", username, 365);
        setToken(token);
        setUserId(userId);
    }, []);

    const authenUser = async () => {
        const data = await getGameToken(GAME_ID, jwtToken || undefined);

        // Check if guest user needs promotion
        if (data.username?.toLowerCase().includes('guest')) {
            await manageGuestUser(data.userId);
        }

        return { token: data.token, userId: data.userId, username: data.username };
    };

    const updateToken = async () => {
        const data = await updateGuestToken(
            GAME_ID,
            getCookie("userId") || "",
            getCookie("username") || ""
        );
        return { token: data.token, userId: data.userId, username: data.username };
    };

    const guestUser = async () => {
        const data = await getGuestToken(GAME_ID);
        return { token: data.token, userId: data.userId, username: data.username };
    };

    const initialize = useCallback(async () => {
        try {
            if (jwtToken && !authFailed) {
                const data = await authenUser();
                setStateAndCookie(data);
            } else {
                if (!showChoice && !token) {
                    setShowChoice(true);
                    return;
                }

                if (getCookie("userId")) {
                    const data = await updateToken();
                    setStateAndCookie(data);
                } else {
                    const data = await guestUser();
                    setStateAndCookie(data);
                }
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setAuthFailed(true);
                localStorage.removeItem('jwt_token');
                setShowChoice(true);
            }
        }
    }, [jwtToken, setStateAndCookie, showChoice, token, authFailed]);
}
```

### Choice Screen UI

When a user is not authenticated, they see a choice screen:

```tsx
if (showChoice) {
    return (
        <div className="...">
            <h2>Ready for Battle?</h2>
            <p>Choose how you want to enter the Royale</p>

            <button onClick={() => router.push("/auth/signin?callbackUrl=/playgame")}>
                Login to Account
            </button>

            <button onClick={() => { setShowChoice(false); initialize(); }}>
                Play as Guest
            </button>

            <p>Guest sessions do not save progress or leaderboard statistics</p>
        </div>
    );
}
```

---

## API Reference

### Authentication APIs

#### 1. Email/Password Login
```
POST /auth/credentials/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    ...
  }
}
```

#### 2. OAuth Login (Backend)
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "user@email.com",
  "name": "User Name",
  "image": "https://...",
  "provider": "google",
  "sub": ""
}

Response:
{
  "token": "eyJhbGciOiJIUzI1...",
  "id": "user_id",
  "authUserId": "auth_user_id",
  "email": "user@email.com",
  "displayName": "User Name",
  "photo": "https://...",
  "country": "TH",
  "authProviders": [{ "providerId": "google", "uid": "..." }]
}
```

### Game APIs

#### 3. Get Game Token (Authenticated)
```
POST /game-stats/{gameId}
Headers: { Authorization: Bearer {jwtToken} }

Response:
{
  "data": {
    "token": "game_auth_token",
    "userId": "user_id",
    "username": "username"
  }
}
```

#### 4. Update Guest Token (Returning Guest)
```
PUT /game-stats/{gameId}/unprotected
Content-Type: application/json

Request:
{
  "userId": "guest_user_id",
  "username": "guest_username"
}

Response:
{
  "data": {
    "token": "refreshed_game_token",
    "userId": "guest_user_id",
    "username": "guest_username"
  }
}
```

#### 5. Create Guest Session (New Guest)
```
POST /game-stats/{gameId}/unprotected

Response:
{
  "data": {
    "token": "new_game_token",
    "userId": "new_guest_id",
    "username": "guest_12345"
  }
}
```

---

## Code Examples

### Using Authentication in Components

```typescript
import { useAuth } from '@/context/AuthContext';

const MyComponent = () => {
    const { user, token, loading, logout } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Please log in</div>;
    }

    return (
        <div>
            <h1>Welcome, {user.name}</h1>
            <button onClick={logout}>Logout</button>
        </div>
    );
};
```

### Making Authenticated API Calls

```typescript
import api from '@/lib/api';

// API client is pre-configured with JWT from localStorage
const fetchData = async () => {
    try {
        const response = await api.get('/some-endpoint');
        return response.data;
    } catch (error) {
        console.error('Request failed:', error);
    }
};
```

### Cookie Utilities

```typescript
import { setCookie, getCookie, deleteCookie, addMinutesToDate } from '@/lib/cookie';

// Set cookie with days
setCookie('myKey', 'myValue', 365);

// Set cookie with specific date
setCookie('myKey', 'myValue', addMinutesToDate(new Date(), 5));

// Get cookie
const value = getCookie('myKey');

// Delete cookie
deleteCookie('myKey');
```

---

## Environment Variables Required

```bash
# Backend API base URL
NEXT_PUBLIC_API_URL=https://api.example.com

# Game iframe URL
NEXT_PUBLIC_GAME_URL=https://tinylittleroyale.io/

# Game identifier
NEXT_PUBLIC_GAME_ID=tiny-little-royale

# Branch (develop or production)
BRANCH=develop

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# OAuth provider credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

LINE_CLIENT_ID=your_line_client_id
LINE_CLIENT_SECRET=your_line_client_secret
```

---

## Key Design Decisions

### 1. Why Dual Token System?
- **NextAuth Session**: Handles OAuth flows and manages provider sessions
- **Backend JWT**: Used for API authorization with custom claims and user data

### 2. Why Show Choice Screen for Unauthenticated Users?
- Clear user intent before creating guest accounts
- Prevents accidental guest sessions when user wanted to log in
- Better UX with explicit options

### 3. Why 5-Minute Game Token Expiration?
- Game tokens are short-lived for security
- Tokens refresh on page reload
- Users typically play in continuous sessions

### 4. Why localStorage for JWT?
- Persists across page refreshes
- Accessible from both client and API interceptors
- Separate from NextAuth session management

### 5. Why Cookie + State for Game Data?
- Cookies needed for iframe URL parameter communication
- React state provides instant access in components
- Separation of concerns (game tokens vs auth tokens)

---

## NextAuth Provider Configuration

**File**: `/src/lib/auth.ts`

```typescript
export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                    scope: 'openid email profile',
                },
            },
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID || '',
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
        }),
        // Line custom provider
        {
            id: 'line',
            name: 'LINE',
            type: 'oauth',
            clientId: process.env.LINE_CLIENT_ID || '',
            clientSecret: process.env.LINE_CLIENT_SECRET || '',
            authorization: {
                url: 'https://access.line.me/oauth2/v2.1/authorize',
                params: { scope: 'profile openid email' },
            },
            token: 'https://api.line.me/oauth2/v2.1/token',
            userinfo: 'https://api.line.me/v2/profile',
            profile(profile) {
                return {
                    id: profile.userId,
                    name: profile.displayName,
                    email: profile.email || `${profile.userId}@line.me`,
                    image: profile.pictureUrl,
                };
            },
        },
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.provider = account.provider;
                token.accessToken = account.access_token;
            }
            if (profile) {
                token.email = profile.email || token.email;
                token.name = profile.name || token.name;
                token.picture = profile.picture || profile.image || token.picture;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.email = token.email || '';
                session.user.name = token.name || '';
                session.user.image = token.picture as string || '';
            }
            session.provider = token.provider;
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/signin',
    },
};
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Failed to load game token" 401 | JWT token expired or invalid | Clear localStorage and re-login |
| OAuth login loops | Session/token mismatch | Clear cookies and localStorage |
| Guest session not persisting | Cookies blocked or expired | Check browser cookie settings |
| Infinite loading on /playgame | Auth state not resolving | Check console for API errors |

### Debug Logging

The PlayGame component includes detailed console logging:

```typescript
console.log("[PlayGame] Initializing v2 with:", {
    GAME_ID,
    hasJwtToken: !!jwtToken,
    status,
    showChoice,
    authFailed,
    hasLocalUserId: !!getCookie("userId")
});
```

Check browser console for `[PlayGame]` prefixed messages to debug game initialization issues.
