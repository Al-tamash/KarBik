import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishlists } from "@/lib/db/schema";
import { ApiError, apiHandler, requireUser } from "@/lib/guards";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/wishlist/check/:carId — is this car wishlisted by the buyer?
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ carId: string }> }
) {
  return apiHandler(async () => {
    const user = await requireUser();
    const { carId } = await params;

    if (!UUID_PATTERN.test(carId)) {
      throw new ApiError(400, "Invalid Car ID format");
    }

    const [favorite] = await db
      .select({ id: wishlists.id })
      .from(wishlists)
      .where(and(eq(wishlists.user, user.id), eq(wishlists.car, carId)))
      .limit(1);

    return Response.json({ isWishlisted: Boolean(favorite) });
  });
}
