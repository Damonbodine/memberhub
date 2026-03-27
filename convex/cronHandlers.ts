import { internalMutation } from "./_generated/server";

export const checkOverduePayments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const pendingPayments = await ctx.db
      .query("duesPayments")
      .withIndex("by_status", (q: any) => q.eq("status", "Pending"))
      .collect();

    for (const payment of pendingPayments) {
      if (payment.periodEnd < now) {
        await ctx.db.patch(payment._id, {
          status: "Overdue",
          updatedAt: now,
        });
      }
    }
  },
});

export const checkLapsedRenewals = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const settings = await ctx.db.query("orgSettings").first();
    const gracePeriodMs = (settings?.gracePeriodDays ?? 30) * 24 * 60 * 60 * 1000;

    const pendingRenewals = await ctx.db
      .query("renewals")
      .withIndex("by_status", (q: any) => q.eq("status", "Pending"))
      .collect();

    for (const renewal of pendingRenewals) {
      if (renewal.renewalDate + gracePeriodMs < now) {
        await ctx.db.patch(renewal._id, { status: "Lapsed" });
        const member = await ctx.db.get(renewal.memberId);
        if (member) {
          await ctx.db.patch(member._id, { status: "Expired" });
        }
      }
    }
  },
});

export const sendRenewalReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const settings = await ctx.db.query("orgSettings").first();
    if (!settings) return;

    const firstReminderMs = settings.firstReminderDays * 24 * 60 * 60 * 1000;
    const pendingRenewals = await ctx.db
      .query("renewals")
      .withIndex("by_status", (q: any) => q.eq("status", "Pending"))
      .collect();

    for (const renewal of pendingRenewals) {
      const daysUntilRenewal = renewal.renewalDate - now;
      if (daysUntilRenewal <= firstReminderMs && renewal.reminderCount === 0) {
        await ctx.db.insert("notifications", {
          userId: renewal.memberId,
          type: "RenewalReminder",
          title: "Membership Renewal Coming Up",
          message: "Your membership renewal is approaching. Please renew to maintain your benefits.",
          link: "/renewals",
          isRead: false,
          priority: "Normal",
          createdAt: now,
        });
        await ctx.db.patch(renewal._id, {
          reminderSentAt: now,
          reminderCount: renewal.reminderCount + 1,
        });
      }
    }
  },
});
