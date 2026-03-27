"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PaymentDetailPage() {
  const params = useParams();
  const payment = useQuery(api.duesPayments.getById, params.id ? { id: params.id as Id<"duesPayments"> } : "skip");

  if (payment === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (payment === null) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Payment not found</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dues"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
        <StatusBadge status={payment.status} />
      </div>
      <Card>
        <CardHeader><CardTitle>Payment Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><p className="text-sm text-muted-foreground">Amount</p><p className="text-lg font-medium">${payment.amount.toFixed(2)}</p></div>
          <div><p className="text-sm text-muted-foreground">Status</p><p className="text-lg font-medium">{payment.status}</p></div>
          <div><p className="text-sm text-muted-foreground">Period Start</p><p className="text-lg font-medium">{new Date(payment.periodStart).toLocaleDateString()}</p></div>
          <div><p className="text-sm text-muted-foreground">Period End</p><p className="text-lg font-medium">{new Date(payment.periodEnd).toLocaleDateString()}</p></div>
          {payment.paymentMethod && <div><p className="text-sm text-muted-foreground">Payment Method</p><p className="text-lg font-medium">{payment.paymentMethod}</p></div>}
          {payment.paymentDate && <div><p className="text-sm text-muted-foreground">Payment Date</p><p className="text-lg font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</p></div>}
          {payment.notes && <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Notes</p><p className="text-lg font-medium">{payment.notes}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}