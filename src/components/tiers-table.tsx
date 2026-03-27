"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Plus } from "lucide-react";

export function TiersTable() {
  const router = useRouter();
  const tiers = useQuery(api.membershipTiers.list);

  if (!tiers) {
    return <div className="h-[300px] rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Membership Tiers</h2>
        <Button onClick={() => router.push("/tiers/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Tier
        </Button>
      </div>

      {tiers.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No tiers configured</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Annual Dues</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.map((tier) => (
              <TableRow key={tier._id}>
                <TableCell className="font-medium">{tier.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">{tier.description}</TableCell>
                <TableCell>${tier.annualDuesAmount.toLocaleString()}</TableCell>
                <TableCell>{tier.currentMemberCount ?? 0}</TableCell>
                <TableCell>{tier.maxMembers ?? "Unlimited"}</TableCell>
                <TableCell>
                  <StatusBadge status={tier.isActive ? "Active" : "Inactive"} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
