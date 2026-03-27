"use client";


import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { EventDetail } from "@/components/event-detail";

export default function EventDetailPage() {
  const params = useParams();
  if (!params.id) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Event not found</p></div>;
  }

  return <EventDetail eventId={params.id as Id<"events">} />;
}