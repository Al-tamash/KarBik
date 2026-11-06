import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars } from "@/lib/db/schema";
import { ApiError, apiHandler, requireDealer } from "@/lib/guards";
import { deleteFromCloudinary } from "@/lib/cloudinary-server";
import { isOwnCarAsset } from "@/lib/asset-ownership";

// DELETE /api/cars/upload/:publicId — dealer only: remove one of THEIR assets.
// The public id contains slashes, so clients send it URL-encoded.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> }
) {
  return apiHandler(async () => {
    const user = await requireDealer();
    const { publicId: rawPublicId } = await params;
    let publicId = rawPublicId;
    try {
      publicId = decodeURIComponent(rawPublicId);
    } catch {
      throw new ApiError(400, "Invalid asset id");
    }

    // 1) Assets uploaded since per-dealer folders: ownership is in the path.
    let owned = isOwnCarAsset(user.id, publicId);

    // 2) Older assets: only if one of this dealer's own listings references it.
    if (!owned) {
      const [match] = await db
        .select({ id: cars.id })
        .from(cars)
        .where(
          and(
            eq(cars.dealer, user.id),
            sql`${cars.images} @> ${JSON.stringify([{ publicId }])}::jsonb`
          )
        )
        .limit(1);
      owned = Boolean(match);
    }

    if (!owned) {
      throw new ApiError(403, "You can only delete your own images");
    }

    await deleteFromCloudinary(publicId);
    return Response.json({ message: "Image deleted" });
  });
}
