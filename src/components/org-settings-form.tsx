"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"] as const;

export function OrgSettingsForm() {
  const settings = useQuery(api.orgSettings.get);
  const updateSettings = useMutation(api.orgSettings.update);

  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [membershipYearStart, setMembershipYearStart] = useState("January");
  const [gracePeriodDays, setGracePeriodDays] = useState("30");
  const [firstReminderDays, setFirstReminderDays] = useState("60");
  const [secondReminderDays, setSecondReminderDays] = useState("30");
  const [finalReminderDays, setFinalReminderDays] = useState("7");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setOrgName(settings.orgName ?? "");
      setOrgEmail(settings.orgEmail ?? "");
      setOrgPhone(settings.orgPhone ?? "");
      setAddress(settings.address ?? "");
      setCity(settings.city ?? "");
      setState(settings.state ?? "");
      setZipCode(settings.zipCode ?? "");
      setMembershipYearStart(settings.membershipYearStart ?? "January");
      setGracePeriodDays(settings.gracePeriodDays?.toString() ?? "30");
      setFirstReminderDays(settings.firstReminderDays?.toString() ?? "60");
      setSecondReminderDays(settings.secondReminderDays?.toString() ?? "30");
      setFinalReminderDays(settings.finalReminderDays?.toString() ?? "7");
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaved(false);
    try {
      await updateSettings({
        orgName: orgName || undefined,
        orgEmail: orgEmail || undefined,
        orgPhone: orgPhone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        membershipYearStart: membershipYearStart as typeof MONTHS[number],
        gracePeriodDays: parseInt(gracePeriodDays),
        firstReminderDays: parseInt(firstReminderDays),
        secondReminderDays: parseInt(secondReminderDays),
        finalReminderDays: parseInt(finalReminderDays),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (settings === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader><CardTitle>Organization Settings</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="orgName">Organization Name</Label><Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="orgEmail">Email</Label><Input id="orgEmail" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="orgPhone">Phone</Label><Input id="orgPhone" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="state">State</Label><Input id="state" value={state} onChange={(e) => setState(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="zipCode">ZIP Code</Label><Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="membershipYearStart">Membership Year Start</Label><Select value={membershipYearStart} onValueChange={(v) => setMembershipYearStart(v ?? "January")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MONTHS.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select></div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Renewal Reminder Settings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="gracePeriodDays">Grace Period (days)</Label><Input id="gracePeriodDays" type="number" min="0" value={gracePeriodDays} onChange={(e) => setGracePeriodDays(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="firstReminderDays">First Reminder (days before)</Label><Input id="firstReminderDays" type="number" min="0" value={firstReminderDays} onChange={(e) => setFirstReminderDays(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="secondReminderDays">Second Reminder (days before)</Label><Input id="secondReminderDays" type="number" min="0" value={secondReminderDays} onChange={(e) => setSecondReminderDays(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="finalReminderDays">Final Reminder (days before)</Label><Input id="finalReminderDays" type="number" min="0" value={finalReminderDays} onChange={(e) => setFinalReminderDays(e.target.value)} /></div>
            </div>
          </div>
          <div className="flex gap-4 items-center"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Settings"}</Button>{saved && <span className="text-sm text-green-600">Settings saved successfully</span>}</div>
        </form>
      </CardContent>
    </Card>
  );
}