import { v } from "convex/values";
import { action, query, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

const OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// Internal queries for gathering member data within actions

export const getMemberProfile = internalQuery({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) return null;
    const tier = await ctx.db.get(member.tierId);

    const payments = await ctx.db
      .query("duesPayments")
      .withIndex("by_memberId", (q: any) => q.eq("memberId", args.memberId))
      .collect();

    const renewals = await ctx.db
      .query("renewals")
      .withIndex("by_memberId", (q: any) => q.eq("memberId", args.memberId))
      .collect();

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_memberId", (q: any) => q.eq("memberId", args.memberId))
      .collect();

    const communications = await ctx.db
      .query("communicationLogs")
      .withIndex("by_memberId", (q: any) => q.eq("memberId", args.memberId))
      .collect();

    return {
      member: { ...member, tierName: tier?.name ?? "Unknown", annualDues: tier?.annualDuesAmount ?? 0 },
      payments,
      renewals,
      registrations,
      communications,
    };
  },
});

export const getUpcomingEvents = internalQuery({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q: any) => q.eq("status", "Upcoming"))
      .collect();
    return events;
  },
});

export const getDashboardData = internalQuery({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("members").collect();
    const tiers = await ctx.db.query("membershipTiers").collect();
    const payments = await ctx.db.query("duesPayments").collect();
    const renewals = await ctx.db.query("renewals").collect();

    const tierMap = new Map(tiers.map((t: any) => [t._id, t.name]));
    const activeMembers = members.filter((m: any) => m.status === "Active");

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const membersByTier: Record<string, number> = {};
    for (const m of activeMembers) {
      const name = tierMap.get(m.tierId) ?? "Unknown";
      membersByTier[name] = (membersByTier[name] || 0) + 1;
    }

    const paidPayments = payments.filter((p: any) => p.status === "Paid");
    const monthRevenue = paidPayments
      .filter((p: any) => p.paymentDate && p.paymentDate >= monthStart)
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalRevenue = paidPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

    const completedRenewals = renewals.filter((r: any) => r.status === "Completed").length;
    const lapsedRenewals = renewals.filter((r: any) => r.status === "Lapsed").length;
    const totalRenewals = completedRenewals + lapsedRenewals;
    const retentionRate = totalRenewals > 0 ? Math.round((completedRenewals / totalRenewals) * 100) : 100;

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      membersByTier,
      monthRevenue,
      totalRevenue,
      retentionRate,
      overduePayments: payments.filter((p: any) => p.status === "Overdue").length,
      newThisMonth: members.filter((m: any) => m.joinDate >= monthStart).length,
    };
  },
});

export const getAtRiskMembers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const members = await ctx.db.query("members").collect();
    const now = Date.now();
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

    const atRisk = [];
    for (const member of members) {
      if (member.status !== "Active") continue;
      if (member.renewalDate - now <= sixtyDaysMs && member.renewalDate > now) {
        const tier = await ctx.db.get(member.tierId);
        atRisk.push({
          _id: member._id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          renewalDate: member.renewalDate,
          tierName: tier?.name ?? "Unknown",
        });
      }
    }
    return atRisk;
  },
});

// ─── AI Actions ─────────────────────────────────────────────────────────────

