"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Faq = { q: string; a: string };

export default function FAQAccordion({ faqs }: { faqs: Faq[] }) {
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  return (
    <section className="max-w-[1280px] mx-auto px-6 py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-ink-strong tracking-tight font-display mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-base text-ink-muted">
          Everything you need to know about purchasing this vehicle.
        </p>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const isOpen = expandedFaqIndex === i;
          return (
            <div
              key={i}
              // Standardized on solid bg-surface surface and light-gray borders with custom shadow for maximum contrast and high-end feel
              className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs hover:border-primary-300 transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => setExpandedFaqIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-surface-alt/60 transition-colors cursor-pointer"
              >
                <h3 className="text-base font-bold text-ink pr-4">
                  {faq.q}
                </h3>
                {/* shrink-0 keeps the accordion chevron icon size solid and uncompressed */}
                <ChevronRight
                  className={`h-5 w-5 text-ink-subtle shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
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
                    <div className="px-6 pb-5 border-t border-border">
                      <p className="text-sm text-ink-muted leading-relaxed pt-4">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
