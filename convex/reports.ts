import { v } from "convex/values";
import { query } from "./_generated/server";

export const membershipReport = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const members = await ctx.db.query("members").collect();
    const tiers = await ctx.db.query("membershipTiers").collect();

    const tierMap = new Map(tiers.map((t: any) => [t._id, t.name]));

    // Group by month
    const monthlyData: Record<string, Record<string, number>> = {};
    for (const member of members) {
      if (member.joinDate < args.startDate || member.joinDate > args.endDate) continue;

      const date = new Date(member.joinDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const tierName = tierMap.get(member.tierId) ?? "Unknown";

      if (!monthlyData[monthKey]) monthlyData[monthKey] = {};
      monthlyData[monthKey][tierName] = (monthlyData[monthKey][tierName] || 0) + 1;
    }

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, tiers]) => ({ month, tiers }));
  },
});

export const revenueReport = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const payments = await ctx.db.query("duesPayments").collect();
    const tiers = await ctx.db.query("membershipTiers").collect();

    const tierMap = new Map(tiers.map((t: any) => [t._id, t.name]));

    const monthlyData: Record<string, Record<string, number>> = {};
    for (const payment of payments) {
      if (payment.status !== "Paid") continue;
      const payDate = payment.paymentDate ?? payment.createdAt;
      if (payDate < args.startDate || payDate > args.endDate) continue;

      const date = new Date(payDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const tierName = tierMap.get(payment.tierId) ?? "Unknown";

      if (!monthlyData[monthKey]) monthlyData[monthKey] = {};
      monthlyData[monthKey][tierName] = (monthlyData[monthKey][tierName] || 0) + payment.amount;
    }

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, tiers]) => ({ month, tiers }));
  },
});

export const retentionReport = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const renewals = await ctx.db.query("renewals").collect();
    const tiers = await ctx.db.query("membershipTiers").collect();

    const tierMap = new Map(tiers.map((t: any) => [t._id, t.name]));

    const tierStats: Record<string, { renewalCount: number; lapseCount: number }> = {};
    for (const renewal of renewals) {
      if (renewal.renewalDate < args.startDate || renewal.renewalDate > args.endDate) continue;

      const tierName = tierMap.get(renewal.newTierId) ?? "Unknown";
      if (!tierStats[tierName]) tierStats[tierName] = { renewalCount: 0, lapseCount: 0 };

      if (renewal.status === "Completed") tierStats[tierName].renewalCount++;
      if (renewal.status === "Lapsed") tierStats[tierName].lapseCount++;
    }

    return Object.entries(tierStats).map(([tierName, stats]) => {
      const total = stats.renewalCount + stats.lapseCount;
      return {
        tierName,
        renewalCount: stats.renewalCount,
        lapseCount: stats.lapseCount,
        retentionRate: total > 0 ? Math.round((stats.renewalCount / total) * 100) : 0,
      };
    });
  },
});
