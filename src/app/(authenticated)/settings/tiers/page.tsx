"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { TiersTable } from "@/components/tiers-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function TierManagementPage() {
  const tiers = useQuery(api.membershipTiers.list);

  if (tiers === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Membership Tiers</h1>
        <Link href="/settings/tiers/new">
          <Button><Plus className="mr-2 h-4 w-4" />Add Tier</Button>
        </Link>
      </div>
      <TiersTable />
    </div>
  );
}