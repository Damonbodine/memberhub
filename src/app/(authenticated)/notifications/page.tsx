"use client";


import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { NotificationsList } from "@/components/notifications-list";

export default function NotificationsPage() {
  const notifications = useQuery(api.notifications.listByUser);

  if (notifications === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      <NotificationsList />
    </div>
  );
}