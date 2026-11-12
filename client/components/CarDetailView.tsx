"use client";

/**
 * CarDetailView: the car detail page, where a buyer decides to ask KarBik.
 *
 * Section flow (see .impeccable/surfaces/app-cars-id-page-tsx.md): gallery,
 * summary, a sticky anchor bar, then Overview, Checks on this car, Features,
 * EMI estimate, How KarBik connects you, dealer reviews, similar cars and FAQ.
 * Phones get a sticky bottom bar; desktop gets a sticky summary panel.
 *
 * This component owns the state and the lead handlers (wishlist, inquiry,
 * WhatsApp, sign-in gate, reviews); the sections are in components/car-detail/.
 * The dealer is never named here (PRODUCT.md): support names them after the lead.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppSession, authClient } from "@/lib/auth-client";
import type { ApiCar, ApiReview, BuyerDealerSummary } from "@/lib/api-types";
import { displayCarName } from "@/lib/car-name";
import { normalizeIndianMobile } from "@/lib/car-format";
import { useWishlist } from "@/lib/wishlist";
import { SHOW_DEALER_REVIEWS } from "@/lib/flags";

import ImageGallery from "./car-detail/ImageGallery";
import SummaryPanel from "./car-detail/SummaryPanel";
import StickyCtaBar from "./car-detail/StickyCtaBar";
import SectionNav, { type SectionLink } from "./car-detail/SectionNav";
import DetailSection from "./car-detail/DetailSection";
import KeySpecs from "./car-detail/KeySpecs";
import CarChecks from "./car-detail/CarChecks";
import FeaturesList from "./car-detail/FeaturesList";
import EmiEstimate from "./car-detail/EmiEstimate";
import HowItWorks from "./car-detail/HowItWorks";
import DealerReviews from "./car-detail/DealerReviews";
import SimilarCars from "./car-detail/SimilarCars";
import FaqList, { type Faq } from "./car-detail/FaqList";
import LeadSheet, { type AuthForm } from "./car-detail/LeadSheet";
import type { InquiryUi } from "./car-detail/ContactActions";

/* Every answer describes what KarBik actually does: no invented warranties,
   bank partnerships or promises on the dealer's behalf. */
const FAQS: Faq[] = [
  {
    q: "Who will I talk to first?",
    a: "KarBik support. Message us on WhatsApp or ask for a call back, and support talks to you before connecting you with the dealer.",
  },
  {
    q: "Is the price negotiable?",
    a: "Prices are set by each dealer, and many are open to a fair discussion. Once support has connected you, you talk price with the dealer directly. KarBik is not part of the deal.",
  },
  {
    q: "Does this car come with a warranty?",
    a: "Warranty varies by dealer and car. Ask when support connects you, and get any promise in writing before you pay.",
  },
  {
    q: "Is RC transfer help included?",
    a: "RC transfer is handled with the dealer you buy from. When you connect, confirm who files the transfer forms and by when, and keep everything in writing.",
  },
  {
    q: "Can I arrange my own financing?",
    a: "Yes. KarBik does not offer loans, so you can ask your own bank or NBFC. The EMI estimate above is only a guide.",
  },
];

