'use client';

export default function PlayGameLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 bg-black z-50">
            {children}
        </div>
    );
}
