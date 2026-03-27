import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Idempotency check
    const existingTiers = await ctx.db.query("membershipTiers").first();
    if (existingTiers) {
      console.log("Database already seeded, skipping.");
      return;
    }

    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
    const sixMonthsAgo = now - 182 * 24 * 60 * 60 * 1000;
    const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthFromNow = now + 30 * 24 * 60 * 60 * 1000;
    const threeMonthsFromNow = now + 90 * 24 * 60 * 60 * 1000;
    const sixMonthsFromNow = now + 182 * 24 * 60 * 60 * 1000;
    const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000;

    // 1. Create 5 membership tiers
    const individualTierId = await ctx.db.insert("membershipTiers", {
      name: "Individual",
      description: "Standard individual membership with full benefits",
      annualDuesAmount: 75,
      benefitsDescription: "Access to all events, newsletter, voting rights",
      currentMemberCount: 2,
      sortOrder: 1,
      isActive: true,
      createdAt: oneYearAgo,
    });

    const familyTierId = await ctx.db.insert("membershipTiers", {
      name: "Family",
      description: "Family membership covering up to 4 household members",
      annualDuesAmount: 125,
      benefitsDescription: "All individual benefits plus family event discounts",
      maxMembers: 4,
      currentMemberCount: 1,
      sortOrder: 2,
      isActive: true,
      createdAt: oneYearAgo,
    });

    const studentTierId = await ctx.db.insert("membershipTiers", {
      name: "Student",
      description: "Discounted membership for full-time students",
      annualDuesAmount: 25,
      benefitsDescription: "Access to events and mentorship programs",
      currentMemberCount: 1,
      sortOrder: 3,
      isActive: true,
      createdAt: oneYearAgo,
    });

    const seniorTierId = await ctx.db.insert("membershipTiers", {
      name: "Senior",
      description: "Reduced rate for members 65 and older",
      annualDuesAmount: 50,
      benefitsDescription: "All individual benefits at senior rate",
      currentMemberCount: 1,
      sortOrder: 4,
      isActive: true,
      createdAt: oneYearAgo,
    });

    const lifetimeTierId = await ctx.db.insert("membershipTiers", {
      name: "Lifetime",
      description: "One-time payment for permanent membership",
      annualDuesAmount: 500,
      benefitsDescription: "Permanent membership with all benefits, no renewals",
      currentMemberCount: 0,
      sortOrder: 5,
      isActive: true,
      createdAt: oneYearAgo,
    });

    // 2. Create 5 members
    const janeId = await ctx.db.insert("members", {
      clerkId: "clerk_admin_001",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@memberhub.org",
      phone: "512-555-0101",
      address: "200 Congress Ave",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      tierId: individualTierId,
      role: "Admin",
      status: "Active",
      joinDate: oneYearAgo,
      renewalDate: oneYearFromNow,
      createdAt: oneYearAgo,
    });

    const bobId = await ctx.db.insert("members", {
      clerkId: "clerk_staff_001",
      firstName: "Bob",
      lastName: "Smith",
      email: "bob.smith@memberhub.org",
      phone: "512-555-0102",
      address: "1100 S Congress Ave",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      tierId: familyTierId,
      role: "StaffMember",
      status: "Active",
      joinDate: sixMonthsAgo,
      renewalDate: sixMonthsFromNow,
      createdAt: sixMonthsAgo,
    });

    const carolId = await ctx.db.insert("members", {
      clerkId: "clerk_board_001",
      firstName: "Carol",
      lastName: "Davis",
      email: "carol.davis@memberhub.org",
      phone: "512-555-0103",
      address: "500 E 4th St",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      tierId: seniorTierId,
      role: "BoardMember",
      status: "Active",
      joinDate: oneYearAgo,
      renewalDate: threeMonthsFromNow,
      createdAt: oneYearAgo,
    });

    const aliceId = await ctx.db.insert("members", {
      clerkId: "clerk_member_001",
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@example.com",
      phone: "512-555-0104",
      city: "Austin",
      state: "TX",
      zipCode: "78703",
      tierId: individualTierId,
      role: "Member",
      status: "Active",
      joinDate: threeMonthsAgo,
      renewalDate: threeMonthsFromNow,
      createdAt: threeMonthsAgo,
    });

    const tomId = await ctx.db.insert("members", {
      clerkId: "clerk_member_002",
      firstName: "Tom",
      lastName: "Wilson",
      email: "tom.wilson@example.com",
      phone: "512-555-0105",
      city: "Austin",
      state: "TX",
      zipCode: "78745",
      tierId: studentTierId,
      role: "Member",
      status: "Active",
      joinDate: oneMonthAgo,
      renewalDate: oneYearFromNow,
      createdAt: oneMonthAgo,
    });

    // 3. Create 4 dues payments
    await ctx.db.insert("duesPayments", {
      memberId: janeId,
      tierId: individualTierId,
      amount: 75,
      periodStart: oneYearAgo,
      periodEnd: oneYearFromNow,
      status: "Paid",
      paymentDate: oneYearAgo,
      paymentMethod: "CreditCard",
      receiptNumber: "RCP-2025-001",
      processedById: janeId,
      createdAt: oneYearAgo,
      updatedAt: oneYearAgo,
    });

    await ctx.db.insert("duesPayments", {
      memberId: bobId,
      tierId: familyTierId,
      amount: 125,
      periodStart: sixMonthsAgo,
      periodEnd: sixMonthsFromNow,
      status: "Paid",
      paymentDate: sixMonthsAgo,
      paymentMethod: "BankTransfer",
      receiptNumber: "RCP-2025-002",
      processedById: janeId,
      createdAt: sixMonthsAgo,
      updatedAt: sixMonthsAgo,
    });

    await ctx.db.insert("duesPayments", {
      memberId: aliceId,
      tierId: individualTierId,
      amount: 75,
      periodStart: threeMonthsAgo,
      periodEnd: threeMonthsFromNow,
      status: "Pending",
      createdAt: threeMonthsAgo,
      updatedAt: threeMonthsAgo,
    });

    await ctx.db.insert("duesPayments", {
      memberId: carolId,
      tierId: seniorTierId,
      amount: 50,
      periodStart: oneYearAgo,
      periodEnd: oneMonthAgo,
      status: "Overdue",
      createdAt: oneYearAgo,
      updatedAt: oneWeekAgo,
    });

    // 4. Create 3 renewals
    await ctx.db.insert("renewals", {
      memberId: aliceId,
      oldTierId: individualTierId,
      newTierId: individualTierId,
      renewalDate: threeMonthsFromNow,
      status: "Pending",
      reminderCount: 0,
      createdAt: now,
    });

    await ctx.db.insert("renewals", {
      memberId: bobId,
      oldTierId: familyTierId,
      newTierId: familyTierId,
      renewalDate: sixMonthsAgo,
      completedDate: sixMonthsAgo,
      status: "Completed",
      reminderSentAt: sixMonthsAgo - 30 * 24 * 60 * 60 * 1000,
      reminderCount: 1,
      processedById: janeId,
      createdAt: sixMonthsAgo,
    });

    await ctx.db.insert("renewals", {
      memberId: carolId,
      oldTierId: seniorTierId,
      newTierId: seniorTierId,
      renewalDate: oneMonthAgo,
      status: "Lapsed",
      reminderSentAt: oneMonthAgo - 14 * 24 * 60 * 60 * 1000,
      reminderCount: 2,
      createdAt: oneMonthAgo,
    });

    // 5. Create 2 communication logs
    await ctx.db.insert("communicationLogs", {
      memberId: aliceId,
      staffId: janeId,
      type: "Email",
      subject: "Welcome to MemberHub",
      content: "Welcome aboard! We are excited to have you as a member.",
      direction: "Outbound",
      communicationDate: threeMonthsAgo,
      createdAt: threeMonthsAgo,
    });

    await ctx.db.insert("communicationLogs", {
      memberId: carolId,
      staffId: bobId,
      type: "Phone",
      subject: "Renewal follow-up",
      content: "Called to discuss membership renewal options.",
      direction: "Outbound",
      followUpDate: oneWeekAgo,
      followUpCompleted: false,
      communicationDate: oneMonthAgo,
      createdAt: oneMonthAgo,
    });

    // 6. Create 3 events
    const upcomingEventId = await ctx.db.insert("events", {
      title: "Annual Members Gala",
      description: "Join us for our annual celebration and networking event.",
      date: oneMonthFromNow,
      startTime: "18:00",
      endTime: "22:00",
      location: "Austin Convention Center",
      address: "500 E Cesar Chavez St, Austin, TX 78701",
      capacity: 200,
      registrationCount: 2,
      status: "Upcoming",
      isMembersOnly: true,
      createdById: janeId,
      createdAt: oneWeekAgo,
    });

    const inProgressEventId = await ctx.db.insert("events", {
      title: "Spring Workshop Series",
      description: "A hands-on workshop covering community engagement strategies.",
      date: now,
      startTime: "09:00",
      endTime: "12:00",
      location: "Community Hall",
      address: "123 Main St, Austin, TX 78702",
      capacity: 50,
      registrationCount: 1,
      status: "InProgress",
      isMembersOnly: false,
      createdById: bobId,
      createdAt: oneMonthAgo,
    });

    const completedEventId = await ctx.db.insert("events", {
      title: "New Member Orientation",
      description: "Introduction session for new members covering benefits and resources.",
      date: oneMonthAgo,
      startTime: "14:00",
      endTime: "16:00",
      location: "MemberHub Office",
      address: "200 Congress Ave, Austin, TX 78701",
      capacity: 30,
      registrationCount: 1,
      status: "Completed",
      isMembersOnly: true,
      createdById: janeId,
      createdAt: threeMonthsAgo,
    });

    // 7. Create 4 event registrations
    await ctx.db.insert("eventRegistrations", {
      eventId: upcomingEventId,
      memberId: aliceId,
      status: "Registered",
      registeredDate: oneWeekAgo,
      createdAt: oneWeekAgo,
    });

    await ctx.db.insert("eventRegistrations", {
      eventId: upcomingEventId,
      memberId: tomId,
      status: "Waitlisted",
      registeredDate: oneWeekAgo,
      createdAt: oneWeekAgo,
    });

    await ctx.db.insert("eventRegistrations", {
      eventId: completedEventId,
      memberId: aliceId,
      status: "Attended",
      registeredDate: threeMonthsAgo,
      attendedDate: oneMonthAgo,
      createdAt: threeMonthsAgo,
    });

    await ctx.db.insert("eventRegistrations", {
      eventId: inProgressEventId,
      memberId: carolId,
      status: "Cancelled",
      registeredDate: oneMonthAgo,
      cancelledDate: oneWeekAgo,
      notes: "Schedule conflict",
      createdAt: oneMonthAgo,
    });

    // 8. Create 3 directory entries
    await ctx.db.insert("memberDirectory", {
      memberId: janeId,
      displayName: "Jane Doe",
      showEmail: true,
      showPhone: true,
      showAddress: false,
      showTier: true,
      optedIn: true,
      bio: "Organization administrator and founding member.",
      updatedAt: now,
    });

    await ctx.db.insert("memberDirectory", {
      memberId: bobId,
      displayName: "Bob Smith",
      showEmail: true,
      showPhone: false,
      showAddress: false,
      showTier: true,
      optedIn: true,
      bio: "Staff member focused on community outreach.",
      updatedAt: now,
    });

    await ctx.db.insert("memberDirectory", {
      memberId: aliceId,
      displayName: "Alice Johnson",
      showEmail: false,
      showPhone: false,
      showAddress: false,
      showTier: false,
      optedIn: true,
      updatedAt: now,
    });

    // 9. Create 3 notifications
    await ctx.db.insert("notifications", {
      userId: aliceId,
      type: "DuesOverdue",
      title: "Payment Due",
      message: "Your membership dues payment is pending. Please complete your payment.",
      link: "/dues",
      isRead: false,
      priority: "High",
      createdAt: oneWeekAgo,
    });

    await ctx.db.insert("notifications", {
      userId: janeId,
      type: "SystemAlert",
      title: "New Member Joined",
      message: "Tom Wilson has joined as a Student member.",
      link: "/members",
      isRead: true,
      priority: "Normal",
      createdAt: oneMonthAgo,
    });

    await ctx.db.insert("notifications", {
      userId: carolId,
      type: "RenewalReminder",
      title: "Membership Renewal Required",
      message: "Your membership renewal is overdue. Please renew to maintain your benefits.",
      link: "/renewals",
      isRead: false,
      priority: "High",
      createdAt: oneWeekAgo,
    });

    // 10. Create org settings
    await ctx.db.insert("orgSettings", {
      orgName: "Austin Community Association",
      orgEmail: "info@memberhub.org",
      orgPhone: "512-555-0100",
      address: "200 Congress Ave",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      membershipYearStart: "January",
      gracePeriodDays: 30,
      firstReminderDays: 60,
      secondReminderDays: 30,
      finalReminderDays: 7,
      updatedAt: now,
    });

    console.log("Seed data inserted successfully.");
  },
});