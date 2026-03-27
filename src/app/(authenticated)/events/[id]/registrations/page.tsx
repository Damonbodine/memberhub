"use client";


import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { EventRegistrationsTable } from "@/components/event-registrations-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EventRegistrationsPage() {
  const params = useParams();
  const registrations = useQuery(api.eventRegistrations.listByEvent, params.id ? { eventId: params.id as Id<"events"> } : "skip");
  const event = useQuery(api.events.getById, params.id ? { id: params.id as Id<"events"> } : "skip");

  if (registrations === undefined || event === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${params.id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-3xl font-bold tracking-tight">Registrations: {event?.title}</h1>
      </div>
      <EventRegistrationsTable eventId={params.id as Id<"events">} />
    </div>
  );
}