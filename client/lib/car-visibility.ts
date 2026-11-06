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

/** Unverified dealers may have this many live listings before approval is needed. */
export const UNVERIFIED_LIVE_LISTING_QUOTA = 2;
