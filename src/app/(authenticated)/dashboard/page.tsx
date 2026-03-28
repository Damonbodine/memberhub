"use client";


import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { DashboardStats } from "@/components/dashboard-stats";
import { TierBreakdown } from "@/components/tier-breakdown";
import { UpcomingRenewals } from "@/components/upcoming-renewals";
import { RecentPayments } from "@/components/recent-payments";
import { QuickActions } from "@/components/quick-actions";
import { RenewalRiskWidget } from "@/components/renewal-risk-widget";

export default function DashboardPage() {
  const stats = useQuery(api.dashboard.getStats);

  if (stats === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <DashboardStats />
      <div className="grid gap-6 md:grid-cols-2">
        <TierBreakdown />
        <QuickActions />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingRenewals />
        <RecentPayments />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <RenewalRiskWidget />
      </div>
    </div>
  );
}