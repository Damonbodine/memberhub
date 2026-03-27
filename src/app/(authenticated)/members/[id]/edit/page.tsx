"use client";


import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { MemberForm } from "@/components/member-form";

export default function EditMemberPage() {
  const params = useParams();
  const member = useQuery(api.members.getById, params.id ? { id: params.id as Id<"members"> } : "skip");

  if (member === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (member === null) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Member not found</p></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Member</h1>
      <MemberForm existingMember={member} />
    </div>
  );
}