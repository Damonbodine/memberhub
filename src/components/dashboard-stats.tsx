"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { StatCard } from "@/components/stat-card";
import { Users, UserPlus, DollarSign, AlertTriangle } from "lucide-react";

export function DashboardStats() {
  const stats = useQuery(api.dashboard.getStats);

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[120px] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Active Members"
        value={stats.activeMembers ?? 0}
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        label="New This Month"
        value={stats.newThisMonth ?? 0}
        icon={<UserPlus className="h-4 w-4" />}
      />
      <StatCard
        label="Revenue"
        value={`$${(stats.revenueThisMonth ?? 0).toLocaleString()}`}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <StatCard
        label="Overdue Payments"
        value={stats.overdueCount ?? 0}
        icon={<AlertTriangle className="h-4 w-4" />}
      />
    </div>
  );
}
