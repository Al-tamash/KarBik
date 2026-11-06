CREATE TYPE "public"."body_type" AS ENUM('hatchback', 'sedan', 'suv', 'muv', 'coupe', 'convertible', 'pickup', 'van');--> statement-breakpoint
CREATE TYPE "public"."boost_status" AS ENUM('created', 'paid', 'active', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."boost_type" AS ENUM('1day', '3day', '7day');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('petrol', 'diesel', 'electric', 'cng', 'hybrid', 'lpg');--> statement-breakpoint
CREATE TYPE "public"."inquiry_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'contacted', 'interested', 'test_drive', 'closed', 'lost', 'fake');--> statement-breakpoint
CREATE TYPE "public"."lead_quality" AS ENUM('new', 'good', 'high_intent', 'suspicious');--> statement-breakpoint
CREATE TYPE "public"."owners" AS ENUM('1st owner', '2nd owner', '3rd owner', '4th owner or more');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('created', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transmission_type" AS ENUM('manual', 'automatic', 'cvt', 'amt');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car" uuid NOT NULL,
	"dealer" text NOT NULL,
	"boostType" "boost_type" NOT NULL,
	"amount" integer NOT NULL,
	"status" "boost_status" DEFAULT 'created' NOT NULL,
	"startDate" timestamp with time zone,
	"endDate" timestamp with time zone,
	"razorpayOrderId" text,
	"razorpayPaymentId" text,
	"razorpaySignature" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(120) NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"variant" text DEFAULT '' NOT NULL,
	"year" integer NOT NULL,
	"price" double precision NOT NULL,
	"fuelType" "fuel_type" NOT NULL,
	"transmission" "transmission_type" NOT NULL,
	"mileage" double precision NOT NULL,
	"bodyType" "body_type" NOT NULL,
	"color" text NOT NULL,
	"owners" "owners" NOT NULL,
	"city" text NOT NULL,
	"registrationNumber" text DEFAULT '' NOT NULL,
	"insuranceValid" text DEFAULT '' NOT NULL,
	"rcVerified" boolean DEFAULT false NOT NULL,
	"engineCC" integer,
	"power" text DEFAULT '' NOT NULL,
	"groundClearance" text DEFAULT '' NOT NULL,
	"certifiedMileage" text DEFAULT '' NOT NULL,
	"features" jsonb DEFAULT '{"comfort":[],"safety":[],"interior":[],"exterior":[]}'::jsonb NOT NULL,
	"accidentHistory" boolean DEFAULT false NOT NULL,
	"serviceHistory" boolean DEFAULT false NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"isInspected" boolean DEFAULT false NOT NULL,
	"inspectionReport" jsonb,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dealer" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', "title" || ' ' || "brand" || ' ' || "model" || ' ' || "variant")) STORED
);
--> statement-breakpoint
CREATE TABLE "dealer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" text NOT NULL,
	"businessName" text DEFAULT '' NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"verificationDoc" jsonb,
	"averageRating" double precision DEFAULT 0 NOT NULL,
	"totalReviews" integer DEFAULT 0 NOT NULL,
	"slug" varchar(60),
	"about" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"bannerImage" jsonb,
	"socialLinks" jsonb DEFAULT '{"whatsapp":"","instagram":"","facebook":""}'::jsonb NOT NULL,
	"microWebsiteEnabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dealer_profiles_user_unique" UNIQUE("user"),
	CONSTRAINT "dealer_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(15) NOT NULL,
	"message" text NOT NULL,
	"car" uuid NOT NULL,
	"buyer" text NOT NULL,
	"dealer" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"priority" "inquiry_priority" DEFAULT 'medium' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"lastContactedAt" timestamp with time zone,
	"followUpAt" timestamp with time zone,
	"whatsappMessageCount" integer DEFAULT 0 NOT NULL,
	"leadScore" integer DEFAULT 50 NOT NULL,
	"leadQuality" "lead_quality" DEFAULT 'new' NOT NULL,
	"leadSignals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"markedFakeAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealer" text NOT NULL,
	"plan" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"razorpayOrderId" text NOT NULL,
	"razorpayPaymentId" text,
	"razorpaySignature" text,
	"status" "payment_status" DEFAULT 'created' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(60) NOT NULL,
	"priceMonthly" integer DEFAULT 0 NOT NULL,
	"priceLabel" text DEFAULT 'Free' NOT NULL,
	"listingLimit" integer DEFAULT 5 NOT NULL,
	"boostsPerMonth" integer DEFAULT 0 NOT NULL,
	"features" jsonb DEFAULT '{"dashboard":true,"analytics":false,"whatsappIntegration":false,"prioritySupport":false,"dealerBadge":null}'::jsonb NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_name_unique" UNIQUE("name"),
	CONSTRAINT "plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"endpoint" text NOT NULL,
	"subscription" jsonb NOT NULL,
	"deviceType" text DEFAULT 'mobile' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealer" text NOT NULL,
	"buyerName" text NOT NULL,
	"buyerId" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealer" text NOT NULL,
	"plan" uuid NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"startDate" timestamp with time zone DEFAULT now() NOT NULL,
	"endDate" timestamp with time zone NOT NULL,
	"payment" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"role" text DEFAULT 'buyer' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" text NOT NULL,
	"car" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boosts" ADD CONSTRAINT "boosts_car_cars_id_fk" FOREIGN KEY ("car") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boosts" ADD CONSTRAINT "boosts_dealer_user_id_fk" FOREIGN KEY ("dealer") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_dealer_user_id_fk" FOREIGN KEY ("dealer") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_profiles" ADD CONSTRAINT "dealer_profiles_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_car_cars_id_fk" FOREIGN KEY ("car") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_buyer_user_id_fk" FOREIGN KEY ("buyer") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_dealer_user_id_fk" FOREIGN KEY ("dealer") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_dealer_user_id_fk" FOREIGN KEY ("dealer") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_plan_plans_id_fk" FOREIGN KEY ("plan") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_dealer_user_id_fk" FOREIGN KEY ("dealer") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_dealer_user_id_fk" FOREIGN KEY ("dealer") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_plans_id_fk" FOREIGN KEY ("plan") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_payment_payments_id_fk" FOREIGN KEY ("payment") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_car_cars_id_fk" FOREIGN KEY ("car") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cars_brand_idx" ON "cars" USING btree ("brand");--> statement-breakpoint
CREATE INDEX "cars_price_idx" ON "cars" USING btree ("price");--> statement-breakpoint
CREATE INDEX "cars_year_idx" ON "cars" USING btree ("year");--> statement-breakpoint
CREATE INDEX "cars_fuel_type_idx" ON "cars" USING btree ("fuelType");--> statement-breakpoint
CREATE INDEX "cars_transmission_idx" ON "cars" USING btree ("transmission");--> statement-breakpoint
CREATE INDEX "cars_dealer_created_idx" ON "cars" USING btree ("dealer","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "cars_search_idx" ON "cars" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "inquiries_dealer_created_idx" ON "inquiries" USING btree ("dealer","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "inquiries_buyer_idx" ON "inquiries" USING btree ("buyer");--> statement-breakpoint
CREATE INDEX "inquiries_car_idx" ON "inquiries" USING btree ("car");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlists_user_car_uq" ON "wishlists" USING btree ("user","car");