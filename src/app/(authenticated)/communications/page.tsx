"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CommunicationsTable } from "@/components/communications-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function CommunicationsListPage() {
  const logs = useQuery(api.communicationLogs.list, {});

  if (logs === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
        <Link href="/communications/new">
          <Button><Plus className="mr-2 h-4 w-4" />Log Communication</Button>
        </Link>
      </div>
      <CommunicationsTable />
    </div>
  );
}