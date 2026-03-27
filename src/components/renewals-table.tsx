"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";

export function RenewalsTable() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const renewals = useQuery(
    api.renewals.list,
    statusFilter && statusFilter !== "all"
      ? { status: statusFilter as "Pending" | "Completed" | "Lapsed" }
      : {}
  );

  if (!renewals) {
    return <div className="h-[400px] rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter ?? "all"} onValueChange={(v) => setStatusFilter(v === "all" || v === null ? undefined : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Lapsed">Lapsed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {renewals.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No renewals found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>From Tier</TableHead>
              <TableHead>To Tier</TableHead>
              <TableHead>Renewal Date</TableHead>
              <TableHead>Reminders</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renewals.map((renewal) => (
              <TableRow key={renewal._id}>
                <TableCell className="font-medium">{renewal.memberName ?? "Unknown"}</TableCell>
                <TableCell>{renewal.oldTierName ?? "—"}</TableCell>
                <TableCell>{renewal.newTierName ?? "—"}</TableCell>
                <TableCell>{new Date(renewal.renewalDate).toLocaleDateString()}</TableCell>
                <TableCell>{renewal.reminderCount ?? 0}</TableCell>
                <TableCell><StatusBadge status={renewal.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
