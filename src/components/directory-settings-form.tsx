"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DirectorySettingsForm() {
  const router = useRouter();
  const user = useQuery(api.members.getCurrentUser);
  const existing = useQuery(api.memberDirectory.getByMember, user?._id ? { memberId: user._id } : "skip");
  const upsert = useMutation(api.memberDirectory.upsert);

  const [displayName, setDisplayName] = useState("");
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showTier, setShowTier] = useState(true);
  const [optedIn, setOptedIn] = useState(true);
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setDisplayName(existing.displayName);
      setShowEmail(existing.showEmail);
      setShowPhone(existing.showPhone);
      setShowAddress(existing.showAddress);
      setShowTier(existing.showTier);
      setOptedIn(existing.optedIn);
      setBio(existing.bio ?? "");
    } else if (user) {
      setDisplayName(`${user.firstName} ${user.lastName}`);
    }
  }, [existing, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName) return;
    setIsSubmitting(true);
    try {
      await upsert({
        memberId: user._id,
        displayName,
        showEmail,
        showPhone,
        showAddress,
        showTier,
        optedIn,
        bio: bio || undefined,
      });
      router.push("/directory");
    } catch (error) {
      console.error("Failed to save directory settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader><CardTitle>My Directory Settings</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2"><Label htmlFor="displayName">Display Name *</Label><Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required /></div>
          <div className="space-y-4">
            <Label>Visibility Settings</Label>
            <div className="flex items-center space-x-2"><Checkbox id="optedIn" checked={optedIn} onCheckedChange={(c) => setOptedIn(c === true)} /><Label htmlFor="optedIn">Show me in directory</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="showEmail" checked={showEmail} onCheckedChange={(c) => setShowEmail(c === true)} /><Label htmlFor="showEmail">Show email</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="showPhone" checked={showPhone} onCheckedChange={(c) => setShowPhone(c === true)} /><Label htmlFor="showPhone">Show phone</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="showAddress" checked={showAddress} onCheckedChange={(c) => setShowAddress(c === true)} /><Label htmlFor="showAddress">Show address</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="showTier" checked={showTier} onCheckedChange={(c) => setShowTier(c === true)} /><Label htmlFor="showTier">Show membership tier</Label></div>
          </div>
          <div className="space-y-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell other members about yourself..." /></div>
          <div className="flex gap-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Settings"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}