"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import QRCodeCard from "@/components/QRCodeCard";
import { Award, Globe, UploadCloud, CheckCircle, Check, Sparkles, MessageCircle, Camera, Link2 } from "lucide-react";
import type { ApiDealerProfile, SocialLinks } from "@/lib/api-types";

const SOCIAL_ICONS: Record<keyof SocialLinks, ComponentType<{ className?: string }>> = {
  whatsapp: MessageCircle,
  instagram: Camera,
  facebook: Link2,
};

const SOCIAL_COLORS: Record<keyof SocialLinks, string> = {
  whatsapp: "text-green-600",
  instagram: "text-pink-600",
  facebook: "text-blue-600",
};

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
  profileAbout,
  onProfileAboutChange,
  profilePhone,
  onProfilePhoneChange,
  profileAddress,
  onProfileAddressChange,
  profileCity,
  onProfileCityChange,
  profileSocial,
  onProfileSocialChange,
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
  profileAbout: string;
  onProfileAboutChange: (value: string) => void;
  profilePhone: string;
  onProfilePhoneChange: (value: string) => void;
  profileAddress: string;
  onProfileAddressChange: (value: string) => void;
  profileCity: string;
  onProfileCityChange: (value: string) => void;
  profileSocial: SocialLinks;
  onProfileSocialChange: (platform: keyof SocialLinks, value: string) => void;
  bannerFile: File | null;
  onBannerFileChange: (file: File | null) => void;
  savingProfile: boolean;
  onMicroWebsiteSave: (e?: React.FormEvent<HTMLFormElement>) => void;
  slugStatus: "" | "available" | "taken";
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* ─── Left: forms ─── */}
      <div className="lg:col-span-8 space-y-6">

        {/* Trust & Verification */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-ink-strong mb-1 flex items-center gap-2">
            {/* Unified icon color text-primary-600 to align with standard design system */}
            <Award className="w-5 h-5 text-primary-600" />
            Trust & Verification
          </h2>
          <p className="text-sm text-ink-muted mb-6">Upload dealer credentials. The verified badge is added after KarBik reviews your document.</p>

          {dealerProfile?.isVerified && (
            <div className="mb-6 rounded-xl bg-success-50 border border-success-200 p-4 flex items-start gap-3">
              <span className="p-1 rounded-lg bg-success-700 text-white shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </span>
              <div>
                <p className="font-semibold text-success-800 text-sm">Dealership verified</p>
                <p className="text-xs text-success-600 mt-0.5">Your verified badge is live on all listings.</p>
              </div>
            </div>
          )}

          {!dealerProfile?.isVerified && dealerProfile?.verificationDoc && (
            <div className="mb-6 rounded-xl bg-warning-50 border border-warning-200 p-4">
              <p className="font-semibold text-warning-800 text-sm">Document under review</p>
              <p className="text-xs text-warning-700 mt-0.5">We have your document. The verified badge goes live once it is approved.</p>
            </div>
          )}

          <form onSubmit={onVerificationSubmit} className="space-y-5">
            <div>
              <label className="label">Business name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => onBusinessNameChange(e.target.value)}
                className="input"
                placeholder="e.g. Premium Auto Motors"
                required
              />
            </div>

            <div>
              <label className="label">Verification document</label>
              <div className="relative border-2 border-dashed border-border-strong hover:border-primary-500 rounded-xl p-6 transition-colors bg-surface-alt text-center cursor-pointer group">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => onVerificationDocChange(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <UploadCloud className="w-8 h-8 text-ink-subtle group-hover:text-primary-500 transition-colors mx-auto mb-2" />
                <p className="text-sm font-medium text-ink">
                  {verificationDoc ? verificationDoc.name : "Choose file or drag and drop"}
                </p>
                <p className="text-xs text-ink-subtle mt-1">PNG, JPG, or PDF</p>
              </div>
            </div>

            <button type="submit" disabled={uploadingDoc} className="btn-md btn-primary shadow-sm">
              {uploadingDoc ? "Saving..." : "Submit for verification"}
            </button>
          </form>
        </div>

        {/* Micro-website */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-ink-strong mb-1 flex items-center gap-2">
            {/* Unified icon color text-primary-600 to align with standard design system */}
            <Globe className="w-5 h-5 text-primary-600" />
            Branded micro-website
          </h2>
          <p className="text-sm text-ink-muted mb-6">A custom landing page to share with buyers.</p>

          {profileSlug && (
            <div className="mb-6 rounded-xl bg-primary-50 border border-primary-200 p-4">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">Your page URL</p>
              <Link
                href={`/dealer/${profileSlug}`}
                className="text-sm font-semibold text-primary-700 hover:underline break-all"
                target="_blank"
              >
                {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dealer/{profileSlug}
              </Link>
            </div>
          )}

          <form onSubmit={onMicroWebsiteSave} className="space-y-5">
            <div>
              <label className="label">URL path</label>
              <div className="flex items-center gap-0">
                <span className="text-sm font-medium text-ink-subtle px-3 py-2.5 bg-surface-alt rounded-l-lg border border-r-0 border-border-strong">
                  /dealer/
                </span>
                <input
                  type="text"
                  value={profileSlug}
                  onChange={(e) => onProfileSlugChange(e.target.value)}
                  className="input rounded-l-none"
                  placeholder="premium-auto-motors"
                  required
                />
              </div>
              {slugStatus === "available" && (
                <p className="mt-1.5 text-xs text-success-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> URL available
                </p>
              )}
              {slugStatus === "taken" && (
                <p className="mt-1.5 text-xs text-danger-600 font-medium">URL is already taken. Try a different name.</p>
              )}
              <p className="helper-text">Lowercase letters, numbers, and hyphens only. Minimum 3 characters.</p>
            </div>

            <div>
              <label className="label">About your dealership</label>
              <textarea
                value={profileAbout}
                onChange={(e) => onProfileAboutChange(e.target.value)}
                rows={4}
                className="input resize-none text-sm leading-relaxed"
                placeholder="Describe your dealership, credentials, and values..."
                maxLength={1000}
              />
              <p className="helper-text text-right">{profileAbout.length}/1000</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Contact phone</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => onProfilePhoneChange(e.target.value)}
                  className="input"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  value={profileCity}
                  onChange={(e) => onProfileCityChange(e.target.value)}
                  className="input"
                  placeholder="Mumbai"
                />
              </div>
            </div>

            <div>
              <label className="label">Showroom address</label>
              <input
                type="text"
                value={profileAddress}
                onChange={(e) => onProfileAddressChange(e.target.value)}
                className="input"
                placeholder="Showroom 12, Main Road, Area"
              />
            </div>

            <div>
              <label className="label">Cover banner</label>
              {dealerProfile?.bannerImage?.url && (
                // We add the relative class to the parent div because Next.js layout 'fill' requires
                // relative coordinates to bind absolute positioning of visual elements.
                <div className="relative mb-3 rounded-xl overflow-hidden border border-border h-24 shadow-sm">
                  <Image 
                    loader={cloudinaryLoader}
                    src={dealerProfile.bannerImage.url} 
                    alt="Showroom cover" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              <div className="relative border border-border-strong hover:border-primary-500 rounded-xl p-4 transition-colors bg-surface text-center cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onBannerFileChange(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <p className="text-xs font-medium text-ink group-hover:text-primary-600">
                  {bannerFile ? bannerFile.name : "Select cover image"}
                </p>
                <p className="text-xs text-ink-subtle mt-0.5">Recommended: 1200x400px</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="label">Social links</label>
              {Object.entries(profileSocial).map(([platform, value]) => {
                const key = platform as keyof SocialLinks;
                const Icon = SOCIAL_ICONS[key];
                return (
                  <div key={platform} className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 shrink-0 ${SOCIAL_COLORS[key]}`} />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => onProfileSocialChange(key, e.target.value)}
                      className="input py-2 text-sm"
                      placeholder={platform === "whatsapp" ? "919876543210" : `${platform}_handle`}
                    />
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={savingProfile || slugStatus === "taken"}
              className="btn-md btn-primary shadow-sm"
            >
              {savingProfile ? "Saving..." : "Save & publish"}
            </button>
          </form>
        </div>
      </div>

      {/* ─── Right: ratings & QR ─── */}
      <div className="lg:col-span-4 space-y-6">
        {dealerProfile && (
          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-warning-50 text-warning-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-ink-muted mb-0.5">Review rating</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-ink-strong leading-none">{dealerProfile.averageRating.toFixed(1)}</span>
                <span className="text-xs text-ink-subtle">({dealerProfile.totalReviews} reviews)</span>
              </div>
            </div>
          </div>
        )}

        {dealerProfile?.slug && (
          <QRCodeCard slug={dealerProfile.slug} />
        )}
      </div>
    </div>
  );
}
