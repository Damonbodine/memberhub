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

    // Determine if the current user is Staff/Admin for privacy bypass
    const currentUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    const isStaffOrAdmin = currentUsers.length > 0 && (currentUsers[0].role === "Admin" || currentUsers[0].role === "StaffMember");

    const entries = await ctx.db.query("memberDirectory").collect();
    const results = [];

    for (const entry of entries) {
      // C9: Filter out non-opted-in members (unless staff/admin)
      if (!entry.optedIn && !isStaffOrAdmin) continue;

      const member = await ctx.db.get(entry.memberId);
      if (!member || member.status !== "Active") continue;

      const result: Record<string, any> = {
        _id: entry._id,
        memberId: entry.memberId,
        displayName: entry.displayName,
        bio: entry.bio,
        optedIn: entry.optedIn,
      };

      // Apply privacy settings
      if (entry.showEmail) result.email = member.email;
      if (entry.showPhone) result.phone = member.phone;
      if (entry.showAddress) {
        result.address = member.address;
        result.city = member.city;
        result.state = member.state;
        result.zipCode = member.zipCode;
      }
      if (entry.showTier) {
        const tier = await ctx.db.get(member.tierId);
        result.tierName = tier?.name ?? "Unknown";
      }

      results.push(result);
    }

    return results;
  },
});

export const getByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const entries = await ctx.db
      .query("memberDirectory")
      .withIndex("by_memberId", (q: any) => q.eq("memberId", args.memberId))
      .take(1);
    return entries.length > 0 ? entries[0] : null;
  },
});

export const upsert = mutation({
  args: {
    memberId: v.id("members"),
    displayName: v.string(),
    showEmail: v.boolean(),
    showPhone: v.boolean(),
    showAddress: v.boolean(),
    showTier: v.boolean(),
    optedIn: v.boolean(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("memberDirectory")
      .withIndex("by_memberId", (q: any) => q.eq("memberId", args.memberId))
      .take(1);

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, {
        ...args,
        updatedAt: Date.now(),
      });
      if (actingUsers.length > 0) {
        await writeAuditLog(ctx, actingUsers[0]._id, "Update", "memberDirectory", existing[0]._id, "Updated directory entry");
      }
      return existing[0]._id;
    } else {
      const entryId = await ctx.db.insert("memberDirectory", {
        ...args,
        updatedAt: Date.now(),
      });
      if (actingUsers.length > 0) {
        await writeAuditLog(ctx, actingUsers[0]._id, "Create", "memberDirectory", entryId, "Created directory entry");
      }
      return entryId;
    }
  },
});
