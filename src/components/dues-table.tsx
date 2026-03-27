"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Plus } from "lucide-react";

export function DuesTable() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const payments = useQuery(
    api.duesPayments.list,
    statusFilter && statusFilter !== "all"
      ? { status: statusFilter as "Pending" | "Paid" | "Overdue" | "Waived" }
      : {}
  );

  if (!payments) {
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
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
            <SelectItem value="Waived">Waived</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => router.push("/dues/new")} className="gap-2 ml-auto">
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No payments found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell className="font-medium">{payment.memberName ?? "Unknown"}</TableCell>
                <TableCell>{payment.tierName ?? "—"}</TableCell>
                <TableCell>${payment.amount.toLocaleString()}</TableCell>
                <TableCell>
                  {new Date(payment.periodStart).toLocaleDateString()} — {new Date(payment.periodEnd).toLocaleDateString()}
                </TableCell>
                <TableCell>{payment.paymentMethod ?? "—"}</TableCell>
                <TableCell><StatusBadge status={payment.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
