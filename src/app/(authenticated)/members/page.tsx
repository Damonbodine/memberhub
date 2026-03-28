"use client";


import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { MembersTable } from "@/components/members-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { withPreservedDemoQuery } from "@/lib/demo";

export default function MembersListPage() {
  const members = useQuery(api.members.list, {});
  const searchParams = useSearchParams();

  if (members === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <Link href={withPreservedDemoQuery("/members/new", searchParams)}>
          <Button><Plus className="mr-2 h-4 w-4" />Add Member</Button>
        </Link>
      </div>
      <MembersTable />
    </div>
  );
}
