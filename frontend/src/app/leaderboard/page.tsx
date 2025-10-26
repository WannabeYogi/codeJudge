"use client";

import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LeaderboardRedirectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        // Fetch the first available contest
        const contests = await apiService.getContests();
        if (contests && contests.length > 0) {
          router.push(`/leaderboard/${contests[0].id}`);
        } else {
          // If no contests are available, redirect to contests page
          router.push('/contests');
        }
      } catch (error) {
        console.error("Failed to fetch contests:", error);
        // On error, redirect to contests page
        router.push('/contests');
      }
    };

    fetchContests();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}