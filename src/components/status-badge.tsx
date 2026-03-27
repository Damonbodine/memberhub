"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColorMap: Record<string, string> = {
  Active: "bg-green-500/15 text-green-700 border-green-500/20",
  Paid: "bg-green-500/15 text-green-700 border-green-500/20",
  Completed: "bg-green-500/15 text-green-700 border-green-500/20",
  Registered: "bg-green-500/15 text-green-700 border-green-500/20",
  Attended: "bg-green-500/15 text-green-700 border-green-500/20",
  Pending: "bg-amber-500/15 text-amber-700 border-amber-500/20",
  Waitlisted: "bg-amber-500/15 text-amber-700 border-amber-500/20",
  InProgress: "bg-amber-500/15 text-amber-700 border-amber-500/20",
  Upcoming: "bg-amber-500/15 text-amber-700 border-amber-500/20",
  Overdue: "bg-red-500/15 text-red-700 border-red-500/20",
  Expired: "bg-red-500/15 text-red-700 border-red-500/20",
  Suspended: "bg-red-500/15 text-red-700 border-red-500/20",
  Cancelled: "bg-red-500/15 text-red-700 border-red-500/20",
  NoShow: "bg-red-500/15 text-red-700 border-red-500/20",
  Inactive: "bg-gray-500/15 text-gray-700 border-gray-500/20",
  Waived: "bg-gray-500/15 text-gray-700 border-gray-500/20",
  Lapsed: "bg-gray-500/15 text-gray-700 border-gray-500/20",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColorMap[status] ?? "bg-gray-500/15 text-gray-700 border-gray-500/20";
  return (
    <Badge variant="outline" className={cn(colorClass, className)}>
      {status}
    </Badge>
  );
}
