"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, RefreshCcw, Sparkles } from "lucide-react";
import Link from "next/link";

interface EventRecommendationsProps {
  memberId: Id<"members">;
}

export function EventRecommendations({ memberId }: EventRecommendationsProps) {
  const recommendEvents = useAction(api.ai.recommendEvents);
  const [result, setResult] = useState<{ recommendations: Array<{ eventId: string; title: string; date: number; reason: string }> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecommend = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recommendEvents({ memberId });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Event Recommendations
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleRecommend} disabled={loading}>
          <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          {result ? "Refresh" : "Get Recommendations"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!result && !loading && !error && (
          <p className="text-sm text-muted-foreground">Click Get Recommendations to find events this member might enjoy.</p>
        )}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Analyzing member interests...</p>
          </div>
        )}
        {result && !loading && (
          <div className="space-y-3">
            {result.recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming events to recommend at this time.</p>
            ) : (
              result.recommendations.map((rec, i) => (
                <Link
                  key={i}
                  href={`/events/${rec.eventId}`}
                  className="block p-3 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(rec.date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
