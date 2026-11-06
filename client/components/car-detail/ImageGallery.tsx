"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Share2, Copy, ExternalLink, X, Car as CarIcon } from "lucide-react";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import type { ApiCar } from "@/lib/api-types";

function toTitleCase(str: unknown): string {
  if (str === null || str === undefined || str === "") return "";
  return String(str)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ImageGallery({ car, toggleWishlist, wishlistLoading, isWishlisted }: {
  car: ApiCar;
  toggleWishlist: () => void;
  wishlistLoading: boolean;
  isWishlisted: boolean;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const hasImages = car?.images && car.images.length > 0;

  function lightboxNext() {
    setLightboxIndex((i) => (i + 1) % car.images.length);
  }
  function lightboxPrev() {
    setLightboxIndex((i) => (i - 1 + car.images.length) % car.images.length);
  }

  return (
    <>
      {/* Main Relative Container for the entire Gallery component */}
      <div className="relative w-full flex flex-col gap-4">
        {/* 
          Main Active Image Viewport:
          - We removed the outside 'flex items-center gap-4' and external buttons to prevent left-right clutter.
          - We added 'group/gallery' to easily control desktop hover states on the child overlay buttons.
          - We use 'bg-neutral-100' for a clean, premium background that matches our light design theme.
        */}
        {/* aspect-16/10 simplifies standard aspect ratio under Tailwind CSS v4 dynamic sizing */}
        <div
          className="relative w-full aspect-16/10 overflow-hidden rounded-xl bg-neutral-100 cursor-zoom-in border border-border shadow-md group/gallery"
          onClick={() => {
            setLightboxIndex(activeImage);
            setShowLightbox(true);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full"
            >
              {hasImages ? (
                /* 
                  - We removed the heavy, blurry background 'ambient clone' that looked like AI template clutter.
                  - We updated the main Image class from 'object-contain' to 'object-cover'.
                  - This ensures the car image fits beautifully edge-to-edge with no gray/white side bars.
                */
                <Image
                  loader={cloudinaryLoader}
                  src={car.images[activeImage]?.url || ""}
                  alt={car.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover object-center z-10"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-alt"><CarIcon className="h-16 w-16 text-border-strong" strokeWidth={1.5} aria-hidden /></div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* 
            Absolute Overlay Arrows (Inside the active image box):
            - They are absolute positioned so they do NOT compress or shrink our image container.
            - On mobile, they are always visible (opacity-100).
            - On desktop (md), they are hidden by default (opacity-0) and cleanly fade in on hover (md:group-hover/gallery:opacity-100).
          */}
          {hasImages && car.images.length > 1 && (
            <>
              <button
                type="button" aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage((prev) => (prev - 1 + car.images.length) % car.images.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-surface/90 hover:bg-surface text-ink flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 opacity-100 md:opacity-0 md:group-hover/gallery:opacity-100 duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button" aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage((prev) => (prev + 1) % car.images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-surface/90 hover:bg-surface text-ink flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 opacity-100 md:opacity-0 md:group-hover/gallery:opacity-100 duration-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Wishlist & Share buttons positioned over the gallery */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              type="button" aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={isWishlisted}
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist();
              }}
              disabled={wishlistLoading}
              className="h-11 w-11 sm:h-9 sm:w-9 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
            >
              <Heart
                className={`h-4 w-4 transition-all ${
                  isWishlisted
                    ? "fill-danger-500 text-danger-500"
                    : "text-ink-muted"
                }`}
              />
            </button>
            <div className="relative">
              <button
                type="button" aria-label="Share this car"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSharePopover((p) => !p);
                }}
                className="h-11 w-11 sm:h-9 sm:w-9 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="h-4 w-4 text-ink-muted" />
              </button>
              <AnimatePresence>
                {showSharePopover && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSharePopover(false);
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      className="absolute right-0 mt-2 w-44 bg-surface border border-border rounded-xl p-2 shadow-xl z-20"
                    >
                      <p className="text-xs font-bold text-ink-subtle uppercase px-2.5 py-1 mb-1 tracking-wider">
                        Share
                      </p>
                      <button
                        type="button" aria-label="Copy link"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await navigator.clipboard.writeText(
                              window.location.href
                            );
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          } catch {}
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-ink hover:bg-surface-alt rounded-lg text-left transition-colors cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </button>
                      <button
                        type="button" aria-label="Share on WhatsApp"
                        onClick={(e) => {
                          e.stopPropagation();
                          const text = `Check out this ${toTitleCase(car.brand)} ${toTitleCase(car.title)} on KarBik: ${window.location.href}`;
                          window.open(
                            `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
                            "_blank"
                          );
                          setShowSharePopover(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-ink hover:bg-surface-alt rounded-lg text-left transition-colors cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Share to WhatsApp
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip positioned below the main image box */}
      {hasImages && car.images.length > 1 && (
        <div className="w-full">
          {/* We use a simple flex row for exactly 4 thumbnails instead of a scrolling overflow strip */}
          {/* This matches Spinny's clean aesthetic and looks extremely intentional and professional */}
          {/* grid-cols-4: the four thumbnails share the available width, so the strip can
              never be wider than the screen (fixed 96px buttons forced a 444px page on phones) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 pb-1">
            {car.images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`relative w-full h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${ // shrink-0 keeps thumbnail box static, preventing it from compressing inside the flex strip
                  i === activeImage
                    ? "border-primary-600 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-90"
                }`}
              >
                <Image
                  loader={cloudinaryLoader}
                  src={img?.url || ""}
                  alt={`Photo ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 25vw, 120px"
                  className="object-cover"
                />
                {/* +N Photos overlay on the 4th thumbnail (index 3) when there are more than 4 images */}
                {i === 3 && car.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs font-bold transition-all hover:bg-black/50">
                    <span>+{car.images.length - 4}</span>
                    <span className="text-xs uppercase tracking-wider font-medium">Photos</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Fullscreen Lightbox ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showLightbox && hasImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center" // z-100 uses Tailwind CSS v4's dynamic z-index support without arbitrary bracket syntax
            onClick={() => setShowLightbox(false)}
          >
            <button
              type="button" aria-label="Close photo viewer"
              onClick={() => setShowLightbox(false)}
              className="absolute top-5 right-5 h-11 w-11 rounded-full bg-surface/10 text-white flex items-center justify-center hover:bg-surface/20 transition-colors cursor-pointer z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button" aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                lightboxPrev();
              }}
              className="absolute left-4 h-11 w-11 rounded-full bg-surface/10 text-white flex items-center justify-center hover:bg-surface/20 transition-colors cursor-pointer z-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              className="relative w-full max-w-5xl max-h-[85vh] px-16"
              onClick={(e) => e.stopPropagation()}
            >
              {/* aspect-16/10 specifies clean aspect ratio for the fullscreen lightbox modal container */}
              <div className="relative aspect-16/10 w-full">
                <Image
                  loader={cloudinaryLoader}
                  src={car.images[lightboxIndex]?.url || ""}
                  alt={`${car.title} - Photo ${lightboxIndex + 1}`}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-white/50 text-xs mt-4">
                {lightboxIndex + 1} / {car.images.length}
              </p>
            </div>

            <button
              type="button" aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                lightboxNext();
              }}
              className="absolute right-4 h-11 w-11 rounded-full bg-surface/10 text-white flex items-center justify-center hover:bg-surface/20 transition-colors cursor-pointer z-10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
