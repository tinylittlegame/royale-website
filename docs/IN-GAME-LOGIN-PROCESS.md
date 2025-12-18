# In-Game Login Process Documentation

This document describes the complete authentication and game token flow for the Tiny Little Game platform. It explains how external developers can integrate with our authentication system and obtain game tokens for in-game login.

## Overview

The in-game login process consists of two main phases:
1. **User Authentication**: Obtain JWT token from the auth system
2. **Game Token Generation**: Use JWT token to get game-specific tokens for gameplay

## Authentication Flow

```mermaid
flowchart TD
    A[User Starts Game] --> B{User Registered?}
    B -->|No| C[Register User Account]
    B -->|Yes| D[User Login]
    C --> D
    D --> E{Authentication Method}
    E -->|Email/Password| F[POST /auth/credentials/login]
    E -->|Google OAuth| G[GET /auth/google]
    E -->|Facebook OAuth| H[GET /auth/facebook]
    E -->|Line OAuth| L_LINE[GET /auth/line]
    E -->|Web3 Wallet| I[POST /auth/web3-login]
    F --> J[Receive JWT Token]
    G --> J
    H --> J
    I --> J
    J --> K[Store JWT Token]
    K --> L[Request Game Token]
    L --> M[POST /game-stats/{gameId}]
    M --> N[Receive Game Token]
    N --> O[Start Game Session]
    O --> P{Session Valid?}
    P -->|Yes| Q[Continue Playing]
    P -->|No| R[Token Expired/Invalid]
    R --> L
    Q --> S[Game Ends]
    S --> T[Session Complete]
```

## API Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Purpose:** Create a new user account

**Request:**
```json
{
  "email": "player@example.com",
  "password": "SecurePass123!",
  "name": "Player Name",
  "confirmURL": "https://your-app.com/confirm"
}
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "player@example.com",
  "name": "Player Name",
  "emailConfirmed": false
}
```

### 2. User Authentication

#### Option A: Email/Password Login

**Endpoint:** `POST /api/auth/credentials/login`

**Request:**
```json
{
  "email": "player@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "player@example.com",
    "displayName": "Player Name",
    "authUserId": "firebase-auth-id"
  }
}
```

#### Option B: Google OAuth Login

**Endpoint:** `GET /api/auth/google`

**Flow:** Browser-based OAuth redirect flow
1. Redirect user to `/api/auth/google`
2. User completes Google authentication
3. Callback to `/api/auth/google/callback`
4. Redirect to success page with user data

4. Redirect to success page with user data

#### Option C: Facebook OAuth Login

**Endpoint:** `GET /api/auth/facebook`

**Flow:** Browser-based OAuth redirect flow
1. Redirect user to `/api/auth/facebook`
2. User completes Facebook authentication
3. Callback to `/api/auth/facebook/callback`
4. Redirect to success page with user data

#### Option D: Line OAuth Login

> [!IMPORTANT]
> **Implementation Note**: The Line login strategy is implemented in the backend, but the endpoints `GET /api/auth/line` and `callback` need to be enabled in `AuthController`.

**Endpoint:** `GET /api/auth/line`

**Flow:** Browser-based OAuth redirect flow
1. Redirect user to `/api/auth/line`
2. User completes Line authentication
3. Callback to `/api/auth/line/callback`
4. Redirect to success page with user data

#### Option E: Web3 Wallet Login

**Endpoint:** `POST /api/auth/web3-login`

**Request:**
```json
{
  "wallet": "0x742d35Cc9e8C4e3BaF0A97D1234567890AbCdEf",
  "sign": "0x1234567890abcdef...",
  "message": "Login message"
}
```

### 3. Game Token Generation

**Endpoint:** `POST /api/game-stats/{gameId}`

**Purpose:** Generate game-specific token for authenticated users

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Parameters:**
- `gameId`: Game identifier (e.g., `tiny-little-fly`, `tiny-little-tank`)

**Response:**
```json
{
  "token": "Ab3dEf9H",
  "username": "Player Name",
  "userId": "firebase-auth-id"
}
```

**Game Token Properties:**
- **Length:** 8 characters
- **Format:** Alphanumeric (A-Z, a-z, 0-9)
- **Purpose:** In-game authentication and session management
- **Storage:** Linked to user ID and game ID in database

## Supported Games

