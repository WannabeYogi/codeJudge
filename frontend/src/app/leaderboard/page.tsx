"use client";

import { Loader2 } from "lucide-react";
import { SAMPLE_CONTEST_ID } from "@/lib/api";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LeaderboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.push(`/leaderboard/${SAMPLE_CONTEST_ID}`);
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
