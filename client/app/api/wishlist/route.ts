import { and, desc, eq } from "drizzle-orm";
import { publiclyVisible } from "@/lib/car-visibility";
import { db } from "@/lib/db";
import { cars, wishlists } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";

// GET /api/wishlist — all favorited listings for the logged-in buyer
export async function GET() {
  return apiHandler(async () => {
    const user = await requireUser();

    const rows = await db
      .select({ favorite: wishlists, car: cars })
      .from(wishlists)
      .innerJoin(cars, eq(wishlists.car, cars.id))
      .where(and(eq(wishlists.user, user.id), publiclyVisible))
      .orderBy(desc(wishlists.createdAt));

    return Response.json(
      rows.map((row) => ({ ...row.favorite, car: row.car }))
    );
  });
}
