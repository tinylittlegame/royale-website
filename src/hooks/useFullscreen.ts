import { useState, useEffect, useCallback, RefObject } from 'react';
import { isFullscreenActive, requestFullscreen, isMobile } from '@/lib/browser-utils';

interface UseFullscreenOptions {
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

/**
 * Hook to manage fullscreen state and actions
 */
export function useFullscreen(
  containerRef: RefObject<HTMLElement>,
  options?: UseFullscreenOptions
) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = isFullscreenActive();
      setIsFullscreen(isCurrentlyFullscreen);
      options?.onFullscreenChange?.(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && isMobile()) {
        // User exited fullscreen on mobile, show prompt again
        setShowPrompt(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [options]);

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
    if (!containerRef.current) return false;

    console.log('[useFullscreen] Attempting to enter fullscreen...');
    const success = await requestFullscreen(containerRef.current);

    if (success) {
      setShowPrompt(false);
      setIsFullscreen(true);
      console.log('[useFullscreen] Fullscreen entered successfully');
    } else if (isMobile()) {
      // If automatic fullscreen fails, show the prompt
      setShowPrompt(true);
    }

    return success;
  }, [containerRef]);

  return {
    isFullscreen,
    showPrompt,
    setShowPrompt,
    enterFullscreen,
  };
}
