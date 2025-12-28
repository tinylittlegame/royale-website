import { useState, useEffect } from 'react';
import { isInAppBrowser, getInAppBrowserName } from '@/lib/browser-utils';

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
      console.log('[useInAppBrowser] In-app browser detected:', name);

      // Show warning after a short delay so user sees the game first
      setTimeout(() => {
        setShowWarning(true);
      }, 1000);
    }
  }, []);

  return {
    isInApp,
    browserName,
    showWarning,
    setShowWarning,
  };
}
