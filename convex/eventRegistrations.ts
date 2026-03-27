import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function writeAuditLog(ctx: any, userId: any, action: string, entityType: string, entityId: string, details?: string) {
  await ctx.db.insert("auditLogs", { userId, action, entityType, entityId, details, createdAt: Date.now() });
}

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q: any) => q.eq("eventId", args.eventId))
      .collect();

    const results = [];
    for (const reg of registrations) {
      const member = await ctx.db.get(reg.memberId);
      results.push({
        ...reg,
        memberName: member ? `${member.firstName} ${member.lastName}` : "Unknown",
        memberEmail: member?.email ?? "Unknown",
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

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_memberId", (q: any) => q.eq("memberId", args.memberId))
      .order("desc")
      .collect();

    const results = [];
    for (const reg of registrations) {
      const event = await ctx.db.get(reg.eventId);
      results.push({
        ...reg,
        eventTitle: event?.title ?? "Unknown",
        eventDate: event?.date,
      });
    }
    return results;
  },
});

export const register = mutation({
  args: {
    eventId: v.id("events"),
    memberId: v.id("members"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (event.status === "Cancelled") throw new Error("Cannot register for a cancelled event");

    // C7: Members-only check
    if (event.isMembersOnly) {
      const member = await ctx.db.get(args.memberId);
      if (!member || member.status !== "Active") {
        throw new Error("Only active members can register for members-only events");
      }
    }

    // C6: No duplicate registrations
    const existing = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_memberId", (q: any) => q.eq("eventId", args.eventId).eq("memberId", args.memberId))
      .collect();
    const activeReg = existing.find((r: any) => r.status === "Registered" || r.status === "Waitlisted");
    if (activeReg) throw new Error("Member already has an active registration for this event");

    // C5: Check capacity and auto-waitlist
    let regStatus: "Registered" | "Waitlisted" = "Registered";
    if (event.capacity !== undefined && event.registrationCount >= event.capacity) {
      regStatus = "Waitlisted";
    }

    const regId = await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      memberId: args.memberId,
      status: regStatus,
      registeredDate: Date.now(),
      notes: args.notes,
      createdAt: Date.now(),
    });

    // Increment registration count only for Registered (not waitlisted)
    if (regStatus === "Registered") {
      await ctx.db.patch(args.eventId, { registrationCount: event.registrationCount + 1 });
    }

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "Create", "eventRegistrations", regId, `Registered for event "${event.title}" as ${regStatus}`);
    }

    return regId;
  },
});

export const cancel = mutation({
  args: { id: v.id("eventRegistrations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const reg = await ctx.db.get(args.id);
    if (!reg) throw new Error("Registration not found");

    const wasRegistered = reg.status === "Registered";
    await ctx.db.patch(args.id, { status: "Cancelled", cancelledDate: Date.now() });

    // Decrement count if was Registered
    if (wasRegistered) {
      const event = await ctx.db.get(reg.eventId);
      if (event) {
        await ctx.db.patch(reg.eventId, { registrationCount: Math.max(0, event.registrationCount - 1) });

        // Promote first waitlisted person
        const waitlisted = await ctx.db
          .query("eventRegistrations")
          .withIndex("by_eventId", (q: any) => q.eq("eventId", reg.eventId))
          .collect();
        const firstWaitlisted = waitlisted.find((r: any) => r.status === "Waitlisted");
        if (firstWaitlisted) {
          await ctx.db.patch(firstWaitlisted._id, { status: "Registered" });
          await ctx.db.patch(reg.eventId, { registrationCount: Math.max(0, event.registrationCount) });
        }
      }
    }

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "StatusChange", "eventRegistrations", args.id, "Cancelled registration");
    }
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("eventRegistrations"),
    status: v.union(v.literal("Attended"), v.literal("NoShow")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const reg = await ctx.db.get(args.id);
    if (!reg) throw new Error("Registration not found");

    const updates: Record<string, any> = { status: args.status };
    if (args.status === "Attended") {
      updates.attendedDate = Date.now();
    }

    await ctx.db.patch(args.id, updates);

    const actingUsers = await ctx.db
      .query("members")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .take(1);
    if (actingUsers.length > 0) {
      await writeAuditLog(ctx, actingUsers[0]._id, "StatusChange", "eventRegistrations", args.id, `Marked as ${args.status}`);
    }
  },
});
