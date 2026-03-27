"use client";


import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { MyEventsList } from "@/components/my-events-list";

export default function MyEventsPage() {
  const user = useQuery(api.members.getCurrentUser);
  const registrations = useQuery(api.eventRegistrations.listByMember, user && user._id ? { memberId: user._id } : "skip");

  if (user === undefined || registrations === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
      <MyEventsList />
    </div>
  );
}