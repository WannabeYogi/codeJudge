"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, FileCode, Loader2 } from "lucide-react";
import { Contest, apiService } from "@/lib/api";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        // For demo purposes, we'll use the sample contest since the API endpoint might not be implemented
        // In a real app, you would use: const contests = await apiService.getContests();
        const sampleContest = {
          id: "68fdb9efd102435f3b037f7a",
          name: "Sample Contest"
        };
        setContests([sampleContest]);
      } catch (error) {
        console.error("Failed to fetch contests:", error);
        toast({
          title: "Error",
          description: "Failed to load contests. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Contests</h1>
      </div>

      {contests.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No contests available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contests.map((contest) => (
            <Link key={contest.id} href={`/contests/${contest.id}`} passHref>
              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{contest.name}</CardTitle>
                  <CardDescription>Coding challenge</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm">
                    <FileCode className="mr-2 h-4 w-4" />
                    <span>3 Problems</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    View Contest
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
