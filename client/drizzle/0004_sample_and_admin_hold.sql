ALTER TABLE "dealer_profiles" ADD COLUMN "isSample" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "adminHold" boolean DEFAULT false NOT NULL;