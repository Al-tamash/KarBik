import type { ApiCar, ApiPublicDealerProfile, BuyerDealerSummary } from "@/lib/api-types";
import { SHOW_DEALER_REVIEWS } from "@/lib/flags";

/**
 * Remove contact details a dealer may have typed into a description. A phone number,
 * email or link there lets a buyer skip KarBik. Names of workshops or showrooms cannot be
 * caught by code; those are a data edit.
 */
export function scrubDescription(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/https?:\/\/\S+|www\.\S+/gi, "")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "")
    .replace(/(?:\+?91[\s-]?)?\d[\d\s-]{8,}\d/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

/**
 * Props for a client component are serialised into the page HTML, so anything left
 * on the object is public. Buyer pages must not carry the dealer's name, slug, user id
 * or the car's registration number (PRODUCT.md: dealer identity stays behind KarBik).
 */
export function toBuyerCar(car: ApiCar): ApiCar {
  return {
    ...car,
    registrationNumber: "",
    // Only the review flow needs the dealer id, and that flow is off (lib/flags.ts).
    dealer: SHOW_DEALER_REVIEWS ? car.dealer : "",
    description: scrubDescription(car.description),
    dealerProfile: car.dealerProfile
      ? { ...car.dealerProfile, businessName: "", slug: null }
      : car.dealerProfile,
  };
}

export function toBuyerDealer(
  profile: ApiPublicDealerProfile | null,
  car: ApiCar,
): BuyerDealerSummary | null {
  if (!profile) return null;
  return {
    isVerified: Boolean(profile.isVerified),
    isSample: Boolean(profile.isSample),
    city: profile.city || car.city || "Hyderabad",
    averageRating: profile.averageRating ?? 0,
    totalReviews: profile.totalReviews ?? 0,
  };
}
