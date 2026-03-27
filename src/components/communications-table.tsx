"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function CommunicationsTable() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [directionFilter, setDirectionFilter] = useState<string | undefined>(undefined);

  const logs = useQuery(
    api.communicationLogs.list,
    {
      ...(typeFilter && typeFilter !== "all" ? { type: typeFilter as "Email" | "Phone" | "InPerson" | "Note" } : {}),
      ...(directionFilter && directionFilter !== "all" ? { direction: directionFilter as "Inbound" | "Outbound" | "Internal" } : {}),
    }
  );

  if (!logs) {
    return <div className="h-[400px] rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={typeFilter ?? "all"} onValueChange={(v) => setTypeFilter(v === "all" || v === null ? undefined : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Phone">Phone</SelectItem>
            <SelectItem value="InPerson">In Person</SelectItem>
            <SelectItem value="Note">Note</SelectItem>
          </SelectContent>
        </Select>
        <Select value={directionFilter ?? "all"} onValueChange={(v) => setDirectionFilter(v === "all" || v === null ? undefined : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All directions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All directions</SelectItem>
            <SelectItem value="Inbound">Inbound</SelectItem>
            <SelectItem value="Outbound">Outbound</SelectItem>
            <SelectItem value="Internal">Internal</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => router.push("/communications/new")} className="gap-2 ml-auto">
          <Plus className="h-4 w-4" />
          New Communication
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No communications found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell className="font-medium">{log.memberName ?? "Unknown"}</TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell className="max-w-[200px] truncate">{log.subject}</TableCell>
                <TableCell>{log.direction}</TableCell>
                <TableCell>{new Date(log.communicationDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
