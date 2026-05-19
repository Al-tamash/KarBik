"use client";

import React, { useState } from "react";

/**
 * DealerShareButton — Leaf Client Component
 * 
 * WHAT: Interactive share button for dealer showroom.
 * WHY: Web API navigator.share & navigator.clipboard require a browser context.
 *      By putting this button in a leaf client component, we keep the parent
 *      dealer landing page as a high-speed, SEO-friendly Server Component.
 */
export default function DealerShareButton({ slug, businessName }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({
        title: `${businessName || "Dealer"} on AutoBazaar`,
        text: `Check out these premium cars from ${businessName || "this dealer"}`,
        url,
      }).catch((err) => {
        // Fallback to clipboard if share fails or is canceled
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  }

  function copyToClipboard(url) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      id="btn-share-showroom"
      className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-3.5 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 backdrop-blur-md transition-all cursor-pointer select-none"
    >
      <span className="text-lg">➦</span> {copied ? "Link Copied!" : "Share Showroom"}
    </button>
  );
}
