'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0">
                            <Image
                                src="/images/Logo/Logo_140x70.png"
                                alt="Tiny Little Royale"
                                width={100}
                                height={50}
                                className="h-10 w-auto"
                            />
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link
                                    href="/"
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/leaderboard"
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Leaderboard
                                </Link>
                                <Link
                                    href="/playgame"
                                    className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-bold transition-transform hover:scale-105"
                                >
                                    Play Now
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-300 text-sm">
                                        {user.name || (user as any).displayName || user.email}
                                    </span>
                                    {user.photo ? (
                                        <Image
                                            src={user.photo}
                                            alt="Profile"
                                            width={32}
                                            height={32}
                                            className="rounded-full ring-2 ring-yellow-500"
                                            onError={(e) => {
                                                // Hide broken image and show fallback
                                                e.currentTarget.style.display = 'none';
                                                const fallback = e.currentTarget.nextElementSibling;
                                                if (fallback) fallback.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-8 h-8 rounded-full ring-2 ring-yellow-500 bg-yellow-500 flex items-center justify-center text-black font-bold text-sm ${user.photo ? 'hidden' : ''}`}>
                                        {(user.name || (user as any).displayName || user.email || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <button
                                        onClick={() => logout()}
                                        className="text-gray-300 hover:text-white text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/auth/signin"
                                    className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-bold transition-colors"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            href="/"
                            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Leaderboard
                        </Link>
                        <Link
                            href="/playgame"
                            className="text-yellow-500 hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-bold"
                        >
                            Play Now
                        </Link>
                        {user ? (
                            <div className="border-t border-gray-700 pt-4 pb-3">
                                <div className="flex items-center px-5">
                                    <div className="flex-shrink-0">
                                        {user.photo ? (
                                            <Image
                                                src={user.photo}
                                                alt="Profile"
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const fallback = e.currentTarget.nextElementSibling;
                                                    if (fallback) fallback.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-lg ${user.photo ? 'hidden' : ''}`}>
                                            {(user.name || (user as any).displayName || user.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium leading-none text-white">{user.name || (user as any).displayName}</div>
                                        <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                                    </div>
                                </div>
                                <div className="mt-3 px-2">
                                    <button
                                        onClick={() => logout()}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="w-full text-center bg-yellow-500 hover:bg-yellow-400 text-black block px-4 py-3 rounded-md text-base font-bold transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
