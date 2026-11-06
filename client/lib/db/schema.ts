import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type {
  CarFeatures,
  CloudFile,
  PlanFeatures,
  SocialLinks,
  WebPushSubscription,
} from "@autobazaar/shared";

const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return "tsvector";
  },
});

// ─── Enums ─────────────────────────────────────────────────────────

export const fuelTypeEnum = pgEnum("fuel_type", [
  "petrol",
  "diesel",
  "electric",
  "cng",
  "hybrid",
  "lpg",
]);

export const transmissionTypeEnum = pgEnum("transmission_type", [
  "manual",
  "automatic",
  "cvt",
  "amt",
]);

export const bodyTypeEnum = pgEnum("body_type", [
  "hatchback",
  "sedan",
  "suv",
  "muv",
  "coupe",
  "convertible",
  "pickup",
  "van",
]);

export const ownersEnum = pgEnum("owners", [
  "1st owner",
  "2nd owner",
  "3rd owner",
  "4th owner or more",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "contacted",
  "interested",
  "test_drive",
  "closed",
  "lost",
  "fake",
]);

export const inquiryPriorityEnum = pgEnum("inquiry_priority", [
  "low",
  "medium",
  "high",
]);

export const leadQualityEnum = pgEnum("lead_quality", [
  "new",
  "good",
  "high_intent",
  "suspicious",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "created",
  "paid",
  "failed",
]);

export const boostTypeEnum = pgEnum("boost_type", ["1day", "3day", "7day"]);

export const boostStatusEnum = pgEnum("boost_status", [
  "created",
  "paid",
  "active",
  "failed",
  "expired",
]);

// ─── Better Auth tables ────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  role: text("role").notNull().default("buyer"),
  phone: text("phone"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

// ─── Marketplace tables ────────────────────────────────────────────

export const cars = pgTable(
  "cars",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 120 }).notNull(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    variant: text("variant").notNull().default(""),
    year: integer("year").notNull(),
    price: doublePrecision("price").notNull(),
    fuelType: fuelTypeEnum("fuelType").notNull(),
    transmission: transmissionTypeEnum("transmission").notNull(),
    mileage: doublePrecision("mileage").notNull(),
    bodyType: bodyTypeEnum("bodyType").notNull(),
    color: text("color").notNull(),
    owners: ownersEnum("owners").notNull(),
    city: text("city").notNull(),
    registrationNumber: text("registrationNumber").notNull().default(""),
    insuranceValid: text("insuranceValid").notNull().default(""),
    rcVerified: boolean("rcVerified").notNull().default(false),
    engineCC: integer("engineCC"),
    power: text("power").notNull().default(""),
    groundClearance: text("groundClearance").notNull().default(""),
    certifiedMileage: text("certifiedMileage").notNull().default(""),
    features: jsonb("features")
      .$type<CarFeatures>()
      .notNull()
      .default({ comfort: [], safety: [], interior: [], exterior: [] }),
    accidentHistory: boolean("accidentHistory").notNull().default(false),
    serviceHistory: boolean("serviceHistory").notNull().default(false),
    description: text("description").notNull().default(""),
    views: integer("views").notNull().default(0),
    isInspected: boolean("isInspected").notNull().default(false),
    inspectionReport: jsonb("inspectionReport").$type<CloudFile | null>(),
    images: jsonb("images")
      .$type<CloudFile[]>()
      .notNull()
      .default([]),
    dealer: text("dealer")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Soft delete: an archived listing disappears from every public surface but
    // its inquiries and lead audit trail are kept.
    archivedAt: timestamp("archivedAt", { withTimezone: true }),
    // Listings beyond an unverified dealer's free live quota wait here until an
    // admin verifies the dealer (or approves the car).
    pendingApproval: boolean("pendingApproval").notNull().default(false),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      sql`to_tsvector('english', "title" || ' ' || "brand" || ' ' || "model" || ' ' || "variant")`
    ),
  },
  (table) => [
    index("cars_brand_idx").on(table.brand),
    index("cars_price_idx").on(table.price),
    index("cars_year_idx").on(table.year),
    index("cars_fuel_type_idx").on(table.fuelType),
    index("cars_transmission_idx").on(table.transmission),
    index("cars_dealer_created_idx").on(table.dealer, table.createdAt.desc()),
    index("cars_search_idx").using("gin", table.searchVector),
    index("cars_public_created_idx").on(table.createdAt.desc()),
  ]
);

