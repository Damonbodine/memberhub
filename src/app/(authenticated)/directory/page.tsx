"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { DirectoryGrid } from "@/components/directory-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function MemberDirectoryPage() {
  const entries = useQuery(api.memberDirectory.list);

  if (entries === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Member Directory</h1>
        <Link href="/directory/settings">
          <Button variant="outline"><Settings className="mr-2 h-4 w-4" />My Settings</Button>
        </Link>
      </div>
      <DirectoryGrid />
    </div>
  );
}