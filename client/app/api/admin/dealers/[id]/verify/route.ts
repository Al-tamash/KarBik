import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, dealerProfiles } from "@/lib/db/schema";
import { apiHandler, requireAdmin, ApiError } from "@/lib/guards";

/**
 * PATCH /api/admin/dealers/[id]/verify
 * WHAT: Toggles or sets the isVerified badge on a dealer profile.
 * WHY: Allows the Super Admin to approve dealer documentation or revoke verification.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    // 1. Guard check
    await requireAdmin();

    // 2. Next.js 16 async params resolution
    const { id: dealerId } = await params;
    if (!dealerId) throw new ApiError(400, "Dealer ID is required");

    // 3. Parse optional body for explicit boolean, or toggle current value
    const body = (await request.json().catch(() => ({}))) as { isVerified?: boolean };

    const [existing] = await db
      .select({ id: dealerProfiles.id, isVerified: dealerProfiles.isVerified })
      .from(dealerProfiles)
      .where(eq(dealerProfiles.id, dealerId))
      .limit(1);

    if (!existing) throw new ApiError(404, "Dealer not found");

    const nextVerified =
      typeof body.isVerified === "boolean" ? body.isVerified : !existing.isVerified;

    const [updated] = await db
      .update(dealerProfiles)
      .set({
        isVerified: nextVerified,
        updatedAt: new Date(),
      })
      .where(eq(dealerProfiles.id, dealerId))
      .returning();

    // A verified dealer's held listings go live; revoking verification does not
    // re-hide existing live listings (that is a separate moderation decision).
    if (nextVerified) {
      await db
        .update(cars)
        .set({ pendingApproval: false, updatedAt: new Date() })
        .where(eq(cars.dealer, updated.user));
    }

    return {
      success: true,
      dealer: updated,
    };
  });
}

