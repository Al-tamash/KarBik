/**
 * WHAT: We are updating client/app/page.js.
 * WHY: We are splitting the homepage into Server and Client components for SEO optimization.
 */

import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, Store, 
  MessageSquare, ArrowRight, Car,
  ChevronRight
} from "lucide-react";

import { API_BASE } from "@/lib/api-base";
import HeroSearchWidget from "@/components/HeroSearchWidget";
import FeaturedCars from "@/components/FeaturedCars";
import JustArrivedCars from "@/components/JustArrivedCars";

import Reveal from "@/components/Reveal";
import TrustStatsStrip from "@/components/TrustStatsStrip";

// Connect to the unified server API using the public environment variable


export const metadata = {
  title: "Used Cars in Hyderabad from Local Dealers | KarBik",
  description: "Browse used cars in Hyderabad from local dealers. Browse listings, compare cars and talk to KarBik support on WhatsApp or phone, who will connect you with the dealer. Free for buyers.",
  keywords: ["used cars in hyderabad", "second hand cars hyderabad", "pre-owned cars hyderabad", "verified car dealers hyderabad"],
};

export default async function Home() {

  // Fetch real stats from the API — we use limit=1 to minimize payload
  // and only read the `total` field from the response
  let stats = { totalCars: 0, loaded: false };
  try {
    const res = await fetch(`${API_BASE}/api/cars?limit=1`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      stats = { totalCars: data.total || 0, loaded: true };
    } else {
      stats.loaded = true;
    }
  } catch (err) {
    stats.loaded = true;
  }

  // Hero backdrop — real inventory photography (boosted listings sort first).
  // Falls back to a calm gradient when no photos exist yet.
  let heroImage: string | null = null;
  let heroCaption: string | null = null;
  try {
    const res = await fetch(`${API_BASE}/api/cars?limit=8`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      type HeroCar = { images?: Array<{ url?: string }>; city?: string; dealerProfile?: { businessName?: string } | null };
      const carsList: HeroCar[] = data.cars ?? [];
      const heroCar = carsList.find((c) => (c.images?.length ?? 0) > 0);
      heroImage = heroCar?.images?.[0]?.url ?? null;
      if (heroCar) {
        const bits = [heroCar.dealerProfile?.businessName, heroCar.city].filter(Boolean);
        heroCaption = bits.length > 0 ? bits.join(", ") : null;
      }
    }
  } catch {
    // Keep the gradient fallback
  }

  // Premium brand logo cards with local asset references
  const popularBrands = [
    { name: "Maruti Suzuki", searchBrand: "Maruti", logo: "svg" },
    { name: "Tata", searchBrand: "Tata", logo: "/images/company-logo-img/tata.png" },
    { name: "Kia", searchBrand: "Kia", logo: "/images/company-logo-img/kia-logo.avif" },
    { name: "Toyota", searchBrand: "Toyota", logo: "/images/company-logo-img/toy.jpg" },
    { name: "Hyundai", searchBrand: "Hyundai", logo: "/images/company-logo-img/hyundai.png" },
    { name: "Mahindra", searchBrand: "Mahindra", logo: "/images/company-logo-img/mahindra-logo.jpg" },
    { name: "Honda", searchBrand: "Honda", logo: "/images/company-logo-img/honda.jpg" },
    { name: "MG Motors", searchBrand: "MG", logo: "/images/company-logo-img/mg-motors-logo.png" },
    { name: "Renault", searchBrand: "Renault", logo: "/images/company-logo-img/renault-logo.png" },
    { name: "Ford", searchBrand: "Ford", logo: "/images/company-logo-img/ford-logo.jpg" },
  ];

  return (
    <div className="bg-bg min-h-screen font-sans">

      {/* ═══════════════════════════════════════════════
          SECTION 1 — Photo-Led Editorial Hero
          Full-bleed REAL inventory photography (boosted listings first).
          The headline sits on a solid bg wash anchored to the bottom so it
          stays legible in both colour modes. No gradients-for-decoration,
          no glass, no stock showroom renders.
      ═══════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden border-b border-border">
        <div className="absolute inset-0" aria-hidden>
          {heroImage ? (
            <>
              {/* Server Component — no custom loader prop here (functions cannot
                  cross the RSC boundary). res.cloudinary.com is whitelisted in
                  next.config.mjs, so the default optimizer handles it. */}
              <Image
                src={heroImage}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              {/* Readability wash — opaque at the text zone (bottom), lets the photo breathe up top */}
              <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/90 to-bg/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-primary-50/60 via-surface to-bg" />
          )}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 md:pt-24 pb-12 md:pb-16">
          <div className="max-w-2xl flex flex-col items-start gap-6">

            {/* Live-inventory caption — ties the photo to a real listing */}
            {heroImage && (
              <span className="inline-flex items-center gap-2 rounded-full bg-surface/95 border border-border px-3.5 py-1.5 text-xs font-semibold text-ink-muted shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" aria-hidden />
                {stats.totalCars > 0 && (
                  <strong className="font-bold text-ink">{stats.totalCars}+ cars</strong>
                )}
                {heroCaption && <span className="truncate">· real photos from {heroCaption}</span>}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink-strong tracking-tight leading-[1.08] text-balance">
              Hyderabad’s Marketplace<br />
              for <span className="text-primary-600">Used Cars</span> from Local Dealers
            </h1>

            <p className="text-base md:text-lg text-ink leading-relaxed max-w-xl">
              Browse listings, compare cars and tell KarBik support which one you like, on WhatsApp or by call back. We connect you with the dealer. Free for buyers. Look for the “RC checked” and “Verified dealer” badges for extra confidence.
            </p>

            {/* Solid search panel — overlaps the photo edge */}
            <div className="w-full">
              <HeroSearchWidget />
            </div>

            {/* Data-backed trust badges */}
            <div className="flex flex-wrap gap-3 mt-2">
              {stats.loaded && stats.totalCars > 0 && (
                <div className="flex items-center gap-1.5 bg-surface border border-border px-3.5 py-1.5 rounded-full text-ink text-xs font-semibold shadow-xs">
                  <Car className="h-3.5 w-3.5 text-primary-600" />
                  <span>{stats.totalCars}+ Cars Listed</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-surface border border-border px-3.5 py-1.5 rounded-full text-ink text-xs font-semibold shadow-xs">
                <Store className="h-3.5 w-3.5 text-success-600" />
                <span>Free for buyers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface border border-border px-3.5 py-1.5 rounded-full text-ink text-xs font-semibold shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-primary-600" />
                <span>WhatsApp support: 94947 20878</span>
              </div>
            </div>
            </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2 — Hyderabad Regional Car Hubs
          Structured editorial layout + highly readable solid cards
      ═══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-bg border-b border-border">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-10">
            <h2 className="text-3xl font-display font-bold text-ink-strong tracking-tight">Popular Hyderabad Car Hubs</h2>
            <p className="text-sm text-ink-muted mt-1 max-w-xl">
              Physical dealership zones verified by the KarBik team. Browse stocks in your neighborhood.
            </p>
          </div>

          {/* Snapping cards carousel — redesigned for high contrast and extreme readability */}
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 gap-6 snap-x snap-mandatory scrollbar-hide">
            
            {/* Kukatpally Miyapur */}
            <Link 
              href="/cars?location=Kukatpally"
              className="min-w-[280px] sm:min-w-[320px] bg-surface rounded-2xl overflow-hidden snap-center group cursor-pointer border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="h-36 w-full relative overflow-hidden bg-surface-alt">
                <Image alt="Kukatpally Miyapur Showrooms" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAvfYHsO0CGQTppXbbMsrZZEbDi4fRoD2ZWcpQTrik2ZjRCvrXnsBHyOr1PrP2ev9PvnTo5isZLr3hWg6W5zyzklN_-tk9laVXNiFBrC_RkRHzJqHx0o6r8Laf9DnswaDFiELTa2vsHW7MU-7_Qi07LgtcguqZIYjaKFhtXpX-UNL7SMgCfH7SxMK3kz0KlLMOKh6R5B8LtDsoFtCsfgp4oJoJz7zeK6rAHF2CDapjhvLn4xPL96Hf8-OgGyFZqJSQe4cDWEE5_fA" fill sizes="(max-width: 640px) 100vw, 320px" />
              </div>
              <div className="p-5 text-left border-t border-border flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 mb-2 uppercase tracking-wider">Automotive Corridor</span>
                  <h3 className="text-base font-bold text-ink-strong group-hover:text-primary-600 transition-colors">Kukatpally & Miyapur</h3>
                  <p className="text-xs text-ink-muted mt-1">Multi-brand showrooms & yards</p>
                </div>
              </div>
            </Link>

            {/* Secunderabad Minister Road */}
            <Link 
              href="/cars?location=Minister Road"
              className="min-w-[280px] sm:min-w-[320px] bg-surface rounded-2xl overflow-hidden snap-center group cursor-pointer border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="h-36 w-full relative overflow-hidden bg-surface-alt">
                <Image alt="Secunderabad Minister Road Stock" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEi3ZedMlzyvI8Twe8yFzh4WJmKsbWMgrIOM30hcqKCtlXRtId8W-tCdMoBQOtc2YBtSR47Y90Ye8W_Q4x_Ihdkg6aozTMf3BWRCykxwU2AE1AS7cz8ZbrT5E61UKyZaKMLQB63b__XgcrZJjgNuyiqm_FuA0C_0e5vGYHTqxAAZ64Qd-4IDvMAMEhpy3md6fDCkFOtEziWeFxTgcSl6kePlyJtjlENZb0IqnmAM6tHqT5n80QDkREMfUWjE378mdi0xcA1xfPn54" fill sizes="(max-width: 640px) 100vw, 320px" />
              </div>
              <div className="p-5 text-left border-t border-border flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 mb-2 uppercase tracking-wider">Established Market</span>
                  <h3 className="text-base font-bold text-ink-strong group-hover:text-primary-600 transition-colors">Secunderabad</h3>
                  <p className="text-xs text-ink-muted mt-1">Established dealer corridor</p>
                </div>
              </div>
            </Link>

            {/* Madhapur Gachibowli */}
            <Link 
              href="/cars?location=Madhapur"
              className="min-w-[280px] sm:min-w-[320px] bg-surface rounded-2xl overflow-hidden snap-center group cursor-pointer border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="h-36 w-full relative overflow-hidden bg-surface-alt">
                <Image alt="Madhapur Jubilee Hills Showrooms" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnKTY6eDTR_hjgETEyc3xOdJhDD7C1WC6vMW8AjXKfsViJ9ALfHhzu9fqXZOi5wdy56TP7We63pHjIoTTD05e4SwZh6l0MEZWePLiLYsD7G70sdr_dDRIe2e2CJ69RtmV3nQr9NMkOStO-wTuuSWkDDYkFW7D_9ctjjdwWRyKPQJm8w6JlYLxQNLeS8GO1cy7j_qJ6Rf5TyAWeBaKP6tNoJh861lR0C4VT1FkvLxdsNLHLAC_oFl6BaQEBC_MyI7TV52xhVoH9Zlk" fill sizes="(max-width: 640px) 100vw, 320px" />
              </div>
              <div className="p-5 text-left border-t border-border flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 mb-2 uppercase tracking-wider">Premium & Luxury</span>
                  <h3 className="text-base font-bold text-ink-strong group-hover:text-primary-600 transition-colors">Madhapur & Gachibowli</h3>
                  <p className="text-xs text-ink-muted mt-1">Premium & luxury inventory</p>
                </div>
              </div>
            </Link>

            {/* LB Nagar Dilsukhnagar */}
            <Link 
              href="/cars?location=LB Nagar"
              className="min-w-[280px] sm:min-w-[320px] bg-surface rounded-2xl overflow-hidden snap-center group cursor-pointer border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="h-36 w-full relative overflow-hidden bg-surface-alt">
                <Image alt="LB Nagar Family Car Hub" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8FFM3nizduDUGWP-YMj2Gs2Sl8an6W0GyuIb8VfrgTTh-bUfJK8Le5elberIg7e2wUTu87DbvwoqPvyJbmOM_bU6mIqn1T9EYtpxtvBaYUHRk55tpvqrs0lSiPnXgcZVHHt4gyMqow9m8sjUX0PKWCG1q9SMOCCY9kMmh_cODtJxEmpDGatcAkSKWfTt6ZSYk1YJb6MJXmIOs-lP9thEon48COOLuDuzZWZzsVxcUYAHHFCKqC70xUk3hCnPEGf1wiGv70S2lt5A" fill sizes="(max-width: 640px) 100vw, 320px" />
              </div>
              <div className="p-5 text-left border-t border-border flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 mb-2 uppercase tracking-wider">Budget-Friendly</span>
                  <h3 className="text-base font-bold text-ink-strong group-hover:text-primary-600 transition-colors">LB Nagar & Dilsukhnagar</h3>
                  <p className="text-xs text-ink-muted mt-1">Budget-friendly family options</p>
                </div>
              </div>
            </Link>
          </div>
        </Reveal>
      </section>

      <TrustStatsStrip />

      {/* ═══════════════════════════════════════════════
          SECTION 3 — Premium Brand Directory
          Elegant brand logos matching the requested brand slider mockup
      ═══════════════════════════════════════════════ */}
      <section className="py-16 bg-surface border-b border-border">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-8">
            <h2 className="text-3xl font-display font-bold text-ink-strong tracking-tight">Browse by Premium Brand</h2>
            <p className="text-sm text-ink-muted mt-1 max-w-xl">
              Explore trusted inventory immediately filtered by popular global and local manufacturers.
            </p>
          </div>

          {/* Premium brand cards list with horizontal scroll / sliding grid support */}
          <div className="relative">
            <div className="flex overflow-x-auto pb-4 gap-5 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border-strong scrollbar-track-transparent">
              {popularBrands.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/cars?brand=${brand.searchBrand}`}
                  className="min-w-[145px] sm:min-w-[165px] flex-1 flex flex-col justify-between items-center p-5 rounded-2xl border border-border bg-surface hover:border-primary-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group snap-center"
                >
                  {/* Brand Logo Container */}
                  <div className="relative h-16 w-full flex items-center justify-center bg-transparent">
                    {brand.logo === "svg" ? (
                      <svg viewBox="0 0 24 24" className="w-11 h-11 mx-auto transition-transform duration-300 group-hover:scale-105" style={{ fill: "var(--color-ink-subtle)" }}>
                        <path d="M17.369 19.995C13.51 22.39 12 24 12 24L.105 15.705s5.003-3.715 9.186-.87l5.61 3.882.683-.453L.106 7.321s2.226-.65 6.524-3.315C10.49 1.609 12 0 12 0l11.895 8.296s-5.003 3.715-9.187.87L9.1 5.281l-.683.454L23.893 16.68s-2.224.649-6.524 3.315Z"/>
                      </svg>
                    ) : (
                      <Image
                        src={brand.logo}
                        alt={`${brand.name} Logo`}
                        fill
                        sizes="165px"
                        className="object-contain !p-2 mx-auto transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  
                  {/* Brand Name */}
                  <span className="text-xs sm:text-sm font-semibold text-ink group-hover:text-primary-600 transition-colors mt-4 text-center">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <FeaturedCars />
      <JustArrivedCars />

      {/* ═══════════════════════════════════════════════
          SECTION 5 — Why Choose KarBik (Trust)
          Asymmetrical layout blocks
      ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-surface">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Editorial Block */}
            <div className="lg:col-span-5 text-left space-y-4">
              {/* Redundant section badge removed */}
              <h2 className="text-3xl md:text-4xl font-display font-bold text-ink-strong tracking-tight leading-tight">
                Hyderabad’s Most Transparent Pre-Owned Car Network
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed">
                KarBik isn&apos;t just another listing site. We bridge the trust gap in the pre-owned vehicle ecosystem with rigorous physical verification and seamless communication channels.
              </p>
            </div>

            {/* Right Column: Stacked Step Sequence */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              {/* Step 1 */}
              <div className="flex gap-6 items-start pb-6 border-b border-border">
                <span className="text-3xl md:text-4xl font-black text-primary-600/20 tracking-tight select-none">
                  01
                </span>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary-600" />
                    “RC checked” badge on verified cars
                  </h3>
                  {/* Applied max-width cap to respect typographic line length guidelines (~65ch) */}
                  <p className="text-xs text-ink-muted leading-relaxed max-w-md">
                    When KarBik has checked a car’s registration papers, it carries an “RC checked” badge. Look for it before you visit the dealer.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start pb-6 border-b border-border">
                <span className="text-3xl md:text-4xl font-black text-primary-600/20 tracking-tight select-none">
                  02
                </span>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary-600" />
                    Dealers reviewed by KarBik
                  </h3>
                  {/* Applied max-width cap to respect typographic line length guidelines (~65ch) */}
                  <p className="text-xs text-ink-muted leading-relaxed max-w-md">
                    Dealers earn a “Verified” badge after KarBik reviews their documents. Buyers who contacted a dealer can leave a review.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <span className="text-3xl md:text-4xl font-black text-primary-600/20 tracking-tight select-none">
                  03
                </span>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary-600" />
                    KarBik connects you with the dealer
                  </h3>
                  {/* Applied max-width cap to respect typographic line length guidelines (~65ch) */}
                  <p className="text-xs text-ink-muted leading-relaxed max-w-md">
                    Tap WhatsApp for a pre-filled message to KarBik support, or ask for a call back. Support talks to you first, then connects you with the dealer.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </Reveal>
      </section>

      

      {/* ═══════════════════════════════════════════════
          SECTION 6 — Dealer Success Radial Glow Card
          Dark showroom aesthetic, asymmetric split
      ═══════════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-6">
        <Reveal className="max-w-7xl mx-auto bg-neutral-900 rounded-2xl overflow-hidden relative border border-neutral-800 shadow-xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 md:p-14 gap-8">
            <div className="max-w-xl text-left">
              {/* Redundant section badge removed */}
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight leading-tight mb-4">
                Grow Your Showroom Digitally
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed mb-8">
                Set up your digital storefront, scan custom physical QR standees, and receive real WhatsApp leads from buyers near you.
              </p>
              <Link 
                href="/register?role=dealer"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-7 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.98]"
              >
                <span>Partner With Us</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="hidden lg:block w-[40%] relative">
              <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-transparent to-transparent z-10 pointer-events-none" />
              <Image
                alt="Dealer Growth Success Showroom"
                className="rounded-2xl shadow-xl rotate-2 scale-105 border border-white/10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDGJhL44B7T7EhIivXwErHccW5S4yDZKXT_dW33qsFbvgc0aRWJRsYhZYreyyRcSHxAvMj0scCK6VTNgPdJwZdcAuRtsTEHrHxc9r8WMN0OSQME46gL3OP4TPahDG9ND70O2NgvgOqREYJTArFrojQ0lfqwM6CdLNQ4rVLY3TcCFxiCZD_VnRQAWPAA8-2IN0gdJAZ4yMFK6yx2HRsTU36o_XDMKREVb17CR94BEpMHWvMUfv4pJ1WNjXxrQJriwUxr7ohU2Bkkms"
                width={720}
                height={480}
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