export default function CarDetailView({
  car,
  initialDealerProfile,
  initialReviews,
  similarCars = [],
}: {
  car: ApiCar;
  initialDealerProfile: BuyerDealerSummary | null;
  initialReviews: ApiReview[];
  similarCars?: ApiCar[];
}) {
  const { data: session } = useAppSession();
  const searchParams = useSearchParams();

  const dealer = initialDealerProfile;
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

  /* Lead gate */
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("signup");
  const [authForm, setAuthForm] = useState<AuthForm>({ name: "", phone: "", email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  /* Wishlist: same store as the listing-card hearts and the header count */
  const wishlist = useWishlist();
  const isWishlisted = wishlist.has(car.id);

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
      if (userPhone) setAuthForm((p) => ({ ...p, phone: userPhone }));
    }
  }, [session]);

  /* Remember this car as recently viewed (no dealer fields are stored) */
  useEffect(() => {
    if (!car || typeof car.id !== "string" || car.id.trim().length === 0) return;
    try {
      const raw = localStorage.getItem("recentlyViewedCars");
      const parsed = raw ? JSON.parse(raw) : [];
      const existing = Array.isArray(parsed) ? parsed : [];
      const cleaned = existing.filter(
        (item): item is Record<string, unknown> & { id: string } =>
          Boolean(item && typeof item === "object" && typeof item.id === "string" && item.id.trim().length > 0 && item.id !== car.id),
      );
      cleaned.unshift({
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
        dealerProfile: null,
      });
      localStorage.setItem("recentlyViewedCars", JSON.stringify(cleaned.slice(0, 6)));
    } catch (err) {
      console.warn("Failed to update recently viewed cars in storage:", err);
    }
  }, [car]);

  /* May this buyer review the dealer? (needs an inquiry; re-check after sending one) */
  useEffect(() => {
    if (!SHOW_DEALER_REVIEWS || !isLoggedIn || !car?.dealer) {
      setCanReview(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/trust/reviews/eligibility?dealerId=${encodeURIComponent(car.dealer)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: { eligible?: boolean }) => {
        if (!cancelled) setCanReview(Boolean(d.eligible));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, car?.dealer, hasInquired]);

  /* ?action=call (from the listing's Call button): register the callback lead first,
     so no call happens without a recorded lead. Fires once per arrival. */
  useEffect(() => {
    if (searchParams.get("action") === "call") {
      handleRequestCallback();
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ─── Actions ─────────────────────────────────────────────────────────── */

  // Works signed out too (saved in this browser, merged into the account on sign-in).
  function toggleWishlist() {
    void wishlist.toggle(car.id);
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
            customMessage || inquiry.message || `Interested in ${displayCarName(car)}. Please connect for a test drive.`,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const d = (await res.json()) as { message?: string };
        throw new Error(d.message || "Failed to submit inquiry.");
      }
      setInquiryStatus("success");
      setInquiryMessage("Request received. KarBik support will call you shortly to confirm, then connect you with the dealer.");
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

  // Registers the lead FIRST, then opens WhatsApp with a server-issued link: the dealer's
  // number never reaches the browser, and WhatsApp only opens once the lead is stored.
  async function connectOnWhatsApp(phone: string, buyerName: string) {
    // Open a blank tab synchronously (inside the click) so popup blockers allow it.
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
      const data = (await res.json().catch(() => ({}))) as { message?: string; whatsappUrl?: string | null };
      if (!res.ok) throw new Error(data.message || "Failed to submit inquiry.");

      setHasInquired(true);
      setInquiryStatus("success");
      if (data.whatsappUrl) {
        setInquiryMessage("Request received. Continue the chat with KarBik support on WhatsApp.");
        if (waTab) {
          waTab.location.href = data.whatsappUrl;
        } else {
          // Popup blocked (e.g. tab opened after the sign-up round trip). The lead is stored,
          // so hand the buyer to WhatsApp in this tab instead.
          window.location.assign(data.whatsappUrl);
        }
      } else {
        waTab?.close();
        setInquiryMessage("Request received. KarBik support will contact you shortly.");
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
    await submitInquiryData(phone, session?.user?.name || "Buyer", "Callback requested");
  }

  async function handleAuthSubmit(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      // Already signed in: only confirm the number, then finish the pending action.
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
        const { error } = await authClient.signIn.email({ email: authForm.email, password: authForm.password });
        if (error) throw new Error(error.message || "Sign in failed.");
      }
      setShowAuthModal(false);
      const verifiedPhone = authForm.phone;
      const buyerName = authForm.name || "Buyer";
      if (pendingAction === "inquiry") {
        await submitInquiryData(verifiedPhone, buyerName, inquiry.message);
      } else if (pendingAction === "whatsapp") {
        await connectOnWhatsApp(verifiedPhone, buyerName);
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
        body: JSON.stringify({ dealerId: car.dealer, rating: reviewForm.rating, comment: reviewForm.comment }),
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to submit review.");
      }
      const created = await res.json();
      setReviews([created.review ?? created, ...reviews]);
      setReviewForm({ rating: 5, comment: "" });
      setHasReviewed(true);
    } catch (err) {
      window.alert((err as Error).message);
    } finally {
      setSubmittingReview(false);
    }
  }

  const closeSheet = useCallback(() => setShowAuthModal(false), []);

  const ui: InquiryUi = {
    status: inquiryStatus,
    message: inquiryMessage,
    sent: hasInquired,
    sending: sendingInquiry,
  };

  /* ─── Which sections exist for this car ───────────────────────────────── */
  const features = (car.features ?? {}) as Record<string, string[] | undefined>;
  const hasFeatures = Object.values(features).some((list) => Array.isArray(list) && list.length > 0);
  const showReviews = SHOW_DEALER_REVIEWS && (reviews.length > 0 || canReview);
  const showSimilar = similarCars.length >= 2;

  const sections: SectionLink[] = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "checks", label: "Checks" },
      ...(hasFeatures ? [{ id: "features", label: "Features" }] : []),
      { id: "emi", label: "EMI" },
      ...(showSimilar ? [{ id: "similar", label: "Similar cars" }] : []),
    ],
    [hasFeatures, showSimilar],
  );

  const name = displayCarName(car);

  return (
    <div className="bg-surface pb-32 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Desktop breadcrumb; phones get the back button on the photo */}
        <nav aria-label="Breadcrumb" className="hidden items-center gap-2 py-4 text-sm text-ink-muted lg:flex">
          <Link href="/" className="hover:text-primary-700 hover:underline">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link href="/cars" className="hover:text-primary-700 hover:underline">
            Used cars in Hyderabad
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-ink-strong" aria-current="page">
            {name}
          </span>
        </nav>

        {/* One grid, three blocks in reading order: photo, summary, sections. From lg the
            summary moves to the right column (sticky) without being rendered twice. */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-10">
          <div className="min-w-0 lg:col-span-8 lg:col-start-1 lg:row-start-1">
            <ImageGallery
              car={car}
              isWishlisted={isWishlisted}
              wishlistReady={wishlist.ready}
              onToggleWishlist={toggleWishlist}
            />
          </div>

          <div className="pt-5 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:pt-0">
            <div className="lg:sticky lg:top-20">
              <SummaryPanel
                car={car}
                dealer={dealer}
                ui={ui}
                onWhatsApp={handleWhatsAppClick}
                onCallback={handleRequestCallback}
              />
            </div>
          </div>

          <div className="min-w-0 lg:col-span-8 lg:col-start-1 lg:row-start-2">
            <SectionNav items={sections} className="mt-6" />

            <DetailSection id="overview" title="Overview">
              <KeySpecs car={car} />
              {car.description && (
                <div className="mt-8">
                  <h3 className="text-base font-bold text-ink-strong">About this car</h3>
                  <p className="mt-2 max-w-prose whitespace-pre-line text-base leading-relaxed text-ink">
                    {car.description}
                  </p>
                </div>
              )}
            </DetailSection>

            <DetailSection id="checks" title="Checks on this car">
              <CarChecks car={car} />
            </DetailSection>

            {hasFeatures && (
              <DetailSection id="features" title="Features">
                <FeaturesList features={car.features} />
              </DetailSection>
            )}

            <DetailSection id="emi" title="EMI estimate">
              <EmiEstimate price={car.price} />
            </DetailSection>

            <DetailSection title="How KarBik connects you">
              <HowItWorks />
            </DetailSection>

            {showReviews && (
              <DetailSection title="Dealer reviews">
                <DealerReviews
                  reviews={reviews}
                  canReview={canReview}
                  hasReviewed={hasReviewed}
                  form={reviewForm}
                  setForm={setReviewForm}
                  submitting={submittingReview}
                  onSubmit={handleReviewSubmit}
                />
              </DetailSection>
            )}

            {showSimilar && (
              <DetailSection id="similar" title="Similar cars">
                <SimilarCars cars={similarCars} />
              </DetailSection>
            )}

            <DetailSection title="Questions buyers ask">
              <FaqList faqs={FAQS} />
            </DetailSection>
          </div>
        </div>
      </div>

      <StickyCtaBar car={car} ui={ui} onWhatsApp={handleWhatsAppClick} onCallback={handleRequestCallback} />

      <LeadSheet
        open={showAuthModal}
        onClose={closeSheet}
        isLoggedIn={isLoggedIn}
        authTab={authTab}
        setAuthTab={setAuthTab}
        form={authForm}
        setForm={setAuthForm}
        error={authError}
        loading={authLoading}
        pendingAction={pendingAction}
        onSubmit={handleAuthSubmit}
      />
    </div>
  );
}
