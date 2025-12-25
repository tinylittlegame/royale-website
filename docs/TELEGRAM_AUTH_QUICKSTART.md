# Telegram Authentication - Quick Start for Frontend Developers

This is a quick reference guide. For complete documentation, see [docs/TELEGRAM_AUTH_FRONTEND.md](docs/TELEGRAM_AUTH_FRONTEND.md)

## API Endpoints

### Base URL
- **Development:** `http://localhost:3001`
- **Production:** `https://api.yourdomain.com`

## Method 1: Widget Authentication (Web Apps)

### Setup

1. Add Telegram Login Widget to your HTML:

```html
<script async src="https://telegram.org/js/telegram-widget.js?22"
  data-telegram-login="your_bot_username"
  data-size="large"
  data-onauth="onTelegramAuth(user)"
  data-request-access="write">
</script>
```

2. Implement callback:

```javascript
async function onTelegramAuth(user) {
  const response = await fetch('https://api.yourdomain.com/api/auth/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('authToken', data.token);
    window.location.href = '/dashboard';
  } else {
    alert('Login failed: ' + data.message);
  }
}
```

### API Details

**Endpoint:** `POST /api/auth/telegram`

**Request:**
```json
{
  "id": "123456789",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://...",
  "auth_date": "1703356800",
  "hash": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Telegram authentication successful",
  "user": {
    "id": "uuid",
    "email": "123456789@telegram.me",
    "displayName": "johndoe",
    "photo": "https://..."
  },
  "token": "eyJhbGci..."
}
```

---

## Method 2: Mini App Authentication (Telegram Apps)

### Setup

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
  <script>
    const tg = window.Telegram.WebApp;
    const initData = tg.initData;

    fetch('https://api.yourdomain.com/api/auth/telegram/mini-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('authToken', data.token);
        tg.ready();
        // Continue to your app
      }
    });
  </script>
</body>
</html>
```

### API Details

**Endpoint:** `POST /api/auth/telegram/mini-app`

**Request:**
```json
{
  "initData": "query_id=AAH...&user=%7B%22id%22%3A...&hash=..."
}
```

**Response:** Same as Widget method

---

## Using the JWT Token

Include the token in all authenticated requests:

```javascript
fetch('https://api.yourdomain.com/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## Testing in Development

Use the test endpoint (bypasses hash verification):

```javascript
fetch('http://localhost:3001/api/auth/test-telegram-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    telegramId: '123456789',
    firstName: 'Test',
    username: 'testuser'
  })
})
```

---

## TypeScript Types

```typescript
interface TelegramUser {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    displayName: string;
    photo?: string;
  };
  token?: string;
  timestamp: string;
}
```

---

## Common Errors

| Error | Solution |
|-------|----------|
| "Telegram bot token not configured" | Contact backend team |
| "Invalid hash" | Use test endpoint in dev, or don't modify user data |
| "Authentication data expired" | Re-authenticate (auth_date too old) |
| CORS error | Backend needs to enable CORS for your domain |

---

## React Example

```jsx
import { useEffect } from 'react';

function TelegramLogin() {
  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        window.location.href = '/dashboard';
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'your_bot_username');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    document.body.appendChild(script);
  }, []);

  return <div id="telegram-login"></div>;
}
```

---

## Complete Documentation

For detailed information, examples, troubleshooting, and best practices:

**[→ Full Frontend Integration Guide](docs/TELEGRAM_AUTH_FRONTEND.md)**

Other documentation:
- [Backend Implementation](docs/TELEGRAM_AUTH.md)
- [Debug Guide](TELEGRAM_DEBUG.md)

---

## Quick Links

- Create bot: [@BotFather](https://t.me/botfather)
- [Telegram Login Widget Docs](https://core.telegram.org/widgets/login)
- [Telegram Mini Apps Docs](https://core.telegram.org/bots/webapps)
