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

interface EventFormProps {
  existingEvent?: {
    _id: Id<"events">;
    title: string;
    description: string;
    date: number;
    startTime: string;
    endTime?: string;
    location: string;
    address?: string;
    capacity?: number;
    status: string;
    isMembersOnly: boolean;
  };
}

export function EventForm({ existingEvent }: EventFormProps) {
  const router = useRouter();
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const isEditing = !!existingEvent;

  const [title, setTitle] = useState(existingEvent?.title ?? "");
  const [description, setDescription] = useState(existingEvent?.description ?? "");
  const [date, setDate] = useState(existingEvent ? new Date(existingEvent.date).toISOString().split("T")[0] : "");
  const [startTime, setStartTime] = useState(existingEvent?.startTime ?? "");
  const [endTime, setEndTime] = useState(existingEvent?.endTime ?? "");
  const [location, setLocation] = useState(existingEvent?.location ?? "");
  const [address, setAddress] = useState(existingEvent?.address ?? "");
  const [capacity, setCapacity] = useState(existingEvent?.capacity?.toString() ?? "");
  const [status, setStatus] = useState(existingEvent?.status ?? "Upcoming");
  const [isMembersOnly, setIsMembersOnly] = useState(existingEvent?.isMembersOnly ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !startTime || !location) return;
    setIsSubmitting(true);
    try {
      if (isEditing && existingEvent) {
        await updateEvent({
          id: existingEvent._id,
          title,
          description,
          date: new Date(date).getTime(),
          startTime,
          endTime: endTime || undefined,
          location,
          address: address || undefined,
          capacity: capacity ? parseInt(capacity) : undefined,
          isMembersOnly,
        });
        router.push(`/events/${existingEvent._id}`);
      } else {
        await createEvent({
          title,
          description,
          date: new Date(date).getTime(),
          startTime,
          endTime: endTime || undefined,
          location,
          address: address || undefined,
          capacity: capacity ? parseInt(capacity) : undefined,
          status: status as "Upcoming" | "InProgress" | "Completed" | "Cancelled",
          isMembersOnly,
        });
        router.push("/events");
      }
    } catch (error) {
      console.error("Failed to save event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{isEditing ? "Edit Event" : "Create Event"}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2"><Label htmlFor="title">Title *</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="date">Date *</Label><Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="startTime">Start Time *</Label><Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="endTime">End Time</Label><Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="location">Location *</Label><Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="capacity">Capacity</Label><Input id="capacity" type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
            {isEditing && <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={status} onValueChange={(v) => setStatus(v ?? "Upcoming")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Upcoming">Upcoming</SelectItem><SelectItem value="InProgress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent></Select></div>}
          </div>
          <div className="space-y-2"><Label htmlFor="description">Description *</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required /></div>
          <div className="flex items-center space-x-2"><Checkbox id="isMembersOnly" checked={isMembersOnly} onCheckedChange={(checked) => setIsMembersOnly(checked === true)} /><Label htmlFor="isMembersOnly">Members Only</Label></div>
          <div className="flex gap-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update Event" : "Create Event"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}