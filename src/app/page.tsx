"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Apple, Play, Share2 } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "Tiny Little Royale",
      text: "Tiny little royale. โหมดตบฮุนเซน 🎮",
      url: `${window.location.origin}/playgame`,
    };

    try {
      // Try to use Web Share API (works on mobile)
      if (navigator.share) {
        await navigator.share(shareData);
        console.log("[Share] Shared successfully via Web Share API");
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        );
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
        console.log("[Share] Link copied to clipboard");
      }
    } catch (err) {
      console.error("[Share] Error sharing:", err);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden">
      {/* Hero Section */}
      <section className="w-full relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/Logo/Logo_327x484.png"
              alt="Tiny Little Royale Logo"
              width={200}
              height={296}
              className="drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              style={{ height: 'auto' }}
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Tiny Little{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Royale
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Fly into the arena, battle players worldwide, and become the
            champion. The most chaotic and fun mini battle royale is here!
          </p>

          <div className="flex flex-col items-center gap-8 w-full">
            {/* Play Now - Bigger and Centered */}
            <Link
              href="/playgame"
              className="group relative px-12 py-6 bg-yellow-500 rounded-full font-black text-black text-2xl hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:shadow-[0_0_50px_rgba(234,179,8,0.8)] hover:scale-110 active:scale-95"
            >
              <span className="flex items-center gap-3">
                PLAY NOW <Play fill="currentColor" size={28} />
              </span>
            </Link>

            {/* Store Buttons - Below and Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="https://apps.apple.com/th/app/tiny-little-royale/id6743611360"
                target="_blank"
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-medium text-white hover:bg-white/20 transition-all flex items-center gap-2 text-sm"
              >
                <Apple size={18} /> App Store
              </Link>

              <Link
                href="https://play.google.com/store/apps/details?id=com.hengtech.tinylittleroyale&hl=en"
                target="_blank"
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-medium text-white hover:bg-white/20 transition-all flex items-center gap-2 text-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.3,12.5L17.38,15.69L15.12,13.43L16.81,11.74L17.38,12.31C18.15,12.8 19.06,12.92 20.3,12.5M16.81,8.88L14.54,11.15L6.05,2.66L16.81,8.88Z" />
                </svg>
                Google Play
              </Link>
            </div>

            {/* Share Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <button
                onClick={handleShare}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-white transition-all flex items-center gap-3 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Image
                    src="/images/2_icon_husen_512.png"
                    alt="Share Icon"
                    width={24}
                    height={24}
                    className="rounded"
                  />
                </div>
                <span>Share Game</span>
                <Share2
                  size={18}
                  className="group-hover:rotate-12 transition-transform"
                />
              </button>

              {/* Success tooltip */}
              {shareSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap"
                >
                  ✓ Link copied to clipboard!
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Video Trailer Section */}
      <section className="w-full py-20 px-4 bg-black relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Watch the Trailer
            </h2>
            <div className="h-1 w-20 bg-yellow-500 mx-auto rounded-full" />
          </div>

          <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-yellow-900/20 group">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/wpiiyPLQ6zQ?autoplay=0&controls=1&rel=0"
              title="Tiny Little Royale Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="group-hover:scale-105 transition-transform duration-700"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Feature Section with some images placeholders or just text if no assets */}
      <section className="w-full py-20 bg-neutral-900 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Why Play?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-black/50 rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-colors">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-white mb-2">Fast Paced</h3>
              <p className="text-gray-400">
                Jump in and play instantly. Matches are quick, intense, and full
                of action.
              </p>
            </div>
            <div className="p-6 bg-black/50 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Global Battles
              </h3>
              <p className="text-gray-400">
                Fight against players from around the world. Climb the
                leaderboards.
              </p>
            </div>
            <div className="p-6 bg-black/50 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Cross Platform
              </h3>
              <p className="text-gray-400">
                Play on Web, iOS, or Android with the same account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
