"use client";

import { TierForm } from "@/components/tier-form";

export default function NewTierPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Membership Tier</h1>
      <TierForm />
    </div>
  );
}