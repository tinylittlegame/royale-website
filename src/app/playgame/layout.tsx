'use client';

export default function PlayGameLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
            {children}
        </div>
    );
}
