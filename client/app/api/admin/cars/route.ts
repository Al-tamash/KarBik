import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, dealerProfiles, boosts } from "@/lib/db/schema";
import { apiHandler, requireAdmin } from "@/lib/guards";

const isBoostedSql = sql<boolean>`exists (
  select 1 from ${boosts}
  where ${boosts.car} = ${cars.id}
    and ${boosts.status} = 'active'
    and ${boosts.endDate} > now()
)`;

/**
 * GET /api/admin/cars
 * WHAT: Returns all marketplace cars with dealer metadata and moderation flags.
 * WHY: Super Admin needs visibility into all vehicle listings across dealerships,
 *      with the ability to search, filter, feature, or remove cars.
 */
export async function GET(request: Request) {
  return apiHandler(async () => {
    // 1. Guard check
    await requireAdmin();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || "";

    // 2. Query cars joined with dealerProfiles
    let query = db
      .select({
        id: cars.id,
        title: cars.title,
        brand: cars.brand,
        model: cars.model,
        year: cars.year,
        price: cars.price,
        mileage: cars.mileage,
        fuelType: cars.fuelType,
        transmission: cars.transmission,
        city: cars.city,
        registrationNumber: cars.registrationNumber,
        isBoosted: isBoostedSql,
        rcVerified: cars.rcVerified,
        isInspected: cars.isInspected,
        pendingApproval: cars.pendingApproval,
        images: cars.images,
        createdAt: cars.createdAt,
        dealerId: cars.dealer,
        dealerBusinessName: dealerProfiles.businessName,
      })
      .from(cars)
      .leftJoin(dealerProfiles, eq(cars.dealer, dealerProfiles.user))
      .$dynamic();

    if (search) {
      query = query.where(
        and(
          isNull(cars.archivedAt),
          or(
            ilike(cars.title, `%${search}%`),
            ilike(cars.brand, `%${search}%`),
            ilike(cars.model, `%${search}%`),
            ilike(cars.registrationNumber, `%${search}%`)
          )
        )
      );
    } else {
      query = query.where(isNull(cars.archivedAt));
    }

    const carList = await query.orderBy(desc(cars.createdAt)).limit(100);

    return { cars: carList };
  });
}
