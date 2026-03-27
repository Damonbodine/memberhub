import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function writeAuditLog(ctx: any, userId: any, action: string, entityType: string, entityId: string, details?: string) {
  await ctx.db.insert("auditLogs", { userId, action, entityType, entityId, details, createdAt: Date.now() });
}

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("Pending"), v.literal("Completed"), v.literal("Lapsed"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let renewals;
    if (args.status) {
      renewals = await ctx.db.query("renewals").withIndex("by_status", (q: any) => q.eq("status", args.status)).order("desc").collect();
    } else {
      renewals = await ctx.db.query("renewals").order("desc").collect();
    }

    const results = [];
    for (const renewal of renewals) {
      const member = await ctx.db.get(renewal.memberId);
      const oldTier = await ctx.db.get(renewal.oldTierId);
      const newTier = await ctx.db.get(renewal.newTierId);
      results.push({
        ...renewal,
        memberName: member ? `${member.firstName} ${member.lastName}` : "Unknown",
        oldTierName: oldTier?.name ?? "Unknown",
        newTierName: newTier?.name ?? "Unknown",
      });
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("renewals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const renewal = await ctx.db.get(args.id);
    if (!renewal) return null;
    const member = await ctx.db.get(renewal.memberId);
    const oldTier = await ctx.db.get(renewal.oldTierId);
    const newTier = await ctx.db.get(renewal.newTierId);
    return {
      ...renewal,
      memberName: member ? `${member.firstName} ${member.lastName}` : "Unknown",
      oldTierName: oldTier?.name ?? "Unknown",
      newTierName: newTier?.name ?? "Unknown",
    };
  },
});

export const listByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const renewals = await ctx.db
      .query("renewals")
      .withIndex("by_memberId", (q: any) => q.eq("memberId", args.memberId))
      .order("desc")
      .collect();

    const results = [];
    for (const renewal of renewals) {
      const oldTier = await ctx.db.get(renewal.oldTierId);
      const newTier = await ctx.db.get(renewal.newTierId);
      results.push({
        ...renewal,
        oldTierName: oldTier?.name ?? "Unknown",
        newTierName: newTier?.name ?? "Unknown",
      });
    }
    return results;
  },
});

export const create = mutation({
  args: {
    memberId: v.id("members"),
    oldTierId: v.id("membershipTiers"),
    newTierId: v.id("membershipTiers"),
    renewalDate: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // C4: Validate new tier is active
    const newTier = await ctx.db.get(args.newTierId);
    if (!newTier) throw new Error("New membership tier not found");
    if (!newTier.isActive) throw new Error("New membership tier is not active");

    const renewalId = await ctx.db.insert("renewals", {
      ...args,
      status: "Pending",
      reminderCount: 0,
      createdAt: Date.now(),
    });

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "Renewal", "renewals", renewalId, "Created renewal");
    }

    return renewalId;
  },
});

export const complete = mutation({
  args: {
    id: v.id("renewals"),
    paymentAmount: v.number(),
    paymentMethod: v.optional(v.union(v.literal("Cash"), v.literal("Check"), v.literal("CreditCard"), v.literal("BankTransfer"), v.literal("Online"), v.literal("Other"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const renewal = await ctx.db.get(args.id);
    if (!renewal) throw new Error("Renewal not found");
    if (renewal.status !== "Pending") throw new Error("Only pending renewals can be completed");

    // C4: Validate new tier is still active
    const newTier = await ctx.db.get(renewal.newTierId);
    if (!newTier || !newTier.isActive) throw new Error("New membership tier is no longer active");

    const now = Date.now();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;

    // Complete the renewal
    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    const processedById = actingUsers.length > 0 ? actingUsers[0]._id : undefined;

    await ctx.db.patch(args.id, {
      status: "Completed",
      completedDate: now,
      processedById,
    });

    // Update member tier and renewal date
    const member = await ctx.db.get(renewal.memberId);
    if (member) {
      // Handle tier change: decrement old, increment new
      if (renewal.oldTierId !== renewal.newTierId) {
        const oldTier = await ctx.db.get(renewal.oldTierId);
        if (oldTier) await ctx.db.patch(renewal.oldTierId, { currentMemberCount: Math.max(0, oldTier.currentMemberCount - 1) });
        await ctx.db.patch(renewal.newTierId, { currentMemberCount: newTier.currentMemberCount + 1 });
      }

      await ctx.db.patch(renewal.memberId, {
        tierId: renewal.newTierId,
        renewalDate: renewal.renewalDate + oneYearMs,
        status: "Active",
      });
    }

    // Create dues payment record
    await ctx.db.insert("duesPayments", {
      memberId: renewal.memberId,
      tierId: renewal.newTierId,
      amount: args.paymentAmount,
      periodStart: renewal.renewalDate,
      periodEnd: renewal.renewalDate + oneYearMs,
      status: "Paid",
      paymentDate: now,
      paymentMethod: args.paymentMethod,
      receiptNumber: "RCP-" + Date.now().toString(36).toUpperCase(),
      processedById,
      createdAt: now,
      updatedAt: now,
    });

    if (processedById) {
      await writeAuditLog(ctx, processedById, "Renewal", "renewals", args.id, "Completed renewal");
    }
  },
});

export const sendReminder = mutation({
  args: { id: v.id("renewals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const renewal = await ctx.db.get(args.id);
    if (!renewal) throw new Error("Renewal not found");

    await ctx.db.patch(args.id, {
      reminderSentAt: Date.now(),
      reminderCount: renewal.reminderCount + 1,
    });

    // Create notification for the member
    await ctx.db.insert("notifications", {
      userId: renewal.memberId,
      type: "RenewalReminder",
      title: "Membership Renewal Reminder",
      message: "Your membership renewal is coming up. Please renew to maintain your membership benefits.",
      link: "/renewals",
      isRead: false,
      priority: "Normal",
      createdAt: Date.now(),
    });

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "Renewal", "renewals", args.id, `Sent renewal reminder #${renewal.reminderCount + 1}`);
    }
  },
});
