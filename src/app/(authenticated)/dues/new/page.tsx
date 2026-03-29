"use client";


import { PaymentForm } from "@/components/payment-form";

export default function NewPaymentPage() {
  return (
    <div className="space-y-6" data-demo="payment-form">
      <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
      <PaymentForm />
    </div>
  );
}
