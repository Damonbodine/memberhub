"use client";

import { CommunicationForm } from "@/components/communication-form";

export default function NewCommunicationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Log Communication</h1>
      <CommunicationForm />
    </div>
  );
}