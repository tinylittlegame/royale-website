# TikTok Events API Integration

This document describes the TikTok Events API integration in the Tiny Little Royale web application.

## Overview

The application now uses **dual tracking** for TikTok:
1. **TikTok Pixel** (client-side) - JavaScript tracking for immediate events
2. **TikTok Events API** (server-side) - More reliable server-to-server tracking

This dual approach provides:
- Better tracking accuracy (not blocked by ad blockers)
- Improved attribution for TikTok ads
- Redundancy if client-side tracking fails
- Better data for TikTok's optimization algorithms

## Configuration

### Environment Variables

The following environment variables have been added to `.env`, `.env.dev`, and `.env.pro`:

```bash
# Existing
TIKTOK_PIXEL_ID=D57TBMBC77UCQLCHD1NG
NEXT_PUBLIC_TIKTOK_PIXEL_ID=D57TBMBC77UCQLCHD1NG

# New - Events API Access Token (server-side only)
TIKTOK_ACCESS_TOKEN=dc94eb6b60a36466c29708331755a6af7c53c8ad
```

## Implementation

### Files Created

1. **`src/lib/tiktok-events.ts`** - Server-side TikTok Events API integration
2. **`src/lib/tiktok-client.ts`** - Client-side tracking utilities
3. **`src/app/api/tiktok/track/route.ts`** - API endpoint for event tracking
4. **`src/hooks/useTikTokTracking.ts`** - React hooks for easy tracking

### API Endpoint

**`POST /api/tiktok/track`**

Accepts events from the client and forwards them to TikTok Events API with proper server-side context (IP, user-agent, etc.)

**Health Check:** `GET /api/tiktok/track`

Returns status and configuration info.

## Usage

### Basic Usage

```typescript
import { TikTokTracking } from '@/lib/tiktok-client';

// Track a page view
await TikTokTracking.pageView();

// Track button click
await TikTokTracking.clickButton('play-now');

// Track user registration
await TikTokTracking.completeRegistration(userId, userEmail);

// Track game start
await TikTokTracking.gameStart(userId, {
  game_id: 'tiny-little-royale',
  platform: 'mobile'
});
```

### Using the Hook

```typescript
import { useTikTokTracking } from '@/hooks/useTikTokTracking';

function MyComponent() {
  const tracking = useTikTokTracking();

  const handleClick = async () => {
    await tracking.clickButton('my-button');
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### Custom Events

```typescript
import { trackTikTokEvent } from '@/lib/tiktok-client';

await trackTikTokEvent({
  event: 'CustomEvent',
  userId: '123',
  email: 'user@example.com',
  properties: {
    custom_property: 'value',
    another_property: 123
  }
});
```

## Current Tracking

The following events are currently tracked:

### 1. **Page View** - `ViewContent`
- Automatically tracked on page load via TikTok Pixel

### 2. **Complete Registration** - `CompleteRegistration`
- **Location:** `/auth/success/page.tsx`
- **Triggered:** When user successfully authenticates
- **Data:** User ID, email, authentication method

### 3. **Game Start** - `GameStart`
- **Location:** `/playgame/page.tsx`
- **Triggered:** When game iframe loads successfully
- **Data:** User ID, game ID, platform (mobile/desktop)

### 4. **Click Button** (Game Signup) - `ClickButton`
- **Location:** `/playgame/page.tsx`
- **Triggered:** When user clicks signup from within the game
- **Data:** Button name ('game-signup'), source, user ID

## Available Event Types

Predefined events from `TikTokTracking`:

- `pageView()` - Track page views
- `completeRegistration()` - Track user signups
- `clickButton()` - Track button clicks
- `submitForm()` - Track form submissions
- `gameStart()` - Track game starts
- `gameEnd()` - Track game endings
- `search()` - Track searches
- `contact()` - Track contact actions

## Testing

### 1. Check API Health

```bash
curl http://localhost:3000/api/tiktok/track
```

Should return:
```json
{
  "status": "ok",
  "message": "TikTok tracking endpoint is active",
  "pixelConfigured": true,
  "tokenConfigured": true
}
```

### 2. Test Event Tracking

Open browser console and run:
```javascript
// Should track via both Pixel and Events API
await TikTokTracking.pageView();
```

Check console logs for:
- `[TikTok Pixel] Event tracked: ViewContent`
- `[TikTok Events API] Event tracked successfully: ViewContent`

### 3. Verify in TikTok Events Manager

1. Go to [TikTok Events Manager](https://ads.tiktok.com/i18n/events_manager)
2. Select your pixel (D57TBMBC77UCQLCHD1NG)
3. Check "Test Events" to see events in real-time
4. Check "Event Debugging" for detailed event info

## TikTok Click ID (ttclid) Tracking

The integration automatically captures and uses TikTok's click ID (`ttclid`) for attribution:

- Captured from URL query parameter `?ttclid=...`
- Stored in sessionStorage for subsequent events
- Automatically included in Events API calls
- Used for conversion tracking and attribution

## Security Notes

- **Access Token** is server-side only (never exposed to client)
- **Pixel ID** is public (safe to expose in client-side code)
- User emails are passed to TikTok for better matching (recommended by TikTok)
- IP addresses are automatically captured server-side for geo-targeting

## Troubleshooting

### Events not showing in TikTok?

1. Check environment variables are set correctly
2. Verify Pixel is loaded: `window.ttq` should exist
3. Check browser console for error messages
4. Use TikTok Events Manager's "Test Events" feature
5. Check API endpoint: `GET /api/tiktok/track`

### API errors?

- Verify `TIKTOK_ACCESS_TOKEN` is valid and not expired
- Check TikTok API status
- Review server logs for detailed error messages

## Future Enhancements

Potential events to add:
- Track level completions
- Track in-game purchases (if applicable)
- Track user retention metrics
- Track social sharing

## Resources

- [TikTok Events API Documentation](https://business-api.tiktok.com/portal/docs)
- [TikTok Pixel Documentation](https://ads.tiktok.com/help/article/standard-events-parameters)
- [Best Practices for Events API](https://ads.tiktok.com/marketing_api/docs?id=1701890973258754)
