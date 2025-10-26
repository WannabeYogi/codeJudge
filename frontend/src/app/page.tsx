"use client";

import { Code, FileCode, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SAMPLE_CONTEST_ID } from "@/lib/api";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Code className="h-16 w-16" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Shodh-a-Code
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Solve coding challenges and compete with others
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contests" passHref>
            <Button size="lg" className="gap-2">
              <FileCode className="h-5 w-5" />
              View Contests
            </Button>
          </Link>
          <Link href={`/contests/${SAMPLE_CONTEST_ID}`} passHref>
            <Button size="lg" variant="outline" className="gap-2">
              <Code className="h-5 w-5" />
              Submit Code
            </Button>
          </Link>
          <Link href={`/leaderboard/${SAMPLE_CONTEST_ID}`} passHref>
            <Button size="lg" variant="outline" className="gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <div className="border rounded-lg p-6 bg-card">
          <FileCode className="h-10 w-10 mb-4" />
          <h2 className="text-xl font-bold mb-2">Solve Problems</h2>
          <p className="text-muted-foreground">
            Practice with a variety of coding problems across different difficulty levels.
          </p>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <Code className="h-10 w-10 mb-4" />
          <h2 className="text-xl font-bold mb-2">Submit Solutions</h2>
          <p className="text-muted-foreground">
            Write and submit your code in Java and get instant feedback.
          </p>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <Trophy className="h-10 w-10 mb-4" />
          <h2 className="text-xl font-bold mb-2">Compete</h2>
          <p className="text-muted-foreground">
            Participate in contests and compare your performance on the leaderboard.
          </p>
        </div>
      </div>
    </div>
  );
}