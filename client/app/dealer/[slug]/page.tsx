import React from "react";
import Link from "next/link";
// Optimized next/image for lightning-fast responsive images
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Car as CarIcon,
  MapPin,
  Phone,
  Star,
  Store as StoreIcon,
} from "lucide-react";
import DealerShareButton from "@/components/DealerShareButton";
import DealerConciergeAction from "@/components/DealerConciergeAction";
import ShareButtons from "@/components/ShareButtons";
import type { ApiCar, ApiPublicDealerProfile, ApiReview } from "@/lib/api-types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type DealerPageResponse = {
  profile: ApiPublicDealerProfile;
  cars: ApiCar[];
  reviews: ApiReview[];
};

/**
 * WHAT ARE WE BUILDING:
 * We are converting the Dealer Showroom micro-website page into a React 19 / Next.js 16
 * Server Component (RSC).
 *
 * WHY IS IT NEEDED:
 * 1. SEO Crawling: Search engines (Googlebot, social preview scrapers) need static HTML
 *    headers to index dealer profile keywords and preview images. Client-side fetching
 *    renders as blank to crawlers.
 * 2. High Performance: Fetching data directly on the server cuts out extra client round-trips,
 *    delivering ready-to-display pixels instantly for a premium "human-crafted" feel.
 */

