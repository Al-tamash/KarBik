export type CloudFile = { url: string; publicId: string };

export type CarFeatures = {
  comfort: string[];
  safety: string[];
  interior: string[];
  exterior: string[];
};

export type PlanFeatures = {
  dashboard: boolean;
  analytics: boolean;
  whatsappIntegration: boolean;
  prioritySupport: boolean;
  dealerBadge: string | null;
};

export type SocialLinks = {
  whatsapp: string;
  instagram: string;
  facebook: string;
};

export type WebPushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

export const FUEL_TYPES = [
  "petrol",
  "diesel",
  "electric",
  "cng",
  "hybrid",
  "lpg",
] as const;

export const TRANSMISSIONS = ["manual", "automatic", "cvt", "amt"] as const;

export const BODY_TYPES = [
  "hatchback",
  "sedan",
  "suv",
  "muv",
  "coupe",
  "convertible",
  "pickup",
  "van",
] as const;

export const OWNER_OPTIONS = [
  "1st owner",
  "2nd owner",
  "3rd owner",
  "4th owner or more",
] as const;

export type FuelType = (typeof FUEL_TYPES)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type BodyType = (typeof BODY_TYPES)[number];
export type OwnerOption = (typeof OWNER_OPTIONS)[number];

export function emptyCarFeatures(): CarFeatures {
  return { comfort: [], safety: [], interior: [], exterior: [] };
}
