"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { useState } from "react";

interface EventDetailProps {
  eventId: Id<"events">;
}

export function EventDetail({ eventId }: EventDetailProps) {
  const event = useQuery(api.events.getById, { id: eventId });
  const currentUser = useQuery(api.members.getCurrentUser);
  const register = useMutation(api.eventRegistrations.register);
  const [isRegistering, setIsRegistering] = useState(false);

  if (!event) {
    return <div className="h-[300px] rounded-lg bg-muted animate-pulse" />;
  }

  const handleRegister = async () => {
    if (!currentUser) return;
    setIsRegistering(true);
    try {
      await register({ eventId, memberId: currentUser._id });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <StatusBadge status={event.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{event.description}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{event.startTime}{event.endTime ? ` — ${event.endTime}` : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}{event.address ? `, ${event.address}` : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{event.registrationCount ?? 0}{event.capacity ? ` / ${event.capacity}` : ""} registered</span>
          </div>
        </div>

        {event.isMembersOnly && (
          <p className="text-sm font-medium text-primary">Members Only Event</p>
        )}

        {event.status === "Upcoming" && currentUser && (
          <Button onClick={handleRegister} disabled={isRegistering}>
            {isRegistering ? "Registering..." : "Register"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
