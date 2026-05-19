/**
 * Seed Script — Inserts default subscription plans into the database
 *
 * RUN THIS ONCE with: node scripts/seedPlans.js
 * Safe to re-run — uses "upsert" which means:
 * - If a plan with that slug EXISTS → update it
 * - If it DOESN'T exist → insert it
 *
 * WHY A SEED SCRIPT?
 * Our Plan model stores plans in MongoDB, but an empty database
 * has no plans. This script fills the database with our initial
 * plan offerings — like stocking a store before opening day.
 */
import "dotenv/config";
import mongoose from "mongoose";
import Plan from "../models/Plan.js";

const plans = [
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
    boostsPerMonth: 5,
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
    boostsPerMonth: 20,
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
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    for (const plan of plans) {
      // findOneAndUpdate with upsert = "find by slug, update everything, or insert if new"
      await Plan.findOneAndUpdate({ slug: plan.slug }, plan, { upsert: true });
      console.log(`  ✅ Plan "${plan.name}" seeded (${plan.priceLabel})`);
    }

    console.log("\n🎉 All plans seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

seed();
