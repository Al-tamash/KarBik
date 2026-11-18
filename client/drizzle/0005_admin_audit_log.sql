CREATE TABLE "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"actorEmail" text DEFAULT '' NOT NULL,
	"action" varchar(60) NOT NULL,
	"targetType" varchar(30) NOT NULL,
	"targetId" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "admin_audit_created_idx" ON "admin_audit_log" USING btree ("createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "admin_audit_target_idx" ON "admin_audit_log" USING btree ("targetType","targetId","createdAt");