import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { TikTokTracking } from '@/lib/tiktok-client';

/**
 * Hook to automatically track page views with TikTok
 */
export function useTikTokPageView() {
  const pathname = usePathname();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    // Only track if pathname has changed
    if (pathname && pathname !== trackedRef.current) {
      trackedRef.current = pathname;

      // Small delay to ensure page is loaded
      setTimeout(() => {
        TikTokTracking.pageView({
          page_path: pathname,
          page_title: document.title,
        });
      }, 100);
    }
  }, [pathname]);
}

/**
 * Hook to provide TikTok tracking functions
 */
export function useTikTokTracking() {
  return TikTokTracking;
}