The following game IDs are supported:
- `tiny-little-fly` - Flight simulation game
- `tiny-little-deva` - Adventure game with tutorial system
- `tiny-little-royale` - Battle royale game
- `tiny-little-tank` - Tank combat game

## Implementation Steps

### For Game Developers

1. **Implement User Registration/Login UI**
   - Create registration form
   - Create login form with multiple options
   - Handle OAuth redirects (if using social login)

2. **Store JWT Token**
   ```javascript
   // Example: Store in localStorage or secure storage
   localStorage.setItem('jwt_token', response.token);
   ```

3. **Request Game Token Before Game Start**
   ```javascript
   const gameToken = await fetch('/api/game-stats/tiny-little-fly', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${jwt_token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

4. **Use Game Token for In-Game Operations**
   - Include game token in game API requests
   - Refresh token when expired
   - Handle authentication errors gracefully

### For Backend Integration

1. **Validate JWT Tokens**
   - Use `@UseGuards(JwtAuthGuard)` decorator
   - Access user info via `@ReqContext() req: RequestContext`

2. **Create Game-Specific Logic**
   - Implement game token validation
   - Handle user game data
   - Manage game sessions

## Security Considerations

### JWT Token Security
- Store JWT tokens securely (not in localStorage for production)
- Implement token refresh mechanism
- Validate tokens on every request
- Use HTTPS only

### Game Token Security
- Game tokens are session-specific
- Tokens expire and need renewal
- Never expose tokens in logs
- Implement rate limiting

### Best Practices
- Always use HTTPS
- Implement proper error handling
- Log authentication events
- Monitor for suspicious activity
- Implement session timeout

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Invalid email format"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "No user found with provided credentials"
}
```

### Error Handling Strategy

1. **Token Expired:** Re-authenticate user
2. **Invalid Credentials:** Show login form
3. **Network Error:** Implement retry mechanism
4. **Server Error:** Show user-friendly error message

## Testing with Postman

### Collection Setup

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:3000/api`
   - `jwt_token`: (will be set after login)
   - `game_token`: (will be set after game token generation)

2. **Test Registration:**
   ```
   POST {{base_url}}/auth/register
   Body: {
     "email": "test@example.com",
     "password": "TestPass123!",
     "name": "Test User",
     "confirmURL": "https://example.com/confirm"
   }
   ```

3. **Test Login:**
   ```
   POST {{base_url}}/auth/credentials/login
   Body: {
     "email": "test@example.com",
     "password": "TestPass123!"
   }
   ```

4. **Extract JWT Token:**
   ```javascript
   // In Tests tab of login request
   const response = pm.response.json();
   pm.environment.set("jwt_token", response.token);
   ```

5. **Test Game Token Generation:**
   ```
   POST {{base_url}}/game-stats/tiny-little-fly
   Headers: Authorization: Bearer {{jwt_token}}
   ```

6. **Extract Game Token:**
   ```javascript
   // In Tests tab of game-stats request
   const response = pm.response.json();
   pm.environment.set("game_token", response.token);
   ```

## Rate Limiting

### Authentication Endpoints
- Login attempts: 5 per minute per IP
- Registration: 3 per minute per IP
- Password reset: 2 per minute per email

### Game Token Endpoints
- Token generation: 10 per minute per user
- Token refresh: 20 per minute per user

## Monitoring and Analytics

### Key Metrics to Track
- Login success/failure rates
- Game token generation frequency
- Session duration
- Authentication method preferences
- Error rates by endpoint

### Logging Requirements
- Authentication attempts (success/failure)
- Game token generation
- Token validation failures
- Suspicious activity patterns

## Support and Troubleshooting

### Common Issues

1. **"Invalid JWT Token"**
   - Check token format and expiration
   - Verify Authorization header format
   - Ensure token was generated correctly

2. **"User not found"**
   - Verify user registration completed
   - Check email confirmation status
   - Confirm correct login credentials

3. **"Game token generation failed"**
   - Verify JWT token is valid
   - Check game ID format
   - Ensure user has required permissions

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=auth:* npm run start:dev
```

### API Documentation

- **Swagger UI:** `http://localhost:3000/docs`
- **OpenAPI Spec:** `http://localhost:3000/docs-json`

## Conclusion

This authentication system provides a robust, secure foundation for in-game login processes. By following this documentation, external developers can successfully integrate with the Tiny Little Game platform and provide seamless authentication experiences for their users.

For additional support or questions, please refer to the API documentation or contact the development team.