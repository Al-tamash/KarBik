import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiries, cars, dealerProfiles, user } from "@/lib/db/schema";
import { apiHandler, requireAdmin } from "@/lib/guards";

/**
 * GET /api/admin/inquiries
 * WHAT: Returns all customer leads across all Hyderabad dealers.
 * WHY: Gives the administrator oversight of marketplace inquiry volume, lead conversion,
 *      and dealer responsiveness.
 */
export async function GET() {
  return apiHandler(async () => {
    await requireAdmin();

    const leads = await db
      .select({
        id: inquiries.id,
        name: inquiries.name,
        phone: inquiries.phone,
        message: inquiries.message,
        status: inquiries.status,
        priority: inquiries.priority,
        leadScore: inquiries.leadScore,
        leadSource: inquiries.leadSource,
        isVerifiedByAdmin: inquiries.isVerifiedByAdmin,
        adminHold: inquiries.adminHold,
        dealerIsSample: dealerProfiles.isSample,
        adminNotes: inquiries.adminNotes,
        verifiedAt: inquiries.verifiedAt,
        createdAt: inquiries.createdAt,
        buyerEmail: user.email,
        carId: inquiries.car,
        carTitle: cars.title,
        dealerId: inquiries.dealer,
        dealerBusinessName: dealerProfiles.businessName,
      })
      .from(inquiries)
      .leftJoin(cars, eq(inquiries.car, cars.id))
      .leftJoin(dealerProfiles, eq(inquiries.dealer, dealerProfiles.user))
      .leftJoin(user, eq(inquiries.buyer, user.id))
      .orderBy(desc(inquiries.createdAt))
      .limit(100);

    return { inquiries: leads };
  });
}
