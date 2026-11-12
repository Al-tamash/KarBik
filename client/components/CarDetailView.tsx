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

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ApiCar, ApiReview, BuyerDealerSummary } from "@/lib/api-types";
import { displayCarName } from "@/lib/car-name";
import { useWishlist } from "@/lib/wishlist";
import { SHOW_DEALER_REVIEWS } from "@/lib/flags";
import { useLeadFlow } from "@/lib/use-lead-flow";

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
import LeadSheet from "./car-detail/LeadSheet";

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
  const searchParams = useSearchParams();

  const dealer = initialDealerProfile;
  const [reviews, setReviews] = useState<ApiReview[]>(initialReviews);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [canReview, setCanReview] = useState(false);

  /* Lead flow (sign-in gate, inquiry, WhatsApp) is shared with the compare page. */
  const lead = useLeadFlow();
  const isLoggedIn = lead.isLoggedIn;
  const ui = lead.uiFor(car.id);
  const hasInquired = ui.sent;
  const name = displayCarName(car);
  const leadTarget = { id: car.id, label: name };
  const handleWhatsAppClick = () => void lead.request(leadTarget, "whatsapp");
  const handleRequestCallback = () => void lead.request(leadTarget, "callback");

  /* Wishlist: same store as the listing-card hearts and the header count */
  const wishlist = useWishlist();
  const isWishlisted = wishlist.has(car.id);

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

      <LeadSheet {...lead.sheetProps} />
    </div>
  );
}
