"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function DirectoryGrid() {
  const entries = useQuery(api.memberDirectory.list);

  if (!entries) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[140px] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No directory entries found</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <Card key={entry._id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {entry.displayName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{entry.displayName}</h3>
                {entry.showEmail && entry.email && (
                  <p className="text-sm text-muted-foreground truncate">{entry.email}</p>
                )}
                {entry.showPhone && entry.phone && (
                  <p className="text-sm text-muted-foreground">{entry.phone}</p>
                )}
                {entry.showTier && entry.tierName && (
                  <Badge variant="secondary" className="mt-1">{entry.tierName}</Badge>
                )}
                {entry.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{entry.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
