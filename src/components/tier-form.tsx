"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TierFormProps {
  existingTier?: {
    _id: Id<"membershipTiers">;
    name: string;
    description: string;
    annualDuesAmount: number;
    benefitsDescription?: string;
    maxMembers?: number;
    sortOrder: number;
    isActive: boolean;
  };
}

export function TierForm({ existingTier }: TierFormProps) {
  const router = useRouter();
  const createTier = useMutation(api.membershipTiers.create);
  const updateTier = useMutation(api.membershipTiers.update);
  const isEditing = !!existingTier;

  const [name, setName] = useState(existingTier?.name ?? "");
  const [description, setDescription] = useState(existingTier?.description ?? "");
  const [annualDuesAmount, setAnnualDuesAmount] = useState(existingTier?.annualDuesAmount?.toString() ?? "");
  const [benefitsDescription, setBenefitsDescription] = useState(existingTier?.benefitsDescription ?? "");
  const [maxMembers, setMaxMembers] = useState(existingTier?.maxMembers?.toString() ?? "");
  const [sortOrder, setSortOrder] = useState(existingTier?.sortOrder?.toString() ?? "0");
  const [isActive, setIsActive] = useState(existingTier?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !annualDuesAmount) return;
    setIsSubmitting(true);
    try {
      if (isEditing && existingTier) {
        await updateTier({
          id: existingTier._id,
          name: name as "Individual" | "Family" | "Student" | "Senior" | "Lifetime",
          description,
          annualDuesAmount: parseFloat(annualDuesAmount),
          benefitsDescription: benefitsDescription || undefined,
          maxMembers: maxMembers ? parseInt(maxMembers) : undefined,
          sortOrder: parseInt(sortOrder),
          isActive,
        });
      } else {
        await createTier({
          name: name as "Individual" | "Family" | "Student" | "Senior" | "Lifetime",
          description,
          annualDuesAmount: parseFloat(annualDuesAmount),
          benefitsDescription: benefitsDescription || undefined,
          maxMembers: maxMembers ? parseInt(maxMembers) : undefined,
          sortOrder: parseInt(sortOrder),
          isActive,
        });
      }
      router.push("/settings/tiers");
    } catch (error) {
      console.error("Failed to save tier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{isEditing ? "Edit Tier" : "Create Membership Tier"}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="name">Tier Name *</Label><Select value={name} onValueChange={(v) => setName(v ?? "")}><SelectTrigger><SelectValue placeholder="Select tier name" /></SelectTrigger><SelectContent><SelectItem value="Individual">Individual</SelectItem><SelectItem value="Family">Family</SelectItem><SelectItem value="Student">Student</SelectItem><SelectItem value="Senior">Senior</SelectItem><SelectItem value="Lifetime">Lifetime</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="annualDuesAmount">Annual Dues ($) *</Label><Input id="annualDuesAmount" type="number" step="0.01" min="0" value={annualDuesAmount} onChange={(e) => setAnnualDuesAmount(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="maxMembers">Max Members</Label><Input id="maxMembers" type="number" min="0" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="sortOrder">Sort Order *</Label><Input id="sortOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} required /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="description">Description *</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required /></div>
          <div className="space-y-2"><Label htmlFor="benefitsDescription">Benefits Description</Label><Textarea id="benefitsDescription" value={benefitsDescription} onChange={(e) => setBenefitsDescription(e.target.value)} rows={3} /></div>
          <div className="flex items-center space-x-2"><Checkbox id="isActive" checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} /><Label htmlFor="isActive">Active</Label></div>
          <div className="flex gap-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update Tier" : "Create Tier"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}