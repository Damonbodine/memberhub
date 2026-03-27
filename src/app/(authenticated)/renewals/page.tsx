"use client";


import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { RenewalsTable } from "@/components/renewals-table";

export default function RenewalsListPage() {
  const renewals = useQuery(api.renewals.list, {});

  if (renewals === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Renewals</h1>
      </div>
      <RenewalsTable />
    </div>
  );
}