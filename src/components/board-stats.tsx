"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { StatCard } from "@/components/stat-card";
import { Users, TrendingUp, TrendingDown } from "lucide-react";

export function BoardStats() {
  const stats = useQuery(api.dashboard.getBoardStats);

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[120px] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const totalMembers = stats.membersByTier?.reduce((sum: number, t: { count: number }) => sum + t.count, 0) ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Total Members"
        value={totalMembers}
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        label="Renewal Rate"
        value={`${stats.renewalRate ?? 0}%`}
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <StatCard
        label="Lapse Rate"
        value={`${stats.lapseRate ?? 0}%`}
        icon={<TrendingDown className="h-4 w-4" />}
      />
    </div>
  );
}
