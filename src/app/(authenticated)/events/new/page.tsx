"use client";

import { EventForm } from "@/components/event-form";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
      <EventForm />
    </div>
  );
}