export const dealerProfiles = pgTable("dealer_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user: text("user")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  businessName: text("businessName").notNull().default(""),
  isVerified: boolean("isVerified").notNull().default(false),
  verificationDoc: jsonb("verificationDoc").$type<CloudFile | null>(),
  averageRating: doublePrecision("averageRating").notNull().default(0),
  totalReviews: integer("totalReviews").notNull().default(0),
  slug: varchar("slug", { length: 60 }).unique(),
  about: text("about").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  bannerImage: jsonb("bannerImage").$type<CloudFile | null>(),
  socialLinks: jsonb("socialLinks")
    .$type<SocialLinks>()
    .notNull()
    .default({ whatsapp: "", instagram: "", facebook: "" }),
  microWebsiteEnabled: boolean("microWebsiteEnabled").notNull().default(false),
  // Demo/seed showroom shown with a "Sample listing" label. Its leads and
  // WhatsApp taps go to KarBik support, never to the (fictional) dealer.
  isSample: boolean("isSample").notNull().default(false),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  priceMonthly: integer("priceMonthly").notNull().default(0),
  priceLabel: text("priceLabel").notNull().default("Free"),
  listingLimit: integer("listingLimit").notNull().default(5),
  boostsPerMonth: integer("boostsPerMonth").notNull().default(0),
  features: jsonb("features")
    .$type<PlanFeatures>()
    .notNull()
    .default({
      dashboard: true,
      analytics: false,
      whatsappIntegration: false,
      prioritySupport: false,
      dealerBadge: null,
    }),
  sortOrder: integer("sortOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealer: text("dealer")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  plan: uuid("plan")
    .notNull()
    .references(() => plans.id, { onDelete: "restrict" }),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  razorpayOrderId: text("razorpayOrderId").notNull(),
  razorpayPaymentId: text("razorpayPaymentId"),
  razorpaySignature: text("razorpaySignature"),
  status: paymentStatusEnum("status").notNull().default("created"),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealer: text("dealer")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  plan: uuid("plan")
    .notNull()
    .references(() => plans.id, { onDelete: "restrict" }),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  startDate: timestamp("startDate", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endDate: timestamp("endDate", { withTimezone: true }).notNull(),
  payment: uuid("payment").references(() => payments.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const boosts = pgTable("boosts", {
  id: uuid("id").primaryKey().defaultRandom(),
  car: uuid("car")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  dealer: text("dealer")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  boostType: boostTypeEnum("boostType").notNull(),
  amount: integer("amount").notNull(),
  status: boostStatusEnum("status").notNull().default("created"),
  startDate: timestamp("startDate", { withTimezone: true }),
  endDate: timestamp("endDate", { withTimezone: true }),
  razorpayOrderId: text("razorpayOrderId"),
  razorpayPaymentId: text("razorpayPaymentId"),
  razorpaySignature: text("razorpaySignature"),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reviews = pgTable(
  "reviews",
  {
  id: uuid("id").primaryKey().defaultRandom(),
  dealer: text("dealer")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  buyerName: text("buyerName").notNull(),
  buyerId: text("buyerId").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  },
  (table) => [
    // One review per buyer per dealer, enforced by the database (no race).
    uniqueIndex("reviews_dealer_buyer_uq").on(table.dealer, table.buyerId),
  ]
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 15 }).notNull(),
    message: text("message").notNull(),
    car: uuid("car").references(() => cars.id, { onDelete: "cascade" }),
    buyer: text("buyer")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    dealer: text("dealer")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: inquiryStatusEnum("status").notNull().default("new"),
    priority: inquiryPriorityEnum("priority").notNull().default("medium"),
    notes: text("notes").notNull().default(""),
    lastContactedAt: timestamp("lastContactedAt", { withTimezone: true }),
    followUpAt: timestamp("followUpAt", { withTimezone: true }),
    whatsappMessageCount: integer("whatsappMessageCount").notNull().default(0),
    leadScore: integer("leadScore").notNull().default(50),
    leadQuality: leadQualityEnum("leadQuality").notNull().default("new"),
    leadSignals: jsonb("leadSignals").$type<string[]>().notNull().default([]),
    leadSource: varchar("leadSource", { length: 50 }).notNull().default("car_detail"),
    isVerifiedByAdmin: boolean("isVerifiedByAdmin").notNull().default(false),
    // Callback requests wait here until KarBik support verifies the buyer and
    // forwards them. The dealer cannot see a held lead.
    adminHold: boolean("adminHold").notNull().default(false),
    adminNotes: text("adminNotes").notNull().default(""),
    verifiedAt: timestamp("verifiedAt", { withTimezone: true }),
    markedFakeAt: timestamp("markedFakeAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("inquiries_dealer_created_idx").on(
      table.dealer,
      table.createdAt.desc()
    ),
    index("inquiries_buyer_idx").on(table.buyer),
    index("inquiries_car_idx").on(table.car),
  ]
);

// Append-only audit trail for every lead. Rows are only ever inserted, never
// updated, so a dealer dispute ("I got zero leads") can be answered with
// timestamps, buyer IP and the delivery outcome of each notification.
export const leadEvents = pgTable(
  "lead_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inquiry: uuid("inquiry")
      .notNull()
      .references(() => inquiries.id, { onDelete: "cascade" }),
    dealer: text("dealer")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventType: varchar("eventType", { length: 40 }).notNull(),
    channel: varchar("channel", { length: 20 }).notNull().default("web"),
    ipAddress: varchar("ipAddress", { length: 64 }),
    userAgent: text("userAgent"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("lead_events_inquiry_idx").on(table.inquiry, table.createdAt),
    index("lead_events_dealer_created_idx").on(
      table.dealer,
      table.createdAt.desc()
    ),
    index("lead_events_ip_created_idx").on(table.ipAddress, table.createdAt),
  ]
);

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user: text("user")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    car: uuid("car").references(() => cars.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("wishlists_user_car_uq").on(table.user, table.car)]
);

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  subscription: jsonb("subscription").$type<WebPushSubscription>().notNull(),
  deviceType: text("deviceType").notNull().default("mobile"),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const loanLeads = pgTable(
  "loan_leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 15 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    employmentType: varchar("employmentType", { length: 50 }).notNull().default("salaried"),
    monthlyIncome: integer("monthlyIncome").notNull().default(30000),
    loanAmountRequested: integer("loanAmountRequested").notNull().default(300000),
    car: uuid("car").references(() => cars.id, { onDelete: "set null" }),
    status: varchar("status", { length: 30 }).notNull().default("new"),
    notes: text("notes").notNull().default(""),
    userId: text("userId").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("loan_leads_phone_idx").on(table.phone),
    index("loan_leads_created_idx").on(table.createdAt.desc()),
  ]
);

// ─── Inferred row types ────────────────────────────────────────────

export type UserRow = typeof user.$inferSelect;
export type CarRow = typeof cars.$inferSelect;
export type NewCarRow = typeof cars.$inferInsert;
export type DealerProfileRow = typeof dealerProfiles.$inferSelect;
export type PlanRow = typeof plans.$inferSelect;
export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type BoostRow = typeof boosts.$inferSelect;
export type ReviewRow = typeof reviews.$inferSelect;
export type InquiryRow = typeof inquiries.$inferSelect;
export type LoanLeadRow = typeof loanLeads.$inferSelect;
export type LeadEventRow = typeof leadEvents.$inferSelect;
export type WishlistRow = typeof wishlists.$inferSelect;
export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;
