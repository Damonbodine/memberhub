import { v } from "convex/values";
import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { activeMembers: 0, newThisMonth: 0, revenueThisMonth: 0, overdueCount: 0 };

    const allMembers = await ctx.db.query("members").collect();
    const activeMembers = allMembers.filter((m: any) => m.status === "Active").length;

    // New members this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const newThisMonth = allMembers.filter((m: any) => m.joinDate >= monthStart).length;

    // Revenue this month
    const allPayments = await ctx.db.query("duesPayments").collect();
    const monthPayments = allPayments.filter(
      (p: any) => p.status === "Paid" && p.paymentDate && p.paymentDate >= monthStart
    );
    const revenueThisMonth = monthPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

    // Overdue payments
    const overdueCount = allPayments.filter((p: any) => p.status === "Overdue").length;

    return { activeMembers, newThisMonth, revenueThisMonth, overdueCount };
  },
});

export const getBoardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { membersByTier: [], renewalRate: 0, lapseRate: 0 };

    const allMembers = await ctx.db.query("members").collect();
    const allTiers = await ctx.db.query("membershipTiers").collect();
    const allRenewals = await ctx.db.query("renewals").collect();

    // Members by tier
    const membersByTier = allTiers.map((tier: any) => ({
      tierName: tier.name,
      count: allMembers.filter((m: any) => m.tierId === tier._id && m.status === "Active").length,
    }));

    // Renewal and lapse rates
    const totalRenewals = allRenewals.length;
    const completed = allRenewals.filter((r: any) => r.status === "Completed").length;
    const lapsed = allRenewals.filter((r: any) => r.status === "Lapsed").length;

    const renewalRate = totalRenewals > 0 ? Math.round((completed / totalRenewals) * 100) : 0;
    const lapseRate = totalRenewals > 0 ? Math.round((lapsed / totalRenewals) * 100) : 0;

    return { membersByTier, renewalRate, lapseRate };
  },
});
