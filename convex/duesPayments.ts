import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function writeAuditLog(ctx: any, userId: any, action: string, entityType: string, entityId: string, details?: string) {
  await ctx.db.insert("auditLogs", { userId, action, entityType, entityId, details, createdAt: Date.now() });
}

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("Pending"), v.literal("Paid"), v.literal("Overdue"), v.literal("Waived"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let payments;
    if (args.status) {
      payments = await ctx.db.query("duesPayments").withIndex("by_status", (q: any) => q.eq("status", args.status)).order("desc").collect();
    } else {
      payments = await ctx.db.query("duesPayments").order("desc").collect();
    }

    const results = [];
    for (const payment of payments) {
      const member = await ctx.db.get(payment.memberId);
      const tier = await ctx.db.get(payment.tierId);
      results.push({
        ...payment,
        memberName: member ? `${member.firstName} ${member.lastName}` : "Unknown",
        tierName: tier?.name ?? "Unknown",
      });
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("duesPayments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const payment = await ctx.db.get(args.id);
    if (!payment) return null;
    const member = await ctx.db.get(payment.memberId);
    const tier = await ctx.db.get(payment.tierId);
    return {
      ...payment,
      memberName: member ? `${member.firstName} ${member.lastName}` : "Unknown",
      tierName: tier?.name ?? "Unknown",
    };
  },
});

export const listByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const payments = await ctx.db
      .query("duesPayments")
      .withIndex("by_memberId", (q: any) => q.eq("memberId", args.memberId))
      .order("desc")
      .collect();

    const results = [];
    for (const payment of payments) {
      const tier = await ctx.db.get(payment.tierId);
      results.push({ ...payment, tierName: tier?.name ?? "Unknown" });
    }
    return results;
  },
});

export const create = mutation({
  args: {
    memberId: v.id("members"),
    tierId: v.id("membershipTiers"),
    amount: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    status: v.union(v.literal("Pending"), v.literal("Paid"), v.literal("Overdue"), v.literal("Waived")),
    paymentDate: v.optional(v.number()),
    paymentMethod: v.optional(v.union(v.literal("Cash"), v.literal("Check"), v.literal("CreditCard"), v.literal("BankTransfer"), v.literal("Online"), v.literal("Other"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // C3: Validate payment period
    if (args.periodEnd <= args.periodStart) {
      throw new Error("Period end must be after period start");
    }
    if (args.amount < 0) {
      throw new Error("Payment amount must be >= 0");
    }
    if (args.status === "Waived" && !args.notes) {
      throw new Error("Waived payments must include a note explaining the reason");
    }

    const receiptNumber = "RCP-" + Date.now().toString(36).toUpperCase();
    const now = Date.now();

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    const processedById = actingUsers.length > 0 ? actingUsers[0]._id : undefined;

    const paymentId = await ctx.db.insert("duesPayments", {
      ...args,
      receiptNumber,
      processedById,
      createdAt: now,
      updatedAt: now,
    });

    if (processedById) {
      await writeAuditLog(ctx, processedById, "Payment", "duesPayments", paymentId, `Payment of $${args.amount} for member`);
    }

    return paymentId;
  },
});

export const update = mutation({
  args: {
    id: v.id("duesPayments"),
    status: v.optional(v.union(v.literal("Pending"), v.literal("Paid"), v.literal("Overdue"), v.literal("Waived"))),
    paymentDate: v.optional(v.number()),
    paymentMethod: v.optional(v.union(v.literal("Cash"), v.literal("Check"), v.literal("CreditCard"), v.literal("BankTransfer"), v.literal("Online"), v.literal("Other"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Payment not found");

    const { id, ...fields } = args;
    const updates: Record<string, any> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }

    await ctx.db.patch(id, updates);

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "Update", "duesPayments", id, `Updated payment fields: ${Object.keys(updates).join(", ")}`);
    }
  },
});
