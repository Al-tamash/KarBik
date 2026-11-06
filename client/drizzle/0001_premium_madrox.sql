CREATE TABLE "loan_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(15) NOT NULL,
	"city" varchar(100) NOT NULL,
	"employmentType" varchar(50) DEFAULT 'salaried' NOT NULL,
	"monthlyIncome" integer DEFAULT 30000 NOT NULL,
	"loanAmountRequested" integer DEFAULT 300000 NOT NULL,
	"car" uuid,
	"status" varchar(30) DEFAULT 'new' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"userId" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "car" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlists" ALTER COLUMN "car" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "leadSource" varchar(50) DEFAULT 'car_detail' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "isVerifiedByAdmin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "adminNotes" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "verifiedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "loan_leads" ADD CONSTRAINT "loan_leads_car_cars_id_fk" FOREIGN KEY ("car") REFERENCES "public"."cars"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_leads" ADD CONSTRAINT "loan_leads_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "loan_leads_phone_idx" ON "loan_leads" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "loan_leads_created_idx" ON "loan_leads" USING btree ("createdAt" DESC NULLS LAST);