"use client";

/**
 * CarDetailView — Redesigned to match Stitch reference design
 *
 * WHAT: Premium car detail page with fullscreen hero gallery, 2-column sticky
 *       layout (specs + glass pricing card), EMI calculator, features checklist,
 *       similar cars section, and FAQ accordion.
 *
 * WHY: This is the critical conversion page. The visual redesign mirrors the
 *      Stitch reference: cinematic hero, bento spec grid, glass-panel sidebar
 *      pricing with live EMI, WhatsApp CTA, and editorial FAQ below.
 *
 * DESIGN: Clean, editorial, handcrafted feel. Indigo primary palette with
 *         controlled spacing. No generic AI-slop patterns.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Paintbrush,
  Users,
  MapPin,
  Car,
  Check,
  X,
  Heart,
  Share2,
  ShieldCheck,
  FileText,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Star,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import cloudinaryLoader from "@/lib/cloudinary-loader";

import ImageGallery from "./car-detail/ImageGallery";
import SpecGrid from "./car-detail/SpecGrid";
import FAQAccordion from "./car-detail/FAQAccordion";
import ContactCard from "./car-detail/ContactCard";

const API = process.env.NEXT_PUBLIC_API_URL;

/* ─── Utilities ───────────────────────────────────────────────────────────── */

