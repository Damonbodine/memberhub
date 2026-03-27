import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    if (currentUsers.length === 0) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q: any) => q.eq("userId", currentUsers[0]._id))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const currentUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    if (currentUsers.length === 0) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q: any) => q.eq("userId", currentUsers[0]._id).eq("isRead", false))
      .collect();
    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("Notification not found");

    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    if (currentUsers.length === 0) throw new Error("User not found");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q: any) => q.eq("userId", currentUsers[0]._id).eq("isRead", false))
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

export const create = mutation({
  args: {
    userId: v.id("members"),
    type: v.union(
      v.literal("RenewalReminder"),
      v.literal("DuesOverdue"),
      v.literal("PaymentConfirmation"),
      v.literal("EventReminder"),
      v.literal("EventCancelled"),
      v.literal("WelcomeMessage"),
      v.literal("MembershipExpired"),
      v.literal("SystemAlert")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    priority: v.union(v.literal("Low"), v.literal("Normal"), v.literal("High")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});
