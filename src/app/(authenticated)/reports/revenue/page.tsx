"use client";

import { ReportRevenue } from "@/components/report-revenue";

export default function RevenueReportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Revenue Report</h1>
      <ReportRevenue />
    </div>
  );
}