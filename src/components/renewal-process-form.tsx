"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RenewalProcessFormProps {
  renewalId: Id<"renewals">;
  currentTierId: Id<"membershipTiers">;
}

export function RenewalProcessForm({ renewalId, currentTierId }: RenewalProcessFormProps) {
  const router = useRouter();
  const completeRenewal = useMutation(api.renewals.complete);
  const tiers = useQuery(api.membershipTiers.listActive);
  const currentTier = tiers?.find((t) => t._id === currentTierId);

  const [paymentAmount, setPaymentAmount] = useState(currentTier?.annualDuesAmount?.toString() ?? "");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return;
    setIsSubmitting(true);
    try {
      await completeRenewal({
        id: renewalId,
        paymentAmount: parseFloat(paymentAmount),
        paymentMethod: paymentMethod ? paymentMethod as "Cash" | "Check" | "CreditCard" | "BankTransfer" | "Online" | "Other" : undefined,
      });
      router.push("/renewals");
    } catch (error) {
      console.error("Failed to process renewal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="paymentAmount">Payment Amount ($) *</Label><Input id="paymentAmount" type="number" step="0.01" min="0" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />{currentTier && <p className="text-xs text-muted-foreground">Current tier rate: ${currentTier.annualDuesAmount}/yr</p>}</div>
        <div className="space-y-2"><Label htmlFor="paymentMethod">Payment Method</Label><Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v ?? "")}><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Check">Check</SelectItem><SelectItem value="CreditCard">Credit Card</SelectItem><SelectItem value="BankTransfer">Bank Transfer</SelectItem><SelectItem value="Online">Online</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
      </div>
      <div className="flex gap-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Complete Renewal"}</Button></div>
    </form>
  );
}