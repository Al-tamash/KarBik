import React from "react";
import Link from "next/link";
// Optimized next/image for lightning-fast responsive images
import Image from "next/image";
import DealerShareButton from "@/components/DealerShareButton";
import ShareButtons from "@/components/ShareButtons";

const API = process.env.NEXT_PUBLIC_API_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const res = await fetch(`${API}/api/dealers/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Showroom Not Found | AutoBazaar" };

    const data = await res.json();
    const profile = data?.profile;
    if (!profile) return { title: "Showroom Not Found | AutoBazaar" };

    const name = profile.businessName || "Premium Dealer";
    const city = profile.city ? ` in ${profile.city}` : "";
    const title = `${name} — Premium Used Cars Showroom${city}`;
    const description = profile.about?.slice(0, 160) || 
      `Browse premium certified pre-owned cars at ${name}${city}. Explore inventory, view dynamic inspection status, read ratings, and contact directly.`;
    const bannerUrl = profile.bannerImage?.url || "";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${APP_URL}/dealer/${slug}`,
        siteName: "AutoBazaar Showrooms",
        images: bannerUrl ? [{ url: bannerUrl, width: 1200, height: 630, alt: name }] : [],
        locale: "en_IN",
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: bannerUrl ? [bannerUrl] : [],
      },
    };
  } catch (err) {
    return { title: "Dealer Showroom | AutoBazaar" };
  }
}

