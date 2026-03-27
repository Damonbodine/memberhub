"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, DollarSign, RefreshCcw } from "lucide-react";

export function QuickActions() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button onClick={() => router.push("/members/new")} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/dues/new")}
          className="gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Record Payment
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/renewals")}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Process Renewal
        </Button>
      </CardContent>
    </Card>
  );
}
