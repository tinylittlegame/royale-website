/**
 * TikTok Events API Integration
 * Server-side event tracking for better accuracy and attribution
 */

interface TikTokEventProperties {
  content_type?: string;
  content_id?: string;
  content_name?: string;
  value?: number;
  currency?: string;
  quantity?: number;
  description?: string;
  query?: string;
  [key: string]: any;
}

interface TikTokEvent {
  event: string;
  event_time: number;
  event_id?: string;
  user: {
    external_id?: string;
    email?: string;
    phone?: string;
    ttclid?: string;
    ttp?: string;
    ip?: string;
    user_agent?: string;
  };
  page: {
    url: string;
    referrer?: string;
  };
  properties?: TikTokEventProperties;
}

interface TikTokEventsPayload {
  pixel_code: string;
  event: string;
  event_id?: string;
  timestamp: string;
  context: {
    user_agent?: string;
    ip?: string;
    page: {
      url: string;
      referrer?: string;
    };
    user?: {
      external_id?: string;
      email?: string;
      phone_number?: string;
      ttclid?: string;
      ttp?: string;
    };
  };
  properties?: TikTokEventProperties;
}

/**
 * Send event to TikTok Events API
 */
export async function sendTikTokEvent(
  eventData: TikTokEvent
): Promise<{ success: boolean; error?: string }> {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  const pixelCode = process.env.TIKTOK_PIXEL_ID;

  if (!accessToken || !pixelCode) {
    console.error('[TikTok Events API] Missing credentials');
    return { success: false, error: 'Missing TikTok credentials' };
  }

  try {
    // Build the payload according to TikTok Events API format
    const payload: TikTokEventsPayload = {
      pixel_code: pixelCode,
      event: eventData.event,
      event_id: eventData.event_id || generateEventId(),
      timestamp: new Date(eventData.event_time).toISOString(),
      context: {
        user_agent: eventData.user.user_agent,
        ip: eventData.user.ip,
        page: {
          url: eventData.page.url,
          referrer: eventData.page.referrer,
        },
        user: {
          external_id: eventData.user.external_id,
          email: eventData.user.email,
          phone_number: eventData.user.phone,
          ttclid: eventData.user.ttclid,
          ttp: eventData.user.ttp,
        },
      },
      properties: eventData.properties,
    };

    console.log('[TikTok Events API] Sending event:', {
      event: eventData.event,
      event_id: payload.event_id,
      pixel_code: pixelCode,
    });

    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify({
        pixel_code: pixelCode,
        event: payload.event,
        event_id: payload.event_id,
        timestamp: payload.timestamp,
        context: payload.context,
        properties: payload.properties,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[TikTok Events API] Error response:', result);
      return {
        success: false,
        error: result.message || 'Failed to send event to TikTok',
      };
    }

    console.log('[TikTok Events API] Event sent successfully:', result);
    return { success: true };
  } catch (error: any) {
    console.error('[TikTok Events API] Request failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Hash email for privacy (SHA-256)
 */
export async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Predefined event types
 */
export const TikTokEvents = {
  // Standard events
  PAGE_VIEW: 'ViewContent',
  CLICK_BUTTON: 'ClickButton',
  SEARCH: 'Search',
  SUBMIT_FORM: 'SubmitForm',
  COMPLETE_REGISTRATION: 'CompleteRegistration',
  CONTACT: 'Contact',

  // E-commerce events (if needed)
  ADD_TO_CART: 'AddToCart',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  ADD_PAYMENT_INFO: 'AddPaymentInfo',
  COMPLETE_PAYMENT: 'CompletePayment',
  PLACE_AN_ORDER: 'PlaceAnOrder',

  // Custom events
  GAME_START: 'GameStart',
  GAME_END: 'GameEnd',
  LEVEL_COMPLETE: 'LevelComplete',
} as const;
