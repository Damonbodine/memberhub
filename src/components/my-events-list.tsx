"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Calendar } from "lucide-react";

export function MyEventsList() {
  const currentUser = useQuery(api.members.getCurrentUser);
  const registrations = useQuery(
    api.eventRegistrations.listByMember,
    currentUser ? { memberId: currentUser._id } : "skip"
  );

  if (!currentUser || !registrations) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[80px] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        You have not registered for any events yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {registrations.map((reg) => (
        <Card key={reg._id}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{reg.eventTitle ?? "Event"}</p>
                  <p className="text-sm text-muted-foreground">
                    Registered: {new Date(reg.registeredDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <StatusBadge status={reg.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
