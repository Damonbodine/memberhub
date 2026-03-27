import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function writeAuditLog(ctx: any, userId: any, action: string, entityType: string, entityId: string, details?: string) {
  await ctx.db.insert("auditLogs", { userId, action, entityType, entityId, details, createdAt: Date.now() });
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const settings = await ctx.db.query("orgSettings").take(1);
    return settings.length > 0 ? settings[0] : null;
  },
});

export const update = mutation({
  args: {
    orgName: v.optional(v.string()),
    orgEmail: v.optional(v.string()),
    orgPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    membershipYearStart: v.optional(v.union(
      v.literal("January"), v.literal("February"), v.literal("March"),
      v.literal("April"), v.literal("May"), v.literal("June"),
      v.literal("July"), v.literal("August"), v.literal("September"),
      v.literal("October"), v.literal("November"), v.literal("December")
    )),
    gracePeriodDays: v.optional(v.number()),
    firstReminderDays: v.optional(v.number()),
    secondReminderDays: v.optional(v.number()),
    finalReminderDays: v.optional(v.number()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const settings = await ctx.db.query("orgSettings").take(1);

    const updates: Record<string, any> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(args)) {
      if (val !== undefined) updates[key] = val;
    }

    if (settings.length > 0) {
      await ctx.db.patch(settings[0]._id, updates);

      const actingUsers = await ctx.db
        .query("members")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
        .take(1);
      if (actingUsers.length > 0) {
        await writeAuditLog(ctx, actingUsers[0]._id, "Update", "orgSettings", settings[0]._id, `Updated org settings: ${Object.keys(updates).join(", ")}`);
      }
    } else {
      // Create default settings if none exist
      await ctx.db.insert("orgSettings", {
        orgName: args.orgName ?? "My Organization",
        orgEmail: args.orgEmail ?? "info@example.com",
        orgPhone: args.orgPhone,
        address: args.address,
        city: args.city,
        state: args.state,
        zipCode: args.zipCode,
        membershipYearStart: args.membershipYearStart ?? "January",
        gracePeriodDays: args.gracePeriodDays ?? 30,
        firstReminderDays: args.firstReminderDays ?? 60,
        secondReminderDays: args.secondReminderDays ?? 30,
        finalReminderDays: args.finalReminderDays ?? 7,
        logoUrl: args.logoUrl,
        updatedAt: Date.now(),
      });
    }
  },
});
