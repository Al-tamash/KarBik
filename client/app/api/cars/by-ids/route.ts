import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, dealerProfiles } from "@/lib/db/schema";
import { publiclyVisible } from "@/lib/car-visibility";
import { apiHandler } from "@/lib/guards";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Enough for any wishlist or comparison; stops one request asking for the whole table. */
const MAX_IDS = 60;

// GET /api/cars/by-ids?ids=a,b,c — public: listing-card data for specific cars.
// Used by the wishlist (and anything else that holds a list of car ids).
// Unlike GET /api/cars/:id it does NOT count a view, and it silently drops
// ids that are malformed, sold/archived or waiting for approval.
// Cars come back in the order the ids were given.
export async function GET(request: Request) {
  return apiHandler(async () => {
    const raw = new URL(request.url).searchParams.get("ids") ?? "";
    const ids = [...new Set(raw.split(","))]
      .map((id) => id.trim())
      .filter((id) => UUID_PATTERN.test(id))
      .slice(0, MAX_IDS);

    if (ids.length === 0) return Response.json({ cars: [] });

    const rows = await db
      .select({
        car: cars,
        dealerProfile: {
          businessName: dealerProfiles.businessName,
          slug: dealerProfiles.slug,
          city: dealerProfiles.city,
          averageRating: dealerProfiles.averageRating,
          totalReviews: dealerProfiles.totalReviews,
          isVerified: dealerProfiles.isVerified,
          isSample: dealerProfiles.isSample,
        },
      })
      .from(cars)
      .leftJoin(dealerProfiles, eq(dealerProfiles.user, cars.dealer))
      .where(and(inArray(cars.id, ids), publiclyVisible));

    const byId = new Map(
      rows.map((row) => [
        row.car.id,
        { ...row.car, dealerProfile: row.dealerProfile ?? null },
      ])
    );

    return Response.json({
      cars: ids.flatMap((id) => byId.get(id) ?? []),
    });
  });
}
