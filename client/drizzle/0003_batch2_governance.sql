ALTER TABLE "cars" ADD COLUMN "archivedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "pendingApproval" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "cars_public_created_idx" ON "cars" USING btree ("createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_dealer_buyer_uq" ON "reviews" USING btree ("dealer","buyerId");