/**
 * generateMetadata — Dynamic SEO header generation
 *
 * Next.js 16 calls this function on the server at request time to generate
 * SEO meta tags (<title>, <meta description>, OpenGraph, etc.).
 * In Next.js 16, params is a Promise so we MUST await it.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const res = await fetch(`${APP_URL}/api/dealers/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Showroom Not Found" };

    const data = (await res.json()) as { profile?: ApiPublicDealerProfile };
    const profile = data?.profile;
    if (!profile) return { title: "Showroom Not Found" };

    const name = profile.businessName || "Premium Dealer";
    const city = profile.city ? ` in ${profile.city}` : "";
    const title = `${name} — Premium Used Cars Showroom${city}`;
    const description = profile.about?.slice(0, 160) ||
      `Browse premium certified pre-owned cars at ${name}${city}. Explore inventory, read ratings and ask KarBik support to connect you.`;
    const bannerUrl = profile.bannerImage?.url || "";

    return {
      title,
      description,
      ...(profile.isSample ? { robots: { index: false, follow: false } } : {}),
      openGraph: {
        title,
        description,
        url: `${APP_URL}/dealer/${slug}`,
        siteName: "KarBik Showrooms",
        images: bannerUrl ? [{ url: bannerUrl, width: 1200, height: 630, alt: name }] : [],
        locale: "en_IN",
        type: "profile",
      },
      twitter: {
        card: "summary_large_image" as const,
        title,
        description,
        images: bannerUrl ? [bannerUrl] : [],
      },
    };
  } catch (err) {
    return { title: "Dealer Showroom" };
  }
}

export default async function DealerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let data: DealerPageResponse | null = null;
  let error = "";

  // Fetch data directly in Server Components — no useEffect needed
  try {
    const res = await fetch(`${APP_URL}/api/dealers/${slug}`, { cache: "no-store" });
    if (!res.ok) {
      error = "Showroom Not Found";
    } else {
      data = (await res.json()) as DealerPageResponse;
    }
  } catch (err) {
    error = "Failed to load dealer page";
  }

  // Not Found fallback UI
  if (error || !data) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center bg-surface-alt text-center px-4">
        <StoreIcon className="mb-6 h-16 w-16 text-border-strong opacity-60" strokeWidth={1.5} aria-hidden />
        <h1 className="text-2xl font-bold text-ink-strong mb-3">
          {error || "Showroom Not Found"}
        </h1>
        <p className="text-sm text-ink-muted mb-6 max-w-md">
          The dealer you are looking for doesn&apos;t exist or hasn&apos;t set up their public profile yet.
        </p>
        <Link href="/cars" className="rounded-full bg-primary-600 px-8 py-3 text-sm font-bold text-white hover:bg-primary-800 transition-colors">
          Browse All Cars
        </Link>
      </div>
    );
  }

  const { profile, cars, reviews } = data;
  const initials = (profile.businessName || "D")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Structured Schema.org data for Google AutoDealer snippets
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": profile.businessName || "Premium Dealer",
    "description": profile.about || "Premium certified used car showroom",
    "image": profile.bannerImage?.url || "",
    "url": `${APP_URL}/dealer/${profile.slug || slug}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": profile.address || "",
      "addressLocality": profile.city || "",
      "addressCountry": "IN"
    },
    ...(profile.totalReviews > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": profile.averageRating || 5.0,
        "reviewCount": profile.totalReviews || 1
      }
    } : {})
  };

  return (
    <div className="min-h-screen bg-surface-alt font-sans selection:bg-primary-600/30">
      {/* 1. Inject JSON-LD Schema on the server side for search engine crawl results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      {/* ─── Immersive Hero Section ─── */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden bg-neutral-900 px-4 py-20 text-center">
        {/* Banner Background */}
        {profile.bannerImage?.url && (
          // We set priority={true} on this cover image because it is the primary above-the-fold
          // LCP asset. This signals the browser to fetch it immediately, accelerating load times.
          <Image
            src={profile.bannerImage.url}
            alt={`${profile.businessName} showroom`}
            fill
            sizes="100vw"
            priority={true}
            className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity"
          />
        )}

        {/* Grain Overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />

        {/* Gradients */}
        <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-900/80 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-neutral-900/50 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 flex max-w-3xl flex-col items-center">
          {/* Solid monogram tile — no glass, no gradient fill */}
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-surface shadow-xl ring-1 ring-white/20">
            <span className="text-3xl font-display font-bold tracking-tight text-primary-600">
              {initials}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight drop-shadow-xl">
              {profile.businessName || "Premium Auto"}
            </h1>
            {profile.isSample && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-700 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                SAMPLE SHOWROOM
              </span>
            )}
            {profile.isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                <BadgeCheck className="h-3.5 w-3.5" /> VERIFIED
              </span>
            )}
          </div>

          <p className="mb-8 max-w-xl text-lg text-neutral-300 font-medium leading-relaxed drop-shadow">
            {profile.city ? `Premium pre-owned cars in ${profile.city}. ` : ""}
            Find your next dream car with complete peace of mind.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#inventory" className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-neutral-900 shadow-lg hover:bg-neutral-100 hover:scale-105 transition-all">
              View Inventory
            </a>
            {/* Interactive button cleanly extracted into leaf client component */}
            <DealerShareButton slug={profile.slug || slug} businessName={profile.businessName} />
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <div className="relative z-20 -mt-8 mx-auto max-w-4xl px-4 sm:px-6">
        <div className="grid grid-cols-3 divide-x divide-border rounded-2xl bg-surface p-6 shadow-xl">
          <div className="flex flex-col items-center text-center px-4">
            <span className="text-3xl font-black text-ink-strong">{cars.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-ink-subtle mt-1">Vehicles</span>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            {/* Honest rating: no invented 5.0 when nobody has reviewed yet */}
            {profile.averageRating > 0 ? (
              <div className="flex items-center gap-1 text-3xl font-black text-ink-strong">
                {profile.averageRating.toFixed(1)}
                <Star className="h-5 w-5 fill-warning-400 text-warning-400 -mt-1" />
              </div>
            ) : (
              <span className="text-base font-bold text-ink-muted leading-[2.6rem]">New</span>
            )}
            <span className="text-xs font-bold uppercase tracking-widest text-ink-subtle mt-1">{profile.totalReviews} Reviews</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            {/* Status reflects actual verification state, not invented opening hours */}
            {profile.isVerified ? (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-success-600 bg-success-50 px-3 py-1.5 rounded-full">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            ) : (
              <span className="text-sm font-bold text-ink-muted bg-surface-alt px-3 py-1.5 rounded-full">Pending review</span>
            )}
            <span className="text-xs font-bold uppercase tracking-widest text-ink-subtle mt-2">Status</span>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-16 space-y-24">
        {/* ─── About Section ─── */}
        {profile.about && (
          <section className="mx-auto max-w-3xl text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 mb-4">About Us</h2>
            <p className="text-xl sm:text-2xl text-ink-muted font-medium leading-relaxed">
              &quot;{profile.about}&quot;
            </p>
          </section>
        )}

        {/* ─── Inventory Grid ─── */}
        <section id="inventory" className="scroll-mt-24">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-ink-strong tracking-tight mb-2">Current Inventory</h2>
              <p className="text-ink-muted font-medium">Hand-picked collection ready for test drive.</p>
            </div>
          </div>

          {cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface py-24 text-center">
              <CarIcon className="mb-4 h-14 w-14 text-border-strong opacity-60" strokeWidth={1.5} aria-hidden />
              <h3 className="text-lg font-bold text-ink-strong mb-1">Showroom Empty</h3>
              <p className="text-ink-muted max-w-sm">This dealer hasn&apos;t listed any vehicles yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <Link
                  key={car.id}
                  href={`/cars/${car.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-border hover:shadow-card-hover hover:ring-primary-600/20 transition-all duration-300 animate-slide-up"
                >
                  {/* Car Image Area */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-alt">
                    {car.images?.[0]?.url ? (
                      // Next.js Image optimizes layout shifts, dynamic aspect crops, and serves WebP.
                      <Image
                        src={car.images[0].url}
                        alt={car.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-surface-alt">
                        <CarIcon className="h-10 w-10 text-border-strong" strokeWidth={1.5} aria-hidden />
                      </div>
                    )}

                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {car.isBoosted && (
                        <span className="inline-flex items-center rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                          Featured
                        </span>
                      )}
                      {car.isInspected && (
                        <span className="inline-flex items-center rounded-full bg-success-700 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                          Inspected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Car Details Area */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-ink-subtle mb-1">
                        {car.brand} • {car.year}
                      </p>
                      <h3 className="text-lg font-bold text-ink-strong line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {car.title}
                      </h3>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <p className="text-2xl font-black text-ink-strong tracking-tight">
                        ₹{car.price.toLocaleString("en-IN")}
                      </p>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-ink-subtle group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ─── Testimonials ─── */}
        {reviews.length > 0 && (
          <section className="rounded-2xl bg-neutral-900 px-4 py-20 sm:px-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-display font-bold text-white tracking-tight mb-2 text-center">Customer Experiences</h2>
              <p className="text-neutral-300 font-medium text-center mb-12">Hear from people who bought from {profile.businessName}.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="rounded-2xl bg-neutral-850 p-6 ring-1 ring-white/10 flex flex-col">
                    <div className="flex items-center gap-0.5 mb-4">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-4 w-4 ${
                            n <= rev.rating
                              ? "fill-warning-400 text-warning-400"
                              : "text-neutral-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-neutral-200 leading-relaxed mb-6 italic">&quot;{rev.comment}&quot;</p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                        {rev.buyerName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{rev.buyerName}</p>
                        <p className="text-xs text-neutral-400">Verified Buyer</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── Contact & Location Section ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-surface rounded-2xl p-8 sm:p-12 shadow-sm ring-1 ring-border flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-display font-bold text-ink-strong tracking-tight mb-6">Visit Our Showroom</h2>
              <p className="text-ink-muted font-medium mb-8 max-w-md leading-relaxed">
                We&apos;re here to help you find the perfect vehicle. Reach out to us via phone, WhatsApp, or drop by our showroom.
              </p>

              <div className="space-y-6">
                <DealerConciergeAction
                  dealerId={profile.user}
                  dealerName={profile.businessName || "Showroom"}
                  dealerCity={profile.city || ""}
                />

                {(profile.address || profile.city) && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <MapPin className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-ink-subtle mb-1">Location</p>
                      <p className="font-bold text-ink-strong max-w-xs">{profile.address}{profile.address && profile.city ? ", " : ""}{profile.city}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-subtle mb-3">Instant Showroom QR & Share Channels</p>
              <ShareButtons slug={profile.slug || slug} businessName={profile.businessName} />
            </div>
          </div>

          <div className="relative aspect-square sm:aspect-auto w-full rounded-2xl bg-neutral-900 overflow-hidden ring-1 ring-border flex items-center justify-center p-8 text-center text-white">
             {/* Subtle dot texture on a solid dark backplate — no decorative gradients */}
             <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#ffffff 2px, transparent 2px)", backgroundSize: "32px 32px" }}></div>
             <div className="z-10 flex flex-col items-center">
                <StoreIcon className="mb-4 h-12 w-12 text-primary-300" strokeWidth={1.5} aria-hidden />
                <p className="font-display font-bold text-white text-2xl tracking-tight">{profile.businessName}</p>
                <p className="text-primary-300 font-bold text-xs uppercase tracking-widest mt-2">{profile.city || "Verified Location"}</p>
                <div className="mt-6 flex gap-3">
                  {profile.socialLinks?.instagram && (
                    <a href={profile.socialLinks.instagram.startsWith("http") ? profile.socialLinks.instagram : `https://instagram.com/${profile.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-tr from-[#fd5949] to-[#d6249f] text-white hover:scale-110 transition-transform shadow-lg shadow-[#d6249f]/20 font-bold">I</a>
                  )}
                  {profile.socialLinks?.facebook && (
                    <a href={profile.socialLinks.facebook.startsWith("http") ? profile.socialLinks.facebook : `https://facebook.com/${profile.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1565D8] text-white hover:scale-110 transition-transform shadow-lg shadow-[#1565D8]/20 font-bold">F</a>
                  )}
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
