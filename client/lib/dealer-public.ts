import type { DealerProfileRow } from "@/lib/db/schema";
import type { ApiPublicDealerProfile } from "@/lib/api-types";
import { SHOW_DEALER_BANNER, SHOW_DEALER_REVIEWS } from "@/lib/flags";

/**
 * Strip everything a buyer must not see before a dealer profile leaves the
 * server on a public route: the contact phone, the WhatsApp number, the KYC
 * document, the street address, the social links and the free-text "about"
 * (which dealers fill with an address and claims). Contact only happens through
 * a recorded inquiry.
 *
 * Fields are listed explicitly (allow-list) so a column added to
 * `dealer_profiles` later is private by default.
 */
export function toPublicDealerProfile(
  profile: DealerProfileRow
): ApiPublicDealerProfile {
  return {
    businessName: profile.businessName,
    slug: profile.slug,
    city: profile.city,
    // Off with the flag: the stored banners are not the dealers' own showrooms.
    bannerImage: SHOW_DEALER_BANNER ? profile.bannerImage : null,
    isVerified: profile.isVerified,
    isSample: profile.isSample,
    // Ratings stay out of the public JSON while reviews are switched off (lib/flags.ts).
    averageRating: SHOW_DEALER_REVIEWS ? profile.averageRating : 0,
    totalReviews: SHOW_DEALER_REVIEWS ? profile.totalReviews : 0,
    microWebsiteEnabled: profile.microWebsiteEnabled,
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
