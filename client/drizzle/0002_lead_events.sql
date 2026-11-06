CREATE TABLE "lead_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry" uuid NOT NULL,
	"dealer" text NOT NULL,
	"eventType" varchar(40) NOT NULL,
	"channel" varchar(20) DEFAULT 'web' NOT NULL,
	"ipAddress" varchar(64),
	"userAgent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_inquiry_inquiries_id_fk" FOREIGN KEY ("inquiry") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_dealer_user_id_fk" FOREIGN KEY ("dealer") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lead_events_inquiry_idx" ON "lead_events" USING btree ("inquiry","createdAt");--> statement-breakpoint
CREATE INDEX "lead_events_dealer_created_idx" ON "lead_events" USING btree ("dealer","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "lead_events_ip_created_idx" ON "lead_events" USING btree ("ipAddress","createdAt");