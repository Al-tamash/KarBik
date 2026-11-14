import { and, eq, isNull } from "drizzle-orm";
import { cars } from "@/lib/db/schema";

/**
 * A listing is public only when it is not archived (soft-deleted) and not
 * waiting for admin approval. Use this in EVERY public query so a hidden car
 * can never leak through one forgotten route.
 */
export const publiclyVisible = and(
  isNull(cars.archivedAt),
  eq(cars.pendingApproval, false)
);

// The number lives in lib/limits.ts so client components can read it without importing the
// database schema; it is re-exported here for the server code that already imports it.
export { UNVERIFIED_LIVE_LISTING_QUOTA } from "@/lib/limits";
