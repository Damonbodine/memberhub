import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function writeAuditLog(ctx: any, userId: any, action: string, entityType: string, entityId: string, details?: string) {
  await ctx.db.insert("auditLogs", { userId, action, entityType, entityId, details, createdAt: Date.now() });
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("membershipTiers").withIndex("by_sortOrder").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("membershipTiers")
      .withIndex("by_isActive", (q: any) => q.eq("isActive", true))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("membershipTiers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.union(v.literal("Individual"), v.literal("Family"), v.literal("Student"), v.literal("Senior"), v.literal("Lifetime")),
    description: v.string(),
    annualDuesAmount: v.number(),
    benefitsDescription: v.optional(v.string()),
    maxMembers: v.optional(v.number()),
    sortOrder: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const tierId = await ctx.db.insert("membershipTiers", {
      ...args,
      currentMemberCount: 0,
      createdAt: Date.now(),
    });

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "Create", "membershipTiers", tierId, `Created tier ${args.name}`);
    }

    return tierId;
  },
});

export const update = mutation({
  args: {
    id: v.id("membershipTiers"),
    name: v.optional(v.union(v.literal("Individual"), v.literal("Family"), v.literal("Student"), v.literal("Senior"), v.literal("Lifetime"))),
    description: v.optional(v.string()),
    annualDuesAmount: v.optional(v.number()),
    benefitsDescription: v.optional(v.string()),
    maxMembers: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Membership tier not found");

    const { id, ...fields } = args;
    const updates: Record<string, any> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }

    await ctx.db.patch(id, updates);

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "Update", "membershipTiers", id, `Updated tier fields: ${Object.keys(updates).join(", ")}`);
    }
  },
});
