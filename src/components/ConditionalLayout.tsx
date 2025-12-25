'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
