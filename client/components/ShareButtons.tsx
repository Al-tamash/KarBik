"use client";

/**
 * ShareButtons — Social sharing buttons for the dealer micro-website
 *
 * WHY SHARING MATTERS:
 * Every time a dealer shares their KarBik page on WhatsApp or social media,
 * it's free advertising for the platform. It brings new buyers AND shows other
 * dealers that KarBik exists. This is viral growth at zero cost.
 *
 * HOW SHARING WORKS:
 * Each social platform has a special URL format that opens their "share" dialog.
 * We construct these URLs with the dealer's page link and a message, then open
 * them in a new tab. The user's own social media app handles the rest.
 */
import { useState } from "react";
import { Check, Copy, Link2, MessageCircle } from "lucide-react";

export default function ShareButtons({ slug, businessName }: { slug: string; businessName: string }) {
  const [copied, setCopied] = useState(false);

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dealerUrl = `${APP_URL}/dealer/${slug}`;

  // The message that gets pre-filled when sharing
  const shareText = `Check out ${businessName || "this dealer"} on KarBik! Browse their car inventory here:`;

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
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="text-sm font-bold text-ink-strong mb-1 flex items-center gap-1.5">
        <Link2 className="h-4 w-4 text-primary-600" aria-hidden />
        Share Your Page
      </h3>
      <p className="text-xs text-ink-muted mb-4">
        Share your dealership page with customers and on social media.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopyLink}
          className={`btn-sm inline-flex items-center gap-1.5 ${
            copied
              ? "bg-success-50 text-success-700 border border-success-200"
              : "btn-outline"
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>

        {/* WhatsApp Share */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${dealerUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sm btn-whatsapp inline-flex items-center gap-1.5"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          WhatsApp
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
          className="btn-sm bg-[#1565D8] text-white hover:bg-[#0c64d4] inline-flex items-center gap-1.5"
        >
          Facebook
        </a>
      </div>

      {/* URL Preview */}
      <div className="mt-4 rounded-lg bg-surface-alt border border-border px-4 py-3">
        <p className="text-xs text-ink-muted font-mono break-all">{dealerUrl}</p>
      </div>
    </div>
  );
}
