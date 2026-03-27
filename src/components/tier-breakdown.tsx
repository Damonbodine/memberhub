"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";

export function TierBreakdown() {
  const tiers = useQuery(api.membershipTiers.list);

  if (!tiers) return <div className="h-[200px] rounded-lg bg-muted animate-pulse" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Tiers</CardTitle>
      </CardHeader>
      <CardContent>
        {tiers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No tiers configured</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Annual Dues</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier) => (
                <TableRow key={tier._id}>
                  <TableCell className="font-medium">{tier.name}</TableCell>
                  <TableCell>{tier.currentMemberCount ?? 0}{tier.maxMembers ? ` / ${tier.maxMembers}` : ""}</TableCell>
                  <TableCell>${tier.annualDuesAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={tier.isActive ? "Active" : "Inactive"} />
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
