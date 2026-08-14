"use client";

/**
 * WHAT: Dedicated FAQ page for AutoBazaar.
 * WHY: Reduces customer support load, builds pre-purchase trust for both buyers and dealers,
 *      and boosts search engine rankings (great for Google's FAQ Schema and local queries).
 */
import React, { useState } from "react";
import { ChevronRight, HelpCircle, Shield, Store, CreditCard, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("buyers");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const categories = [
    { id: "buyers", label: "For Buyers", icon: Shield },
    { id: "dealers", label: "For Dealers", icon: Store },
    { id: "general", label: "General & Payment", icon: CreditCard }
  ];

  const faqData = {
    buyers: [
      {
        q: "What does 'RTO Verified' mean?",
        a: "RTO (Regional Transport Office) verified means that we crosscheck each vehicle's registration number, chassis number, engine number, and current ownership details directly against official government databases. This guarantees that the car has no active police complaints, no outstanding challans, and is 100% legal for transfer."
      },
      {
        q: "How does the physical car inspection work?",
        a: "Every listing on AutoBazaar from verified dealers must pass a physical 150-point inspection check. The report evaluates major systems: engine, transmission, suspension, brakes, electricals, and exterior paint body structure. You can read the full inspection summary on the car detail page."
      },
      {
        q: "Can I test drive a car before making a payment?",
        a: "Yes, absolutely! Since all listed vehicles are physically present at verified local showrooms in Hyderabad (e.g. Kukatpally, Madhapur, Secunderabad), you can schedule a visit, inspect the car in person, and take it for a test drive. Simply use the 'Send Inquiry' or secure WhatsApp buttons to book your time with the dealer."
      },
      {
        q: "Are the prices listed on AutoBazaar negotiable?",
        a: "All vehicles are listed with fixed, transparent pricing decided by our dealer network in alignment with fair market valuation. This removes the stress and waste of time associated with typical haggling, ensuring you get a fair deal immediately."
      }
    ],
    dealers: [
      {
        q: "How do I list my cars on AutoBazaar?",
        a: "To list your stock, create a dealer account on our registration page. Once registered, you can immediately add car details, upload showroom photos, and write auto-descriptions. You will also get access to your dealer CRM dashboard to manage buyer leads."
      },
      {
        q: "What is the QR Code Standee feature?",
        a: "Every verified dealer gets a unique QR Code generated inside their dashboard. You can download and print this code to place as physical standees inside your showroom. Walk-in buyers can scan the QR code using their phones to instantly view your complete digital inventory, recent listings, and verified reviews."
      },
      {
        q: "How does listing boosting work?",
        a: "If you want to sell a car quickly, you can 'boost' the listing from your dashboard. A boosted car will be pinned to the top of browse search results, featured in our homepage 'Featured Collection', and get up to 5x more clicks. Boosting is available through our premium subscription plans or pay-per-use Razorpay orders."
      }
    ],
    general: [
      {
        q: "What is AutoBazaar's role in transactions?",
        a: "AutoBazaar is a technology-enabled marketplace connecting premium local dealers with verified buyers in Hyderabad. We provide inspection reports, secure lead routing, digital stores, and CRM tools, but the final title transfer and payment are executed directly between you and the dealership."
      },
      {
        q: "Is it safe to pay for plans on this platform?",
        a: "Yes. All dealer subscriptions and boost payments are securely processed through Razorpay—India's leading PCI-DSS compliant payment gateway. We do not store any credit card, bank, or UPI details on our servers."
      },
      {
        q: "How do I contact customer support?",
        a: "You can reach our Hyderabad support team through our dedicated Contact page, send an email to support@autobazaar.com, or message us directly on WhatsApp. We typically respond to all queries within 2 hours during normal business hours (9:00 AM - 7:00 PM)."
      }
    ]
  };

  const handleTabChange = (cat) => {
    setActiveCategory(cat);
    setExpandedIndex(null);
  };

  const currentFaqs = faqData[activeCategory];

  return (
    <div className="bg-neutral-50 min-h-screen font-sans py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Left-aligned Editorial Header */}
        <div className="text-left mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-4 select-none">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
            <span>Support Directory</span>
          </div>
          <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight leading-none mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-neutral-600 max-w-xl leading-relaxed">
            Got questions about purchasing verified cars, RTO reports, or setting up a digital showroom? We have answers.
          </p>
        </div>

        {/* Categories Tab Grid */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-4 px-3 rounded-2xl border text-center sm:text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-primary-600 text-white border-primary-600 shadow-md scale-[1.01]"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                }`}
              >
                <CatIcon className={`h-5 w-5 shrink-0 ${isSelected ? "text-white" : "text-neutral-500"}`} />
                <span className="text-xs sm:text-sm font-bold tracking-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion Block */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3.5"
            >
              {currentFaqs.map((faq, index) => {
                const isOpen = expandedIndex === index;

                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:border-primary-300/80 transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-neutral-50/30 transition-colors cursor-pointer"
                    >
                      <h3 className="text-base font-bold text-neutral-800 pr-4 leading-snug">
                        {faq.q}
                      </h3>
                      <ChevronRight
                        className={`h-5 w-5 text-neutral-400 shrink-0 transition-transform duration-250 ${
                          isOpen ? "rotate-90 text-primary-500" : ""
                        }`}
                      />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 border-t border-neutral-100">
                            <p className="text-sm text-neutral-600 leading-relaxed pt-5">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-14 bg-neutral-900 rounded-3xl p-8 md:p-10 border border-neutral-800 relative overflow-hidden text-left shadow-xl select-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-1.5 text-primary-400 text-xs font-bold mb-2">
                <Sparkles className="h-4 w-4 text-primary-500" />
                <span>Customer Assistance</span>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight mb-2">
                Still have questions?
              </h3>
              <p className="text-xs text-neutral-300 max-w-md leading-relaxed">
                Can't find the answers you're looking for? Reach out directly to our support agents and we will get back to you.
              </p>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.98]"
            >
              Contact Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
