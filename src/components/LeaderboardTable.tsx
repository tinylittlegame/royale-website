'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/api';
import { Trophy } from 'lucide-react';

export default function LeaderboardTable() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            // Game ID: 'tiny-little-royale' seems consistent with user request
            console.log("Fetching leaderboard...");
            const result = await getLeaderboard('tiny-little-royale');
            console.log("Leaderboard result full:", JSON.stringify(result));

            if (result && Array.isArray(result)) {
                setData(result);
            } else if (result && result.data && Array.isArray(result.data)) {
                setData(result.data);
            } else if (result && result.items && Array.isArray(result.items)) {
                setData(result.items);
            } else if (result && result.leaderboard && Array.isArray(result.leaderboard)) {
                setData(result.leaderboard);
            } else if (result && result.rankings && Array.isArray(result.rankings)) {
                setData(result.rankings);
            }
            setLoading(false);
        }
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-gray-400 border-b border-white/10 text-sm uppercase tracking-wider">
                        <th className="p-4">Rank</th>
                        <th className="p-4">Player</th>
                        <th className="p-4 text-right">Score</th>
                    </tr>
                </thead>
                <tbody className="text-white divide-y divide-white/5">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="p-8 text-center text-gray-500">
                                No records found yet. Be the first to play!
                            </td>
                        </tr>
                    ) : (
                        data.map((item: any, index: number) => (
                            <tr key={index} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-yellow-500 font-bold">
                                    #{item.rank || index + 1}
                                </td>
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-white/10">
                                        {item.photo || item.avatar || item.user?.avatar ? (
                                            <img
                                                src={item.photo || item.avatar || item.user?.avatar}
                                                alt={item.displayName || 'Player'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-gray-400">
                                                {(item.displayName || item.name || 'P')[0]?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white text-base">
                                            {item.displayName || item.name || item.user?.name || 'Anonymous'}
                                        </span>
                                        {item.country && (
                                            <span className="text-xs text-gray-500">{item.country}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-right font-mono text-green-400 font-bold text-lg">
                                    {(item.leaderboardPoint ?? item.score ?? 0).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
