import { useState, useEffect } from 'react';

/**
 * Hook to detect and track device orientation
 * @returns isPortrait - true if device is in portrait mode
 */
export function useOrientation() {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if device is in portrait mode
      const portrait = window.innerHeight > window.innerWidth;
      console.log('[useOrientation] Orientation check:', {
        width: window.innerWidth,
        height: window.innerHeight,
        isPortrait: portrait,
      });
      setIsPortrait(portrait);
    };

    // Check on mount
    checkOrientation();

    // Listen for orientation and resize changes
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    // Also check after a short delay to catch delayed browser UI changes
    const timeoutId = setTimeout(checkOrientation, 100);

    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
      clearTimeout(timeoutId);
    };
  }, []);

  return { isPortrait, setIsPortrait };
}
