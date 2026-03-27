"use client";


import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { EventForm } from "@/components/event-form";

export default function EditEventPage() {
  const params = useParams();
  const event = useQuery(api.events.getById, params.id ? { id: params.id as Id<"events"> } : "skip");

  if (event === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (event === null) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Event not found</p></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
      <EventForm existingEvent={event} />
    </div>
  );
}