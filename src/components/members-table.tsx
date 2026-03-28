"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Search, Plus } from "lucide-react";
import { withPreservedDemoQuery } from "@/lib/demo";

export function MembersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const members = useQuery(
    api.members.list,
    statusFilter && statusFilter !== "all"
      ? { status: statusFilter as "Active" | "Inactive" | "Suspended" | "Expired" }
      : {}
  );

  if (!members) {
    return <div className="h-[400px] rounded-lg bg-muted animate-pulse" />;
  }

  const filtered = members.filter((m) => {
    const name = `${m.firstName} ${m.lastName}`.toLowerCase();
    const email = (m.email ?? "").toLowerCase();
    const q = search.toLowerCase();
    return !q || name.includes(q) || email.includes(q);
  });

  return (
    <div className="space-y-4" data-demo="members-table">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter ?? "all"} onValueChange={(v) => setStatusFilter(v === "all" || v === null ? undefined : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => router.push(withPreservedDemoQuery("/members/new", searchParams))} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No members found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member, index) => (
              <TableRow
                key={member._id}
                data-demo={index === 0 ? "primary-member-row" : undefined}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(withPreservedDemoQuery(`/members/${member._id}`, searchParams))}
              >
                <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.tierName ?? "—"}</TableCell>
                <TableCell><StatusBadge status={member.status} /></TableCell>
                <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
