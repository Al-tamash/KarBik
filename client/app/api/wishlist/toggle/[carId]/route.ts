import { and, eq } from "drizzle-orm";
import { publiclyVisible } from "@/lib/car-visibility";
import { db } from "@/lib/db";
import { cars, wishlists } from "@/lib/db/schema";
import { ApiError, apiHandler, requireUser } from "@/lib/guards";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/wishlist/toggle/:carId — add/remove a listing from favorites
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ carId: string }> }
) {
  return apiHandler(async () => {
    const user = await requireUser();
    const { carId } = await params;

    if (!UUID_PATTERN.test(carId)) {
      throw new ApiError(400, "Invalid Car ID format");
    }

    const [carExists] = await db
      .select({ id: cars.id })
      .from(cars)
      .where(and(eq(cars.id, carId), publiclyVisible))
      .limit(1);
    if (!carExists) {
      return Response.json(
        { message: "Car listing not found" },
        { status: 404 }
      );
    }

    const [existing] = await db
      .select({ id: wishlists.id })
      .from(wishlists)
      .where(and(eq(wishlists.user, user.id), eq(wishlists.car, carId)))
      .limit(1);

    if (existing) {
      await db.delete(wishlists).where(eq(wishlists.id, existing.id));
      return Response.json({
        isWishlisted: false,
        message: "Successfully removed from wishlist",
      });
    }

    try {
      await db.insert(wishlists).values({ user: user.id, car: carId });
    } catch {
      // unique constraint race — treat as success
    }
    return Response.json(
      {
        isWishlisted: true,
        message: "Successfully added to wishlist",
      },
      { status: 201 }
    );
  });
}
