import { and, count, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, dealerProfiles, cars, inquiries, boosts } from "@/lib/db/schema";
import { apiHandler, requireAdmin } from "@/lib/guards";

/**
 * GET /api/admin/stats
 * WHAT: Aggregates top-level marketplace statistics for the Super Admin dashboard.
 * WHY: Gives the administrator immediate visibility into platform inventory,
 *      dealer onboarding, buyer inquiries, and verification metrics.
 */
export async function GET() {
  return apiHandler(async () => {
    // 1. Guard check: Only Super Admin can query platform stats
    await requireAdmin();

    // 2. Fetch parallel aggregates from database
    const [
      [dealerCount],
      [verifiedDealerCount],
      [carCount],
      [rcCheckedCount],
      [boostedCarCount],
      [inquiryCount],
      [userCount],
    ] = await Promise.all([
      db.select({ count: count() }).from(dealerProfiles),
      db.select({ count: count() }).from(dealerProfiles).where(eq(dealerProfiles.isVerified, true)),
      db.select({ count: count() }).from(cars).where(isNull(cars.archivedAt)),
      db
        .select({ count: count() })
        .from(cars)
        .where(and(isNull(cars.archivedAt), eq(cars.rcVerified, true))),
      db
        .select({ count: count() })
        .from(boosts)
        .where(and(eq(boosts.status, "active"), gt(boosts.endDate, new Date()))),
      db.select({ count: count() }).from(inquiries),
      db.select({ count: count() }).from(user),
    ]);

    return {
      totalDealers: Number(dealerCount?.count ?? 0),
      verifiedDealers: Number(verifiedDealerCount?.count ?? 0),
      totalCars: Number(carCount?.count ?? 0),
      rcVerifiedCars: Number(rcCheckedCount?.count ?? 0),
      boostedCars: Number(boostedCarCount?.count ?? 0),
      totalInquiries: Number(inquiryCount?.count ?? 0),
      totalUsers: Number(userCount?.count ?? 0),
    };
  });
}
