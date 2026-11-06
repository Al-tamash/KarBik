"use client";

/**
 * WHAT: How It Works Page for KarBik.
 * WHY: Bridging the trust and friction gap for first-time visitors.
 *      Explaining exactly how KarBik guarantees safety (buyers)
 *      and drives leads (dealers) in a clear 3-step timeline.
 */
import React, { useState } from "react";
import Link from "next/link";
import { 
  Compass, ShieldCheck, CheckCircle2, ChevronRight,
  Store, Smartphone, MessageSquare, ArrowUpRight, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";

export default function HowItWorks() {
  const [activeSegment, setActiveSegment] = useState("buyers");

  const buyerSteps = [
    {
      step: "01",
      icon: Compass,
      title: "Discover Verified Stock",
      desc: "Browse verified used cars in Hyderabad. Filter dynamically by brand, price range, vehicle type, or specific dealer corridor centers like Kukatpally and Gachibowli."
    },
    {
      step: "02",
      icon: ShieldCheck,
      title: "Review Transparent Verification",
      desc: "Listings show RC verification status, accident history, and — on inspected cars — a downloadable inspection report, so you know the vehicle's real condition before you visit."
    },
    {
      step: "03",
      icon: CheckCircle2,
      title: "Talk to Support, Then the Dealer",
      desc: "Tap WhatsApp or request a call back on a car page. KarBik support will talk to you first, then connect you with the dealer. Visit the showroom, test drive locally and make your final decision."
    }
  ];

  const dealerSteps = [
    {
      step: "01",
      icon: Store,
      title: "Launch Digital Showroom",
      desc: "Register your dealership and upload your physical showroom details. KarBik automatically sets up a custom public microsite for your vehicle inventory."
    },
    {
      step: "02",
      icon: Smartphone,
      title: "List Stock & Generate QR Standees",
      desc: "Upload cars from your dashboard and use AI to generate rich descriptions. Download custom QR standees for your physical yard, letting walk-ins browse digitally."
    },
    {
      step: "03",
      icon: MessageSquare,
      title: "Receive Verified Leads",
      desc: "KarBik support speaks to each buyer first and then forwards the verified enquiry to you. You see it in your dashboard, with a push alert when notifications are on."
    }
  ];

  const currentSteps = activeSegment === "buyers" ? buyerSteps : dealerSteps;

  return (
    <div className="bg-surface-alt min-h-screen font-sans py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Page Editorial Header */}
        <Reveal>
          <div className="text-left max-w-2xl mb-12 md:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100 mb-4 select-none">
              <Sparkles className="h-3.5 w-3.5 text-primary-600" />
              <span>Platform Explainer</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-ink-strong tracking-tight leading-none mb-4">
              How KarBik Works
            </h1>
            <p className="text-base text-ink-muted leading-relaxed">
              Hyderabad&apos;s most transparent pre-owned car network, connecting premium local showrooms with verified buyers. Select your role below to learn more.
            </p>
          </div>
        </Reveal>

        {/* Asymmetrical Tab Selection Header */}
        <div className="flex border-b border-border pb-4 mb-16 items-center justify-between">
          <div className="inline-flex bg-surface-alt/70 p-1 rounded-xl border border-border select-none">
            <button
              onClick={() => setActiveSegment("buyers")}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeSegment === "buyers"
                  ? "bg-surface text-primary-600 shadow-sm"
                  : "text-ink-muted hover:text-ink-strong"
              }`}
            >
              I am a Car Buyer
            </button>
            <button
              onClick={() => setActiveSegment("dealers")}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeSegment === "dealers"
                  ? "bg-surface text-primary-600 shadow-sm"
                  : "text-ink-muted hover:text-ink-strong"
              }`}
            >
              I am a Car Dealer
            </button>
          </div>
        </div>

        {/* Visual 3-Step Sequence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 relative text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSegment}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12"
            >
              {currentSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <div key={idx} className="flex flex-col gap-5 p-2 group relative">
                    
                    {/* Visual Connector Line (Desktop only) */}
                    {idx < 2 && (
                      <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-surface-alt/70 -translate-x-12 z-0" />
                    )}

                    <div className="flex items-center justify-between relative z-10">
                      {/* Step Badge */}
                      <span className="text-4xl font-black text-primary-600/15 tracking-tight group-hover:text-primary-600/30 transition-colors select-none">
                        {step.step}
                      </span>
                      {/* Icon container */}
                      <div className="p-3.5 rounded-2xl bg-surface border border-border text-primary-600 shadow-xs group-hover:border-primary-300 transition-colors">
                        <StepIcon className="h-5 w-5 shrink-0" />
                      </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <h3 className="text-lg font-bold text-ink-strong tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-xs text-ink-muted leading-relaxed max-w-sm">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA Panel */}
        <Reveal>
          <div className="mt-20 bg-neutral-900 rounded-2xl p-8 md:p-14 border border-neutral-800 relative overflow-hidden text-left shadow-xl select-none">
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
                {activeSegment === "buyers" 
                  ? "Ready to find your next inspected car?"
                  : "Boost your showroom leads digitally today"}
              </h2>
              <p className="text-xs text-ink-subtle leading-relaxed">
                {activeSegment === "buyers"
                  ? "Browse our active inventory from trusted showrooms in Hyderabad. Read reports, verify ownerships, and make a transparent purchase."
                  : "Sign up for a dealer account, choose a subscription tier, set up custom QR codes, and start receiving real buyer WhatsApp inquiries."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto shrink-0">
              {activeSegment === "buyers" ? (
                <>
                  <Link 
                    href="/cars"
                    className="inline-flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-6.5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.98]"
                  >
                    <span>Browse All Cars</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link 
                    href="/faq"
                    className="inline-flex items-center justify-center gap-1 bg-transparent hover:bg-neutral-800 text-ink-subtle border border-border px-6.5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all active:scale-[0.98]"
                  >
                    <span>Read Buyer FAQs</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/register?role=dealer"
                    className="inline-flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-6.5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.98]"
                  >
                    <span>Partner Registration</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link 
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-1 bg-transparent hover:bg-neutral-800 text-ink-subtle border border-border px-6.5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all active:scale-[0.98]"
                  >
                    <span>Subscription Plans</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
