"use client";
import type { ApiPlan } from "@/lib/api-types";

/**
 * PricingContent — Main interactive container for pricing page
 *
 * WHAT: Manages dynamic states for pricing (monthly vs yearly toggle), dealer
 *       session validation, and active subscription verification.
 * WHY:
 * 1. Isolates React hooks (useState, useEffect, session hooks) from the parent Server Component.
 * 2. Provides staggered animated mount transitions for the plans using Framer Motion.
 * 3. Handles monthly vs annual savings calculations and premium toggles fluidly.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAppSession } from "@/lib/auth-client";
import { ShieldCheck, RotateCcw, CreditCard, Sparkles, HelpCircle } from "lucide-react";
import PricingCard from "@/components/PricingCard";



// Animation presets conforming to premium-frontend-design guidelines
const easing: [number, number, number, number] = [0.22, 1, 0.36, 1]; // Expo out transition

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easing },
  },
};

export default function PricingContent({ initialPlans = [] }: { initialPlans?: ApiPlan[] }) {
  const router = useRouter();
  const { data: session } = useAppSession();
  
  const [currentPlanSlug, setCurrentPlanSlug] = useState("free");
  const [loadingMyPlan, setLoadingMyPlan] = useState(false);

  // Load dealer's current active subscription plan from Express backend
  useEffect(() => {
    if (session?.user?.role === "dealer") {
      fetchMyPlan();
    }
  }, [session]);

  async function fetchMyPlan() {
    setLoadingMyPlan(true);
    try {
      const res = await fetch(`/api/subscriptions/my-plan`, {
        credentials: "include", // ensures cookies are sent correctly
      });
      const data = await res.json();
      if (data.plan?.slug) {
        setCurrentPlanSlug(data.plan.slug);
      }
    } catch (err) {
      console.error("Failed to fetch active plan:", err);
    } finally {
      setLoadingMyPlan(false);
    }
  }

  function handleSubscribeSuccess() {
    // Refresh session/plan state and redirect with confirmation query
    fetchMyPlan();
    router.push("/dashboard/billing?success=true");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-alt py-16 sm:py-24">
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        {/* Typographic Asymmetric Header */}
        <motion.div variants={titleVariants} className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 border border-primary-200 mb-4 tracking-wider uppercase">
            <Sparkles className="h-3 w-3" /> Subscription plans
          </span>
          <h1 className="text-balance text-4xl sm:text-5xl font-extrabold text-ink-strong tracking-tight leading-none mb-4 max-w-3xl mx-auto font-display">
            Accelerate your dealership growth
          </h1>
          <p className="text-balance text-base sm:text-lg text-ink-muted max-w-xl mx-auto leading-relaxed">
            Choose a plan that fits your inventory scale. List more cars and boost your best listings to the top of search results.
          </p>
        </motion.div>

        {/* Billing is monthly only. An annual toggle that showed a discount but still
            charged the monthly price was removed until annual billing really exists. */}
        <div className="mb-16" />

        {/* Bento/Modern Grid for Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {initialPlans.map((plan: ApiPlan, index: number) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              index={index}
              isRecommended={plan.slug === "starter"}
              isCurrentPlan={plan.slug === currentPlanSlug}
              user={session?.user}
              onSubscribe={handleSubscribeSuccess}
            />
          ))}
        </div>

        {/* Premium Security & Trust Badges Section */}
        <motion.div
          variants={titleVariants}
          className="border-t border-border pt-16"
        >
          <div className="text-center mb-10">
            <h3 className="text-lg font-bold text-ink-strong mb-2">Dealership FAQ & Trust</h3>
            <p className="text-xs text-ink-muted">Need help deciding? Contact support for custom volume pricing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
            {/* Feature 1 */}
            <div className="flex gap-4.5 items-start">
              <span className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-100 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-ink-strong mb-1">Secure payments</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Payments are fully secured via Razorpay. We accept UPI, Rupay, Visa, Netbanking, and popular wallets.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4.5 items-start">
              <span className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-100 shrink-0">
                <RotateCcw className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-ink-strong mb-1">No auto-renewal</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Each payment gives you 30 days of your plan. Nothing renews automatically, so there is nothing to cancel.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4.5 items-start">
              <span className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-100 shrink-0">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-ink-strong mb-1">Invoices on request</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Need an invoice for a payment? Contact KarBik support on 94947 20878 and we will help.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
