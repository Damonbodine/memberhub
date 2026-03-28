"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { RenewalRiskScore } from "@/components/renewal-risk-score";
import { RenewalOutreach } from "@/components/renewal-outreach";
import { EventRecommendations } from "@/components/event-recommendations";

interface MemberDetailTabsProps {
  memberId: Id<"members">;
}

export function MemberDetailTabs({ memberId }: MemberDetailTabsProps) {
  const payments = useQuery(api.duesPayments.listByMember, { memberId });
  const communications = useQuery(api.communicationLogs.listByMember, { memberId });
  const registrations = useQuery(api.eventRegistrations.listByMember, { memberId });
  const renewals = useQuery(api.renewals.listByMember, { memberId });

  return (
    <Tabs defaultValue="overview" className="mt-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        <TabsTrigger value="dues">Dues</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardHeader><CardTitle>Renewal History</CardTitle></CardHeader>
          <CardContent>
            {!renewals ? (
              <div className="h-[100px] animate-pulse bg-muted rounded" />
            ) : renewals.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No renewal history</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renewals.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>{new Date(r.renewalDate).toLocaleDateString()}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ai-insights">
        <div className="space-y-6">
          <RenewalRiskScore memberId={memberId} />
          <RenewalOutreach memberId={memberId} />
          <EventRecommendations memberId={memberId} />
        </div>
      </TabsContent>

      <TabsContent value="dues">
        <Card>
          <CardHeader><CardTitle>Dues Payments</CardTitle></CardHeader>
          <CardContent>
            {!payments ? (
              <div className="h-[100px] animate-pulse bg-muted rounded" />
            ) : payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No payments recorded</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>${p.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(p.periodStart).toLocaleDateString()} — {new Date(p.periodEnd).toLocaleDateString()}
                      </TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="communications">
        <Card>
          <CardHeader><CardTitle>Communication History</CardTitle></CardHeader>
          <CardContent>
            {!communications ? (
              <div className="h-[100px] animate-pulse bg-muted rounded" />
            ) : communications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No communications recorded</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communications.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell>{c.type}</TableCell>
                      <TableCell className="font-medium">{c.subject}</TableCell>
                      <TableCell>{c.direction}</TableCell>
                      <TableCell>{new Date(c.communicationDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="events">
        <Card>
          <CardHeader><CardTitle>Event Registrations</CardTitle></CardHeader>
          <CardContent>
            {!registrations ? (
              <div className="h-[100px] animate-pulse bg-muted rounded" />
            ) : registrations.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No event registrations</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className="font-medium">{r.eventTitle ?? "—"}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell>{new Date(r.registeredDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
