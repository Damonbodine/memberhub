import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "checkOverduePayments",
  "0 1 * * *",
  internal.cronHandlers.checkOverduePayments,
);

crons.cron(
  "checkLapsedRenewals",
  "0 2 * * *",
  internal.cronHandlers.checkLapsedRenewals,
);

crons.cron(
  "sendRenewalReminders",
  "0 9 * * *",
  internal.cronHandlers.sendRenewalReminders,
);

export default crons;
