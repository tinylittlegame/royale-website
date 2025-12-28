import { NextRequest, NextResponse } from 'next/server';
import { sendTikTokEvent } from '@/lib/tiktok-events';

/**
 * POST /api/tiktok/track
 * Endpoint to track TikTok events from the client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event,
      event_id,
      user_id,
      email,
      properties,
      url,
      referrer,
      ttclid,
      ttp,
    } = body;

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Get user information from request
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      undefined;

    // Build event data
    const eventData = {
      event,
      event_time: Date.now(),
      event_id,
      user: {
        external_id: user_id,
        email,
        ip,
        user_agent: userAgent,
        ttclid,
        ttp,
      },
      page: {
        url: url || request.headers.get('referer') || '',
        referrer,
      },
      properties,
    };

    console.log('[TikTok API] Received tracking request:', {
      event,
      user_id,
      ip,
    });

    // Send to TikTok Events API
    const result = await sendTikTokEvent(eventData);

    if (!result.success) {
      console.error('[TikTok API] Failed to track event:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[TikTok API] Error processing request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tiktok/track
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'TikTok tracking endpoint is active',
    pixelConfigured: !!process.env.TIKTOK_PIXEL_ID,
    tokenConfigured: !!process.env.TIKTOK_ACCESS_TOKEN,
  });
}
