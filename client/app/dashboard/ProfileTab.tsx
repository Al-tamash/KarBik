"use client";

/**
 * The dealer's profile: who they are on KarBik, and the page buyers see when the link is shared.
 *
 * It asks only for what is used. The storefront (app/dealer/[slug]) shows the dealer's name, city
 * and cars, so there is no "about", street address or social links field any more (they let a
 * buyer skip KarBik and were hidden from the public page). The banner field appears only while
 * SHOW_DEALER_BANNER is on, and the rating only while SHOW_DEALER_REVIEWS is on (lib/flags.ts).
 * The contact phone is where KarBik support forwards leads and is never shown to buyers.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

import cloudinaryLoader from "@/lib/cloudinary-loader";
import QRCodeCard from "@/components/QRCodeCard";
import { SHOW_DEALER_BANNER, SHOW_DEALER_REVIEWS } from "@/lib/flags";
import { CONTACT_DETAILS_MESSAGE, findContactDetails } from "@autobazaar/shared";
import type { ApiDealerProfile } from "@/lib/api-types";

/** A tagline or an area after the name ("Apex Motors - Certified Pre-Owned Jubilee Hills"). */
function nameWarning(name: string): string {
  if (findContactDetails(name)) return CONTACT_DETAILS_MESSAGE;
  if (/\s[-–—|]\s/.test(name)) return "Buyers see only the part before the dash. Keep just your showroom's name.";
  return "";
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-border pt-6">
      <h2 id={id} className="font-display text-xl font-bold text-ink-strong">
        {title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export default function ProfileTab({
  dealerProfile,
  businessName,
  onBusinessNameChange,
  verificationDoc,
  onVerificationDocChange,
  uploadingDoc,
  onVerificationSubmit,
  profileSlug,
  onProfileSlugChange,
  profilePhone,
  onProfilePhoneChange,
  profileCity,
  onProfileCityChange,
  bannerFile,
  onBannerFileChange,
  savingProfile,
  onMicroWebsiteSave,
  slugStatus,
}: {
  dealerProfile: ApiDealerProfile | null;
  businessName: string;
  onBusinessNameChange: (value: string) => void;
  verificationDoc: File | null;
  onVerificationDocChange: (file: File | null) => void;
  uploadingDoc: boolean;
  onVerificationSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  profileSlug: string;
  onProfileSlugChange: (slug: string) => void;
  profilePhone: string;
  onProfilePhoneChange: (value: string) => void;
  profileCity: string;
  onProfileCityChange: (value: string) => void;
  bannerFile: File | null;
  onBannerFileChange: (file: File | null) => void;
  savingProfile: boolean;
  onMicroWebsiteSave: (e?: React.FormEvent<HTMLFormElement>) => void;
  slugStatus: "" | "available" | "taken";
}) {
  const warning = nameWarning(businessName);
  const nameBlocked = Boolean(findContactDetails(businessName));

  return (
    <div className="max-w-2xl space-y-8">
      <Section id="verification-heading" title="Verification">
        <p className="text-base text-ink-muted">
          Upload your dealer document. KarBik reviews it, and only then buyers see &quot;Verified dealer&quot; on your cars.
        </p>

        {dealerProfile?.isVerified && (
          <p role="status" className="text-base font-semibold text-ink">
            Your dealership is verified.
          </p>
        )}
        {!dealerProfile?.isVerified && dealerProfile?.verificationDoc && (
          <p role="status" className="text-base text-ink">
            Your document is with KarBik for review.
          </p>
        )}

        <form onSubmit={onVerificationSubmit} className="space-y-4">
          <div>
            <label htmlFor="business-name" className="label">
              Business name
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => onBusinessNameChange(e.target.value)}
              className="input"
              placeholder="Apex Motors"
              maxLength={120}
              required
              aria-describedby="business-name-hint"
            />
            <p id="business-name-hint" className="helper-text">
              Just your showroom&apos;s name. No tagline, area, phone number or link.
            </p>
            {warning && (
              <p role="alert" className={nameBlocked ? "error-text" : "helper-text"}>
                {warning}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="verification-doc" className="label">
              Verification document
            </label>
            <input
              id="verification-doc"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => onVerificationDocChange(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-ink-muted file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-lg file:border-0 file:bg-border file:px-4 file:text-sm file:font-semibold file:text-ink"
            />
            <p className="helper-text">{verificationDoc ? verificationDoc.name : "PNG, JPG or PDF. A new document puts your verification back in review."}</p>
          </div>

          <button
            type="submit"
            disabled={uploadingDoc || nameBlocked}
            className="btn btn-primary btn-md cursor-pointer disabled:opacity-60"
          >
            {uploadingDoc ? "Saving…" : "Submit for verification"}
          </button>
        </form>
      </Section>

      <Section id="page-heading" title="Your KarBik page">
        <p className="text-base text-ink-muted">The page buyers see when you share your link: your name, city and cars.</p>

        {profileSlug && (
          <p className="text-base text-ink">
            <Link
              href={`/dealer/${profileSlug}`}
              target="_blank"
              className="break-all font-semibold text-primary-600 underline underline-offset-2"
            >
              {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dealer/{profileSlug}
            </Link>
          </p>
        )}

        <form onSubmit={onMicroWebsiteSave} className="space-y-4">
          <div>
            <label htmlFor="profile-slug" className="label">
              Link
            </label>
            <div className="flex items-center">
              <span className="flex min-h-11 items-center rounded-l-lg border border-r-0 border-border-strong bg-surface-alt px-3 text-sm text-ink-muted">
                /dealer/
              </span>
              <input
                id="profile-slug"
                type="text"
                value={profileSlug}
                onChange={(e) => onProfileSlugChange(e.target.value)}
                className="input rounded-l-none"
                placeholder="apex-motors"
                required
              />
            </div>
            {slugStatus === "available" && (
              <p className="helper-text flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" aria-hidden /> Available
              </p>
            )}
            {slugStatus === "taken" && <p className="error-text">Already taken. Try a different name.</p>}
            <p className="helper-text">Lowercase letters, numbers and hyphens. At least 3 characters.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-phone" className="label">
                Contact phone
              </label>
              <input
                id="profile-phone"
                type="tel"
                inputMode="numeric"
                value={profilePhone}
                onChange={(e) => onProfilePhoneChange(e.target.value)}
                className="input"
                placeholder="9876543210"
                aria-describedby="profile-phone-hint"
              />
              <p id="profile-phone-hint" className="helper-text">
                KarBik support uses this to forward leads to you. It is never shown to buyers.
              </p>
            </div>
            <div>
              <label htmlFor="profile-city" className="label">
                City
              </label>
              <input
                id="profile-city"
                type="text"
                value={profileCity}
                onChange={(e) => onProfileCityChange(e.target.value)}
                className="input"
                placeholder="Hyderabad"
              />
            </div>
          </div>

          {SHOW_DEALER_BANNER && (
            <div>
              <label htmlFor="profile-banner" className="label">
                Cover banner
              </label>
              {dealerProfile?.bannerImage?.url && (
                <div className="relative mb-3 h-24 overflow-hidden rounded-xl border border-border">
                  <Image
                    loader={cloudinaryLoader}
                    src={dealerProfile.bannerImage.url}
                    alt="Your cover banner"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <input
                id="profile-banner"
                type="file"
                accept="image/*"
                onChange={(e) => onBannerFileChange(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-ink-muted file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-lg file:border-0 file:bg-border file:px-4 file:text-sm file:font-semibold file:text-ink"
              />
              <p className="helper-text">
                {bannerFile ? bannerFile.name : "A photo of your own showroom, 1200 by 400. No other business's board or stock photos."}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={savingProfile || slugStatus === "taken"}
            className="btn btn-primary btn-md cursor-pointer disabled:opacity-60"
          >
            {savingProfile ? "Saving…" : "Save and publish"}
          </button>
        </form>
      </Section>

      {SHOW_DEALER_REVIEWS && dealerProfile && (
        <Section id="rating-heading" title="Reviews">
          <p className="text-base text-ink tabular-nums">
            {dealerProfile.averageRating.toFixed(1)} ({dealerProfile.totalReviews} reviews)
          </p>
        </Section>
      )}

      {dealerProfile?.slug && (
        <Section id="qr-heading" title="Showroom QR code">
          <QRCodeCard slug={dealerProfile.slug} />
        </Section>
      )}
    </div>
  );
}
