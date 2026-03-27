"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";

export function UpcomingRenewals() {
  const renewals = useQuery(api.renewals.list, { status: "Pending" });

  if (!renewals) return <div className="h-[200px] rounded-lg bg-muted animate-pulse" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Renewals</CardTitle>
      </CardHeader>
      <CardContent>
        {renewals.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No pending renewals</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renewals.slice(0, 5).map((renewal) => (
                <TableRow key={renewal._id}>
                  <TableCell className="font-medium">{renewal.memberName ?? "Unknown"}</TableCell>
                  <TableCell>{new Date(renewal.renewalDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={renewal.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
