"use client";


import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RenewalProcessForm } from "@/components/renewal-process-form";

export default function RenewalDetailPage() {
  const params = useParams();
  const renewal = useQuery(api.renewals.getById, params.id ? { id: params.id as Id<"renewals"> } : "skip");

  if (renewal === undefined) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (renewal === null) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Renewal not found</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/renewals"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-3xl font-bold tracking-tight">Renewal Details</h1>
        <StatusBadge status={renewal.status} />
      </div>
      <Card>
        <CardHeader><CardTitle>Renewal Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><p className="text-sm text-muted-foreground">Renewal Date</p><p className="text-lg font-medium">{new Date(renewal.renewalDate).toLocaleDateString()}</p></div>
          <div><p className="text-sm text-muted-foreground">Status</p><p className="text-lg font-medium">{renewal.status}</p></div>
          {renewal.notes && <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Notes</p><p className="text-lg font-medium">{renewal.notes}</p></div>}
        </CardContent>
      </Card>
      {renewal.status === "Pending" && (
        <Card>
          <CardHeader><CardTitle>Process Renewal</CardTitle></CardHeader>
          <CardContent>
            <RenewalProcessForm renewalId={renewal._id} currentTierId={renewal.oldTierId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}