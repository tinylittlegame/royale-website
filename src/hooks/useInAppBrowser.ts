import { useState, useEffect } from 'react';
import { isInAppBrowser, getInAppBrowserName, supportsFullscreen } from '@/lib/browser-utils';

/**
 * Hook to detect in-app browser and manage warning state
 */
export function useInAppBrowser() {
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [browserName, setBrowserName] = useState<string>('in-app browser');
  const [isInApp, setIsInApp] = useState<boolean>(false);

  useEffect(() => {
    const inApp = isInAppBrowser();
    setIsInApp(inApp);

    if (inApp) {
      const name = getInAppBrowserName();
      setBrowserName(name);
      const hasFullscreenSupport = supportsFullscreen();

<<<<<<< Updated upstream
      // LINE browser supports fullscreen, so don't show warning
      if (name !== 'LINE') {
        // Show warning after a short delay so user sees the game first
=======
      console.log('[useInAppBrowser] In-app browser detected:', {
        name,
        supportsFullscreen: hasFullscreenSupport
      });

      // Only show warning if browser doesn't support fullscreen
      // Browsers like LINE and some versions of Facebook may support it
      if (!hasFullscreenSupport) {
>>>>>>> Stashed changes
        setTimeout(() => {
          setShowWarning(true);
        }, 1000);
      }
    }
  }, []);

  return {
    isInApp,
    browserName,
    showWarning,
    setShowWarning,
  };
}
