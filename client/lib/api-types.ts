/**
 * Client-side shapes for JSON returned by /api route handlers.
 * Dates arrive as ISO strings over the wire.
 */
import type {
  CarFeatures,
  CloudFile,
  PlanFeatures,
  SocialLinks,
} from "@autobazaar/shared";

export type { CarFeatures, CloudFile, PlanFeatures, SocialLinks };

export type FuelType =
  | "petrol"
  | "diesel"
  | "electric"
  | "cng"
  | "hybrid"
  | "lpg";
export type TransmissionType = "manual" | "automatic" | "cvt" | "amt";
export type BodyType =
  | "hatchback"
  | "sedan"
  | "suv"
  | "muv"
  | "coupe"
  | "convertible"
  | "pickup"
  | "van";
export type OwnerOption =
  | "1st owner"
  | "2nd owner"
  | "3rd owner"
  | "4th owner or more";

export type ApiCar = {
  id: string;
  title: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  mileage: number;
  color: string;
  owners: string;
  city: string;
  registrationNumber: string;
  insuranceValid: string;
  rcVerified: boolean;
  engineCC: number | null;
  power: string;
  groundClearance: string;
  certifiedMileage: string;
  features: CarFeatures;
  accidentHistory: boolean;
  serviceHistory: boolean;
  description: string;
  views: number;
  isInspected: boolean;
  inspectionReport: CloudFile | null;
  images: CloudFile[];
  dealer: string;
  createdAt: string;
  updatedAt: string;
  isBoosted?: boolean;
  // true while an unverified dealer's extra listing waits for admin approval
  pendingApproval?: boolean;
  // set by GET /api/cars/:id: the listing belongs to a sample (demo) showroom
  dealerIsSample?: boolean;
  dealerProfile?: ApiDealerSummary | null;
};

export type ApiDealerSummary = {
  businessName: string;
  slug: string | null;
  city: string;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  // Demo showroom: shown with a "Sample listing" label, leads go to KarBik support.
  isSample?: boolean;
};

/**
 * All a buyer page may know about a dealer. No name, slug, address or phone:
 * KarBik support names the dealer only after the lead (see PRODUCT.md).
 */
export type BuyerDealerSummary = {
  isVerified: boolean;
  isSample: boolean;
  city: string;
  averageRating: number;
  totalReviews: number;
};

export type ApiDealerProfile = ApiDealerSummary & {
  id: string;
  user: string;
  about: string;
  phone: string;
  address: string;
  bannerImage: CloudFile | null;
  verificationDoc: CloudFile | null;
  socialLinks: SocialLinks;
  microWebsiteEnabled: boolean;
};

/**
 * What public routes return for a dealer: no phone, no WhatsApp number, no KYC
 * document. Buyers reach the dealer only through a recorded inquiry.
 */
export type ApiPublicDealerProfile = ApiDealerSummary & {
  id: string;
  user: string;
  about: string;
  address: string;
  bannerImage: CloudFile | null;
  socialLinks: Pick<SocialLinks, "instagram" | "facebook">;
  microWebsiteEnabled: boolean;
};

export type InquiryStatus =
  | "new"
  | "contacted"
  | "interested"
  | "test_drive"
  | "closed"
  | "lost"
  | "fake";
export type InquiryPriority = "low" | "medium" | "high";
export type LeadQuality = "new" | "good" | "high_intent" | "suspicious";

export type ApiInquiry = {
  id: string;
  name: string;
  phone: string;
  message: string;
  // null for showroom-level inquiries (a callback request to a dealer profile).
  car:
    | (Pick<ApiCar, "id"> &
        Partial<Pick<ApiCar, "title" | "brand" | "year" | "price" | "images">>)
    | null;
  buyer: string;
  dealer: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  notes: string;
  lastContactedAt: string | null;
  followUpAt: string | null;
  whatsappMessageCount: number;
  leadScore: number;
  leadQuality: LeadQuality;
  leadSignals: string[];
  leadSource?: string;
  isVerifiedByAdmin?: boolean;
  adminNotes?: string;
  verifiedAt?: string | null;
  markedFakeAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiPlan = {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceLabel: string;
  listingLimit: number;
  boostsPerMonth: number;
  features: PlanFeatures;
  sortOrder: number;
  isActive: boolean;
};

export type ApiSubscription = {
  id: string;
  plan: string;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
};

export type ApiMyPlanResponse = {
  subscription: ApiSubscription | null;
  plan: ApiPlan | null;
  isFreeTier: boolean;
};

export type ApiReview = {
  id: string;
  dealer: string;
  buyerName: string;
  buyerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiAnalyticsResponse = {
  overview: {
    totalListings: number;
    totalViews: number;
    totalInquiries: number;
    activeBoosts: number;
    conversionRate: string | number;
  };
  topCars: Array<
    Pick<ApiCar, "id" | "title" | "brand" | "price" | "views"> & {
      images: CloudFile[];
      inquiryCount: number;
      _id?: string;
    }
  >;
};

export type ApiLoanLead = {
  id: string;
  name: string;
  phone: string;
  city: string;
  employmentType: string;
  monthlyIncome: number;
  loanAmountRequested: number;
  car?: Pick<ApiCar, "id" | "title" | "brand" | "price"> | null;
  status: string;
  notes: string;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiSessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  phone?: string | null;
};
