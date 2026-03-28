"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Brain, RefreshCcw, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export function TrendNarrator() {
  const narrateTrends = useAction(api.ai.narrateTrends);
  const [result, setResult] = useState<{ narrative: string; highlights: string[]; concerns: string[]; recommendations: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNarrate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await narrateTrends({});
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Membership Insights
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleNarrate} disabled={loading}>
          <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          {result ? "Refresh" : "Generate Report"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!result && !loading && !error && (
          <p className="text-sm text-muted-foreground">Click Generate Report to get AI-powered insights about membership trends, concerns, and recommendations.</p>
        )}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Analyzing membership data...</p>
          </div>
        )}
        {result && !loading && (
          <div className="space-y-6">
            <div className="text-sm whitespace-pre-wrap">{result.narrative}</div>

            {result.highlights.length > 0 && (
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Highlights
                </p>
                <ul className="space-y-1">
                  {result.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {h}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.concerns.length > 0 && (
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Concerns
                </p>
                <ul className="space-y-1">
                  {result.concerns.map((c, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  Recommendations
                </p>
                <ul className="space-y-1">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
