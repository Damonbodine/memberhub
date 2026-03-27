"use client";


import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { MemberDetailHeader } from "@/components/member-detail-header";
import { MemberDetailTabs } from "@/components/member-detail-tabs";

export default function MemberDetailPage() {
  const params = useParams();
  if (!params.id) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Member not found</p></div>;
  }

  return (
    <div className="space-y-6">
      <MemberDetailHeader memberId={params.id as Id<"members">} />
      <MemberDetailTabs memberId={params.id as Id<"members">} />
    </div>
  );
}