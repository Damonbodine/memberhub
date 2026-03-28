"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function RenewalRiskWidget() {
  const atRiskMembers = useQuery(api.ai.getAtRiskMembers);
  const now = useMemo(() => Date.now(), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-yellow-500" />
          At-Risk Renewals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!atRiskMembers ? (
          <div className="h-[100px] animate-pulse bg-muted rounded" />
        ) : atRiskMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No members with upcoming renewals in the next 60 days.</p>
        ) : (
          <div className="space-y-3">
            {atRiskMembers.slice(0, 5).map((member) => {
              const daysUntil = Math.round((member.renewalDate - now) / (1000 * 60 * 60 * 24));
              return (
                <Link
                  key={member._id}
                  href={`/members/${member._id}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-muted-foreground">{member.tierName}</p>
                  </div>
                  <Badge variant={daysUntil <= 14 ? "destructive" : "secondary"}>
                    {daysUntil} days
                  </Badge>
                </Link>
              );
            })}
            {atRiskMembers.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{atRiskMembers.length - 5} more members
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
