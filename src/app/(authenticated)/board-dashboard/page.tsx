"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { BoardStats } from "@/components/board-stats";

export default function BoardDashboardPage() {
  const stats = useQuery(api.dashboard.getBoardStats);

  if (stats === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Board Dashboard</h1>
      </div>
      <BoardStats />
    </div>
  );
}