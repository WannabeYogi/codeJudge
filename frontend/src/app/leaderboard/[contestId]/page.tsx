"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardEntry, apiService } from "@/lib/api";
import { Loader2, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useToast } from "@/components/ui/use-toast";

export default function LeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const contestId = params.contestId as string;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const leaderboardData = await apiService.getLeaderboard(contestId);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        toast({
          title: "Error",
          description: "Failed to load leaderboard data. Please try again later.",
          variant: "destructive",
        });
        // Navigate back to contests page after a delay
        setTimeout(() => {
          router.push('/contests');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [contestId, toast, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
        <div className="text-center py-10">
          <p className="text-muted-foreground">No leaderboard data available for this contest.</p>
        </div>
      </div>
    );
  }

  const chartData = leaderboard.map((entry, index) => ({
    name: entry.username,
    solved: entry.solvedCount,
    penalty: entry.totalPenalty,
    rank: index + 1,
  }));

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {leaderboard.length} participants
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th scope="col" className="px-6 py-3">Rank</th>
                      <th scope="col" className="px-6 py-3">Username</th>
                      <th scope="col" className="px-6 py-3">Problems Solved</th>
                      <th scope="col" className="px-6 py-3">Total Penalty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr key={entry.username} className="border-b">
                        <td className="px-6 py-4 font-medium">
                          <div className="flex items-center">
                            {index === 0 && <Medal className="h-5 w-5 text-yellow-500 mr-1" />}
                            {index === 1 && <Medal className="h-5 w-5 text-gray-400 mr-1" />}
                            {index === 2 && <Medal className="h-5 w-5 text-amber-700 mr-1" />}
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">{entry.username}</td>
                        <td className="px-6 py-4">{entry.solvedCount}</td>
                        <td className="px-6 py-4">{entry.totalPenalty} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Problems Solved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="solved" fill="#3b82f6" name="Problems Solved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}