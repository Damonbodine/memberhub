"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberDetailHeaderProps {
  memberId: Id<"members">;
}

export function MemberDetailHeader({ memberId }: MemberDetailHeaderProps) {
  const member = useQuery(api.members.getById, { id: memberId });

  if (!member) {
    return <div className="h-[160px] rounded-lg bg-muted animate-pulse" />;
  }

  const initials = `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.avatarUrl ?? undefined} alt={`${member.firstName} ${member.lastName}`} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{member.firstName} {member.lastName}</h2>
              <StatusBadge status={member.status} />
            </div>
            <p className="text-muted-foreground">{member.email}</p>
            <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
              {member.phone && <span>{member.phone}</span>}
              <span>Tier: {member.tierName ?? "—"}</span>
              <span>Role: {member.role}</span>
              <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
