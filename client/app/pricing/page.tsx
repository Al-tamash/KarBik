import { API_BASE } from "@/lib/api-base";
/**
 * Pricing Page — Subscription Plans (Server Component)
 *
 * WHAT: We refactored this page into a pure Server Component (RSC).
 * WHY:
 * 1. Fetching available plans on the server eliminates client-side network round-trips.
 * 2. Improves SEO and crawler discoverability by serving plan details directly in the initial HTML.
 * 3. Follows the strict Next.js 16 standard where pages are server components by default.
 *
 * Client-side interactivity (toggles, sessions, checkout) is isolated inside <PricingContent />.
 */
import PricingContent from "@/components/PricingContent";

// Define search engine friendly metadata
export const metadata = {
  title: "Pricing Plans & Subscriptions",
  description: "Boost your car listings, get advanced dealer analytics, WhatsApp integration and more. Choose the perfect plan for your dealership.",
};

// Force dynamic on-demand rendering since we fetch live pricing tiers from the database
export const dynamic = "force-dynamic";

// Server-side helper to fetch available plans from the API
async function getPlans() {
  try {
    const res = await fetch(`${API_BASE}/api/subscriptions/plans`, {
      cache: "no-store", // ensure we always fetch the latest active plans
    });
    if (!res.ok) {
      throw new Error("Failed to fetch subscription plans");
    }
    return await res.json();
  } catch (error) {
    // Standard Node console.error for serverside troubleshooting
    console.error("Error fetching plans in RSC:", error);
    return [];
  }
}

export default async function PricingPage() {
  // Fetch plans from the database during request execution
  const plans = await getPlans();

  // Pass plans to our interactive client wrapper
  return <PricingContent initialPlans={plans} />;
}
