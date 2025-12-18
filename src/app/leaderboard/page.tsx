import LeaderboardTable from "@/components/LeaderboardTable";

export default function LeaderboardPage() {
    return (
        <div className="min-h-screen bg-black pt-10 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Leaderboard</h1>
                    <p className="text-gray-400">Top Monthly Deathmatch Players</p>
                </div>

                <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <LeaderboardTable />
                </div>
            </div>
        </div>
    );
}
