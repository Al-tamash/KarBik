import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dealerProfiles } from "@/lib/db/schema";
import { apiHandler } from "@/lib/guards";
import { toPublicDealerProfile } from "@/lib/dealer-public";

// GET /api/trust/profile/:dealerId — public: dealer trust profile
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  return apiHandler(async () => {
    const { dealerId } = await params;

    const [profile] = await db
      .select()
      .from(dealerProfiles)
      .where(eq(dealerProfiles.user, dealerId))
      .limit(1);

    if (!profile) {
      return Response.json({
        user: dealerId,
        businessName: "Independent Dealer",
        isVerified: false,
        averageRating: 0,
        totalReviews: 0,
      });
    }

    // Public route: never include phone / WhatsApp / KYC document.
    return Response.json(toPublicDealerProfile(profile));
  });
}
