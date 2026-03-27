import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  members: defineTable({
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
    role: v.union(
      v.literal("Admin"),
      v.literal("StaffMember"),
      v.literal("BoardMember"),
      v.literal("Member")
    ),
    status: v.union(
      v.literal("Active"),
      v.literal("Inactive"),
      v.literal("Suspended"),
      v.literal("Expired")
    ),
    joinDate: v.number(),
    renewalDate: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_tierId", ["tierId"])
    .index("by_status", ["status"])
    .index("by_role", ["role"]),

  membershipTiers: defineTable({
    name: v.union(
      v.literal("Individual"),
      v.literal("Family"),
      v.literal("Student"),
      v.literal("Senior"),
      v.literal("Lifetime")
    ),
    description: v.string(),
    annualDuesAmount: v.number(),
    benefitsDescription: v.optional(v.string()),
    maxMembers: v.optional(v.number()),
    currentMemberCount: v.number(),
    sortOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_isActive", ["isActive"])
    .index("by_sortOrder", ["sortOrder"]),

  duesPayments: defineTable({
    memberId: v.id("members"),
    tierId: v.id("membershipTiers"),
    amount: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Paid"),
      v.literal("Overdue"),
      v.literal("Waived")
    ),
    paymentDate: v.optional(v.number()),
    paymentMethod: v.optional(
      v.union(
        v.literal("Cash"),
        v.literal("Check"),
        v.literal("CreditCard"),
        v.literal("BankTransfer"),
        v.literal("Online"),
        v.literal("Other")
      )
    ),
    receiptNumber: v.optional(v.string()),
    processedById: v.optional(v.id("members")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_tierId", ["tierId"])
    .index("by_status", ["status"])
    .index("by_processedById", ["processedById"]),

  renewals: defineTable({
    memberId: v.id("members"),
    oldTierId: v.id("membershipTiers"),
    newTierId: v.id("membershipTiers"),
    renewalDate: v.number(),
    completedDate: v.optional(v.number()),
    status: v.union(
      v.literal("Pending"),
      v.literal("Completed"),
      v.literal("Lapsed")
    ),
    reminderSentAt: v.optional(v.number()),
    reminderCount: v.number(),
    processedById: v.optional(v.id("members")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_status", ["status"])
    .index("by_renewalDate", ["renewalDate"]),

  communicationLogs: defineTable({
    memberId: v.id("members"),
    staffId: v.id("members"),
    type: v.union(
      v.literal("Email"),
      v.literal("Phone"),
      v.literal("InPerson"),
      v.literal("Note")
    ),
    subject: v.string(),
    content: v.string(),
    direction: v.union(
      v.literal("Inbound"),
      v.literal("Outbound"),
      v.literal("Internal")
    ),
    followUpDate: v.optional(v.number()),
    followUpCompleted: v.optional(v.boolean()),
    communicationDate: v.number(),
    createdAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_staffId", ["staffId"])
    .index("by_type", ["type"]),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.number(),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    location: v.string(),
    address: v.optional(v.string()),
    capacity: v.optional(v.number()),
    registrationCount: v.number(),
    status: v.union(
      v.literal("Upcoming"),
      v.literal("InProgress"),
      v.literal("Completed"),
      v.literal("Cancelled")
    ),
    isMembersOnly: v.boolean(),
    imageUrl: v.optional(v.string()),
    createdById: v.id("members"),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_date", ["date"])
    .index("by_createdById", ["createdById"]),

  eventRegistrations: defineTable({
    eventId: v.id("events"),
    memberId: v.id("members"),
    status: v.union(
      v.literal("Registered"),
      v.literal("Waitlisted"),
      v.literal("Attended"),
      v.literal("NoShow"),
      v.literal("Cancelled")
    ),
    registeredDate: v.number(),
    cancelledDate: v.optional(v.number()),
    attendedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_memberId", ["memberId"])
    .index("by_eventId_memberId", ["eventId", "memberId"]),

  memberDirectory: defineTable({
    memberId: v.id("members"),
    displayName: v.string(),
    showEmail: v.boolean(),
    showPhone: v.boolean(),
    showAddress: v.boolean(),
    showTier: v.boolean(),
    optedIn: v.boolean(),
    bio: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_optedIn", ["optedIn"]),

  notifications: defineTable({
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
    isRead: v.boolean(),
    priority: v.union(
      v.literal("Low"),
      v.literal("Normal"),
      v.literal("High")
    ),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"]),

  auditLogs: defineTable({
    userId: v.id("members"),
    action: v.union(
      v.literal("Create"),
      v.literal("Update"),
      v.literal("Delete"),
      v.literal("StatusChange"),
      v.literal("Payment"),
      v.literal("Renewal"),
      v.literal("Login"),
      v.literal("Export")
    ),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_entityType_entityId", ["entityType", "entityId"]),

  orgSettings: defineTable({
    orgName: v.string(),
    orgEmail: v.string(),
    orgPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    membershipYearStart: v.union(
      v.literal("January"),
      v.literal("February"),
      v.literal("March"),
      v.literal("April"),
      v.literal("May"),
      v.literal("June"),
      v.literal("July"),
      v.literal("August"),
      v.literal("September"),
      v.literal("October"),
      v.literal("November"),
      v.literal("December")
    ),
    gracePeriodDays: v.number(),
    firstReminderDays: v.number(),
    secondReminderDays: v.number(),
    finalReminderDays: v.number(),
    logoUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }),
});