function toTitleCase(str) {
  if (str === null || str === undefined || str === "") return "";
  return String(str)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeIndianMobile(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const without =
    digits.startsWith("91") && digits.length === 12
      ? digits.slice(2)
      : digits;
  if (!/^[6-9]\d{9}$/.test(without)) return null;
  return without;
}

function formatPrice(price) {
  if (!price) return "Price on request";
  const lakh = price / 100000;
  return `₹ ${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} Lakh`;
}



/* ─── FAQs ───────────────────────────────────────────────────────────────── */
const faqs = [
  {
    q: "Is the price negotiable?",
    a: "Our vehicles are priced competitively based on real-time market data to ensure a fair and transparent process. While there is minimal room for negotiation, we do offer excellent trade-in values and competitive financing rates.",
  },
  {
    q: "Does this car come with a warranty?",
    a: "Yes, this vehicle includes a 6-month comprehensive dealer warranty covering major mechanical and electrical components. Extended warranty options are also available at the time of purchase.",
  },
  {
    q: "Can I arrange my own financing?",
    a: "Absolutely. While we partner with leading banks like HDFC, SBI, ICICI, and Axis Bank to offer seamless financing at competitive rates starting from 9.5%, you are completely free to secure a loan from your preferred financial institution.",
  },
  {
    q: "Is RC Transfer assistance included?",
    a: "Yes, absolutely. AutoBazaar works closely with the registered dealer showrooms to completely coordinate the RTO transfer paperwork. Your relationship manager will guide you through every required document.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function CarDetailView({
  car,
  initialDealerProfile,
  initialReviews,
  similarCars = [],
}) {
  const { data: session } = authClient.useSession();

  /* Image gallery */
  const [activeImage, setActiveImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  /* Dealer & reviews */
  const [dealerProfile, setDealerProfile] = useState(initialDealerProfile);
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  /* Inquiry / CRM */
  const [inquiry, setInquiry] = useState({ name: "", phone: "", message: "" });
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [hasInquired, setHasInquired] = useState(false);

  /* Auth modal */
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("signup");
  const [authForm, setAuthForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  /* Wishlist */
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  /* Share popover (moved to ImageGallery) */
  /* FAQ accordion (moved to FAQAccordion) */

  const isLoggedIn = !!session?.user;

  /* Sync session into inquiry form */
  useEffect(() => {
    if (session?.user) {
      setInquiry((prev) => ({
        ...prev,
        name: session.user.name || "",
        phone: session.user.phone || "",
      }));
    }
  }, [session]);

  /* Check wishlist on mount */
  useEffect(() => {
    if (isLoggedIn && car?._id) {
      fetch(`${API}/api/wishlist/check/${car._id}`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((d) => setIsWishlisted(d.isWishlisted))
        .catch(() => {});
    }
  }, [isLoggedIn, car?._id]);

  const hasImages = car.images && car.images.length > 0;

  /* ─── Actions ─────────────────────────────────────────────────────────── */

  async function toggleWishlist() {
    if (!isLoggedIn) {
      setPendingAction("wishlist");
      setShowAuthModal(true);
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await fetch(`${API}/api/wishlist/toggle/${car._id}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const d = await res.json();
        setIsWishlisted(d.isWishlisted);
      }
    } catch (e) {
    } finally {
      setWishlistLoading(false);
    }
  }

  async function submitInquiryData(phone, name, customMessage, isBackground = false) {
    // If it's a background dispatch (e.g. WhatsApp), do not trigger loading indicators or clear success state
    if (!isBackground) {
      setSendingInquiry(true);
      setInquiryStatus("");
      setInquiryMessage("");
    }
    try {
      const res = await fetch(`${API}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car: car._id,
          name: name || inquiry.name || "Buyer",
          phone,
          message:
            customMessage ||
            inquiry.message ||
            `Interested in ${car.year} ${toTitleCase(car.brand)} ${toTitleCase(car.title)}. Please connect for a test drive.`,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to submit inquiry.");
      }
      setInquiryStatus("success");
      setInquiryMessage(
        "Lead registered! Our relationship manager will call you within 15 minutes."
      );
      setHasInquired(true);
      return true;
    } catch (err) {
      // Background dispatches fail silently in the UI to prevent disrupting WhatsApp redirection
      if (!isBackground) {
        setInquiryStatus("error");
        setInquiryMessage(err.message);
      }
      return false;
    } finally {
      if (!isBackground) {
        setSendingInquiry(false);
      }
    }
  }

  async function handleWhatsAppClick() {
    if (!isLoggedIn) {
      setPendingAction("whatsapp");
      setShowAuthModal(true);
      return;
    }
    const phone = session?.user?.phone || inquiry.phone;
    if (!phone) {
      setPendingAction("whatsapp");
      setShowAuthModal(true);
      return;
    }
    
    // Construct the WhatsApp deep-link synchronously using dealer profile details
    const msg = `Hi, I'm interested in the ${car.year} ${toTitleCase(car.brand)} ${toTitleCase(car.title)} listed on AutoBazaar. Please share details.`;
    const waUrl = `https://wa.me/91${normalizeIndianMobile(dealerProfile?.phone)}?text=${encodeURIComponent(msg)}`;
    
    // Optimistic lead UI registration state updates
    setHasInquired(true);
    setInquiryStatus("success");
    setInquiryMessage(
      "Lead registered! Our relationship manager will call you within 15 minutes."
    );

    // Open WhatsApp link immediately in a new tab synchronously to guarantee popup blocker bypass
    window.open(waUrl, "_blank");

    // Register the lead in the background to eliminate API latency
    submitInquiryData(
      phone,
      session?.user?.name || "Buyer",
      "Requested details via WhatsApp",
      true
    ).catch((err) => {
      console.error("Failed to submit background inquiry:", err);
    });
  }

  async function handleRequestCallback() {
    if (!isLoggedIn) {
      setPendingAction("inquiry");
      setShowAuthModal(true);
      return;
    }
    const phone = session?.user?.phone || inquiry.phone;
    if (!phone) {
      setPendingAction("inquiry");
      setShowAuthModal(true);
      return;
    }
    await submitInquiryData(
      phone,
      session?.user?.name || "Buyer",
      "Callback requested"
    );
  }

  async function handleAuthSubmit(e) {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      if (authTab === "signup") {
        const normalizedPhone = normalizeIndianMobile(authForm.phone);
        if (!normalizedPhone) {
          setAuthError("Enter a valid 10-digit Indian mobile number.");
          setAuthLoading(false);
          return;
        }
        const { error } = await authClient.signUp.email({
          email: authForm.email,
          password: authForm.password,
          name: authForm.name,
          role: "buyer",
          phone: normalizedPhone,
        });
        if (error) throw new Error(error.message || "Sign up failed.");
      } else {
        const { error } = await authClient.signIn.email({
          email: authForm.email,
          password: authForm.password,
        });
        if (error) throw new Error(error.message || "Sign in failed.");
      }
      setShowAuthModal(false);
      const updatedSession = await authClient.getSession();
      const verifiedPhone =
        updatedSession?.data?.user?.phone || authForm.phone;
      const buyerName =
        updatedSession?.data?.user?.name || authForm.name || "Buyer";
      if (pendingAction === "inquiry") {
        await submitInquiryData(verifiedPhone, buyerName, inquiry.message);
      } else if (pendingAction === "whatsapp") {
        // Optimistically update registration UI state after successful authentication
        setHasInquired(true);
        setInquiryStatus("success");
        setInquiryMessage(
          "Lead registered! Our relationship manager will call you within 15 minutes."
        );
        
        const msg = `Hi, I'm interested in the ${car.year} ${toTitleCase(car.brand)} ${toTitleCase(car.title)} listed on AutoBazaar. Please share details.`;
        const waUrl = `https://wa.me/91${normalizeIndianMobile(dealerProfile?.phone)}?text=${encodeURIComponent(msg)}`;
        
        // Open WhatsApp instantly in a new tab
        window.open(waUrl, "_blank");

        // Submit the lead capture data in background
        submitInquiryData(
          verifiedPhone,
          buyerName,
          "Requested details via WhatsApp",
          true
        ).catch((err) => {
          console.error("Failed to submit background inquiry after auth:", err);
        });
      } else if (pendingAction === "wishlist") {
        try {
          const r = await fetch(`${API}/api/wishlist/toggle/${car._id}`, {
            method: "POST",
            credentials: "include",
          });
          if (r.ok) {
            const d = await r.json();
            setIsWishlisted(d.isWishlisted);
          }
        } catch {}
      }
      setAuthForm({ name: "", phone: "", email: "", password: "" });
      setPendingAction("");
    } catch (err) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleReviewSubmit(e) {
    if (e) e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API}/api/trust/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId: car.dealer,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to submit review.");
      }
      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setReviewForm({ rating: 5, comment: "" });
      setHasReviewed(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  }

  /* ─── Spec tiles ──────────────────────────────────────────────────────── */
  const specTiles = [
    {
      icon: <Gauge className="h-5 w-5" />,
      // We change the label from "Mileage" to "KM Driven" to be perfectly accurate for buyers.
      // In the database, the 'mileage' field actually tracks the odometer (how many kilometers the vehicle has run),
      // rather than the fuel efficiency rating (e.g. km/l).
      label: "KM Driven",
      value: `${(car.mileage || car.kmsDriven || 0).toLocaleString("en-IN")}`,
      unit: "km",
    },
    {
      icon: <Fuel className="h-5 w-5" />,
      label: "Fuel Type",
      value: toTitleCase(car.fuelType),
      unit: "",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Transmission",
      value: toTitleCase(car.transmission),
      unit: "",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Registration",
      value:
        car.registrationNumber?.split("-")?.[0]?.toUpperCase() || "N/A",
      unit: "",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Make Year",
      value: String(car.year),
      unit: "",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Ownership",
      value: toTitleCase(car.owners),
      unit: "",
    },
    {
      icon: <Paintbrush className="h-5 w-5" />,
      label: "Colour",
      value: toTitleCase(car.color) || "N/A",
      unit: "",
    },
    {
      icon: <Car className="h-5 w-5" />,
      label: "Body Type",
      value: toTitleCase(car.bodyType),
      unit: "",
    },
  ];

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#fcf8ff]">

      {/* ─── Back nav (now at the top of the details view) ────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 pt-6">
        <Link
          href="/cars"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#464555] hover:text-[#3525cd] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>
      </div>

      {/* ─── Main 2-Column Grid Layout ────────────────────────────────────── */}
      {/* Shifted gallery to the left column to prevent image stretching */}
      <section className="max-w-[1280px] mx-auto px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ════════════════════════════════════════════
              LEFT COLUMN (8/12)
              ════════════════════════════════════════════ */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* ─── Image Gallery Container ─── */}
            <ImageGallery 
              car={car} 
              toggleWishlist={toggleWishlist} 
              wishlistLoading={wishlistLoading} 
              isWishlisted={isWishlisted} 
            />


            {/* ── 2. Spec Bento Grid ────────────────────── */}
            <SpecGrid car={car} />

            {/* ── 3. Vehicle Overview / Description ────── */}
            {car.description && (
              <div>
                <h2 className="text-lg font-bold text-[#1b1b24] mb-4 font-display">
                  Vehicle Overview
                </h2>
                <p className="text-[#464555] leading-relaxed text-base mb-4 whitespace-pre-line">
                  {car.description}
                </p>
              </div>
            )}

            {/* ── 4. Inspection Report ─────────── */}
            {car.isInspected && car.inspectionReport?.url && (
              <div className="bg-[#f5f2ff] rounded-2xl p-7 border border-[#c7c4d8]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1b1b24] font-display flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#3525cd]" />
                    Certified Inspection
                  </h2>
                  <p className="text-sm text-[#464555] mt-1">
                    This vehicle has passed our physical verification process.
                  </p>
                </div>
                <a
                  href={car.inspectionReport.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border border-[#c7c4d8] text-[#1b1b24] hover:border-[#3525cd] hover:text-[#3525cd] px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm shrink-0"
                >
                  <FileText className="h-4 w-4" />
                  View Report
                </a>
              </div>
            )}

            {/* ── 5. Dealer Reviews (if any) ────────────── */}
            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#1b1b24] mb-5 font-display">
                  Dealer Reviews
                </h2>
                <div className="space-y-4">
                  {reviews.slice(0, 4).map((r, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-[#c7c4d8]/40 p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 rounded-full bg-[#4f46e5]/10 text-[#3525cd] flex items-center justify-center font-bold text-sm">
                          {(r.buyer?.name || "B")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1b1b24]">
                            {r.buyer?.name || "Verified Buyer"}
                          </p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`h-3.5 w-3.5 ${
                                  n <= r.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-[#c7c4d8]"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-[#464555] leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Leave a review form */}
                {isLoggedIn &&
                  session?.user?.role === "buyer" &&
                  !hasReviewed && (
                    <form
                      onSubmit={handleReviewSubmit}
                      className="mt-6 bg-[#f5f2ff] rounded-2xl border border-[#c7c4d8]/30 p-6"
                    >
                      <h3 className="text-sm font-bold text-[#1b1b24] mb-4">
                        Leave a Review
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() =>
                              setReviewForm((p) => ({ ...p, rating: n }))
                            }
                            className="cursor-pointer"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                n <= reviewForm.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-[#c7c4d8]"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm((p) => ({
                            ...p,
                            comment: e.target.value,
                          }))
                        }
                        placeholder="Share your experience with this dealer..."
                        rows={3}
                        className="w-full rounded-xl border border-[#c7c4d8]/50 bg-white px-4 py-3 text-sm text-[#1b1b24] placeholder:text-[#777587] focus:outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/10 transition-all resize-none"
                        required
                      />
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="mt-3 btn-md btn-primary btn w-full cursor-pointer disabled:opacity-50"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  )}
              </div>
            )}

            {/* ── 6. Similar Vehicles ───────────────────── */}
            {similarCars.length > 0 && (
              <div className="border-t border-[#c7c4d8]/30 pt-8">
                <h2 className="text-lg font-bold text-[#1b1b24] mb-5 font-display">
                  Similar Vehicles You Might Like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {similarCars.slice(0, 4).map((sc) => (
                    <Link
                      key={sc._id}
                      href={`/cars/${sc._id}`}
                      // Changed from bg-white/80 and backdrop-blur-sm to solid bg-white border border-[#c7c4d8]/50 for clean visual accessibility
                      className="group block bg-white border border-[#c7c4d8]/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative h-44 overflow-hidden bg-[#e4e1ee]">
                        {sc.images?.[0]?.url ? (
                           <Image
                             loader={cloudinaryLoader}
                             src={sc.images[0].url}
                             alt={sc.title}
                             fill
                             sizes="(max-width: 640px) 100vw, 50vw"
                             className="object-cover group-hover:scale-105 transition-transform duration-500"
                           />
                        ) : (
                           <div className="flex h-full items-center justify-center text-5xl">
                             🚗
                           </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-bold text-[#1b1b24] mb-1">
                          {sc.year} {toTitleCase(sc.brand)}{" "}
                          {toTitleCase(sc.title)}
                        </h3>
                        <p className="text-sm text-[#777587] mb-3">
                          {sc.year} •{" "}
                          {toTitleCase(sc.fuelType)} •{" "}
                          {sc.kmsDriven?.toLocaleString("en-IN")} km
                        </p>
                        <p className="text-lg font-bold text-primary-600">
                          {formatPrice(sc.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════
              RIGHT COLUMN — Sticky Pricing Card (4/12)
              ════════════════════════════════════════════ */}
          <div className="lg:col-span-4">
            <ContactCard
              car={car}
              dealerProfile={dealerProfile}
              inquiryStatus={inquiryStatus}
              inquiryMessage={inquiryMessage}
              hasInquired={hasInquired}
              sendingInquiry={sendingInquiry}
              handleWhatsAppClick={handleWhatsAppClick}
              handleRequestCallback={handleRequestCallback}
            />
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ──────────────────────────────────────────────────── */}
      <FAQAccordion faqs={faqs} />

      {/* ─── Auth Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {pendingAction === "wishlist"
                      ? "Save to Wishlist"
                      : "Confirm Your Identity"}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Secures your inquiry and prevents spam.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4 text-neutral-600" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-neutral-200">
                {["signup", "signin"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setAuthTab(tab)}
                    className={`flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer ${
                      authTab === tab
                        ? "text-primary-600 border-b-2 border-primary-600"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {tab === "signup" ? "Create Account" : "Sign In"}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form
                onSubmit={handleAuthSubmit}
                className="px-6 py-6 space-y-4"
              >
                {authTab === "signup" && (
                  <>
                    <div>
                      <label className="label">Full Name</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={authForm.name}
                        onChange={(e) =>
                          setAuthForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={authForm.phone}
                        onChange={(e) =>
                          setAuthForm((p) => ({
                            ...p,
                            phone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          }))
                        }
                        className="input"
                        required
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={authForm.email}
                    onChange={(e) =>
                      setAuthForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) =>
                      setAuthForm((p) => ({
                        ...p,
                        password: e.target.value,
                      }))
                    }
                    className="input"
                    required
                  />
                </div>

                {authError && (
                  <p className="error-text">{authError}</p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn btn-primary btn-lg btn-full mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {authLoading
                    ? "Please wait..."
                    : authTab === "signup"
                    ? "Create Account & Continue"
                    : "Sign In & Continue"}
                </button>

                <p className="text-[11px] text-neutral-400 text-center">
                  We never share your information with third parties.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
