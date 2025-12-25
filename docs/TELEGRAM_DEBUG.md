# Telegram Authentication Debug Guide

## Quick Diagnostics

### 1. Check if bot token is configured in production

```bash
# Check environment variables on your server
echo $telegramBotToken

# Or check through the health endpoint
curl https://your-domain.com/api/auth/health/secure-auth
```

### 2. Test with the test endpoint first

```bash
# This bypasses hash verification
curl -X POST https://your-domain.com/api/auth/test-telegram-auth \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "firstName": "Test"
  }'
```

If this works but `/api/auth/telegram` doesn't, it's a hash verification issue.

### 3. Check the request format

The `/api/auth/telegram` endpoint accepts data as either:
- Query parameters: `?id=123&first_name=Test&hash=abc...&auth_date=123456`
- JSON body: `{"id": "123", "first_name": "Test", "hash": "abc...", "auth_date": "123456"}`

### 4. Common Issues

#### Issue: "Telegram bot token not configured"
**Solution:**
- Set `telegramBotToken` in your production environment
- Restart the server

#### Issue: "Invalid Telegram authentication hash"
**Solution:**
- Verify bot token matches the one used to generate the hash
- Check that data hasn't been modified
- Ensure auth_date is current (not older than 24 hours)

#### Issue: "Missing required Telegram parameters"
**Solution:**
- Ensure you're sending: `id`, `hash`, `auth_date`
- At minimum: `id`, `first_name`, `hash`, `auth_date`

#### Issue: "Authentication data expired"
**Solution:**
- The `auth_date` is older than 24 hours
- Use current timestamp

### 5. Debug Logging

In development mode, the service logs detailed info:

```
🔍 Telegram Auth Debug:
  Bot Token: 123456789:...
  Received Hash: abc123...
  Data Check String: auth_date=...
  Calculated Hash: xyz789...
  Hash Match: false
```

Check your server logs for this output.

### 6. Test Hash Generation

Use the hash generator to create valid test data:

```bash
export TELEGRAM_BOT_TOKEN="your_production_bot_token"
node generate-telegram-hash.js
```

### 7. Example Request from Telegram Widget

When Telegram Login Widget calls your endpoint, it sends:

**Query String:**
```
/api/auth/telegram?id=123456789&first_name=John&last_name=Doe&username=johndoe&photo_url=https%3A%2F%2Ft.me%2Fi%2Fuserpic%2F320%2F...&auth_date=1703356800&hash=abc123def456...
```

**Or POST with JSON:**
```json
{
  "id": "123456789",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://t.me/i/userpic/320/...",
  "auth_date": "1703356800",
  "hash": "abc123def456..."
}
```

### 8. Verify Endpoint is Deployed

```bash
# Check if endpoint exists
curl -X POST https://your-domain.com/api/auth/telegram
# Should NOT return 404

# Check server is running
curl https://your-domain.com/api/auth/health/secure-auth
```

### 9. Check CORS if calling from browser

If you're calling from a web app, check browser console for CORS errors.

### 10. Production Environment Variables

Ensure these are set:
- `telegramBotToken` - Your bot token from BotFather
- `NODE_ENV` - Should be "production" (affects debug logging)

## Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Telegram authentication successful",
  "user": {
    "id": "uuid-here",
    "email": "123456789@telegram.me",
    "displayName": "username",
    "photo": "https://..."
  },
  "token": "eyJhbGci...",
  "timestamp": "2025-12-24T..."
}
```

### Error Responses

**Bot Token Missing:**
```json
{
  "success": false,
  "message": "Telegram bot token not configured",
  "timestamp": "..."
}
```

**Invalid Hash:**
```json
{
  "success": false,
  "message": "Invalid Telegram authentication hash",
  "timestamp": "...",
  "debug": { /* only in development */ }
}
```

**Missing Parameters:**
```json
{
  "success": false,
  "message": "Missing required Telegram parameters (id, hash, auth_date)",
  "timestamp": "..."
}
```

**Expired:**
```json
{
  "success": false,
  "message": "Authentication data expired (older than 24 hours)",
  "timestamp": "..."
}
```

## Next Steps

Please provide:
1. Server logs showing the error
2. The exact request you're sending
3. The response you're receiving
4. Whether the test endpoint works
