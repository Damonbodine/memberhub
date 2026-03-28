/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auditLogs from "../auditLogs.js";
import type * as communicationLogs from "../communicationLogs.js";
import type * as cronHandlers from "../cronHandlers.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as duesPayments from "../duesPayments.js";
import type * as eventRegistrations from "../eventRegistrations.js";
import type * as events from "../events.js";
import type * as memberDirectory from "../memberDirectory.js";
import type * as members from "../members.js";
import type * as membershipTiers from "../membershipTiers.js";
import type * as notifications from "../notifications.js";
import type * as orgSettings from "../orgSettings.js";
import type * as renewals from "../renewals.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auditLogs: typeof auditLogs;
  communicationLogs: typeof communicationLogs;
  cronHandlers: typeof cronHandlers;
  crons: typeof crons;
  dashboard: typeof dashboard;
  duesPayments: typeof duesPayments;
  eventRegistrations: typeof eventRegistrations;
  events: typeof events;
  memberDirectory: typeof memberDirectory;
  members: typeof members;
  membershipTiers: typeof membershipTiers;
  notifications: typeof notifications;
  orgSettings: typeof orgSettings;
  renewals: typeof renewals;
  reports: typeof reports;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
