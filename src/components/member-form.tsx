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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MemberFormProps {
  existingMember?: {
    _id: Id<"members">;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    tierId: Id<"membershipTiers">;
    role: string;
    status: string;
    joinDate: number;
    renewalDate: number;
    notes?: string;
  };
}

export function MemberForm({ existingMember }: MemberFormProps) {
  const router = useRouter();
  const createMember = useMutation(api.members.create);
  const updateMember = useMutation(api.members.update);
  const tiers = useQuery(api.membershipTiers.listActive);
  const isEditing = !!existingMember;

  const [firstName, setFirstName] = useState(existingMember?.firstName ?? "");
  const [lastName, setLastName] = useState(existingMember?.lastName ?? "");
  const [email, setEmail] = useState(existingMember?.email ?? "");
  const [phone, setPhone] = useState(existingMember?.phone ?? "");
  const [address, setAddress] = useState(existingMember?.address ?? "");
  const [city, setCity] = useState(existingMember?.city ?? "");
  const [state, setState] = useState(existingMember?.state ?? "");
  const [zipCode, setZipCode] = useState(existingMember?.zipCode ?? "");
  const [tierId, setTierId] = useState<string>(existingMember?.tierId ?? "");
  const [role, setRole] = useState(existingMember?.role ?? "Member");
  const [status, setStatus] = useState(existingMember?.status ?? "Active");
  const [joinDate, setJoinDate] = useState(existingMember ? new Date(existingMember.joinDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
  const [renewalDate, setRenewalDate] = useState(existingMember ? new Date(existingMember.renewalDate).toISOString().split("T")[0] : "");
  const [notes, setNotes] = useState(existingMember?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !tierId || !joinDate || !renewalDate) return;
    setIsSubmitting(true);
    try {
      if (isEditing && existingMember) {
        await updateMember({
          id: existingMember._id,
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          address: address || undefined,
          city: city || undefined,
          state: state || undefined,
          zipCode: zipCode || undefined,
          tierId: tierId as Id<"membershipTiers">,
          role: role as "Admin" | "StaffMember" | "BoardMember" | "Member",
          renewalDate: new Date(renewalDate).getTime(),
          notes: notes || undefined,
        });
        router.push(`/members/${existingMember._id}`);
      } else {
        await createMember({
          clerkId: "",
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          address: address || undefined,
          city: city || undefined,
          state: state || undefined,
          zipCode: zipCode || undefined,
          tierId: tierId as Id<"membershipTiers">,
          role: role as "Admin" | "StaffMember" | "BoardMember" | "Member",
          status: status as "Active" | "Inactive" | "Suspended" | "Expired",
          joinDate: new Date(joinDate).getTime(),
          renewalDate: new Date(renewalDate).getTime(),
          notes: notes || undefined,
        });
        router.push("/members");
      }
    } catch (error) {
      console.error("Failed to save member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{isEditing ? "Edit Member" : "Add New Member"}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="firstName">First Name *</Label><Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="state">State</Label><Input id="state" value={state} onChange={(e) => setState(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="zipCode">ZIP Code</Label><Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="tierId">Membership Tier *</Label><Select value={tierId} onValueChange={(v) => setTierId(v ?? "")}><SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger><SelectContent>{tiers?.map((t) => (<SelectItem key={t._id} value={t._id}>{t.name} - ${t.annualDuesAmount}/yr</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="role">Role *</Label><Select value={role} onValueChange={(v) => setRole(v ?? "Member")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="StaffMember">Staff Member</SelectItem><SelectItem value="BoardMember">Board Member</SelectItem><SelectItem value="Member">Member</SelectItem></SelectContent></Select></div>
            {!isEditing && <div className="space-y-2"><Label htmlFor="status">Status *</Label><Select value={status} onValueChange={(v) => setStatus(v ?? "Active")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Suspended">Suspended</SelectItem><SelectItem value="Expired">Expired</SelectItem></SelectContent></Select></div>}
            <div className="space-y-2"><Label htmlFor="joinDate">Join Date *</Label><Input id="joinDate" type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required disabled={isEditing} /></div>
            <div className="space-y-2"><Label htmlFor="renewalDate">Renewal Date *</Label><Input id="renewalDate" type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} required /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
          <div className="flex gap-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update Member" : "Add Member"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}