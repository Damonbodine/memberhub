"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, DollarSign, RefreshCw } from "lucide-react";

export default function ReportsHubPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/reports/membership">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-8 w-8 text-primary" />
              <CardTitle>Membership Report</CardTitle>
              <CardDescription>Member demographics, growth trends, and status breakdown</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/reports/revenue">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <DollarSign className="h-8 w-8 text-primary" />
              <CardTitle>Revenue Report</CardTitle>
              <CardDescription>Dues collection, payment methods, and revenue trends</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/reports/retention">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <RefreshCw className="h-8 w-8 text-primary" />
              <CardTitle>Retention Report</CardTitle>
              <CardDescription>Renewal rates, lapsed members, and retention metrics</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}