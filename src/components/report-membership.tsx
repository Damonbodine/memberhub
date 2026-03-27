"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ReportMembership() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const [startDate, setStartDate] = useState(yearStart.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(now.toISOString().split("T")[0]);

  const report = useQuery(
    api.reports.membershipReport,
    startDate && endDate
      ? { startDate: new Date(startDate).getTime(), endDate: new Date(endDate).getTime() }
      : "skip"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Start Date</Label>
            <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">End Date</Label>
            <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {!report ? (
          <div className="h-[200px] rounded-lg bg-muted animate-pulse" />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Members (in period)</p>
                <p className="text-2xl font-bold">{report.reduce((sum, m) => sum + Object.values(m.tiers).reduce((a, b) => a + b, 0), 0)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Months Covered</p>
                <p className="text-2xl font-bold">{report.length}</p>
              </div>
            </div>

            {report.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    {Object.keys(report[0]?.tiers ?? {}).map((tier) => (
                      <TableHead key={tier}>{tier}</TableHead>
                    ))}
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.month}</TableCell>
                      {Object.values(row.tiers).map((count, j) => (
                        <TableCell key={j}>{count}</TableCell>
                      ))}
                      <TableCell>{Object.values(row.tiers).reduce((a, b) => a + b, 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
