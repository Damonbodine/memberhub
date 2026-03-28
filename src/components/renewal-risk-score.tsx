"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldAlert, RefreshCcw } from "lucide-react";

interface RenewalRiskScoreProps {
  memberId: Id<"members">;
}

export function RenewalRiskScore({ memberId }: RenewalRiskScoreProps) {
  const predictRisk = useAction(api.ai.predictRenewalRisk);
  const [result, setResult] = useState<{ score: number; factors: string[]; recommendation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictRisk({ memberId });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to analyze renewal risk");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: "Low Risk", color: "text-green-500", bg: "bg-green-500/10" };
    if (score >= 40) return { label: "Medium Risk", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { label: "High Risk", color: "text-red-500", bg: "bg-red-500/10" };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Renewal Risk Score
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleAnalyze} disabled={loading}>
          <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          {result ? "Re-analyze" : "Analyze"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!result && !loading && !error && (
          <p className="text-sm text-muted-foreground">Click Analyze to predict this member&apos;s renewal likelihood using AI.</p>
        )}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Analyzing member data...</p>
          </div>
        )}
        {result && !loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={cn("text-4xl font-bold", getRiskLevel(result.score).color)}>
                {result.score}
              </div>
              <div>
                <Badge className={cn(getRiskLevel(result.score).bg, getRiskLevel(result.score).color, "border-0")}>
                  {getRiskLevel(result.score).label}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">out of 100 (higher = more likely to renew)</p>
              </div>
            </div>
            {result.factors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Key Factors</p>
                <ul className="space-y-1">
                  {result.factors.map((factor, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {factor}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.recommendation && (
              <div>
                <p className="text-sm font-medium mb-1">Recommendation</p>
                <p className="text-sm text-muted-foreground">{result.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
