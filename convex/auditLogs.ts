import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const logs = await ctx.db.query("auditLogs").order("desc").take(100);

    const results = [];
    for (const log of logs) {
      const user = await ctx.db.get(log.userId);
      results.push({
        ...log,
        userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
      });
    }
    return results;
  },
});

export const listByEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_entityType_entityId", (q: any) => q.eq("entityType", args.entityType).eq("entityId", args.entityId))
      .order("desc")
      .collect();

    const results = [];
    for (const log of logs) {
      const user = await ctx.db.get(log.userId);
      results.push({
        ...log,
        userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
      });
    }
    return results;
  },
});
