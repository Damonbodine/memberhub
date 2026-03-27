import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function writeAuditLog(ctx: any, userId: any, action: string, entityType: string, entityId: string, details?: string) {
  await ctx.db.insert("auditLogs", { userId, action, entityType, entityId, details, createdAt: Date.now() });
}

export const list = query({
  args: {
    type: v.optional(v.union(v.literal("Email"), v.literal("Phone"), v.literal("InPerson"), v.literal("Note"))),
    direction: v.optional(v.union(v.literal("Inbound"), v.literal("Outbound"), v.literal("Internal"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let logs;
    if (args.type) {
      logs = await ctx.db.query("communicationLogs").withIndex("by_type", (q: any) => q.eq("type", args.type)).order("desc").collect();
    } else {
      logs = await ctx.db.query("communicationLogs").order("desc").take(100);
    }

    if (args.direction) {
      logs = logs.filter((l: any) => l.direction === args.direction);
    }

    const results = [];
    for (const log of logs) {
      const member = await ctx.db.get(log.memberId);
      const staff = await ctx.db.get(log.staffId);
      results.push({
        ...log,
        memberName: member ? `${member.firstName} ${member.lastName}` : "Unknown",
        staffName: staff ? `${staff.firstName} ${staff.lastName}` : "Unknown",
      });
    }
    return results;
  },
});

export const listByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const logs = await ctx.db
      .query("communicationLogs")
      .withIndex("by_memberId", (q: any) => q.eq("memberId", args.memberId))
      .order("desc")
      .collect();

    const results = [];
    for (const log of logs) {
      const staff = await ctx.db.get(log.staffId);
      results.push({
        ...log,
        staffName: staff ? `${staff.firstName} ${staff.lastName}` : "Unknown",
      });
    }
    return results;
  },
});

export const create = mutation({
  args: {
    memberId: v.id("members"),
    type: v.union(v.literal("Email"), v.literal("Phone"), v.literal("InPerson"), v.literal("Note")),
    subject: v.string(),
    content: v.string(),
    direction: v.union(v.literal("Inbound"), v.literal("Outbound"), v.literal("Internal")),
    followUpDate: v.optional(v.number()),
    communicationDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    if (actingUsers.length === 0) throw new Error("Staff member not found");

    const logId = await ctx.db.insert("communicationLogs", {
      ...args,
      staffId: actingUsers[0]._id,
      createdAt: Date.now(),
    });

    await writeAuditLog(ctx, actingUsers[0]._id, "Create", "communicationLogs", logId, `Logged ${args.type} communication with member`);

    return logId;
  },
});

export const update = mutation({
  args: {
    id: v.id("communicationLogs"),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    followUpCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Communication log not found");

    const { id, ...fields } = args;
    const updates: Record<string, any> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }

    await ctx.db.patch(id, updates);

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "Update", "communicationLogs", id, `Updated communication log`);
    }
  },
});
