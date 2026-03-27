"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { EventsGrid } from "@/components/events-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function EventsListPage() {
  const events = useQuery(api.events.list, {});

  if (events === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <Link href="/events/new">
          <Button><Plus className="mr-2 h-4 w-4" />Create Event</Button>
        </Link>
      </div>
      <EventsGrid />
    </div>
  );
}