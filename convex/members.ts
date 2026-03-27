import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function writeAuditLog(ctx: any, userId: any, action: string, entityType: string, entityId: string, details?: string) {
  await ctx.db.insert("auditLogs", { userId, action, entityType, entityId, details, createdAt: Date.now() });
}

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("Active"), v.literal("Inactive"), v.literal("Suspended"), v.literal("Expired"))),
    tierId: v.optional(v.id("membershipTiers")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let membersQuery = ctx.db.query("members");

    if (args.status) {
      const members = await membersQuery.withIndex("by_status", (q: any) => q.eq("status", args.status)).order("desc").collect();
      const results = [];
      for (const member of members) {
        if (args.tierId && member.tierId !== args.tierId) continue;
        const tier = await ctx.db.get(member.tierId);
        results.push({ ...member, tierName: tier?.name ?? "Unknown" });
      }
      return results;
    }

    const members = await membersQuery.order("desc").collect();
    const results = [];
    for (const member of members) {
      if (args.tierId && member.tierId !== args.tierId) continue;
      const tier = await ctx.db.get(member.tierId);
      results.push({ ...member, tierName: tier?.name ?? "Unknown" });
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const member = await ctx.db.get(args.id);
    if (!member) return null;
    const tier = await ctx.db.get(member.tierId);
    return { ...member, tierName: tier?.name ?? "Unknown" };
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const members = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    if (members.length === 0) return null;
    const member = members[0];
    const tier = await ctx.db.get(member.tierId);
    return { ...member, tierName: tier?.name ?? "Unknown" };
  },
});

export const create = mutation({
  args: {
    clerkId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    tierId: v.id("membershipTiers"),
    role: v.union(v.literal("Admin"), v.literal("StaffMember"), v.literal("BoardMember"), v.literal("Member")),
    status: v.union(v.literal("Active"), v.literal("Inactive"), v.literal("Suspended"), v.literal("Expired")),
    joinDate: v.number(),
    renewalDate: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // C2: Check email uniqueness among Active/Inactive/Suspended members
    const existingByEmail = await ctx.db
      .query("members")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .collect();
    const duplicate = existingByEmail.find(
      (m: any) => m.status === "Active" || m.status === "Inactive" || m.status === "Suspended"
    );
    if (duplicate) throw new Error("A member with this email already exists");

    // C1: Check tier capacity
    const tier = await ctx.db.get(args.tierId);
    if (!tier) throw new Error("Membership tier not found");
    if (tier.maxMembers !== undefined && tier.currentMemberCount >= tier.maxMembers) {
      throw new Error("This membership tier is at capacity");
    }

    const memberId = await ctx.db.insert("members", {
      ...args,
      createdAt: Date.now(),
    });

    // Update tier member count
    await ctx.db.patch(args.tierId, { currentMemberCount: tier.currentMemberCount + 1 });

    // Get acting user for audit log
    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    const actingUserId = actingUsers.length > 0 ? actingUsers[0]._id : memberId;

    await writeAuditLog(ctx, actingUserId, "Create", "members", memberId, `Created member ${args.firstName} ${args.lastName}`);

    return memberId;
  },
});

export const update = mutation({
  args: {
    id: v.id("members"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    tierId: v.optional(v.id("membershipTiers")),
    role: v.optional(v.union(v.literal("Admin"), v.literal("StaffMember"), v.literal("BoardMember"), v.literal("Member"))),
    renewalDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Member not found");

    const { id, ...fields } = args;
    const updates: Record<string, any> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }

    // C1: If changing tier, check capacity
    if (updates.tierId && updates.tierId !== existing.tierId) {
      const newTierId = updates.tierId as typeof args.tierId;
      const newTier = await ctx.db.get(newTierId!);
      if (!newTier) throw new Error("Membership tier not found");
      if (newTier.maxMembers !== undefined && newTier.currentMemberCount >= newTier.maxMembers) {
        throw new Error("Target membership tier is at capacity");
      }
      // Decrement old tier, increment new tier
      const oldTier = await ctx.db.get(existing.tierId);
      if (oldTier) await ctx.db.patch(existing.tierId, { currentMemberCount: Math.max(0, oldTier.currentMemberCount - 1) });
      await ctx.db.patch(newTierId!, { currentMemberCount: newTier.currentMemberCount + 1 });
    }

    await ctx.db.patch(id, updates);

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "Update", "members", id, `Updated member fields: ${Object.keys(updates).join(", ")}`);
    }
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("members"),
    status: v.union(v.literal("Active"), v.literal("Inactive"), v.literal("Suspended"), v.literal("Expired")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Member not found");

    const oldStatus = existing.status;
    await ctx.db.patch(args.id, { status: args.status });

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "StatusChange", "members", args.id, `Status changed from ${oldStatus} to ${args.status}`);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Member not found");

    // Decrement tier count
    const tier = await ctx.db.get(existing.tierId);
    if (tier) await ctx.db.patch(existing.tierId, { currentMemberCount: Math.max(0, tier.currentMemberCount - 1) });

    await ctx.db.delete(args.id);

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "Delete", "members", args.id, `Deleted member ${existing.firstName} ${existing.lastName}`);
    }
  },
});