export const predictRenewalRisk = action({
  args: { memberId: v.id("members") },
  handler: async (ctx, args): Promise<{ score: number; factors: string[]; recommendation: string }> => {
    const profile = await ctx.runQuery(internal.ai.getMemberProfile, { memberId: args.memberId });
    if (!profile) throw new Error("Member not found");

    const { member, payments, renewals, registrations, communications } = profile;
    const now = Date.now();
    const daysUntilRenewal = Math.round((member.renewalDate - now) / (1000 * 60 * 60 * 24));
    const membershipDays = Math.round((now - member.joinDate) / (1000 * 60 * 60 * 24));
    const attendedEvents = registrations.filter((r: any) => r.status === "Attended").length;
    const totalRegistrations = registrations.length;
    const paidPayments = payments.filter((p: any) => p.status === "Paid").length;
    const overduePayments = payments.filter((p: any) => p.status === "Overdue").length;
    const completedRenewals = renewals.filter((r: any) => r.status === "Completed").length;
    const lapsedRenewals = renewals.filter((r: any) => r.status === "Lapsed").length;
    const totalComms = communications.length;

    const prompt = `You are a membership retention analyst. Score this member's renewal likelihood from 1-100 (100 = will definitely renew, 1 = will definitely not renew).

Member Profile:
- Name: ${member.firstName} ${member.lastName}
- Tier: ${member.tierName} ($${member.annualDues}/year)
- Status: ${member.status}
- Member for: ${membershipDays} days
- Days until renewal: ${daysUntilRenewal}

Engagement:
- Events registered: ${totalRegistrations}, attended: ${attendedEvents}
- Communications: ${totalComms}
- Payments on time: ${paidPayments}, overdue: ${overduePayments}
- Past renewals completed: ${completedRenewals}, lapsed: ${lapsedRenewals}

Respond in exactly this JSON format (no other text):
{"score": <number 1-100>, "factors": ["<factor1>", "<factor2>", "<factor3>"], "recommendation": "<one sentence recommendation>"}`;

    const result = await callOpenRouter(prompt);
    try {
      const parsed = JSON.parse(result);
      return {
        score: Math.max(1, Math.min(100, Number(parsed.score) || 50)),
        factors: Array.isArray(parsed.factors) ? parsed.factors.slice(0, 5) : [],
        recommendation: String(parsed.recommendation || ""),
      };
    } catch {
      return { score: 50, factors: ["Unable to analyze — AI response parsing failed"], recommendation: "Manual review recommended" };
    }
  },
});

export const generateRenewalOutreach = action({
  args: { memberId: v.id("members") },
  handler: async (ctx, args): Promise<{ subject: string; body: string; tone: string }> => {
    const profile = await ctx.runQuery(internal.ai.getMemberProfile, { memberId: args.memberId });
    if (!profile) throw new Error("Member not found");

    const { member, registrations, communications } = profile;
    const attendedEvents = registrations.filter((r: any) => r.status === "Attended").length;
    const totalComms = communications.length;
    const isEngaged = attendedEvents >= 3 || totalComms >= 5;

    const prompt = `You are writing a personalized membership renewal reminder email.

Member: ${member.firstName} ${member.lastName}
Tier: ${member.tierName} ($${member.annualDues}/year)
Events attended: ${attendedEvents}
Communications: ${totalComms}
Engagement level: ${isEngaged ? "HIGH — actively involved" : "LOW — limited recent engagement"}
Renewal date: ${new Date(member.renewalDate).toLocaleDateString()}

${isEngaged
  ? "This member is highly engaged. Celebrate their involvement and contributions. Mention specific engagement metrics."
  : "This member has been less active. Acknowledge the gap warmly, highlight what they may have missed, and re-pitch the value of membership."}

Respond in exactly this JSON format (no other text):
{"subject": "<email subject line>", "body": "<email body, 2-3 paragraphs>", "tone": "${isEngaged ? "celebratory" : "re-engagement"}"}`;

    const result = await callOpenRouter(prompt);
    try {
      const parsed = JSON.parse(result);
      return {
        subject: String(parsed.subject || "Your Membership Renewal"),
        body: String(parsed.body || ""),
        tone: String(parsed.tone || (isEngaged ? "celebratory" : "re-engagement")),
      };
    } catch {
      return {
        subject: "Your Membership Renewal",
        body: "We wanted to reach out about your upcoming membership renewal. Your continued membership means a lot to our community.",
        tone: "neutral",
      };
    }
  },
});

