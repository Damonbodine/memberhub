"use client";


import { ReportRetention } from "@/components/report-retention";

export default function RetentionReportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Retention Report</h1>
      <ReportRetention />
    </div>
  );
}