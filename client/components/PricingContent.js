"use client";

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
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { ShieldCheck, RotateCcw, CreditCard, Sparkles, HelpCircle, Tag } from "lucide-react";
import PricingCard from "@/components/PricingCard";

const API = process.env.NEXT_PUBLIC_API_URL;

// Animation presets conforming to premium-frontend-design guidelines
const easing = [0.22, 1, 0.36, 1]; // Expo out transition

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easing },
  },
};

export default function PricingContent({ initialPlans = [] }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  
  // Interactive billing toggle: false = Monthly, true = Annual
  const [isYearly, setIsYearly] = useState(false);
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
      const res = await fetch(`${API}/api/subscriptions/my-plan`, {
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
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50 py-16 sm:py-24">
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
          <h1 className="text-balance text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight leading-none mb-4 max-w-3xl mx-auto font-display">
            Accelerate your dealership growth
          </h1>
          <p className="text-balance text-base sm:text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Choose a plan that fits your inventory scale. List more cars, boost listings to page 1, and access deep buyer analytics.
          </p>
        </motion.div>

        {/* Dynamic Billing Switcher (Toggle) with 20% discount highlight */}
        <motion.div
          variants={titleVariants}
          className="flex flex-col items-center justify-center gap-4 mb-16"
        >
          <div className="relative flex items-center bg-neutral-200/60 p-1.5 rounded-full border border-neutral-300/40">
            {/* Sliding Pill Background indicator */}
            <motion.div
              layout
              className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-white shadow-sm border border-neutral-200/50"
              style={{
                width: "calc(50% - 3px)",
                x: isYearly ? "100%" : "0%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setIsYearly(false)}
              className={`relative z-10 px-5 py-2 text-xs font-bold rounded-full transition-colors duration-200 whitespace-nowrap ${
                !isYearly ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`relative z-10 px-5 py-2 text-xs font-bold rounded-full transition-colors duration-200 whitespace-nowrap ${
                isYearly ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Annual Billing
            </button>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent-600 bg-accent-50 border border-accent-200/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            <Tag className="h-3 w-3" /> Save 20% on Annual
          </span>
        </motion.div>

        {/* Bento/Modern Grid for Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {initialPlans.map((plan, index) => (
            <PricingCard
              key={plan._id}
              plan={plan}
              index={index}
              isRecommended={plan.slug === "starter"}
              isCurrentPlan={plan.slug === currentPlanSlug}
              isYearly={isYearly}
              user={session?.user}
              onSubscribe={handleSubscribeSuccess}
            />
          ))}
        </div>

        {/* Premium Security & Trust Badges Section */}
        <motion.div
          variants={titleVariants}
          className="border-t border-neutral-200/80 pt-16"
        >
          <div className="text-center mb-10">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Dealership FAQ & Trust</h3>
            <p className="text-xs text-neutral-500">Need help deciding? Contact support for custom volume pricing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
            {/* Feature 1 */}
            <div className="flex gap-4.5 items-start">
              <span className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-100 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 mb-1">Secure payments</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
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
                <h4 className="text-sm font-bold text-neutral-900 mb-1">Cancel anytime</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  No lock-ins. You can downgrade or cancel your subscription directly from your billing tab at any point.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4.5 items-start">
              <span className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-100 shrink-0">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 mb-1">GST invoices</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Enter your GSTIN during checkout to claim input tax credit (ITC) on all subscription and boost payments.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
