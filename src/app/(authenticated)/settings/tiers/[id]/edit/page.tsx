"use client";


import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { TierForm } from "@/components/tier-form";

export default function EditTierPage() {
  const params = useParams();
  const tier = useQuery(api.membershipTiers.getById, params.id ? { id: params.id as Id<"membershipTiers"> } : "skip");

  if (tier === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (tier === null) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Tier not found</p></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Membership Tier</h1>
      <TierForm existingTier={tier} />
    </div>
  );
}