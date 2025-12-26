'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/api';
import { Trophy, Crown, Medal, Skull, Target, Zap, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameEvents {
    kill_player?: number;
    kill_boss?: number;
    melee_kill?: number;
    grenade_kill?: number;
    sniper_kill?: number;
    multikill5?: number;
    multikill4?: number;
    multikill3?: number;
    multikill2?: number;
    killstreak1_begin?: number;
    killstreak1_continue?: number;
    killstreak2_begin?: number;
    killstreak2_continue?: number;
}

interface GameResult {
    score: number;
    kill: number;
    dead: number;
    gameEvents?: GameEvents;
}

interface LeaderboardEntry {
    rank: number;
    userId: string;
    gameResult: GameResult;
    leaderboardPoint: number;
    displayName: string;
    photo?: string;
    level: number;
    country?: string;
}

export default function LeaderboardTable() {
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        async function fetch() {
            console.log("Fetching leaderboard...");
            const result = await getLeaderboard('tiny-little-royale', 'event-thaivskhmer', 100);
            console.log("Leaderboard result:", result);

            if (result && Array.isArray(result)) {
                setData(result);
            } else if (result && result.data && Array.isArray(result.data)) {
                setData(result.data);
            }
            setLoading(false);
        }
        fetch();
    }, []);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return null;
    };

    const getRankBadgeClass = (rank: number) => {
        if (rank === 1) return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/50";
        if (rank === 2) return "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-black shadow-lg shadow-gray-400/50";
        if (rank === 3) return "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white shadow-lg shadow-amber-600/50";
        if (rank <= 10) return "bg-gradient-to-br from-purple-600 to-purple-700 text-white";
        return "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300";
    };

    const getKDRatio = (kills: number, deaths: number) => {
        if (deaths === 0) return kills > 0 ? kills.toFixed(1) : '0.0';
        return (kills / deaths).toFixed(2);
    };

    const getMultikills = (gameEvents?: GameEvents) => {
        if (!gameEvents) return 0;
        return (gameEvents.multikill5 || 0) * 5 +
               (gameEvents.multikill4 || 0) * 4 +
               (gameEvents.multikill3 || 0) * 3 +
               (gameEvents.multikill2 || 0) * 2;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
                    <Trophy className="absolute inset-0 m-auto w-8 h-8 text-yellow-500 animate-pulse" />
                </div>
            </div>
        );
    }

    const topThree = data.slice(0, 3);
    const restOfPlayers = showAll ? data.slice(3) : data.slice(3, 13);

    return (
        <div className="w-full">
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
                <div className="relative p-8 bg-gradient-to-b from-yellow-500/10 to-transparent border-b border-yellow-500/20">
                    <div className="flex items-end justify-center gap-4 mb-8">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative mb-3">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 p-1 shadow-lg shadow-gray-400/50">
                                        <img
                                            src={topThree[1].photo || '/default-avatar.png'}
                                            alt={topThree[1].displayName}
                                            className="w-full h-full rounded-full object-cover border-2 border-white"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-400 text-black font-bold text-xs px-2 py-1 rounded-full shadow-lg">
                                        2nd
                                    </div>
                                </div>
                                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 w-32 text-center border border-gray-600">
                                    <div className="text-white font-bold text-sm truncate mb-1">{topThree[1].displayName}</div>
                                    <div className="text-gray-400 text-xs mb-2">Lv.{topThree[1].level}</div>
                                    <div className="text-gray-300 font-mono text-lg font-bold">{topThree[1].leaderboardPoint.toLocaleString()}</div>
                                    <div className="text-gray-500 text-xs">points</div>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place - Champion */}
                        {topThree[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center"
                            >
                                <Crown className="w-10 h-10 text-yellow-400 mb-2 animate-pulse" />
                                <div className="relative mb-3">
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-1.5 shadow-2xl shadow-yellow-500/50 animate-pulse">
                                        <img
                                            src={topThree[0].photo || '/default-avatar.png'}
                                            alt={topThree[0].displayName}
                                            className="w-full h-full rounded-full object-cover border-4 border-yellow-200"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-sm px-3 py-1 rounded-full shadow-lg">
                                        CHAMPION
                                    </div>
                                </div>
                                <div className="bg-gradient-to-b from-yellow-900 to-yellow-950 rounded-xl p-5 w-40 text-center border-2 border-yellow-500 shadow-xl shadow-yellow-500/30">
                                    <div className="text-yellow-300 font-bold text-base truncate mb-1">{topThree[0].displayName}</div>
                                    <div className="text-yellow-500 text-sm mb-2">Lv.{topThree[0].level}</div>
                                    <div className="text-yellow-200 font-mono text-2xl font-bold">{topThree[0].leaderboardPoint.toLocaleString()}</div>
                                    <div className="text-yellow-600 text-xs">points</div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative mb-3">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 p-1 shadow-lg shadow-amber-600/50">
                                        <img
                                            src={topThree[2].photo || '/default-avatar.png'}
                                            alt={topThree[2].displayName}
                                            className="w-full h-full rounded-full object-cover border-2 border-white"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg">
                                        3rd
                                    </div>
                                </div>
                                <div className="bg-gradient-to-b from-amber-900 to-amber-950 rounded-lg p-4 w-32 text-center border border-amber-700">
                                    <div className="text-amber-100 font-bold text-sm truncate mb-1">{topThree[2].displayName}</div>
                                    <div className="text-amber-400 text-xs mb-2">Lv.{topThree[2].level}</div>
                                    <div className="text-amber-200 font-mono text-lg font-bold">{topThree[2].leaderboardPoint.toLocaleString()}</div>
                                    <div className="text-amber-600 text-xs">points</div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {/* Rest of the Players - Detailed List */}
            <div className="overflow-x-auto">
                <div className="min-w-full">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 md:gap-4 px-3 md:px-6 py-4 bg-gradient-to-r from-gray-900 to-black border-b border-white/10 text-gray-400 text-xs md:text-sm font-bold uppercase">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-5 md:col-span-4">Player</div>
                        <div className="hidden md:block md:col-span-2 text-center">Level</div>
                        <div className="col-span-3 md:col-span-2 text-center">K/D</div>
                        <div className="col-span-3 md:col-span-3 text-right">Points</div>
                    </div>

                    {/* Player Rows */}
                    <div className="divide-y divide-white/5">
                        {restOfPlayers.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                                <p className="text-lg">No more players yet</p>
                                <p className="text-sm">Keep playing to climb the ranks!</p>
                            </div>
                        ) : (
                            restOfPlayers.map((player, index) => {
                                const multikills = getMultikills(player.gameResult.gameEvents);
                                const kdRatio = getKDRatio(player.gameResult.kill, player.gameResult.dead);

                                return (
                                    <motion.div
                                        key={player.userId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="grid grid-cols-12 gap-2 md:gap-4 px-3 md:px-6 py-3 md:py-4 hover:bg-gradient-to-r hover:from-yellow-500/5 hover:to-transparent transition-all duration-300 group"
                                    >
                                        {/* Rank */}
                                        <div className="col-span-1 flex items-center">
                                            <div className={`${getRankBadgeClass(player.rank)} w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm shadow-md`}>
                                                {player.rank}
                                            </div>
                                        </div>

                                        {/* Player Info */}
                                        <div className="col-span-5 md:col-span-4 flex items-center gap-2 md:gap-3">
                                            <div className="relative">
                                                <img
                                                    src={player.photo || '/default-avatar.png'}
                                                    alt={player.displayName}
                                                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border-2 border-white/10 group-hover:border-yellow-500/50 transition-colors"
                                                />
                                                {player.rank <= 10 && (
                                                    <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                                        <Star className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-1 md:gap-2">
                                                    <span className="text-white font-bold text-sm md:text-base truncate group-hover:text-yellow-400 transition-colors">
                                                        {player.displayName}
                                                    </span>
                                                    {multikills > 0 && (
                                                        <div className="relative group/multikill hidden md:block">
                                                            <Zap className="w-4 h-4 text-orange-500" />
                                                            <div className="absolute hidden group-hover/multikill:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2">
                                                                {multikills} multikills
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {player.country && (
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <span className="text-base md:text-lg">{getFlagEmoji(player.country)}</span>
                                                        <span className="hidden md:inline">{player.country}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Level - Hidden on mobile */}
                                        <div className="hidden md:flex md:col-span-2 items-center justify-center">
                                            <div className="bg-blue-900/30 border border-blue-500/30 px-3 py-1 rounded-lg">
                                                <span className="text-blue-400 font-bold text-sm">Lv.{player.level}</span>
                                            </div>
                                        </div>

                                        {/* K/D Ratio */}
                                        <div className="col-span-3 md:col-span-2 flex items-center justify-center">
                                            <div className={`px-2 md:px-3 py-1 rounded-lg font-mono font-bold text-xs md:text-sm ${
                                                parseFloat(kdRatio) >= 2 ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                                                parseFloat(kdRatio) >= 1 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                                                'bg-red-900/30 text-red-400 border border-red-500/30'
                                            }`}>
                                                {kdRatio}
                                            </div>
                                        </div>

                                        {/* Kills - Hidden on mobile, shown on desktop */}
                                        <div className="hidden md:flex md:col-span-1 items-center justify-center">
                                            <div className="flex items-center gap-1 text-red-400">
                                                <Skull className="w-4 h-4" />
                                                <span className="font-bold">{player.gameResult.kill}</span>
                                            </div>
                                        </div>

                                        {/* Points */}
                                        <div className="col-span-3 md:col-span-2 flex items-center justify-end">
                                            <div className="text-right">
                                                <div className="text-green-400 font-mono font-bold text-sm md:text-lg">
                                                    {player.leaderboardPoint.toLocaleString()}
                                                </div>
                                                <div className="text-gray-500 text-xs">pts</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Show More Button */}
            {!showAll && data.length > 13 && (
                <div className="p-6 text-center border-t border-white/10 bg-gradient-to-b from-transparent to-black">
                    <button
                        onClick={() => setShowAll(true)}
                        className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/30"
                    >
                        Show All {data.length - 13} More Players
                    </button>
                </div>
            )}

            {/* Stats Summary */}
            {data.length > 0 && (
                <div className="p-6 bg-gradient-to-b from-transparent to-gray-900 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-gray-400 text-sm mb-1">Total Players</div>
                            <div className="text-white font-bold text-2xl">{data.length}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm mb-1">Total Kills</div>
                            <div className="text-red-400 font-bold text-2xl">
                                {data.reduce((sum, p) => sum + p.gameResult.kill, 0).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm mb-1">Avg K/D</div>
                            <div className="text-yellow-400 font-bold text-2xl">
                                {(data.reduce((sum, p) => sum + p.gameResult.kill, 0) /
                                  Math.max(data.reduce((sum, p) => sum + p.gameResult.dead, 0), 1)).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
