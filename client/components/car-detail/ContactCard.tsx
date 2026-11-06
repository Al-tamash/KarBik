"use client";

/**
 * ContactCard Component
 * 
 * WHAT: A beautifully structured, self-contained sticky sidebar component
 *       that shows the car's asking price, EMI options, dealer details,
 *       and provides clear, interactive calls-to-action (WhatsApp & Call Back).
 * 
 * WHY: Separating the right-side sticky panel from the main detail view reduces
 *      the complexity of CarDetailView.js. It encapsulates local calculator state 
 *      and handles rendering cleanly.
 */

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Star,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Phone,
  ShieldCheck,
  Award,
} from "lucide-react";
import EMICalculator from "./EMICalculator";
import LoanApplicationCard from "./LoanApplicationCard";
import type { ApiCar, ApiPublicDealerProfile, ApiReview } from "@/lib/api-types";
import { SUPPORT_PHONE_DISPLAY } from "@/lib/lead-routing";

/* ─── Utilities ───────────────────────────────────────────────────────────── */

// Formats a string to Title Case (e.g. "manual" -> "Manual")
function toTitleCase(str: unknown): string {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Computes the monthly EMI payment using a fixed 9.5% annual interest rate
function calculateDynamicEMI(price: number, downPaymentPct: number, months: number): number {
  const downPayment = price * (downPaymentPct / 100);
  const loanAmount = price - downPayment;
  const monthlyRate = 9.5 / 12 / 100;
  if (loanAmount <= 0) return 0;
  return Math.round(
    (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
  );
}

// Normalizes and validates Indian mobile phone numbers
function normalizeIndianMobile(phone: string | null | undefined): string | null {
  const digits = String(phone || "").replace(/\D/g, "");
  const without =
    digits.startsWith("91") && digits.length === 12
      ? digits.slice(2)
      : digits;
  if (!/^[6-9]\d{9}$/.test(without)) return null;
  return without;
}

// Formats absolute currency values to readable Indian Lakh currency formatting
function formatPrice(price: number | null | undefined): string {
  if (!price) return "Price on request";
  const lakh = price / 100000;
  return `₹ ${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} Lakh`;
}

export default function ContactCard({
  car,
  dealerProfile,
  inquiryStatus,
  inquiryMessage,
  hasInquired,
  sendingInquiry,
  handleWhatsAppClick,
  handleRequestCallback,
  topReview,
}: {
  car: ApiCar;
  dealerProfile: ApiPublicDealerProfile | null;
  inquiryStatus: string;
  inquiryMessage: string;
  hasInquired: boolean;
  sendingInquiry: boolean;
  handleWhatsAppClick: () => void;
  handleRequestCallback: () => void;
  topReview?: ApiReview | null;
}) {
  // Encapsulate local EMI slider states in the sidebar
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [emiTenureSlider, setEmiTenureSlider] = useState(60);

  // Derive dynamic EMI variables locally to keep parent clean
  const dynamicEmi = calculateDynamicEMI(
    car.price,
    downPaymentPercent,
    emiTenureSlider
  );
  const downPaymentAmount = car.price * (downPaymentPercent / 100);

  return (
    <div className="lg:sticky lg:top-24 bg-surface rounded-2xl p-7 flex flex-col gap-6 border border-border shadow-card">
      {/* Title & Key details */}
      <div>
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {car.rcVerified && (
            <span className="inline-flex items-center gap-1 bg-success-50 text-success-700 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-success-200">
              <Check className="h-3 w-3" />
              RTO Verified
            </span>
          )}
          <span className="bg-primary-50 text-primary-700 border border-primary-200/50 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            {car.year} Model
          </span>
          {car.owners && (
            <span className="bg-primary-50 text-primary-700 border border-primary-200/50 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              {toTitleCase(car.owners)}
            </span>
          )}
          {car.isBoosted && (
            <span className="inline-flex items-center gap-1 bg-warning-50 text-warning-700 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-warning-200">
              <Award className="h-3 w-3" /> Featured
            </span>
          )}
          {dealerProfile?.isSample && (
            <span className="inline-flex items-center gap-1 bg-surface-alt text-ink px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border-strong">
              Sample listing
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-ink-strong tracking-tight leading-snug font-display">
          {toTitleCase(car.title)}
        </h1>
        <p className="mt-2 text-xs text-ink-muted">
          {toTitleCase(car.bodyType)} • {toTitleCase(car.fuelType)} • {toTitleCase(car.transmission)}
        </p>
        <p className="text-xs text-ink-muted mt-0.5">
          {(car.mileage || car.mileage || 0).toLocaleString("en-IN")} km driven
        </p>
      </div>

      <hr className="border-border" />

      {/* Price section */}
      <div>
        <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">
          Asking Price
        </p>
        <h2 className="text-3xl font-bold text-primary-600 tracking-tight">
          {formatPrice(car.price)}
        </h2>
        <p className="text-xs text-ink-muted mt-1">
          Ex-showroom, {dealerProfile?.city || "Hyderabad"}
        </p>
      </div>

      <hr className="border-border" />

      {/* Integrated Live EMI Slider Calculator */}
      <EMICalculator
        dynamicEmi={dynamicEmi}
        downPaymentPercent={downPaymentPercent}
        setDownPaymentPercent={setDownPaymentPercent}
        downPaymentAmount={downPaymentAmount}
        emiTenureSlider={emiTenureSlider}
        setEmiTenureSlider={setEmiTenureSlider}
        carPrice={car.price}
      />

      {/* Used Car Loan Pre-Approval Engine (Monetization) */}
      <LoanApplicationCard
        car={car}
        requestedLoanAmount={car.price - downPaymentAmount}
      />

      {/* Solid Dealer Info Card (Removed glass bg-surface/60 -> solid bg-surface-alt) */}
      {dealerProfile && (
        <div className="flex items-center gap-3.5 p-4 bg-surface-alt rounded-xl border border-border">
          {/* shrink-0 prevents this avatar circle from compressing when dealer name is long */}
          <div className="w-11 h-11 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-base shrink-0">
            {(dealerProfile.businessName || "D")[0].toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink-strong">
              {dealerProfile.businessName || "Dealer"}
            </h4>
            {dealerProfile.averageRating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                <span className="text-xs font-semibold text-ink-strong">
                  {dealerProfile.averageRating?.toFixed(1)}
                </span>
                <span className="text-xs text-ink-muted">
                  ({dealerProfile.totalReviews} reviews)
                </span>
              </div>
            )}
            {dealerProfile.city && (
              <p className="text-xs text-ink-muted mt-0.5">
                {dealerProfile.city}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Review snippet at the decision point — a real quote from a real buyer */}
      {topReview?.comment && (
        <div className="rounded-xl border border-border bg-surface-alt p-4">
          <div className="flex items-center gap-0.5 mb-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-3 w-3 ${
                  n <= topReview.rating
                    ? "fill-warning-400 text-warning-400"
                    : "text-border-strong"
                }`}
              />
            ))}
            <span className="ml-1.5 text-xs font-bold text-ink-subtle uppercase tracking-wider">
              {topReview.buyerName || "Verified buyer"}
            </span>
          </div>
          <p className="text-xs text-ink leading-relaxed line-clamp-3">
            “{topReview.comment}”
          </p>
          {dealerProfile?.slug && (dealerProfile.totalReviews ?? 0) > 1 && (
            <Link
              href={`/dealer/${dealerProfile.slug}`}
              className="mt-2 inline-block text-xs font-bold text-primary-600 hover:underline"
            >
              Read all {dealerProfile.totalReviews} reviews →
            </Link>
          )}
        </div>
      )}

      {/* Action Inquiry Alert Status */}
      <AnimatePresence>
        {inquiryStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-3.5 bg-success-50 border border-success-200 rounded-xl text-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-success-800 mt-0.5 shrink-0" />
            <p className="text-success-800 font-medium text-xs leading-relaxed">
              {inquiryMessage}
            </p>
          </motion.div>
        )}
        {inquiryStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-3.5 bg-danger-50 border border-danger-200 rounded-xl"
          >
            <AlertTriangle className="h-4 w-4 text-danger-600 mt-0.5 shrink-0" />
            <p className="text-danger-700 font-medium text-xs leading-relaxed">
              {inquiryMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call to Action CTA Panels */}
      {!hasInquired ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            disabled={sendingInquiry}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer bg-primary-600 hover:bg-primary-700"
          >
            <MessageCircle className="h-4 w-4" />
            Connect via WhatsApp
          </button>
          <button
            type="button"
            onClick={handleRequestCallback}
            disabled={sendingInquiry}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-primary-700 border border-primary-200 bg-surface hover:bg-primary-50/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Phone className="h-4 w-4" />
            {sendingInquiry ? "Connecting..." : "Request Call Back"}
          </button>
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-success-700">
            <CheckCircle2 className="h-4 w-4" />
            Inquiry sent
          </p>
          <p className="text-xs text-ink-muted mt-1">
            Need help? Call or WhatsApp KarBik support: {SUPPORT_PHONE_DISPLAY}
          </p>
        </div>
      )}

      {dealerProfile?.isSample && (
        <p className="rounded-xl border border-border bg-surface-alt p-3 text-xs text-ink-muted leading-relaxed">
          This is a sample listing shown for demonstration. Message KarBik support and we will help you find similar real cars.
        </p>
      )}

      {/* Consent + support: honest, no "no sharing" claim (we do pass your number to the dealer) */}
      <p className="text-xs text-ink-muted leading-relaxed text-center">
        By contacting, you allow KarBik and the dealer to call or WhatsApp you on your number.{" "}
        <Link href="/privacy" className="font-semibold text-primary-600 hover:underline">
          Privacy Policy
        </Link>
      </p>
      <div className="flex items-center justify-center gap-1.5 text-xs text-ink-muted font-medium">
        <ShieldCheck className="h-3.5 w-3.5 text-primary-600" />
        Free for buyers • KarBik support {SUPPORT_PHONE_DISPLAY}
      </div>
    </div>
  );
}
