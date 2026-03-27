import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function writeAuditLog(ctx: any, userId: any, action: string, entityType: string, entityId: string, details?: string) {
  await ctx.db.insert("auditLogs", { userId, action, entityType, entityId, details, createdAt: Date.now() });
}

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("Upcoming"), v.literal("InProgress"), v.literal("Completed"), v.literal("Cancelled"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    if (args.status) {
      return await ctx.db.query("events").withIndex("by_status", (q: any) => q.eq("status", args.status)).order("desc").collect();
    }
    return await ctx.db.query("events").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const event = await ctx.db.get(args.id);
    if (!event) return null;
    const creator = await ctx.db.get(event.createdById);
    return { ...event, createdByName: creator ? `${creator.firstName} ${creator.lastName}` : "Unknown" };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.number(),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    location: v.string(),
    address: v.optional(v.string()),
    capacity: v.optional(v.number()),
    status: v.union(v.literal("Upcoming"), v.literal("InProgress"), v.literal("Completed"), v.literal("Cancelled")),
    isMembersOnly: v.boolean(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    if (actingUsers.length === 0) throw new Error("User not found");

    const eventId = await ctx.db.insert("events", {
      ...args,
      registrationCount: 0,
      createdById: actingUsers[0]._id,
      createdAt: Date.now(),
    });

    await writeAuditLog(ctx, actingUsers[0]._id, "Create", "events", eventId, `Created event "${args.title}"`);

    return eventId;
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    capacity: v.optional(v.number()),
    isMembersOnly: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Event not found");

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
      await writeAuditLog(ctx, actingUsers[0]._id, "Update", "events", id, `Updated event fields: ${Object.keys(updates).join(", ")}`);
    }
  },
});

export const cancel = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    // C8: Cancel event and cascade to registrations
    await ctx.db.patch(args.id, { status: "Cancelled" });

    // Cancel all active registrations and notify members
    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q: any) => q.eq("eventId", args.id))
      .collect();

    for (const reg of registrations) {
      if (reg.status === "Registered" || reg.status === "Waitlisted") {
        await ctx.db.patch(reg._id, { status: "Cancelled", cancelledDate: Date.now() });

        // Create notification for each affected member
        await ctx.db.insert("notifications", {
          userId: reg.memberId,
          type: "EventCancelled",
          title: "Event Cancelled",
          message: `The event "${event.title}" has been cancelled.`,
          link: "/events",
          isRead: false,
          priority: "High",
          createdAt: Date.now(),
        });
      }
    }

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "StatusChange", "events", args.id, `Cancelled event "${event.title}"`);
    }
  },
});
