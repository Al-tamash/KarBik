"use client";

/**
 * QRCodeCard — Generates and displays a downloadable QR code
 *
 * HOW QR CODES WORK:
 * A QR code is a 2D barcode that stores text data (in our case, a URL).
 * When someone scans it with their phone camera, the phone opens the URL.
 *
 * We use the "qrcode" npm package to generate the QR code entirely in the
 * browser as a PNG image (no external API calls needed). The generated
 * image is stored as a "data URL" — a base64-encoded image string that
 * the browser can display directly without downloading anything.
 *
 * WHY THIS MATTERS FOR DEALERS:
 * Print the QR code → paste on showroom window → buyers scan → see inventory.
 * This is a physical-to-digital bridge that no competitor offers.
 */
import { useState, useEffect } from "react";
import QRCode from "qrcode";
// Import optimized next/image component
import Image from "next/image";
import { Smartphone, Download } from "lucide-react";

export default function QRCodeCard({ slug }: { slug: string }) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  // Build the full URL that the QR code will encode
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dealerUrl = `${APP_URL}/dealer/${slug}`;

  /**
   * Generate QR code whenever the slug changes.
   *
   * QRCode.toDataURL converts a string into a PNG image encoded as base64.
   * The result looks like: "data:image/png;base64,iVBORw0KGgo..."
   * This can be used directly as an <img> src.
   */
  useEffect(() => {
    if (!slug) return;

    QRCode.toDataURL(dealerUrl, {
      width: 300,        // 300px wide QR code
      margin: 2,         // small white border around the QR
      color: {
        dark: "#0f172a",  // dark pixels (foreground) — matches our theme
        light: "#ffffff", // light pixels (background) — white
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR generation failed:", err));
  }, [slug, dealerUrl]);

  /**
   * handleDownload — saves the QR code as a PNG file
   *
   * How it works:
   * 1. Create a temporary <a> tag in memory
   * 2. Set its href to the data URL (the QR image)
   * 3. Set the download attribute (tells browser to save instead of navigate)
   * 4. Programmatically click it
   * 5. Remove the temporary element
   */
  function handleDownload() {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `karbik-qr-${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Don't render anything if no slug is set
  if (!slug) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold text-neutral-900 mb-1 flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-primary-600" /> Your Showroom QR Code
      </h3>
      <p className="text-xs text-neutral-500 mb-4">
        Print this QR code and display it at your showroom. When customers scan
        it, they&apos;ll see all your listings.
      </p>

      {qrDataUrl ? (
        <div className="flex flex-col items-center">
          {/* The QR code image */}
          <div className="rounded-xl border-2 border-dashed border-neutral-200 p-4 bg-white flex items-center justify-center">
            {/* 
              We use unoptimized={true} here because the QR code image is a client-side generated
              Base64 string. By bypassing the remote image loader pipelines, we allow instant
              local display while maintaining exact width/height constraints to eliminate CLS layout shifts!
            */}
            <Image
              src={qrDataUrl}
              alt={`QR code for ${slug}`}
              width={192}
              height={192}
              unoptimized={true}
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* The URL that the QR code links to */}
          <p className="mt-3 text-xs text-neutral-500 text-center break-all max-w-xs">
            {dealerUrl}
          </p>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="mt-4 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" /> Download QR Code
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
          <p className="text-sm text-neutral-500 ml-2">Generating QR...</p>
        </div>
      )}
    </div>
  );
}
