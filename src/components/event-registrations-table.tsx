"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";

interface EventRegistrationsTableProps {
  eventId: Id<"events">;
}

export function EventRegistrationsTable({ eventId }: EventRegistrationsTableProps) {
  const registrations = useQuery(api.eventRegistrations.listByEvent, { eventId });

  if (!registrations) {
    return <div className="h-[200px] rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrations</CardTitle>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No registrations yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg._id}>
                  <TableCell className="font-medium">{reg.memberName ?? "Unknown"}</TableCell>
                  <TableCell><StatusBadge status={reg.status} /></TableCell>
                  <TableCell>{new Date(reg.registeredDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{reg.notes ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
