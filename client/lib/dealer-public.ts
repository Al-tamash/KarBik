import type { DealerProfileRow } from "@/lib/db/schema";
import type { ApiPublicDealerProfile } from "@/lib/api-types";

/**
 * Strip everything a buyer must not see before a dealer profile leaves the
 * server on a public route: the contact phone, the WhatsApp number and the
 * KYC document. Contact only happens through a recorded inquiry.
 *
 * Fields are listed explicitly (allow-list) so a column added to
 * `dealer_profiles` later is private by default.
 */
export function toPublicDealerProfile(
  profile: DealerProfileRow
): ApiPublicDealerProfile {
  return {
    id: profile.id,
    user: profile.user,
    businessName: profile.businessName,
    slug: profile.slug,
    city: profile.city,
    about: profile.about,
    address: profile.address,
    bannerImage: profile.bannerImage,
    isVerified: profile.isVerified,
    isSample: profile.isSample,
    averageRating: profile.averageRating,
    totalReviews: profile.totalReviews,
    microWebsiteEnabled: profile.microWebsiteEnabled,
    socialLinks: {
      instagram: profile.socialLinks?.instagram ?? "",
      facebook: profile.socialLinks?.facebook ?? "",
    },
  };
}

/** Build the wa.me deep link for a dealer. Server-side only. */
export function buildWhatsAppUrl(
  dealerPhone: string | null | undefined,
  text: string
): string | null {
  const digits = String(dealerPhone ?? "").replace(/\D/g, "");
  const national =
    digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(national)) return null;
  return `https://wa.me/91${national}?text=${encodeURIComponent(text)}`;
}
