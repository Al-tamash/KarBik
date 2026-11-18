import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, dealerProfiles, inquiries } from "@/lib/db/schema";
import { apiHandler, requireAdmin } from "@/lib/guards";
import { notifyDealerOfLead } from "@/lib/lead-notify";
import { recordLeadEvent } from "@/lib/lead-events";
import { recordAdminAction } from "@/lib/audit";

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
    const admin = await requireAdmin();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    // The dealer sees this note, so it is capped.
    const adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.trim().slice(0, 1000) : "";
    const isVerified = typeof body.isVerified === "boolean" ? body.isVerified : true;

    // The one rule the screen enforces with a tick must hold on the server too: a lead is only
    // verified (and forwarded) when the admin says they spoke to the buyer.
    if (isVerified && body.spokeToBuyer !== true) {
      return Response.json(
        { message: "Confirm that you spoke to the buyer before verifying the lead." },
        { status: 400 }
      );
    }

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
      // Releasing is conditional on the lead still being held, so two clicks or two admins
      // cannot both forward it and alert the dealer twice.
      .where(releaseNow ? and(eq(inquiries.id, id), eq(inquiries.adminHold, true)) : eq(inquiries.id, id))
      .returning();

    if (!updated) {
      const [current] = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
      return { inquiry: current, forwarded: false, message: "This lead was just forwarded by someone else." };
    }

    // The record comes before the alert, so a failed alert cannot leave a forwarded lead unrecorded.
    await recordAdminAction(
      { id: admin.id, email: admin.email },
      {
        action: releaseNow ? "lead.forward" : isVerified ? "lead.verify" : "lead.unverify",
        targetType: "lead",
        targetId: id,
        summary: releaseNow
          ? `Verified and forwarded the lead from ${existing.name} to the dealer`
          : isVerified
            ? `Verified the lead from ${existing.name} (not forwarded)`
            : `Removed verification from the lead from ${existing.name}`,
        note: adminNotes,
        metadata: isVerified ? { spokeToBuyer: true } : {},
      }
    );

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
