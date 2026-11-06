/**
 * Seed Script — Inserts default subscription plans into the database
 *
 * RUN THIS ONCE with: npm run seed:plans
 * Safe to re-run — upserts by slug.
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { plans } from "../lib/db/schema";

config({ path: ".env.local" });

const planRows = [
  {
    name: "Free",
    slug: "free",
    priceMonthly: 0,
    priceLabel: "Free",
    listingLimit: 5,
    boostsPerMonth: 0,
    features: {
      dashboard: true,
      analytics: false,
      whatsappIntegration: false,
      prioritySupport: false,
      dealerBadge: null,
    },
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Starter",
    slug: "starter",
    priceMonthly: 99900, // ₹999 in paise
    priceLabel: "₹999/month",
    listingLimit: 25,
    boostsPerMonth: 1,
    features: {
      dashboard: true,
      analytics: false,
      whatsappIntegration: false,
      prioritySupport: false,
      dealerBadge: "Verified",
    },
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Pro",
    slug: "pro",
    priceMonthly: 299900, // ₹2,999 in paise
    priceLabel: "₹2,999/month",
    listingLimit: 9999, // effectively unlimited
    boostsPerMonth: 4,
    features: {
      dashboard: true,
      analytics: true,
      whatsappIntegration: true,
      prioritySupport: true,
      dealerBadge: "Verified PRO",
    },
    sortOrder: 3,
    isActive: true,
  },
] as const;

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  for (const plan of planRows) {
    await db
      .insert(plans)
      .values({ ...plan, features: { ...plan.features } })
      .onConflictDoUpdate({
        target: plans.slug,
        set: {
          name: plan.name,
          priceMonthly: plan.priceMonthly,
          priceLabel: plan.priceLabel,
          listingLimit: plan.listingLimit,
          boostsPerMonth: plan.boostsPerMonth,
          features: plan.features,
          sortOrder: plan.sortOrder,
          isActive: plan.isActive,
          updatedAt: new Date(),
        },
      });
    console.log(`  ✅ Plan "${plan.name}" seeded (${plan.priceLabel})`);
  }

  console.log("\n🎉 All plans seeded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", (error as Error).message);
    process.exit(1);
  });
