"use client";

import { MemberForm } from "@/components/member-form";

export default function NewMemberPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
      <MemberForm />
    </div>
  );
}