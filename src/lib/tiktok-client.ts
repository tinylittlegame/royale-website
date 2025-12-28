/**
 * Client-side TikTok tracking utilities
 * Tracks events using both Pixel (client-side) and Events API (server-side)
 */

interface TikTokTrackOptions {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  email?: string;
}

/**
 * Get TikTok click ID from cookies or URL
 */
function getTikTokClickId(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  // Try to get from URL first
  const urlParams = new URLSearchParams(window.location.search);
  const ttclid = urlParams.get('ttclid');
  if (ttclid) {
    // Store in sessionStorage for later use
    sessionStorage.setItem('ttclid', ttclid);
    return ttclid;
  }

  // Try to get from sessionStorage
  return sessionStorage.getItem('ttclid') || undefined;
}

/**
 * Get TikTok test parameter (ttp) from cookies
 */
function getTikTokTtp(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  // Check for _ttp cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_ttp') {
      return value;
    }
  }
  return undefined;
}

/**
 * Track event with TikTok Pixel (client-side)
 */
function trackPixelEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.ttq) {
    console.warn('[TikTok] Pixel not loaded');
    return;
  }

  try {
    window.ttq.track(event, properties || {});
    console.log('[TikTok Pixel] Event tracked:', event, properties);
  } catch (error) {
    console.error('[TikTok Pixel] Failed to track event:', error);
  }
}

/**
 * Track event with Events API (server-side)
 */
async function trackServerEvent(options: TikTokTrackOptions): Promise<boolean> {
  try {
    const ttclid = getTikTokClickId();
    const ttp = getTikTokTtp();

    const response = await fetch('/api/tiktok/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: options.event,
        event_id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        user_id: options.userId,
        email: options.email,
        properties: options.properties,
        url: window.location.href,
        referrer: document.referrer,
        ttclid,
        ttp,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error('[TikTok Events API] Failed to track event:', result.error);
      return false;
    }

    console.log('[TikTok Events API] Event tracked successfully:', options.event);
    return true;
  } catch (error) {
    console.error('[TikTok Events API] Request failed:', error);
    return false;
  }
}

/**
 * Track event with both Pixel and Events API
 */
export async function trackTikTokEvent(options: TikTokTrackOptions): Promise<void> {
  // Track with Pixel (immediate, client-side)
  trackPixelEvent(options.event, options.properties);

  // Track with Events API (server-side, more reliable)
  await trackServerEvent(options);
}

/**
 * Predefined tracking functions for common events
 */
export const TikTokTracking = {
  /**
   * Track page view
   */
  pageView: async (properties?: Record<string, any>) => {
    await trackTikTokEvent({
      event: 'ViewContent',
      properties,
    });
  },

  /**
   * Track user registration/signup
   */
  completeRegistration: async (userId?: string, email?: string, properties?: Record<string, any>) => {
    await trackTikTokEvent({
      event: 'CompleteRegistration',
      userId,
      email,
      properties,
    });
  },

  /**
   * Track button click
   */
  clickButton: async (buttonName: string, properties?: Record<string, any>) => {
    await trackTikTokEvent({
      event: 'ClickButton',
      properties: {
        content_name: buttonName,
        ...properties,
      },
    });
  },

  /**
   * Track form submission
   */
  submitForm: async (formName: string, properties?: Record<string, any>) => {
    await trackTikTokEvent({
      event: 'SubmitForm',
      properties: {
        content_name: formName,
        ...properties,
      },
    });
  },

  /**
   * Track game start
   */
  gameStart: async (userId?: string, properties?: Record<string, any>) => {
    await trackTikTokEvent({
      event: 'GameStart',
      userId,
      properties,
    });
  },

  /**
   * Track game end
   */
  gameEnd: async (userId?: string, properties?: Record<string, any>) => {
    await trackTikTokEvent({
      event: 'GameEnd',
      userId,
      properties,
    });
  },

  /**
   * Track search
   */
  search: async (query: string, properties?: Record<string, any>) => {
    await trackTikTokEvent({
      event: 'Search',
      properties: {
        query,
        ...properties,
      },
    });
  },

  /**
   * Track contact
   */
  contact: async (properties?: Record<string, any>) => {
    await trackTikTokEvent({
      event: 'Contact',
      properties,
    });
  },
};

// Declare global window.ttq type
declare global {
  interface Window {
    ttq: {
      track: (event: string, properties?: Record<string, any>) => void;
      page: () => void;
      identify: (data: Record<string, any>) => void;
      [key: string]: any;
    };
  }
}
