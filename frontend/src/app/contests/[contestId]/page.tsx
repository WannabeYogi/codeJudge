"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Loader2, Trophy } from "lucide-react";
import { ContestWithProblems, apiService } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function ContestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const contestId = params.contestId as string;
  const [contest, setContest] = useState<ContestWithProblems | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        setLoading(true);
        const contestDetails = await apiService.getContestDetails(contestId);
        setContest(contestDetails);
      } catch (error) {
        console.error("Failed to fetch contest details:", error);
        toast({
          title: "Error",
          description: "Failed to load contest details. Please try again later.",
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

    fetchContestDetails();
  }, [contestId, toast, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="container py-10">
        <div className="text-center py-10">
          <p className="text-muted-foreground">Contest not found. Redirecting to contests page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{contest.name}</h1>
          <p className="text-muted-foreground mt-1">
            {contest.problems.length} problems available
          </p>
        </div>
        <Link href={`/leaderboard/${contestId}`} passHref>
          <Button variant="outline" className="gap-2">
            <Trophy className="h-4 w-4" />
            View Leaderboard
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {contest.problems.map((problem) => (
          <Link key={problem.id} href={`/problems/${problem.id}?contestId=${contestId}`} passHref>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{problem.title}</CardTitle>
                <CardDescription>
                  Time Limit: {problem.timeLimitMs}ms | Memory Limit: {problem.memoryLimitMb}MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2">{problem.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto">
                  Solve Problem
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}