"use client";

/**
 * ⚠️ DEPRECATED — DO NOT RENDER.
 *
 * This component contains FABRICATED testimonials (invented names, quotes,
 * "180+ Cars Sold" stats, "Verified Purchase" tags) with no backing data.
 * It was removed from the homepage during the honesty pass of the redesign.
 *
 * To bring social proof back properly: expose a public reviews feed from the
 * existing `reviews` table (real buyer reviews per dealer) and render THAT
 * here instead of hardcoding quotes.
 */
import { useState } from "react";
import { Star, Quote, ArrowRight, ArrowLeft, ShieldCheck, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Testimonials() {
  const [activeTab, setActiveTab] = useState("buyers"); // 'buyers' | 'dealers'
  const [currentIndex, setCurrentIndex] = useState(0);

  const buyerTestimonials = [
    {
      quote: "KarBik completely transformed how I bought my family car. Finding a verified dealer in Kukatpally was so easy, and the inspection report gave me the confidence I needed to buy without worrying about hidden issues.",
      author: "Aditya Reddy",
      role: "Software Engineer, Gachibowli",
      rating: 5,
      vehicle: "Honda City 2021 (VTEC)",
      tag: "Buyer Review",
      avatar: "AR"
    },
    {
      quote: "The transparency is incredible. I saw the exact car specs, connected with the dealer via WhatsApp, and finished the purchase in 2 days. The fixed price policy saved me from annoying negotiations.",
      author: "Nisha Rao",
      role: "HR Professional, Madhapur",
      rating: 5,
      vehicle: "Hyundai i20 2020 (Asta)",
      tag: "Verified Purchase",
      avatar: "NR"
    },
    {
      quote: "Buying a pre-owned car in Hyderabad can be stressful with so many unverified brokers. KarBik only hosts certified local showrooms, which made my purchase of a Tata Nexon incredibly smooth and safe.",
      author: "Siddharth Sen",
      role: "Business Owner, Secunderabad",
      rating: 5,
      vehicle: "Tata Nexon 2022 (XZ+)",
      tag: "Inspected Passed",
      avatar: "SS"
    }
  ];

  const dealerTestimonials = [
    {
      quote: "KarBik has become our primary source of premium leads. The QR code feature in our showroom lets walk-in customers instantly scan and see our digital storefront. We've closed 15 sales in the last month alone!",
      author: "Vikram Malhotra",
      role: "Malhotra Motors, Jubilee Hills",
      rating: 5,
      carsSold: "180+ Cars Sold",
      tag: "Premium Partner",
      avatar: "VM"
    },
    {
      quote: "The CRM dashboard helps us track every customer inquiry. Plus, boosting our premium stock (like SUVs) gives us high-intent buyers who are ready to make a down payment immediately. Highly recommended!",
      author: "K. R. Srinivas",
      role: "Sri Sai Cars, Kukatpally",
      rating: 5,
      carsSold: "340+ Cars Sold",
      tag: "Certified Dealer",
      avatar: "KS"
    }
  ];

  const activeTestimonials = activeTab === "buyers" ? buyerTestimonials : dealerTestimonials;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeTestimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + activeTestimonials.length) % activeTestimonials.length);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentIndex(0);
  };

  const current = activeTestimonials[currentIndex];

  return (
    <section className="py-20 bg-surface-alt border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Heading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-8 text-left">
            <h2 className="text-3xl font-extrabold text-ink-strong tracking-tight">
              Trusted by Hundreds of Hyderabadis
            </h2>
            <p className="text-sm text-ink-muted mt-1 max-w-xl">
              Discover how KarBik connects passionate car buyers with transparent, verified local dealers.
            </p>
          </div>

          {/* Toggle Tab Pills */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="inline-flex bg-surface-alt/70 p-1 rounded-xl border border-border">
              <button
                onClick={() => handleTabChange("buyers")}
                className={`px-4.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "buyers"
                    ? "bg-surface text-primary-600 shadow-sm"
                    : "text-ink-muted hover:text-ink-strong"
                }`}
              >
                Buyer Stories
              </button>
              <button
                onClick={() => handleTabChange("dealers")}
                className={`px-4.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "dealers"
                    ? "bg-surface text-primary-600 shadow-sm"
                    : "text-ink-muted hover:text-ink-strong"
                }`}
              >
                Dealer Success
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Frame - Left-aligned Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-surface rounded-2xl border border-border shadow-sm overflow-hidden min-h-[380px]">
          
          {/* Left Visual Accent Block */}
          <div className="lg:col-span-4 bg-primary-600 text-white p-8 md:p-12 flex flex-col justify-between text-left relative overflow-hidden select-none">
            {/* Subtle geometric circles to break color weight */}
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary-700 rounded-full opacity-60" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500 rounded-full opacity-40" />

            <div className="relative z-10">
              <Quote className="h-10 w-10 text-primary-200/80 mb-6" />
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary-700/85 border border-primary-500/30 text-primary-100">
                {current.tag}
              </span>
            </div>

            <div className="relative z-10 mt-12 lg:mt-0">
              {activeTab === "buyers" ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary-200 text-xs font-bold">
                    <UserCheck className="h-4 w-4" />
                    <span>Verified Buyer</span>
                  </div>
                  <p className="text-lg font-black tracking-tight">{(current as { vehicle?: string }).vehicle}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary-200 text-xs font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verified Partner</span>
                  </div>
                  <p className="text-lg font-black tracking-tight">{(current as { carsSold?: string }).carsSold}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Quote details Block */}
          <div className="lg:col-span-8 p-8 md:p-14 flex flex-col justify-between text-left relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${currentIndex}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* Quote Content */}
                <div>
                  <div className="flex items-center gap-1 text-warning-500 mb-6">
                    {Array(current.rating).fill(null).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning-500" />
                    ))}
                  </div>

                  <blockquote className="text-lg md:text-xl font-medium text-ink leading-relaxed font-sans">
                    &quot;{current.quote}&quot;
                  </blockquote>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border">
                  <div className="h-12 w-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 font-extrabold text-sm select-none">
                    {current.avatar}
                  </div>
                  <div>
                    <cite className="not-italic text-base font-bold text-ink-strong block">
                      {current.author}
                    </cite>
                    <span className="text-xs text-ink-muted font-medium">
                      {current.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <div className="flex gap-3 mt-8 lg:absolute lg:bottom-14 lg:right-14">
              <button
                onClick={handlePrev}
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-ink-muted bg-surface hover:bg-surface-alt active:scale-95 transition-all cursor-pointer shadow-xs"
                title="Previous testimonial"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-ink-muted bg-surface hover:bg-surface-alt active:scale-95 transition-all cursor-pointer shadow-xs"
                title="Next testimonial"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
