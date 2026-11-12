import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { publiclyVisible } from "@/lib/car-visibility";
import { db } from "@/lib/db";
import { cars, wishlists } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";

/** Ids of the signed-in user's saved cars that are still public, newest first. */
async function savedCarIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ carId: cars.id })
    .from(wishlists)
    .innerJoin(cars, eq(wishlists.car, cars.id))
    .where(and(eq(wishlists.user, userId), publiclyVisible))
    .orderBy(desc(wishlists.createdAt));
  return rows.map((row) => row.carId);
}

// GET /api/wishlist — { carIds } saved by the signed-in user, newest first.
// Card data for those ids comes from GET /api/cars/by-ids.
export async function GET() {
  return apiHandler(async () => {
    const user = await requireUser();
    return Response.json({ carIds: await savedCarIds(user.id) });
  });
}

// Same loose UUID check as the other wishlist routes.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const mergeSchema = z.object({
  carIds: z.array(z.string().regex(UUID_PATTERN)).max(60),
});

// POST /api/wishlist { carIds } — add cars to the signed-in user's wishlist.
// Idempotent (already-saved cars stay saved), so it is safe for merging the
// cars a visitor saved before signing in. Hidden or unknown cars are skipped.
// Returns the full { carIds } list afterwards.
export async function POST(request: Request) {
  return apiHandler(async () => {
    const user = await requireUser();
    const { carIds } = mergeSchema.parse(await request.json());
    const unique = [...new Set(carIds)];

    if (unique.length > 0) {
      const visible = await db
        .select({ id: cars.id })
        .from(cars)
        .where(and(inArray(cars.id, unique), publiclyVisible));

      if (visible.length > 0) {
        await db
          .insert(wishlists)
          .values(visible.map((car) => ({ user: user.id, car: car.id })))
          .onConflictDoNothing({ target: [wishlists.user, wishlists.car] });
      }
    }

    return Response.json({ carIds: await savedCarIds(user.id) });
  });
}