export default async function DealerPage({ params }) {
  const { slug } = await params;

  let data = null;
  let error = "";

  // Fetch data directly in Server Components — no useEffect needed
  try {
    const res = await fetch(`${API}/api/dealers/${slug}`, { cache: "no-store" });
    if (!res.ok) {
      error = "Showroom Not Found";
    } else {
      data = await res.json();
    }
  } catch (err) {
    error = "Failed to load dealer page";
  }

  // Not Found fallback UI
  if (error || !data) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center bg-neutral-50 text-center px-4">
        <span className="text-6xl mb-6 grayscale opacity-50">🏪</span>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">
          {error || "Showroom Not Found"}
        </h1>
        <p className="text-sm text-neutral-500 mb-6 max-w-md">
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
    "telephone": profile.phone || "",
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
    <div className="min-h-screen bg-neutral-50 font-sans selection:bg-primary-600/30">
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
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 p-1 shadow-2xl backdrop-blur-md ring-1 ring-white/20">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-linear-to-br from-white/20 to-white/5">
              <span className="text-3xl font-extrabold tracking-tighter text-white drop-shadow-md">
                {initials}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-xl">
              {profile.businessName || "Premium Auto"}
            </h1>
            {profile.isVerified && (
              <span className="flex h-8 items-center rounded-full bg-primary-600/20 px-3 text-xs font-bold text-blue-300 ring-1 ring-primary-600/30 backdrop-blur-md">
                <span className="mr-1.5 text-base">✓</span> VERIFIED
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
        <div className="grid grid-cols-3 divide-x divide-neutral-100 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-neutral-900/5 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center px-4">
            <span className="text-3xl font-black text-neutral-900">{cars.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-1">Vehicles</span>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <div className="flex items-center gap-1 text-3xl font-black text-neutral-900">
              {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "5.0"}
              <span className="text-xl text-yellow-400 -mt-1">★</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-1">{profile.totalReviews} Reviews</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">Open Today</span>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-2">Status</span>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-16 space-y-24">
        {/* ─── About Section ─── */}
        {profile.about && (
          <section className="mx-auto max-w-3xl text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 mb-4">About Us</h2>
            <p className="text-xl sm:text-2xl text-neutral-500 font-medium leading-relaxed">
              &quot;{profile.about}&quot;
            </p>
          </section>
        )}

        {/* ─── Inventory Grid ─── */}
        <section id="inventory" className="scroll-mt-24">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">Current Inventory</h2>
              <p className="text-neutral-500 font-medium">Hand-picked collection ready for test drive.</p>
            </div>
          </div>

          {cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-200 bg-white py-24 text-center">
              <span className="text-6xl mb-4 grayscale opacity-30">🚘</span>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Showroom Empty</h3>
              <p className="text-neutral-500 max-w-sm">This dealer hasn’t listed any vehicles yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <Link
                  key={car._id}
                  href={`/cars/${car._id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 hover:shadow-lg hover:ring-primary-600/20 transition-all duration-300 animate-slide-up"
                >
                  {/* Car Image Area */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100">
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
                      <div className="flex h-full items-center justify-center text-4xl">🚗</div>
                    )}
                    
                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {car.isBoosted && (
                        <span className="inline-flex items-center rounded-full bg-neutral-900/90 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xl ring-1 ring-white/10">
                          Featured
                        </span>
                      )}
                      {car.isInspected && (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xl ring-1 ring-white/10">
                          Inspected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Car Details Area */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">
                        {car.brand} • {car.year}
                      </p>
                      <h3 className="text-lg font-bold text-neutral-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {car.title}
                      </h3>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <p className="text-2xl font-black text-neutral-900 tracking-tight">
                        ₹{car.price.toLocaleString("en-IN")}
                      </p>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        →
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
          <section className="rounded-3xl bg-neutral-900 px-4 py-20 sm:px-12 relative overflow-hidden">
            <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-600/20 blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px]" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 text-center">Customer Experiences</h2>
              <p className="text-neutral-400 font-medium text-center mb-12">Hear from people who bought from {profile.businessName}.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((rev) => (
                  <div key={rev._id} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-1 text-yellow-400 mb-4 text-sm">
                      {"★".repeat(rev.rating)}
                      {"☆".repeat(5 - rev.rating)}
                    </div>
                    <p className="text-neutral-300 leading-relaxed mb-6 italic">&quot;{rev.comment}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-sm">
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
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm ring-1 ring-neutral-200 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-black text-neutral-900 tracking-tight mb-6">Visit Our Showroom</h2>
              <p className="text-neutral-500 font-medium mb-8 max-w-md leading-relaxed">
                We&apos;re here to help you find the perfect vehicle. Reach out to us via phone, WhatsApp, or drop by our showroom.
              </p>
              
              <div className="space-y-6">
                {profile.phone && (
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 text-xl">📞</div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Call Us</p>
                      <p className="font-bold text-neutral-900">{profile.phone}</p>
                    </div>
                  </div>
                )}
                
                {(profile.address || profile.city) && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 text-xl">📍</div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Location</p>
                      <p className="font-bold text-neutral-900 max-w-xs">{profile.address}{profile.address && profile.city ? ", " : ""}{profile.city}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-neutral-100 pt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Instant Showroom QR & Share Channels</p>
              <ShareButtons slug={profile.slug || slug} businessName={profile.businessName} />
            </div>
          </div>
          
          <div className="relative aspect-square sm:aspect-auto w-full rounded-2xl bg-neutral-900 overflow-hidden ring-1 ring-neutral-200 flex items-center justify-center p-8 text-center text-white">
             {/* Dynamic Ambient Background decoration */}
             {/* Replacing non-existent neutral-950 with standard black gradient stops for a correct, high-contrast visual backplate */}
             <div className="absolute inset-0 bg-gradient-to-br from-primary-600/30 via-black to-black"></div>
             <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#ffffff 2px, transparent 2px)", backgroundSize: "32px 32px" }}></div>
             <div className="z-10 flex flex-col items-center">
                <span className="text-7xl mb-4 block animate-bounce">🏪</span>
                <p className="font-black text-white text-2xl tracking-tight">{profile.businessName}</p>
                <p className="text-primary-300 font-bold text-xs uppercase tracking-widest mt-2">{profile.city || "Verified Location"}</p>
                <div className="mt-6 flex gap-3">
                  {profile.socialLinks?.whatsapp && (
                    <a href={`https://wa.me/${profile.socialLinks.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white hover:scale-110 transition-transform shadow-lg shadow-[#25D366]/20 font-bold">W</a>
                  )}
                  {profile.socialLinks?.instagram && (
                    <a href={profile.socialLinks.instagram.startsWith("http") ? profile.socialLinks.instagram : `https://instagram.com/${profile.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-tr from-[#fd5949] to-[#d6249f] text-white hover:scale-110 transition-transform shadow-lg shadow-[#d6249f]/20 font-bold">I</a>
                  )}
                  {profile.socialLinks?.facebook && (
                    <a href={profile.socialLinks.facebook.startsWith("http") ? profile.socialLinks.facebook : `https://facebook.com/${profile.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white hover:scale-110 transition-transform shadow-lg shadow-[#1877F2]/20 font-bold">F</a>
                  )}
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
