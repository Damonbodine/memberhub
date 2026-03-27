"use client";


import { ReportMembership } from "@/components/report-membership";

export default function MembershipReportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Membership Report</h1>
      <ReportMembership />
    </div>
  );
}