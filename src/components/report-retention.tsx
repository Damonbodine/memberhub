"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReportRetention() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const [startDate, setStartDate] = useState(yearStart.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(now.toISOString().split("T")[0]);

  const report = useQuery(
    api.reports.retentionReport,
    startDate && endDate
      ? { startDate: new Date(startDate).getTime(), endDate: new Date(endDate).getTime() }
      : "skip"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retention Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="space-y-2">
            <Label htmlFor="ret-start">Start Date</Label>
            <Input id="ret-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ret-end">End Date</Label>
            <Input id="ret-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {!report ? (
          <div className="h-[200px] rounded-lg bg-muted animate-pulse" />
        ) : (
          <div className="space-y-4">
            {(() => {
              const totalRenewed = report.reduce((s, r) => s + r.renewalCount, 0);
              const totalLapsed = report.reduce((s, r) => s + r.lapseCount, 0);
              const total = totalRenewed + totalLapsed;
              const avgRate = total > 0 ? Math.round((totalRenewed / total) * 100) : 0;
              return (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg Retention Rate</p>
                    <p className="text-2xl font-bold">{avgRate}%</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Renewed</p>
                    <p className="text-2xl font-bold">{totalRenewed}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Lapsed</p>
                    <p className="text-2xl font-bold">{totalLapsed}</p>
                  </div>
                </div>
              );
            })()}
            {report.length > 0 && (
              <div className="space-y-2">
                {report.map((tier, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{tier.tierName}</span>
                    <span className="text-sm text-muted-foreground">
                      {tier.renewalCount} renewed / {tier.lapseCount} lapsed ({tier.retentionRate}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
