import LeaderboardTable from "@/components/LeaderboardTable";
import { Trophy, Swords, Crown } from "lucide-react";

export default function LeaderboardPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-10 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Exciting Header */}
                <div className="text-center mb-12 relative">
                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-10 opacity-20">
                        <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-500/30 rounded-full blur-3xl"></div>
                        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
                    </div>

                    {/* Icons decoration */}
                    <div className="flex items-center justify-center gap-3 md:gap-6 mb-4 md:mb-6">
                        <Swords className="w-8 h-8 md:w-12 md:h-12 text-yellow-500 animate-pulse" />
                        <Trophy className="w-10 h-10 md:w-16 md:h-16 text-yellow-400 animate-bounce" />
                        <Swords className="w-8 h-8 md:w-12 md:h-12 text-yellow-500 animate-pulse" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mb-3 md:mb-4 uppercase tracking-wide md:tracking-wider">
                        Leaderboard
                    </h1>

                    <div className="flex items-center justify-center gap-1 md:gap-2 text-gray-400 mb-2">
                        <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                        <p className="text-sm md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500">
                            Thai vs Khmer Event
                        </p>
                        <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                    </div>

                    <p className="text-gray-500 text-xs md:text-sm">
                        Top 100 Warriors • Battle Royale Champions
                    </p>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-gradient-to-b from-neutral-900 to-black border border-yellow-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-yellow-500/10">
                    <LeaderboardTable />
                </div>

                {/* Bottom decoration */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-black border border-white/10 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-400 text-sm">Live Rankings • Updated Real-time</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
