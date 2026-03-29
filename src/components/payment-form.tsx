"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withPreservedDemoQuery } from "@/lib/demo";

export function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createPayment = useMutation(api.duesPayments.create);
  const members = useQuery(api.members.list, { status: "Active" });
  const tiers = useQuery(api.membershipTiers.list);

  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [status, setStatus] = useState<string>("Pending");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMember = members?.find((m) => m._id === memberId);
  const selectedTier = selectedMember && tiers ? tiers.find((t) => t._id === selectedMember.tierId) : null;

  const handleMemberChange = (value: string) => {
    setMemberId(value);
    const member = members?.find((m) => m._id === value);
    if (member && tiers) {
      const tier = tiers.find((t) => t._id === member.tierId);
      if (tier) setAmount(tier.annualDuesAmount.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount || !periodStart || !periodEnd || !status) return;
    if (status === "Waived" && !notes) { alert("Notes are required when status is Waived"); return; }
    setIsSubmitting(true);
    try {
      const member = members?.find((m) => m._id === memberId);
      await createPayment({
        memberId: memberId as Id<"members">,
        tierId: (member?.tierId ?? "") as Id<"membershipTiers">,
        amount: parseFloat(amount),
        periodStart: new Date(periodStart).getTime(),
        periodEnd: new Date(periodEnd).getTime(),
        status: status as "Pending" | "Paid" | "Overdue" | "Waived",
        paymentMethod: paymentMethod ? paymentMethod as "Cash" | "Check" | "CreditCard" | "BankTransfer" | "Online" | "Other" : undefined,
        paymentDate: paymentDate ? new Date(paymentDate).getTime() : undefined,
        notes: notes || undefined,
      });
      router.push(withPreservedDemoQuery("/dues", searchParams));
    } catch (error) {
      console.error("Failed to create payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Record Payment</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="memberId">Member *</Label><Select value={memberId} onValueChange={(v) => handleMemberChange(v ?? "")}><SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger><SelectContent>{members?.map((m) => (<SelectItem key={m._id} value={m._id}>{m.firstName} {m.lastName}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="amount">Amount ($) *</Label><Input id="amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />{selectedTier && <p className="text-xs text-muted-foreground">Tier rate: ${selectedTier.annualDuesAmount}/yr</p>}</div>
            <div className="space-y-2"><Label htmlFor="periodStart">Period Start *</Label><Input id="periodStart" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="periodEnd">Period End *</Label><Input id="periodEnd" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="status">Status *</Label><Select value={status} onValueChange={(v) => setStatus(v ?? "Pending")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Overdue">Overdue</SelectItem><SelectItem value="Waived">Waived</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="paymentMethod">Payment Method</Label><Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v ?? "")}><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Check">Check</SelectItem><SelectItem value="CreditCard">Credit Card</SelectItem><SelectItem value="BankTransfer">Bank Transfer</SelectItem><SelectItem value="Online">Online</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="paymentDate">Payment Date</Label><Input id="paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="notes">Notes {status === "Waived" && "*"}</Label><Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} required={status === "Waived"} /></div>
          <div className="flex gap-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Record Payment"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
