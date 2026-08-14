"use client";

/**
 * WHAT: How It Works Page for AutoBazaar.
 * WHY: Bridging the trust and friction gap for first-time visitors.
 *      Explaining exactly how AutoBazaar guarantees safety (buyers)
 *      and drives leads (dealers) in a clear 3-step timeline.
 */
import React, { useState } from "react";
import Link from "next/link";
import { 
  Compass, ShieldCheck, CheckCircle2, ChevronRight,
  Store, Smartphone, MessageSquare, ArrowUpRight, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HowItWorks() {
  const [activeSegment, setActiveSegment] = useState("buyers");

  const buyerSteps = [
    {
      step: "01",
      icon: Compass,
      title: "Discover Verified Stock",
      desc: "Browse hundreds of inspected cars in Hyderabad. Filter dynamically by brand, price range, vehicle type, or specific dealer corridor centers like Kukatpally and Gachibowli."
    },
    {
      step: "02",
      icon: ShieldCheck,
      title: "Review Transparent Verification",
      desc: "Every car listing displays a comprehensive 150-point mechanical inspection report and official RTO background verification checks. No hidden repairs, no paperwork issues."
    },
    {
      step: "03",
      icon: CheckCircle2,
      title: "Test Drive & Secure Checkout",
      desc: "Connect directly with local showroom managers via secure pre-filled WhatsApp threads or 15-minute callback requests. Test drive locally and make your final decision."
    }
  ];

  const dealerSteps = [
    {
      step: "01",
      icon: Store,
      title: "Launch Digital Showroom",
      desc: "Register your dealership and upload your physical showroom details. AutoBazaar automatically sets up a custom public microsite for your vehicle inventory."
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
      title: "Receive Hot Leads on WhatsApp",
      desc: "Inquiries are routed directly to your phone. Track buyer behavior, premium boosts, and review analytics securely inside your central CRM dashboard."
    }
  ];

  const currentSteps = activeSegment === "buyers" ? buyerSteps : dealerSteps;

  return (
    <div className="bg-neutral-50 min-h-screen font-sans py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Page Editorial Header */}
        <div className="text-left max-w-2xl mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-4 select-none">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Platform Explainer</span>
          </div>
          <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight leading-none mb-4">
            How AutoBazaar Works
          </h1>
          <p className="text-base text-neutral-600 leading-relaxed">
            Hyderabad's most transparent pre-owned car network, connecting premium local showrooms with verified buyers. Select your role below to learn more.
          </p>
        </div>

        {/* Asymmetrical Tab Selection Header */}
        <div className="flex border-b border-neutral-200 pb-4 mb-16 items-center justify-between">
          <div className="inline-flex bg-neutral-200/60 p-1 rounded-xl border border-neutral-200 select-none">
            <button
              onClick={() => setActiveSegment("buyers")}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeSegment === "buyers"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              I am a Car Buyer
            </button>
            <button
              onClick={() => setActiveSegment("dealers")}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeSegment === "dealers"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
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
                      <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-neutral-200/60 -translate-x-12 z-0" />
                    )}

                    <div className="flex items-center justify-between relative z-10">
                      {/* Step Badge */}
                      <span className="text-4xl font-black text-primary-600/15 tracking-tight group-hover:text-primary-600/30 transition-colors select-none">
                        {step.step}
                      </span>
                      {/* Icon container */}
                      <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 text-primary-600 shadow-xs group-hover:border-primary-300 transition-colors">
                        <StepIcon className="h-5 w-5 shrink-0" />
                      </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
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
        <div className="mt-20 bg-neutral-900 rounded-3xl p-8 md:p-14 border border-neutral-800 relative overflow-hidden text-left shadow-2xl select-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
                {activeSegment === "buyers" 
                  ? "Ready to find your next inspected car?"
                  : "Boost your showroom leads digitally today"}
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
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
                    className="inline-flex items-center justify-center gap-1 bg-transparent hover:bg-neutral-800 text-neutral-300 border border-neutral-750 px-6.5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all active:scale-[0.98]"
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
                    className="inline-flex items-center justify-center gap-1 bg-transparent hover:bg-neutral-800 text-neutral-300 border border-neutral-750 px-6.5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all active:scale-[0.98]"
                  >
                    <span>Subscription Plans</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
