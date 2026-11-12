"use client";

/**
 * Gallery for the car detail page.
 * Phone: an edge-to-edge swipe strip (CSS scroll-snap) with a counter, and a
 * thumbnail row. From sm: the same strip with arrow buttons and a rounded frame.
 * Works with 4 photos, 1 photo, or none; a photo that fails to load shows the
 * placeholder instead of a broken image (photos are hotlinked, see PRODUCT.md).
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Heart, MessageCircle, Share2, SlidersHorizontal, X, Car as CarIcon } from "lucide-react";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import type { ApiCar } from "@/lib/api-types";
import { displayCarName } from "@/lib/car-name";

const OVERLAY_BTN =
  "flex h-11 w-11 items-center justify-center rounded-full bg-surface/95 text-ink shadow-sm transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

function Placeholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-surface-alt text-ink-muted">
      <CarIcon className="h-12 w-12 text-border-strong" strokeWidth={1.5} aria-hidden />
      <span className="mt-2 text-sm font-semibold">Photos coming soon</span>
    </div>
  );
}

export default function ImageGallery({
  car,
  isWishlisted,
  wishlistReady,
  onToggleWishlist,
}: {
  car: ApiCar;
  isWishlisted: boolean;
  wishlistReady: boolean;
  onToggleWishlist: () => void;
}) {
  const images = car.images ?? [];
  const count = images.length;
  const name = displayCarName(car);

  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const strip = useRef<HTMLDivElement>(null);

  /* Compare list lives in localStorage, same keys as the listing card. */
  useEffect(() => {
    try {
      const selected = JSON.parse(localStorage.getItem("compareCars") || "[]") as string[];
      setIsComparing(selected.includes(car.id));
    } catch {
      setIsComparing(false);
    }
  }, [car.id]);

  function toggleCompare() {
    try {
      let selected = JSON.parse(localStorage.getItem("compareCars") || "[]") as string[];
      if (isComparing) {
        selected = selected.filter((id) => id !== car.id);
        setIsComparing(false);
      } else {
        if (selected.length >= 3) {
          window.alert("You can compare up to 3 cars at a time.");
          return;
        }
        selected.push(car.id);
        setIsComparing(true);
      }
      localStorage.setItem("compareCars", JSON.stringify(selected));
      window.dispatchEvent(new Event("compareChanged"));
    } catch {
      /* storage blocked: compare is simply unavailable */
    }
  }

  const goTo = useCallback(
    (index: number) => {
      const el = strip.current;
      if (!el || count === 0) return;
      const next = (index + count) % count;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      setActive(next);
    },
    [count],
  );

  function onScroll() {
    const el = strip.current;
    if (!el || !el.clientWidth) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  /* Lightbox: Esc closes, arrows move. */
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % count));
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + count) % count));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, count]);

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: name, url: window.location.href });
        return;
      } catch {
        /* dismissed: fall through to the menu */
      }
    }
    setShareOpen((o) => !o);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  function shareWhatsApp() {
    const text = `Check out this ${name} on KarBik: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setShareOpen(false);
  }

  const showThumbs = count > 1;

  return (
    <div className="-mx-4 sm:mx-0">
      {/* Photo strip */}
      <div className="relative bg-surface-alt sm:overflow-hidden sm:rounded-2xl">
        <div
          ref={strip}
          onScroll={onScroll}
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:aspect-[16/10]"
        >
          {count === 0 ? (
            <div className="h-full w-full shrink-0">
              <Placeholder />
            </div>
          ) : (
            images.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => !failed.has(i) && setLightbox(i)}
                aria-label={`Open photo ${i + 1} of ${count} full screen`}
                className="relative h-full w-full shrink-0 snap-center cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500"
              >
                {failed.has(i) ? (
                  <Placeholder />
                ) : (
                  <Image
                    loader={cloudinaryLoader}
                    src={img.url}
                    alt={`${name}, photo ${i + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                    priority={i === 0}
                    onError={() => setFailed((s) => new Set(s).add(i))}
                  />
                )}
              </button>
            ))
          )}
        </div>

        {/* Back, compare, save, share */}
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between">
          <Link href="/cars" aria-label="Back to all cars" className={`${OVERLAY_BTN} pointer-events-auto`}>
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div className="pointer-events-auto flex gap-2">
            <button
              type="button"
              onClick={toggleCompare}
              aria-pressed={isComparing}
              aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
              className={`${OVERLAY_BTN} ${isComparing ? "!bg-primary-600 !text-white" : ""}`}
            >
              <SlidersHorizontal className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onToggleWishlist}
              disabled={!wishlistReady}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              className={`${OVERLAY_BTN} ${isWishlisted ? "!text-danger-600" : ""}`}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-danger-600" : ""}`} aria-hidden />
            </button>
            <div className="relative">
              <button type="button" onClick={share} aria-label="Share this car" aria-expanded={shareOpen} className={OVERLAY_BTN}>
                <Share2 className="h-5 w-5" aria-hidden />
              </button>
              {shareOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close share menu"
                    onClick={() => setShareOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-border bg-surface p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={copyLink}
                      className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-ink hover:bg-surface-alt"
                    >
                      <Copy className="h-4 w-4" aria-hidden />
                      {copied ? "Link copied" : "Copy link"}
                    </button>
                    <button
                      type="button"
                      onClick={shareWhatsApp}
                      className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-ink hover:bg-surface-alt"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      Share on WhatsApp
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Arrows (sm+) and counter */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous photo"
              className={`${OVERLAY_BTN} absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 sm:flex`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next photo"
              className={`${OVERLAY_BTN} absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 sm:flex`}
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <span className="absolute bottom-3 right-3 z-10 rounded-md bg-graphite/75 px-2 py-1 text-xs font-semibold text-white tabular-nums">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbs && (
        <div className="mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={`${img.url}-t-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-alt ring-2 transition-shadow ${
                i === active ? "ring-primary-600" : "ring-transparent hover:ring-border-strong"
              }`}
            >
              {!failed.has(i) && (
                <Image
                  loader={cloudinaryLoader}
                  src={img.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={() => setFailed((s) => new Set(s).add(i))}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Full-screen viewer */}
      {lightbox !== null && count > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photos`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-graphite/95"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close photo viewer"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          {count > 1 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((i) => (i === null ? i : (i - 1 + count) % count));
              }}
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
          )}
          <div className="relative h-[80vh] w-full max-w-5xl px-14" onClick={(e) => e.stopPropagation()}>
            <Image
              loader={cloudinaryLoader}
              src={images[lightbox].url}
              alt={`${name}, photo ${lightbox + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          {count > 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((i) => (i === null ? i : (i + 1) % count));
              }}
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          )}
          <p className="absolute bottom-4 text-sm text-white/70 tabular-nums">
            {lightbox + 1} / {count}
          </p>
        </div>
      )}
    </div>
  );
}