export const recommendEvents = action({
  args: { memberId: v.id("members") },
  handler: async (ctx, args): Promise<{ recommendations: Array<{ eventId: string; title: string; date: number; reason: string }> }> => {
    const profile = await ctx.runQuery(internal.ai.getMemberProfile, { memberId: args.memberId });
    if (!profile) throw new Error("Member not found");

    const upcomingEvents = await ctx.runQuery(internal.ai.getUpcomingEvents, {});
    if (upcomingEvents.length === 0) return { recommendations: [] };

    const { member, registrations } = profile;
    const pastEventIds = registrations.map((r: any) => r.eventId);

    // Get past event details for context
    const pastEvents: string[] = [];
    for (const reg of registrations.slice(-10)) {
      pastEvents.push(`${reg.status === "Attended" ? "Attended" : reg.status}`);
    }

    const eventList = upcomingEvents
      .filter((e: any) => !pastEventIds.includes(e._id))
      .slice(0, 10)
      .map((e: any) => `- ID:${e._id} | "${e.title}" on ${new Date(e.date).toLocaleDateString()} at ${e.location} | ${e.description.slice(0, 100)}`);

    if (eventList.length === 0) return { recommendations: [] };

    const prompt = `You are an event recommendation engine for a membership organization.

Member: ${member.firstName} ${member.lastName}, ${member.tierName} tier
Past event activity: ${registrations.length} registrations, ${registrations.filter((r: any) => r.status === "Attended").length} attended
Member city: ${member.city || "Unknown"}, state: ${member.state || "Unknown"}

Upcoming events:
${eventList.join("\n")}

Recommend up to 3 events that would be most relevant for this member. Consider their engagement history and demographics.

Respond in exactly this JSON format (no other text):
{"recommendations": [{"eventId": "<ID from list>", "reason": "<1-2 sentence explanation>"}]}`;

    const result = await callOpenRouter(prompt);
    try {
      const parsed = JSON.parse(result);
      const recs = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
      return {
        recommendations: recs.slice(0, 3).map((rec: any) => {
          const event = upcomingEvents.find((e: any) => e._id === rec.eventId);
          return {
            eventId: String(rec.eventId),
            title: event?.title ?? "Unknown Event",
            date: event?.date ?? 0,
            reason: String(rec.reason || ""),
          };
        }).filter((r: any) => r.date > 0),
      };
    } catch {
      return { recommendations: [] };
    }
  },
});

export const narrateTrends = action({
  args: {},
  handler: async (ctx): Promise<{ narrative: string; highlights: string[]; concerns: string[]; recommendations: string[] }> => {
    const data = await ctx.runQuery(internal.ai.getDashboardData, {});

    const tierBreakdown = Object.entries(data.membersByTier)
      .map(([name, count]) => `${name}: ${count}`)
      .join(", ");

    const prompt = `You are a membership data analyst. Generate a narrative insights report from this data.

Membership Overview:
- Total members: ${data.totalMembers}
- Active members: ${data.activeMembers}
- New this month: ${data.newThisMonth}
- Members by tier: ${tierBreakdown}

Financial:
- Revenue this month: $${data.monthRevenue.toLocaleString()}
- Total revenue: $${data.totalRevenue.toLocaleString()}
- Overdue payments: ${data.overduePayments}

Retention:
- Retention rate: ${data.retentionRate}%

Provide a concise report with trends, concerns, and actionable recommendations.

Respond in exactly this JSON format (no other text):
{"narrative": "<2-3 paragraph summary>", "highlights": ["<positive trend 1>", "<positive trend 2>"], "concerns": ["<concern 1>", "<concern 2>"], "recommendations": ["<action 1>", "<action 2>", "<action 3>"]}`;

    const result = await callOpenRouter(prompt);
    try {
      const parsed = JSON.parse(result);
      return {
        narrative: String(parsed.narrative || ""),
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      };
    } catch {
      return {
        narrative: "Unable to generate narrative report. Please try again.",
        highlights: [],
        concerns: [],
        recommendations: [],
      };
    }
  },
});
