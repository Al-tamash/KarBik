import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, dealerProfiles, reviews } from "@/lib/db/schema";
import { apiHandler } from "@/lib/guards";
import { toPublicDealerProfile } from "@/lib/dealer-public";
import { publiclyVisible } from "@/lib/car-visibility";

// GET /api/dealers/:slug — public: dealer micro-website data
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return apiHandler(async () => {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const [profile] = await db
      .select()
      .from(dealerProfiles)
      .where(
        and(
          eq(dealerProfiles.slug, slug),
          eq(dealerProfiles.microWebsiteEnabled, true)
        )
      )
      .limit(1);

    if (!profile) {
      return Response.json(
        { message: "Dealer page not found" },
        { status: 404 }
      );
    }

    const [dealerCars, dealerReviews] = await Promise.all([
      db
        .select()
        .from(cars)
        .where(and(eq(cars.dealer, profile.user), publiclyVisible))
        .orderBy(desc(cars.createdAt)),
      db
        .select()
        .from(reviews)
        .where(eq(reviews.dealer, profile.user))
        .orderBy(desc(reviews.createdAt)),
    ]);

    return Response.json({
      // Public route: never include phone / WhatsApp / KYC document.
      profile: toPublicDealerProfile(profile),
      cars: dealerCars,
      reviews: dealerReviews,
    });
  });
}
