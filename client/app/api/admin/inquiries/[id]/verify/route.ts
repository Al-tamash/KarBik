import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, dealerProfiles, inquiries } from "@/lib/db/schema";
import { apiHandler, requireAdmin } from "@/lib/guards";
import { notifyDealerOfLead } from "@/lib/lead-notify";
import { recordLeadEvent } from "@/lib/lead-events";

/**
 * PATCH /api/admin/inquiries/[id]/verify
 *
 * WHAT: KarBik support has called the buyer and confirmed the request. This marks
 *       the lead verified, saves the notes and — if it was held — FORWARDS it to
 *       the dealer (the dealer is alerted by push, with an email fallback).
 * WHY:  Callback requests wait for support first. A lead for a sample (demo)
 *       showroom is verified but never forwarded: there is no real dealer.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    await requireAdmin();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const adminNotes = typeof body.adminNotes === "string" ? body.adminNotes : "";
    const isVerified = typeof body.isVerified === "boolean" ? body.isVerified : true;

    const [existing] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, id))
      .limit(1);
    if (!existing) {
      return Response.json({ message: "Inquiry not found" }, { status: 404 });
    }

    const [dealerRow] = await db
      .select({ isSample: dealerProfiles.isSample })
      .from(dealerProfiles)
      .where(eq(dealerProfiles.user, existing.dealer))
      .limit(1);
    const isSample = dealerRow?.isSample ?? false;

    // Forward only when verifying a held lead for a real dealer.
    const releaseNow = isVerified && existing.adminHold && !isSample;

    const [updated] = await db
      .update(inquiries)
      .set({
        isVerifiedByAdmin: isVerified,
        adminNotes,
        verifiedAt: isVerified ? new Date() : null,
        // Verifying lifts the lead; un-verifying keeps a manual priority/quality
        // choice the dealer may have made instead of overwriting it.
        ...(isVerified ? { priority: "high" as const, leadQuality: "high_intent" as const } : {}),
        adminHold: releaseNow ? false : existing.adminHold,
        updatedAt: new Date(),
      })
      .where(eq(inquiries.id, id))
      .returning();

    if (releaseNow) {
      const [car] = existing.car
        ? await db
            .select({ brand: cars.brand, title: cars.title, images: cars.images })
            .from(cars)
            .where(eq(cars.id, existing.car))
            .limit(1)
        : [];

      await recordLeadEvent({
        inquiry: existing.id,
        dealer: existing.dealer,
        eventType: "released_to_dealer",
        channel: "callback",
        metadata: { verifiedBySupport: true },
      });
      await notifyDealerOfLead({
        inquiryId: existing.id,
        dealerId: existing.dealer,
        buyerName: existing.name,
        subject: car ? `${car.brand} ${car.title}` : "General Showroom Inquiry",
        message: existing.message,
        carImage: car?.images?.[0]?.url,
        channel: "callback",
      });
    }

    return {
      inquiry: updated,
      forwarded: releaseNow,
      message: releaseNow
        ? "Lead verified and forwarded to the dealer"
        : isSample && isVerified
          ? "Lead verified (sample listing: not forwarded to any dealer)"
          : "Lead verification updated successfully",
    };
  });
}
