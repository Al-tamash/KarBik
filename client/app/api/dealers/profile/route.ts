import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { dealerProfiles } from "@/lib/db/schema";
import type { SocialLinks } from "@autobazaar/shared";
import { apiHandler, requireDealer } from "@/lib/guards";
import { generateSlug } from "@/lib/slug";
import {
  deleteFromCloudinary,
  uploadDealerFile,
} from "@/lib/cloudinary-server";
import { parseFormData, validateFiles } from "@/lib/form";
import { normalizeIndianMobile } from "@/lib/inquiry-helpers";

// GET /api/dealers/profile — the signed-in dealer's OWN full profile
// (includes phone and WhatsApp number; the public routes never do).
export async function GET() {
  return apiHandler(async () => {
    const user = await requireDealer();

    const [profile] = await db
      .select()
      .from(dealerProfiles)
      .where(eq(dealerProfiles.user, user.id))
      .limit(1);

    if (!profile) {
      return Response.json({
        user: user.id,
        businessName: "",
        isVerified: false,
        averageRating: 0,
        totalReviews: 0,
      });
    }

    return Response.json(profile);
  });
}

// PATCH /api/dealers/profile — dealer updates micro-website settings
export async function PATCH(request: Request) {
  return apiHandler(async () => {
    const user = await requireDealer();
    const { body, fileGroups } = await parseFormData(request);

    const [existing] = await db
      .select()
      .from(dealerProfiles)
      .where(eq(dealerProfiles.user, user.id))
      .limit(1);

    let profile =
      existing ??
      (
        await db
          .insert(dealerProfiles)
          .values({ user: user.id })
          .returning()
      )[0];

    const updates: Record<string, unknown> = {};

    // ── Slug validation ──
    if (body.slug !== undefined) {
      const cleanSlug = generateSlug(body.slug);

      if (cleanSlug.length < 3) {
        return Response.json(
          { message: "Slug must be at least 3 characters long" },
          { status: 400 }
        );
      }
      if (cleanSlug.length > 60) {
        return Response.json(
          { message: "Slug cannot exceed 60 characters" },
          { status: 400 }
        );
      }

      const [taken] = await db
        .select({ id: dealerProfiles.id })
        .from(dealerProfiles)
        .where(
          and(
            eq(dealerProfiles.slug, cleanSlug),
            ne(dealerProfiles.user, user.id)
          )
        )
        .limit(1);

      if (taken) {
        return Response.json(
          { message: "This URL is already taken. Try a different one." },
          { status: 409 }
        );
      }

      updates.slug = cleanSlug;
    }

    // ── Text fields ──
    if (body.about !== undefined) updates.about = body.about.slice(0, 1000);
    if (body.address !== undefined) updates.address = body.address.slice(0, 300);
    if (body.city !== undefined) updates.city = body.city.slice(0, 100);

    // The phone is where every WhatsApp lead is routed, so a bad number must be
    // rejected here instead of silently breaking lead delivery later. An empty
    // value in the form never wipes an existing number.
    if (body.phone !== undefined && body.phone.trim() !== "") {
      const normalizedPhone = normalizeIndianMobile(body.phone);
      if (!normalizedPhone) {
        return Response.json(
          { message: "Enter a valid 10-digit Indian mobile number" },
          { status: 400 }
        );
      }
      updates.phone = normalizedPhone;
    }

    // ── Social links ──
    if (body.socialLinks !== undefined) {
      let parsedSocialLinks: Partial<SocialLinks> | null = null;
      try {
        parsedSocialLinks = JSON.parse(body.socialLinks) as Partial<SocialLinks>;
      } catch {
        parsedSocialLinks = null;
      }
      if (parsedSocialLinks) {
        const current = profile.socialLinks;
        updates.socialLinks = {
          whatsapp:
            parsedSocialLinks.whatsapp || current?.whatsapp || "",
          instagram:
            parsedSocialLinks.instagram || current?.instagram || "",
          facebook:
            parsedSocialLinks.facebook || current?.facebook || "",
        };
      }
    }

    // ── Banner image ──
    const bannerFiles = fileGroups["bannerImage"] ?? [];
    if (bannerFiles.length > 0) {
      validateFiles(bannerFiles);
      if (profile.bannerImage?.publicId) {
        await deleteFromCloudinary(profile.bannerImage.publicId);
      }
      const result = await uploadDealerFile(
        "autobazaar/dealers",
        Buffer.from(await bannerFiles[0].arrayBuffer())
      );
      updates.bannerImage = result;
    }

    // ── Go-live switch ──
    const slugAfterUpdate =
      (updates.slug as string | undefined) ?? profile.slug;
    if (slugAfterUpdate) {
      updates.microWebsiteEnabled = true;
    }

    if (Object.keys(updates).length > 0) {
      const [updated] = await db
        .update(dealerProfiles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(dealerProfiles.id, profile.id))
        .returning();
      profile = updated;
    }

    return Response.json({
      message: "Profile updated successfully",
      profile,
    });
  });
}
