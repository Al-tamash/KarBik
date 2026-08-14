"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import QRCodeCard from "@/components/QRCodeCard";
import { Award, Globe, UploadCloud, CheckCircle, Check, Sparkles, MessageCircle, Camera, Link2 } from "lucide-react";

const SOCIAL_ICONS = {
  whatsapp: MessageCircle,
  instagram: Camera,
  facebook: Link2,
};

const SOCIAL_COLORS = {
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
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* ─── Left: forms ─── */}
      <div className="lg:col-span-8 space-y-6">

        {/* Trust & Verification */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-neutral-900 mb-1 flex items-center gap-2">
            {/* Unified icon color text-primary-600 to align with standard design system */}
            <Award className="w-5 h-5 text-primary-600" />
            Trust & Verification
          </h2>
          <p className="text-sm text-neutral-500 mb-6">Upload dealer credentials to receive a verified badge.</p>

          {dealerProfile?.isVerified && (
            <div className="mb-6 rounded-xl bg-success-50 border border-success-200 p-4 flex items-start gap-3">
              <span className="p-1 rounded-lg bg-success-600 text-white shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </span>
              <div>
                <p className="font-semibold text-success-800 text-sm">Dealership verified</p>
                <p className="text-xs text-success-600 mt-0.5">Your verified badge is live on all listings.</p>
              </div>
            </div>
          )}

          <form onSubmit={onVerificationSubmit} className="space-y-5">
            <div>
              <label className="label">Business name</label>
              <input
                type="text"
                value={businessName}
                onChange={onBusinessNameChange}
                className="input"
                placeholder="e.g. Premium Auto Motors"
                required
              />
            </div>

            <div>
              <label className="label">Verification document</label>
              <div className="relative border-2 border-dashed border-neutral-300 hover:border-primary-500 rounded-xl p-6 transition-colors bg-neutral-50 text-center cursor-pointer group">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={onVerificationDocChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <UploadCloud className="w-8 h-8 text-neutral-400 group-hover:text-primary-500 transition-colors mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-700">
                  {verificationDoc ? verificationDoc.name : "Choose file or drag and drop"}
                </p>
                <p className="text-xs text-neutral-400 mt-1">PNG, JPG, or PDF</p>
              </div>
            </div>

            <button type="submit" disabled={uploadingDoc} className="btn-md btn-primary shadow-sm">
              {uploadingDoc ? "Saving..." : "Submit for verification"}
            </button>
          </form>
        </div>

        {/* Micro-website */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-neutral-900 mb-1 flex items-center gap-2">
            {/* Unified icon color text-primary-600 to align with standard design system */}
            <Globe className="w-5 h-5 text-primary-600" />
            Branded micro-website
          </h2>
          <p className="text-sm text-neutral-500 mb-6">A custom landing page to share with buyers.</p>

          {profileSlug && (
            <div className="mb-6 rounded-xl bg-primary-50 border border-primary-200 p-4">
              <p className="text-[10px] font-semibold text-primary-600 uppercase tracking-wide mb-1">Your page URL</p>
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
                <span className="text-sm font-medium text-neutral-400 px-3 py-2.5 bg-neutral-100 rounded-l-lg border border-r-0 border-neutral-300">
                  /dealer/
                </span>
                <input
                  type="text"
                  value={profileSlug}
                  onChange={onProfileSlugChange}
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
                onChange={onProfileAboutChange}
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
                  onChange={onProfilePhoneChange}
                  className="input"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  value={profileCity}
                  onChange={onProfileCityChange}
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
                onChange={onProfileAddressChange}
                className="input"
                placeholder="Showroom 12, Main Road, Area"
              />
            </div>

            <div>
              <label className="label">Cover banner</label>
              {dealerProfile?.bannerImage?.url && (
                // We add the relative class to the parent div because Next.js layout 'fill' requires
                // relative coordinates to bind absolute positioning of visual elements.
                <div className="relative mb-3 rounded-xl overflow-hidden border border-neutral-200 h-24 shadow-sm">
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
              <div className="relative border border-neutral-300 hover:border-primary-500 rounded-xl p-4 transition-colors bg-white text-center cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onBannerFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <p className="text-xs font-medium text-neutral-700 group-hover:text-primary-600">
                  {bannerFile ? bannerFile.name : "Select cover image"}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Recommended: 1200x400px</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="label">Social links</label>
              {Object.entries(profileSocial).map(([platform, value]) => {
                const Icon = SOCIAL_ICONS[platform];
                return (
                  <div key={platform} className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 shrink-0 ${SOCIAL_COLORS[platform]}`} />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => onProfileSocialChange(platform, e.target.value)}
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
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-0.5">Review rating</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-neutral-900 leading-none">{dealerProfile.averageRating.toFixed(1)}</span>
                <span className="text-xs text-neutral-400">({dealerProfile.totalReviews} reviews)</span>
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
