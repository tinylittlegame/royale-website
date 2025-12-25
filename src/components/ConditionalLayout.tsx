'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isGamePage = pathname === '/playgame';

    if (isGamePage) {
        // Game page - no navbar/footer, render children directly for fullscreen
        return <>{children}</>;
    }

    // Regular pages - with navbar and footer
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                    {children}
                </main>
            </div>
        }>
            <LayoutContent>{children}</LayoutContent>
        </Suspense>
    );
}
