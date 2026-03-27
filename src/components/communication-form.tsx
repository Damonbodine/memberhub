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

export function CommunicationForm() {
  const router = useRouter();
  const createLog = useMutation(api.communicationLogs.create);
  const members = useQuery(api.members.list, {});

  const [memberId, setMemberId] = useState("");
  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [direction, setDirection] = useState("");
  const [communicationDate, setCommunicationDate] = useState(new Date().toISOString().split("T")[0]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !type || !subject || !content || !direction || !communicationDate) return;
    setIsSubmitting(true);
    try {
      await createLog({
        memberId: memberId as Id<"members">,
        type: type as "Email" | "Phone" | "InPerson" | "Note",
        subject,
        content,
        direction: direction as "Inbound" | "Outbound" | "Internal",
        communicationDate: new Date(communicationDate).getTime(),
        followUpDate: followUpDate ? new Date(followUpDate).getTime() : undefined,
      });
      router.push("/communications");
    } catch (error) {
      console.error("Failed to log communication:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Log Communication</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="memberId">Member *</Label><Select value={memberId} onValueChange={(v) => setMemberId(v ?? "")}><SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger><SelectContent>{members?.map((m) => (<SelectItem key={m._id} value={m._id}>{m.firstName} {m.lastName}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="type">Type *</Label><Select value={type} onValueChange={(v) => setType(v ?? "")}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Email">Email</SelectItem><SelectItem value="Phone">Phone</SelectItem><SelectItem value="InPerson">In Person</SelectItem><SelectItem value="Note">Note</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="direction">Direction *</Label><Select value={direction} onValueChange={(v) => setDirection(v ?? "")}><SelectTrigger><SelectValue placeholder="Select direction" /></SelectTrigger><SelectContent><SelectItem value="Inbound">Inbound</SelectItem><SelectItem value="Outbound">Outbound</SelectItem><SelectItem value="Internal">Internal</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="communicationDate">Date *</Label><Input id="communicationDate" type="date" value={communicationDate} onChange={(e) => setCommunicationDate(e.target.value)} required /></div>
            <div className="md:col-span-2 space-y-2"><Label htmlFor="subject">Subject *</Label><Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="content">Content *</Label><Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} required /></div>
          <div className="space-y-2"><Label htmlFor="followUpDate">Follow-up Date</Label><Input id="followUpDate" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} /></div>
          <div className="flex gap-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Log Communication"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}