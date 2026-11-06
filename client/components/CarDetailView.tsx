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
import { useSearchParams, useRouter } from "next/navigation";
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
import { useAppSession, authClient } from "@/lib/auth-client";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import type { ApiCar, ApiPublicDealerProfile, ApiReview } from "@/lib/api-types";

import ImageGallery from "./car-detail/ImageGallery";
import SpecGrid from "./car-detail/SpecGrid";
import FeaturesGrid from "./car-detail/FeaturesGrid";
import FAQAccordion from "./car-detail/FAQAccordion";
import ContactCard from "./car-detail/ContactCard";
import { displayCarName } from "@/lib/car-name";



/* ─── Utilities ───────────────────────────────────────────────────────────── */

function toTitleCase(str: unknown): string {
  if (str === null || str === undefined || str === "") return "";
  return String(str)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeIndianMobile(phone: string | null | undefined): string | null {
  const digits = String(phone || "").replace(/\D/g, "");
  const without =
    digits.startsWith("91") && digits.length === 12
      ? digits.slice(2)
      : digits;
  if (!/^[6-9]\d{9}$/.test(without)) return null;
  return without;
}

function formatPrice(price: number | null | undefined): string {
  if (!price) return "Price on request";
  const lakh = price / 100000;
  return `₹ ${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} Lakh`;
}



/* ─── FAQs ───────────────────────────────────────────────────────────────── */
/* Every answer below describes what KarBik actually does. No invented
   warranties, bank partnerships, or relationship managers. */
const faqs = [
  {
    q: "Is the price negotiable?",
    a: "Prices are set by each dealer, and many are open to a fair discussion. Once KarBik support has connected you with the dealer, you negotiate with them directly. KarBik is not part of the deal.",
  },
  {
    q: "Does this car come with a warranty?",
    a: "Warranty coverage varies by dealer and car. Some dealers offer their own limited warranty. Ask when support connects you, and get any promise in writing before you pay.",
  },
  {
    q: "Can I arrange my own financing?",
    a: "Yes. Dealers on KarBik don't restrict your financing options — you're free to arrange a loan with any bank or NBFC of your choice.",
  },
  {
    q: "Is RC Transfer assistance included?",
    a: "RC transfer is handled with the dealer you buy from. When you connect, confirm who files the transfer forms and by when, and keep everything in writing.",
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
}: {
  car: ApiCar;
  initialDealerProfile: ApiPublicDealerProfile | null;
  initialReviews: ApiReview[];
  similarCars?: ApiCar[];
}) {
  const { data: session } = useAppSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  /* Image gallery */
  const [activeImage, setActiveImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  /* Dealer & reviews */
  const [dealerProfile, setDealerProfile] = useState<ApiPublicDealerProfile | null>(initialDealerProfile);
  const [reviews, setReviews] = useState<ApiReview[]>(initialReviews);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [canReview, setCanReview] = useState(false);

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
      const userPhone = (session.user as { phone?: string })?.phone || "";
      setInquiry((prev) => ({
        ...prev,
        name: session.user.name || prev.name || "",
        phone: userPhone || prev.phone || "",
      }));
      if (userPhone) {
        setAuthForm((p) => ({ ...p, phone: userPhone }));
      }
    }
  }, [session]);

  // Save current car to recently viewed in localStorage on mount
  useEffect(() => {
    if (car && typeof car.id === "string" && car.id.trim().length > 0) {
      try {
        const raw = localStorage.getItem("recentlyViewedCars");
        const parsed = raw ? JSON.parse(raw) : [];
        const existing = Array.isArray(parsed) ? parsed : [];

        // Filter out invalid items and any previous instance of the current car
        const cleaned = existing.filter(
          (item): item is Record<string, unknown> & { id: string } =>
            Boolean(
              item &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              item.id.trim().length > 0 &&
              item.id !== car.id
            )
        );

        // Store lightweight representation for snappy rendering
        const lightCar = {
          id: car.id,
          title: car.title,
          brand: car.brand,
          model: car.model,
          year: car.year,
          price: car.price,
          mileage: car.mileage,
          fuelType: car.fuelType,
          transmission: car.transmission,
          createdAt: car.createdAt,
          images: car.images && car.images.length > 0 ? [{ url: car.images[0].url }] : [],
          isBoosted: car.isBoosted,
          rcVerified: car.rcVerified,
          city: car.city,
          dealerProfile: car.dealerProfile
            ? {
                businessName: car.dealerProfile.businessName,
                isVerified: car.dealerProfile.isVerified,
                averageRating: car.dealerProfile.averageRating,
                totalReviews: car.dealerProfile.totalReviews,
              }
            : null,
        };

        cleaned.unshift(lightCar);
        // Cap at 6 recently viewed cars
        localStorage.setItem("recentlyViewedCars", JSON.stringify(cleaned.slice(0, 6)));
      } catch (err) {
        console.warn("Failed to update recently viewed cars in storage:", err);
      }
    }
  }, [car]);

  /* May this buyer review the dealer? (needs an inquiry; re-check after sending one) */
  useEffect(() => {
    if (!isLoggedIn || !car?.dealer) {
      setCanReview(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/trust/reviews/eligibility?dealerId=${encodeURIComponent(car.dealer)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d: { eligible?: boolean }) => {
        if (!cancelled) setCanReview(Boolean(d.eligible));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, car?.dealer, hasInquired]);

  /* Check wishlist on mount */
  useEffect(() => {
    if (isLoggedIn && car?.id) {
      fetch(`/api/wishlist/check/${car.id}`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((d: { isWishlisted?: boolean }) => setIsWishlisted(Boolean(d.isWishlisted)))
        .catch(() => {});
    }
  }, [isLoggedIn, car?.id]);

  /* Trigger call action automatically if navigated via Call Button on Listing Page */
  // WHAT: Listens for query parameter ?action=call on page load.
  // WHY: Forces user authentication and registers a callback lead before
  //      initiating call, completely eliminating lead leakage!
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "call") {
      handleRequestCallback();
      // Clean up the URL query parameter so it doesn't trigger again on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
    // Intentionally fires once per ?action=call arrival; adding the handler
    // identity would re-trigger the call flow on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
      const res = await fetch(`/api/wishlist/toggle/${car.id}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const d = (await res.json()) as { isWishlisted?: boolean };
        setIsWishlisted(Boolean(d.isWishlisted));
      }
    } catch (e) {
    } finally {
      setWishlistLoading(false);
    }
  }

  async function submitInquiryData(phone: string, name: string, customMessage: string) {
    setSendingInquiry(true);
    setInquiryStatus("");
    setInquiryMessage("");
    try {
      const res = await fetch(`/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car: car.id,
          channel: "callback",
          name: name || inquiry.name || "Buyer",
          phone,
          message:
            customMessage ||
            inquiry.message ||
            `Interested in ${displayCarName(car)}. Please connect for a test drive.`,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const d = (await res.json()) as { message?: string };
        throw new Error(d.message || "Failed to submit inquiry.");
      }
      setInquiryStatus("success");
      setInquiryMessage(
        "Request received! KarBik support will call you shortly to confirm, then connect you with the dealer."
      );
      setHasInquired(true);
      return true;
    } catch (err) {
      setInquiryStatus("error");
      setInquiryMessage((err as Error).message);
      return false;
    } finally {
      setSendingInquiry(false);
    }
  }

  // WHAT: Registers the lead FIRST, then opens WhatsApp with a server-issued link.
  // WHY: The dealer's number is never sent to the browser up front, and WhatsApp
  //      only opens once the lead is stored — so a failed/blocked inquiry can no
  //      longer leak a conversation the dealer has no record of.
  async function connectOnWhatsApp(phone: string, buyerName: string) {
    // Open a blank tab synchronously (inside the click) so popup blockers allow it,
    // then point it at the link once the server has stored the lead.
    const waTab = window.open("", "_blank");
    setSendingInquiry(true);
    setInquiryStatus("");
    setInquiryMessage("");
    try {
      const res = await fetch(`/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car: car.id,
          channel: "whatsapp",
          name: buyerName || inquiry.name || "Buyer",
          phone,
          message: "Requested details via WhatsApp",
        }),
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        whatsappUrl?: string | null;
      };
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit inquiry.");
      }

      setHasInquired(true);
      setInquiryStatus("success");
      if (data.whatsappUrl) {
        setInquiryMessage("Request received! Continue the chat with KarBik support on WhatsApp.");
        if (waTab) {
          waTab.location.href = data.whatsappUrl;
        } else {
          // Popup was blocked (e.g. tab opened after the sign-up round trip). The lead
          // is already stored, so hand the buyer to WhatsApp in this tab instead.
          window.location.assign(data.whatsappUrl);
        }
      } else {
        waTab?.close();
        setInquiryMessage(
          "Request received! KarBik support will contact you shortly."
        );
      }
    } catch (err) {
      waTab?.close();
      setInquiryStatus("error");
      setInquiryMessage((err as Error).message);
    } finally {
      setSendingInquiry(false);
    }
  }

  async function handleWhatsAppClick() {
    if (!isLoggedIn || !inquiry.phone) {
      setPendingAction("whatsapp");
      setShowAuthModal(true);
      return;
    }
    await connectOnWhatsApp(inquiry.phone, session?.user?.name || "Buyer");
  }

  async function handleRequestCallback() {
    if (!isLoggedIn) {
      setPendingAction("inquiry");
      setShowAuthModal(true);
      return;
    }
    const phone = inquiry.phone || (session?.user as { phone?: string })?.phone;
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

  async function handleAuthSubmit(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      // 1-Click Zero Friction: If buyer is already logged in, only validate phone and submit immediately
      if (isLoggedIn) {
        const normalizedPhone = normalizeIndianMobile(authForm.phone);
        if (!normalizedPhone) {
          setAuthError("Enter a valid 10-digit Indian mobile number.");
          setAuthLoading(false);
          return;
        }
        setInquiry((prev) => ({ ...prev, phone: normalizedPhone }));
        setShowAuthModal(false);
        const buyerName = session?.user?.name || "Buyer";
        if (pendingAction === "inquiry") {
          await submitInquiryData(normalizedPhone, buyerName, inquiry.message);
        } else if (pendingAction === "whatsapp") {
          await connectOnWhatsApp(normalizedPhone, buyerName);
        }
        return;
      }

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
          phone: normalizedPhone,
        } as Parameters<typeof authClient.signUp.email>[0] & { phone?: string });
        if (error) throw new Error(error.message || "Sign up failed.");
      } else {
        const { error } = await authClient.signIn.email({
          email: authForm.email,
          password: authForm.password,
        });
        if (error) throw new Error(error.message || "Sign in failed.");
      }
      setShowAuthModal(false);
      const verifiedPhone = authForm.phone;
      const buyerName =
        authForm.name || "Buyer";
      if (pendingAction === "inquiry") {
        await submitInquiryData(verifiedPhone, buyerName, inquiry.message);
      } else if (pendingAction === "whatsapp") {
        await connectOnWhatsApp(verifiedPhone, buyerName);
      } else if (pendingAction === "wishlist") {
        try {
          const r = await fetch(`/api/wishlist/toggle/${car.id}`, {
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
      setAuthError((err as Error).message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleReviewSubmit(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/trust/reviews`, {
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
      const created = await res.json();
      const newReview = created.review ?? created;
      setReviews([newReview, ...reviews]);
      setReviewForm({ rating: 5, comment: "" });
      setHasReviewed(true);
    } catch (err) {
      alert((err as Error).message);
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
      value: `${(car.mileage || car.mileage || 0).toLocaleString("en-IN")}`,
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
    <div className="min-h-screen bg-bg">

      {/* ─── Back nav (now at the top of the details view) ────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 pt-6">
        <Link
          href="/cars"
          className="inline-flex items-center gap-1.5 py-3 text-sm font-semibold text-ink-muted hover:text-primary-600 transition-colors"
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
          <div className="lg:col-span-8 flex flex-col gap-8 min-w-0">

            {/* ─── Image Gallery Container ─── */}
            <ImageGallery 
              car={car} 
              toggleWishlist={toggleWishlist} 
              wishlistLoading={wishlistLoading} 
              isWishlisted={isWishlisted} 
            />

            {/* ─── Mobile Pricing & Contact Card (Visible only on mobile devices) ─── */}
            {/* WHAT: Renders the ContactCard directly under the image gallery on mobile screens. */}
            {/* WHY: Buyers on mobile expect to see the price, brand details, and action buttons */}
            {/*      immediately after inspecting images. Putting this here drastically increases conversion. */}
            <div className="block lg:hidden">
              <ContactCard
                car={car}
                dealerProfile={dealerProfile}
                inquiryStatus={inquiryStatus}
                inquiryMessage={inquiryMessage}
                hasInquired={hasInquired}
                sendingInquiry={sendingInquiry}
                handleWhatsAppClick={handleWhatsAppClick}
                handleRequestCallback={handleRequestCallback}
                topReview={reviews[0] ?? null}
              />
            </div>

            {/* ── 2. Spec Bento Grid ────────────────────── */}
            <SpecGrid car={car} />

            {/* ── 2.5 KarBik Assured Trust Highlights ────────────────── */}
            {/* WHAT: Renders a premium, dynamic 3-column bento card showing critical trust signals */}
            {/* WHY: Buyers are skeptical of used cars. Showing active DB verified attributes (RC Status, Accident History, */}
            {/*      Service History) immediately under the specs matches Spinny's gold standard and dramatically boosts conversion. */}
            <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-ink-strong font-display flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary-600" />
                  Condition & Paperwork
                </h3>
                <p className="text-xs text-ink-muted mt-1">
                  Paperwork status and condition history as reported by the dealer — items marked verified are checked against RTO records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* RTO / RC Status */}
                <div className="flex gap-3 items-start p-3.5 bg-success-50/40 dark:bg-success-800/15 border border-success-100/60 dark:border-success-700/30 rounded-xl">
                  <div className="p-2 bg-success-500/10 dark:bg-success-800/30 text-success-700 dark:text-success-300 rounded-lg shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">RC Status</h4>
                    <p className="text-xs font-semibold text-success-700 dark:text-success-300 mt-0.5 uppercase tracking-wider">
                      {car.rcVerified ? "Verified & Active" : "Under Validation"}
                    </p>
                    <p className="text-xs text-ink-muted mt-1.5 leading-normal">
                      Registration details validated against RTO records.
                    </p>
                  </div>
                </div>

                {/* Accident History */}
                <div className={`flex gap-3 items-start p-3.5 border rounded-xl ${!car.accidentHistory ? 'bg-primary-50/30 dark:bg-primary-800/15 border-primary-100/50 dark:border-primary-700/30' : 'bg-danger-50/30 dark:bg-danger-800/15 border-danger-100/50 dark:border-danger-700/30'}`}>
                  <div className={`p-2 rounded-lg shrink-0 ${!car.accidentHistory ? 'bg-primary-50 dark:bg-primary-800/30 text-primary-600 dark:text-primary-300' : 'bg-danger-500/10 dark:bg-danger-800/30 text-danger-700 dark:text-danger-300'}`}>
                    {!car.accidentHistory ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Accident History</h4>
                    <p className={`text-xs font-semibold mt-0.5 uppercase tracking-wider ${!car.accidentHistory ? 'text-primary-600 dark:text-primary-300' : 'text-danger-700 dark:text-danger-300'}`}>
                      {!car.accidentHistory ? "No Major Accidents" : "History Reported"}
                    </p>
                    <p className="text-xs text-ink-muted mt-1.5 leading-normal">
                      {!car.accidentHistory ? "Dealer reports no major accidents on this vehicle." : "Dealer has reported accident/damage history — inspect before buying."}
                    </p>
                  </div>
                </div>

                {/* Service History */}
                <div className="flex gap-3 items-start p-3.5 bg-primary-50/40 dark:bg-primary-800/15 border border-primary-100 dark:border-primary-700/30 rounded-xl">
                  <div className="p-2 bg-primary-50 dark:bg-primary-800/30 text-primary-600 dark:text-primary-300 rounded-lg shrink-0">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Service History</h4>
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-300 mt-0.5 uppercase tracking-wider">
                      {car.serviceHistory ? "Full Record Available" : "Regular Checks"}
                    </p>
                    <p className="text-xs text-ink-muted mt-1.5 leading-normal">
                      {car.serviceHistory ? "Dealer reports a full service record." : "No full service record — ask the dealer for details."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. Vehicle Overview / Description ────── */}
            {car.description && (
              <div>
                <h2 className="text-lg font-bold text-ink-strong mb-4 font-display">
                  Vehicle Overview
                </h2>
                <p className="text-ink leading-relaxed text-base mb-4 whitespace-pre-line">
                  {car.description}
                </p>
              </div>
            )}

            {/* ── 3.5 Categorized Features Grid (Phase 13 AI Auto-population) ────── */}
            <FeaturesGrid features={car.features} />

            {/* ── 4. Inspection Report ─────────── */}
            {car.isInspected && car.inspectionReport?.url && (
              <div className="bg-primary-50 rounded-2xl p-7 border border-primary-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-ink-strong font-display flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary-600" />
                    Certified Inspection
                  </h2>
                  <p className="text-sm text-ink-muted mt-1">
                    This vehicle has passed our physical verification process.
                  </p>
                </div>
                <a
                  href={car.inspectionReport.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-surface border border-border-strong text-ink-strong hover:border-primary-600 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm shrink-0"
                >
                  <FileText className="h-4 w-4" />
                  View Report
                </a>
              </div>
            )}

            {/* ── 5. Dealer Reviews (if any) ────────────── */}
            {((reviews && reviews.length > 0) || canReview) && (
              <div>
                <h2 className="text-lg font-bold text-ink-strong mb-5 font-display">
                  Dealer Reviews
                </h2>
                <div className="space-y-4">
                  {reviews.slice(0, 4).map((r, i) => (
                    <div
                      key={i}
                      className="bg-surface rounded-xl border border-border p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 rounded-full bg-primary-600/10 text-primary-600 flex items-center justify-center font-bold text-sm">
                          {(r.buyerName || "B")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink-strong">
                            {r.buyerName || "Verified Buyer"}
                          </p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`h-3.5 w-3.5 ${
                                  n <= r.rating
                                    ? "fill-warning-400 text-warning-400"
                                    : "text-border-strong"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-ink-muted leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Leave a review form */}
                {canReview && !hasReviewed && (
                    <form
                      onSubmit={handleReviewSubmit}
                      className="mt-6 bg-primary-50 rounded-2xl border border-primary-100 p-6"
                    >
                      <h3 className="text-sm font-bold text-ink-strong mb-4">
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
                                  ? "fill-warning-400 text-warning-400"
                                  : "text-ink-subtle"
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
                        className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm text-ink-strong placeholder:text-ink-subtle focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
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
              <div className="border-t border-border pt-8">
                <h2 className="text-lg font-bold text-ink-strong mb-5 font-display">
                  Similar Vehicles You Might Like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {similarCars.slice(0, 4).map((sc) => (
                    <Link
                      key={sc.id}
                      href={`/cars/${sc.id}`}
                      className="group block bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative h-44 overflow-hidden bg-surface-alt">
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
                           <div className="flex h-full items-center justify-center bg-surface-alt">
                             <Car className="h-10 w-10 text-border-strong" />
                           </div>
                         )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-bold text-ink-strong mb-1">
                          {displayCarName(sc)}
                        </h3>
                        <p className="text-sm text-ink-muted mb-3">
                          {sc.year} •{" "}
                          {toTitleCase(sc.fuelType)} •{" "}
                          {sc.mileage?.toLocaleString("en-IN")} km
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
          <div className="hidden lg:block lg:col-span-4">
            <ContactCard
              car={car}
              dealerProfile={dealerProfile}
              inquiryStatus={inquiryStatus}
              inquiryMessage={inquiryMessage}
              hasInquired={hasInquired}
              sendingInquiry={sendingInquiry}
              handleWhatsAppClick={handleWhatsAppClick}
              handleRequestCallback={handleRequestCallback}
              topReview={reviews[0] ?? null}
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
            className="fixed inset-0 z-90 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4" // z-90 specifies high stacking index for absolute auth modal overlay without arbitrary bracket syntax
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold text-ink-strong">
                    {isLoggedIn
                      ? "Confirm Mobile Number"
                      : pendingAction === "wishlist"
                      ? "Save to Wishlist"
                      : "Confirm Your Identity"}
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {isLoggedIn
                      ? "KarBik support will call you back on this number."
                      : "Secures your inquiry and prevents spam."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="h-8 w-8 rounded-full bg-surface-alt flex items-center justify-center hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4 text-ink-muted" />
                </button>
              </div>

              {/* Tabs — Only shown for non-logged in users */}
              {!isLoggedIn && (
                <div className="flex border-b border-border">
                  {["signup", "signin"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setAuthTab(tab)}
                      className={`flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer ${
                        authTab === tab
                          ? "text-primary-600 border-b-2 border-primary-600"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {tab === "signup" ? "Create Account" : "Sign In"}
                    </button>
                  ))}
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleAuthSubmit}
                className="px-6 py-6 space-y-4"
              >
                {isLoggedIn ? (
                  <div>
                    <label className="label">10-Digit Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={authForm.phone}
                      onChange={(e) =>
                        setAuthForm((p) => ({
                          ...p,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        }))
                      }
                      className="input"
                      required
                      autoFocus
                    />
                    <p className="helper-text text-xs text-ink-muted mt-1.5">
                      Your number is saved to your profile for instant 1-click inquiries next time.
                    </p>
                  </div>
                ) : (
                  <>
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
                  </>
                )}

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
                    : isLoggedIn
                    ? "Confirm & Request Callback"
                    : authTab === "signup"
                    ? "Create Account & Continue"
                    : "Sign In & Continue"}
                </button>

                <p className="text-xs text-ink-subtle text-center">
                  By continuing you allow KarBik and the dealer to contact you on this number. See our Privacy Policy.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
