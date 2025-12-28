/**
 * Browser and Device Detection Utilities
 */

/**
 * Detect if user is on mobile device
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detect if user is on iOS device
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Check if running in standalone mode (added to home screen)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    (window.navigator as any).standalone ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

/**
 * Detect if user is in an in-app browser (Facebook, Instagram, LINE, etc.)
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Check for common in-app browsers
  const inAppPatterns = [
    /FBAN|FBAV/i, // Facebook
    /Instagram/i, // Instagram
    /Line/i, // LINE
    /Twitter/i, // Twitter
    /Telegram/i, // Telegram
    /micromessenger/i, // WeChat
    /snapchat/i, // Snapchat
    /LinkedInApp/i, // LinkedIn
    /FB_IAB/i, // Facebook in-app browser
    /FBIOS/i, // Facebook iOS
  ];

  return inAppPatterns.some((pattern) => pattern.test(ua));
}

/**
 * Get the name of the in-app browser for user-friendly messages
 */
export function getInAppBrowserName(): string {
  if (typeof window === 'undefined') return 'in-app browser';
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return 'Facebook';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/Line/i.test(ua)) return 'LINE';
  if (/Twitter/i.test(ua)) return 'Twitter';
  if (/Telegram/i.test(ua)) return 'Telegram';
  if (/micromessenger/i.test(ua)) return 'WeChat';
  if (/snapchat/i.test(ua)) return 'Snapchat';
  if (/LinkedInApp/i.test(ua)) return 'LinkedIn';

  return 'in-app browser';
}

/**
 * Check if device is currently in fullscreen mode
 */
export function isFullscreenActive(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}

/**
 * Enter fullscreen mode for a given element
 */
export async function requestFullscreen(element: HTMLElement): Promise<boolean> {
  try {
    // iOS doesn't support Fullscreen API on iPhone Safari
    if (isIOS() && !isStandalone()) {
      console.log('[Fullscreen] iOS detected - fullscreen not supported in browser');
      return false;
    }

    // Request fullscreen for supported devices
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen(); // Safari on iPad
    } else if ((element as any).webkitEnterFullscreen) {
      await (element as any).webkitEnterFullscreen(); // iOS Safari (video elements only)
    } else if ((element as any).mozRequestFullScreen) {
      await (element as any).mozRequestFullScreen(); // Firefox
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen(); // IE/Edge
    } else {
      return false;
    }

    // Try to lock orientation to landscape on mobile (not supported on iOS)
    // Skip orientation lock for in-app browsers as they often have restrictions
    if (
      'orientation' in screen &&
      'lock' in screen.orientation &&
      !isIOS() &&
      !isInAppBrowser()
    ) {
      try {
        await (screen.orientation as any).lock('landscape');
        console.log('[Fullscreen] Orientation locked to landscape');
      } catch (err) {
        console.log('[Fullscreen] Could not lock orientation:', err);
      }
    }

    return true;
  } catch (err) {
    console.error('[Fullscreen] Failed to enter fullscreen:', err);
    return false;
  }
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('[Clipboard] Failed to copy:', err);
    return false;
  }
}
