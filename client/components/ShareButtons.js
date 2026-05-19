"use client";

/**
 * ShareButtons — Social sharing buttons for the dealer micro-website
 *
 * WHY SHARING MATTERS:
 * Every time a dealer shares their AutoBazaar page on WhatsApp or social media,
 * it's free advertising for the platform. It brings new buyers AND shows other
 * dealers that AutoBazaar exists. This is viral growth at zero cost.
 *
 * HOW SHARING WORKS:
 * Each social platform has a special URL format that opens their "share" dialog.
 * We construct these URLs with the dealer's page link and a message, then open
 * them in a new tab. The user's own social media app handles the rest.
 */
import { useState } from "react";

export default function ShareButtons({ slug, businessName }) {
  const [copied, setCopied] = useState(false);

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dealerUrl = `${APP_URL}/dealer/${slug}`;

  // The message that gets pre-filled when sharing
  const shareText = `Check out ${businessName || "this dealer"} on AutoBazaar! Browse their car inventory here:`;

  /**
   * handleCopyLink — copies the dealer URL to clipboard
   *
   * navigator.clipboard.writeText is the modern way to copy text.
   * We show a "Copied!" feedback for 2 seconds, then reset.
   */
  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(dealerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers that don't support clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = dealerUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Don't render if no slug
  if (!slug) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold text-neutral-900 mb-1">
        🔗 Share Your Page
      </h3>
      <p className="text-xs text-neutral-500 mb-4">
        Share your dealership page with customers and on social media.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopyLink}
          className={`btn-sm ${
            copied
              ? "bg-success-50 text-success-700 border border-success-200"
              : "btn-outline"
          }`}
        >
          {copied ? "✅ Copied!" : "📋 Copy Link"}
        </button>

        {/* WhatsApp Share */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${dealerUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sm btn-whatsapp"
        >
          💬 WhatsApp
        </a>

        {/* Twitter/X Share */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(dealerUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sm bg-neutral-800 text-white hover:bg-neutral-900"
        >
          𝕏 Twitter
        </a>

        {/* Facebook Share */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dealerUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sm bg-[#1877F2] text-white hover:bg-[#0c64d4]"
        >
          📘 Facebook
        </a>
      </div>

      {/* URL Preview */}
      <div className="mt-4 rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3">
        <p className="text-xs text-neutral-500 font-mono break-all">{dealerUrl}</p>
      </div>
    </div>
  );
}
