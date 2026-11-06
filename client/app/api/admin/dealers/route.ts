import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, dealerProfiles, cars } from "@/lib/db/schema";
import { apiHandler, requireAdmin } from "@/lib/guards";
import { getAdminDocumentUrl } from "@/lib/cloudinary-server";

/**
 * GET /api/admin/dealers
 * WHAT: Returns a list of all registered dealerships with verification and inventory info.
 * WHY: Enables administrators to review dealerships, check uploaded documents,
 *      and toggle official verification badges.
 */
export async function GET() {
  return apiHandler(async () => {
    // 1. Guard check: Must be Super Admin
    await requireAdmin();

    // 2. Fetch dealers joined with user account and active car counts
    const dealersList = await db
      .select({
        id: dealerProfiles.id,
        userId: dealerProfiles.user,
        businessName: dealerProfiles.businessName,
        slug: dealerProfiles.slug,
        phone: dealerProfiles.phone,
        address: dealerProfiles.address,
        city: dealerProfiles.city,
        isVerified: dealerProfiles.isVerified,
        verificationDoc: dealerProfiles.verificationDoc,
        averageRating: dealerProfiles.averageRating,
        totalReviews: dealerProfiles.totalReviews,
        createdAt: dealerProfiles.createdAt,
        ownerName: user.name,
        ownerEmail: user.email,
        carsCount: sql<number>`(
          SELECT count(*)::int FROM cars WHERE cars.dealer = ${dealerProfiles.user}
        )`,
      })
      .from(dealerProfiles)
      .leftJoin(user, eq(dealerProfiles.user, user.id))
      .orderBy(desc(dealerProfiles.createdAt));

    // Private KYC documents are only ever shown through a short-lived signed link.
    return {
      dealers: dealersList.map((d) => ({
        ...d,
        verificationDoc: d.verificationDoc
          ? { ...d.verificationDoc, url: getAdminDocumentUrl(d.verificationDoc) }
          : null,
      })),
    };
  });
}

