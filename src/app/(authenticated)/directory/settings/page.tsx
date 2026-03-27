"use client";


import { DirectorySettingsForm } from "@/components/directory-settings-form";

export default function DirectorySettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Directory Settings</h1>
      <DirectorySettingsForm />
    </div>
  );
}