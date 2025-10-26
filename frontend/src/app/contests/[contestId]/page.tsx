"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Loader2, Trophy } from "lucide-react";
import { ContestWithProblems, apiService } from "@/lib/api";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function ContestDetailsPage() {
  const params = useParams();
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
          description: "Failed to load contest details. Using mock data instead.",
          variant: "destructive",
        });
        
        // Provide mock data when API fails
        setContest({
          id: contestId,
          name: "Sample Contest",
          problems: [
            {
              id: "68fdb9efd102435f3b037f7c",
              title: "Hello World",
              description: "Print 'Hello, World!' to the console.",
              timeLimitMs: 1000,
              memoryLimitMb: 128
            },
            {
              id: "68fdb9efd102435f3b037f7d",
              title: "Sum of Two Numbers",
              description: "Given two integers A and B, return their sum.",
              timeLimitMs: 1000,
              memoryLimitMb: 128
            },
            {
              id: "68fdb9efd102435f3b037f7e",
              title: "Factorial",
              description: "Calculate the factorial of a given number N.",
              timeLimitMs: 1000,
              memoryLimitMb: 128
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContestDetails();
  }, [contestId, toast]);

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
          <p className="text-muted-foreground">Contest not found.</p>
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
          <Link key={problem.id} href={`/problems/${problem.id}`} passHref>
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
