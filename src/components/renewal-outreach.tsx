"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Mail, RefreshCcw } from "lucide-react";

interface RenewalOutreachProps {
  memberId: Id<"members">;
}

export function RenewalOutreach({ memberId }: RenewalOutreachProps) {
  const generateOutreach = useAction(api.ai.generateRenewalOutreach);
  const [result, setResult] = useState<{ subject: string; body: string; tone: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateOutreach({ memberId });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate outreach");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Renewal Outreach Draft
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleGenerate} disabled={loading}>
          <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          {result ? "Regenerate" : "Generate"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!result && !loading && !error && (
          <p className="text-sm text-muted-foreground">Click Generate to draft a personalized renewal reminder using AI.</p>
        )}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Drafting personalized outreach...</p>
          </div>
        )}
        {result && !loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{result.tone}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Subject</p>
              <p className="text-sm bg-muted p-2 rounded">{result.subject}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Body</p>
              <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{result.body}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
