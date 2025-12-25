'use client';

import { useEffect } from 'react';

export default function PlayGameLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Optimize viewport for in-app browsers and mobile
    useEffect(() => {
        // Set viewport height CSS variable for use across the app
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);

        // Prevent scroll bounce on iOS and in-app browsers
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.body.style.overscrollBehavior = 'none';

        // Hide address bar on scroll (for mobile browsers)
        window.scrollTo(0, 1);

        return () => {
            window.removeEventListener('resize', setVH);
            window.removeEventListener('orientationchange', setVH);
            // Reset body styles when leaving
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            document.body.style.overscrollBehavior = '';
        };
    }, []);

    return (
        <div
            className="fixed inset-0 w-full h-full bg-black overflow-hidden"
            style={{
                height: '100dvh',
                minHeight: '100dvh',
                maxHeight: '100dvh',
                width: '100vw',
                maxWidth: '100vw',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0,
                overflow: 'hidden',
                touchAction: 'none',
                overscrollBehavior: 'none',
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}
