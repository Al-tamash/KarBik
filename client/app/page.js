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

import HeroSearchWidget from "@/components/HeroSearchWidget";
import FeaturedCars from "@/components/FeaturedCars";
import JustArrivedCars from "@/components/JustArrivedCars";
import Testimonials from "@/components/Testimonials";
import TrustStatsStrip from "@/components/TrustStatsStrip";

// Connect to the unified server API using the public environment variable
const API = process.env.NEXT_PUBLIC_API_URL;

export const metadata = {
  title: "Used Cars in Hyderabad — Verified Dealers & Inspected Cars | AutoBazaar",
  description: "Find certified second hand cars in Hyderabad from top rated local showrooms. Browse verified inventories in Kukatpally, Madhapur & Gachibowli with 150-point inspection reports and RTO verification.",
  keywords: ["used cars in hyderabad", "second hand cars hyderabad", "pre-owned cars hyderabad", "verified car dealers hyderabad"],
};

export default async function Home() {

  // Fetch real stats from the API — we use limit=1 to minimize payload
  // and only read the `total` field from the response
  let stats = { totalCars: 0, loaded: false };
  try {
    const res = await fetch(`${API}/api/cars?limit=1`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      stats = { totalCars: data.total || 0, loaded: true };
    } else {
      stats.loaded = true;
    }
  } catch (err) {
    stats.loaded = true;
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
    <div className="bg-neutral-50 min-h-screen font-sans">

      {/* ═══════════════════════════════════════════════
          SECTION 1 — Premium Split Hero Layout
          Calm left-aligned value prop + clean framed showroom showcase on right
      ═══════════════════════════════════════════════ */}
      <section className="relative w-full bg-linear-to-br from-indigo-50/60 via-white to-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline, Search Widget and Trust Badges */}
            <div className="lg:col-span-7 text-left flex flex-col items-start gap-6">
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-tight"
              >
                Hyderabad’s Trusted<br />
                {/* Brand color accent for high contrast and calm professional framing */}
                <span className="text-primary-600">Verified Used Car</span> Marketplace
              </h1>

              <p 
                className="text-base text-neutral-600 leading-relaxed max-w-xl"
              >
                Discover premium verified vehicles from top rated local dealers across Kukatpally, Begumpet, and Secunderabad. Enjoy a highly transparent, RTO-verified car buying experience.
              </p>

              {/* Floating Solid Search Panel */}
              <div className="w-full">
                <HeroSearchWidget />
              </div>

              {/* Solid Trust Badges — Replacing transparent glassmorphism for better accessibility */}
              <div className="flex flex-wrap gap-3 mt-2">
                {stats.loaded && stats.totalCars > 0 && (
                  <div className="flex items-center gap-1.5 bg-primary-50 border border-primary-100 px-3.5 py-1.5 rounded-full text-primary-700 text-xs font-semibold shadow-xs">
                    <Car className="h-3.5 w-3.5" />
                    <span>{stats.totalCars}+ Cars Listed</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full text-emerald-800 text-xs font-semibold shadow-xs">
                  <Store className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Verified Dealers Only</span>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full text-blue-700 text-xs font-semibold shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Every Car Inspected</span>
                </div>
              </div>

              {/* Mobile Hero Image — shown ONLY on mobile/tablet where the right column is hidden */}
              <div className="lg:hidden mt-4 w-full">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-neutral-200/80 bg-neutral-100 shadow-sm">
                  <Image 
                    alt="Premium Pre-Owned Showroom Hyderabad" 
                    className="object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA725eW61wDKQE0vapkmdbZvSxIJpFeBoWjgoebGMwlNug6zEa8daiC0OuGZytG8Xm6A7G4Qz70XPhvWE5DVpfU1bcHxIizOPqSmf7tAIIrmGR-tzLOvEhV-j0rxz7PtbZVZfAYfaT-xe_jf4QI4zNr2XpanwG3j1F8QFNzX-J7jFHyDVnrzfNifsyXQ-_MbUsG4vARfSbNyuVW7MDRvIhemFxQ6HbUqNb0PeWryWMAZ5Pw61P1l96fBdeHwdYUFDbgDvulU3Iirxo"
                    fill
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Premium Framed Showroom Image (Desktop only) */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-md border border-neutral-200/80 bg-neutral-100 transition-all duration-300 hover:shadow-lg">
                <Image 
                  alt="Premium Pre-Owned Showroom Hyderabad" 
                  className="object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA725eW61wDKQE0vapkmdbZvSxIJpFeBoWjgoebGMwlNug6zEa8daiC0OuGZytG8Xm6A7G4Qz70XPhvWE5DVpfU1bcHxIizOPqSmf7tAIIrmGR-tzLOvEhV-j0rxz7PtbZVZfAYfaT-xe_jf4QI4zNr2XpanwG3j1F8QFNzX-J7jFHyDVnrzfNifsyXQ-_MbUsG4vARfSbNyuVW7MDRvIhemFxQ6HbUqNb0PeWryWMAZ5Pw61P1l96fBdeHwdYUFDbgDvulU3Iirxo"
                  fill
                  unoptimized
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2 — Hyderabad Regional Car Hubs
          Structured editorial layout + highly readable solid cards
      ═══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-10">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Popular Hyderabad Car Hubs</h2>
            <p className="text-sm text-neutral-500 mt-1 max-w-xl">
              Physical dealership zones verified by the AutoBazaar team. Browse stocks in your neighborhood.
            </p>
          </div>

          {/* Snapping cards carousel — redesigned for high contrast and extreme readability */}
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 gap-6 snap-x snap-mandatory scrollbar-hide">
            
            {/* Kukatpally Miyapur */}
            <Link 
              href="/cars?location=Kukatpally"
              className="min-w-[280px] sm:min-w-[320px] bg-white rounded-2xl overflow-hidden snap-center group cursor-pointer border border-neutral-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="h-36 w-full relative overflow-hidden bg-neutral-100">
                <img 
                  alt="Kukatpally Miyapur Showrooms" 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 pointer-events-none" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAvfYHsO0CGQTppXbbMsrZZEbDi4fRoD2ZWcpQTrik2ZjRCvrXnsBHyOr1PrP2ev9PvnTo5isZLr3hWg6W5zyzklN_-tk9laVXNiFBrC_RkRHzJqHx0o6r8Laf9DnswaDFiELTa2vsHW7MU-7_Qi07LgtcguqZIYjaKFhtXpX-UNL7SMgCfH7SxMK3kz0KlLMOKh6R5B8LtDsoFtCsfgp4oJoJz7zeK6rAHF2CDapjhvLn4xPL96Hf8-OgGyFZqJSQe4cDWEE5_fA"
                />
              </div>
              <div className="p-5 text-left border-t border-neutral-100 flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 text-primary-700 border border-primary-100 mb-2 uppercase tracking-wider">Automotive Corridor</span>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">Kukatpally & Miyapur</h3>
                  <p className="text-xs text-neutral-500 mt-1">Multi-brand showrooms & yards</p>
                </div>
              </div>
            </Link>

            {/* Secunderabad Minister Road */}
            <Link 
              href="/cars?location=Minister Road"
              className="min-w-[280px] sm:min-w-[320px] bg-white rounded-2xl overflow-hidden snap-center group cursor-pointer border border-neutral-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="h-36 w-full relative overflow-hidden bg-neutral-100">
                <img 
                  alt="Secunderabad Minister Road Stock" 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 pointer-events-none" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEi3ZedMlzyvI8Twe8yFzh4WJmKsbWMgrIOM30hcqKCtlXRtId8W-tCdMoBQOtc2YBtSR47Y90Ye8W_Q4x_Ihdkg6aozTMf3BWRCykxwU2AE1AS7cz8ZbrT5E61UKyZaKMLQB63b__XgcrZJjgNuyiqm_FuA0C_0e5vGYHTqxAAZ64Qd-4IDvMAMEhpy3md6fDCkFOtEziWeFxTgcSl6kePlyJtjlENZb0IqnmAM6tHqT5n80QDkREMfUWjE378mdi0xcA1xfPn54"
                />
              </div>
              <div className="p-5 text-left border-t border-neutral-100 flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 text-primary-700 border border-primary-100 mb-2 uppercase tracking-wider">Established Market</span>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">Secunderabad</h3>
                  <p className="text-xs text-neutral-500 mt-1">Established dealer corridor</p>
                </div>
              </div>
            </Link>

            {/* Madhapur Gachibowli */}
            <Link 
              href="/cars?location=Madhapur"
              className="min-w-[280px] sm:min-w-[320px] bg-white rounded-2xl overflow-hidden snap-center group cursor-pointer border border-neutral-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="h-36 w-full relative overflow-hidden bg-neutral-100">
                <img 
                  alt="Madhapur Jubilee Hills Showrooms" 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 pointer-events-none" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnKTY6eDTR_hjgETEyc3xOdJhDD7C1WC6vMW8AjXKfsViJ9ALfHhzu9fqXZOi5wdy56TP7We63pHjIoTTD05e4SwZh6l0MEZWePLiLYsD7G70sdr_dDRIe2e2CJ69RtmV3nQr9NMkOStO-wTuuSWkDDYkFW7D_9ctjjdwWRyKPQJm8w6JlYLxQNLeS8GO1cy7j_qJ6Rf5TyAWeBaKP6tNoJh861lR0C4VT1FkvLxdsNLHLAC_oFl6BaQEBC_MyI7TV52xhVoH9Zlk"
                />
              </div>
              <div className="p-5 text-left border-t border-neutral-100 flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 text-primary-700 border border-primary-100 mb-2 uppercase tracking-wider">Premium & Luxury</span>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">Madhapur & Gachibowli</h3>
                  <p className="text-xs text-neutral-500 mt-1">Premium & luxury inventory</p>
                </div>
              </div>
            </Link>

            {/* LB Nagar Dilsukhnagar */}
            <Link 
              href="/cars?location=LB Nagar"
              className="min-w-[280px] sm:min-w-[320px] bg-white rounded-2xl overflow-hidden snap-center group cursor-pointer border border-neutral-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="h-36 w-full relative overflow-hidden bg-neutral-100">
                <img 
                  alt="LB Nagar Family Car Hub" 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 pointer-events-none" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8FFM3nizduDUGWP-YMj2Gs2Sl8an6W0GyuIb8VfrgTTh-bUfJK8Le5elberIg7e2wUTu87DbvwoqPvyJbmOM_bU6mIqn1T9EYtpxtvBaYUHRk55tpvqrs0lSiPnXgcZVHHt4gyMqow9m8sjUX0PKWCG1q9SMOCCY9kMmh_cODtJxEmpDGatcAkSKWfTt6ZSYk1YJb6MJXmIOs-lP9thEon48COOLuDuzZWZzsVxcUYAHHFCKqC70xUk3hCnPEGf1wiGv70S2lt5A"
                />
              </div>
              <div className="p-5 text-left border-t border-neutral-100 flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 text-primary-700 border border-primary-100 mb-2 uppercase tracking-wider">Budget-Friendly</span>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">LB Nagar & Dilsukhnagar</h3>
                  <p className="text-xs text-neutral-500 mt-1">Budget-friendly family options</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <TrustStatsStrip />

      {/* ═══════════════════════════════════════════════
          SECTION 3 — Premium Brand Directory
          Elegant brand logos matching the requested brand slider mockup
      ═══════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-8">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Browse by Premium Brand</h2>
            <p className="text-sm text-neutral-500 mt-1 max-w-xl">
              Explore trusted inventory immediately filtered by popular global and local manufacturers.
            </p>
          </div>

          {/* Premium brand cards list with horizontal scroll / sliding grid support */}
          <div className="relative">
            <div className="flex overflow-x-auto pb-4 gap-5 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
              {popularBrands.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/cars?brand=${brand.searchBrand}`}
                  className="min-w-[145px] sm:min-w-[165px] flex-1 flex flex-col justify-between items-center p-5 rounded-2xl border border-neutral-200 bg-white hover:border-primary-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group snap-center"
                >
                  {/* Brand Logo Container */}
                  <div className="h-16 w-full flex items-center justify-center bg-transparent">
                    {brand.logo === "svg" ? (
                      <svg viewBox="0 0 24 24" fill="#7c7b84" className="w-11 h-11 mx-auto transition-transform duration-300 group-hover:scale-105">
                        <path d="M17.369 19.995C13.51 22.39 12 24 12 24L.105 15.705s5.003-3.715 9.186-.87l5.61 3.882.683-.453L.106 7.321s2.226-.65 6.524-3.315C10.49 1.609 12 0 12 0l11.895 8.296s-5.003 3.715-9.187.87L9.1 5.281l-.683.454L23.893 16.68s-2.224.649-6.524 3.315Z"/>
                      </svg>
                    ) : (
                      <img
                        src={brand.logo}
                        alt={`${brand.name} Logo`}
                        className="max-h-11 max-w-[85%] object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  
                  {/* Brand Name */}
                  <span className="text-xs sm:text-sm font-semibold text-neutral-700 group-hover:text-primary-600 transition-colors mt-4 text-center">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FeaturedCars />
      <JustArrivedCars />

      {/* ═══════════════════════════════════════════════
          SECTION 5 — Why Choose AutoBazaar (Trust)
          Asymmetrical layout blocks
      ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Editorial Block */}
            <div className="lg:col-span-5 text-left space-y-4">
              {/* Redundant section badge removed */}
              <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                Hyderabad’s Most Transparent Pre-Owned Car Network
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                AutoBazaar isn't just another listing site. We bridge the trust gap in the pre-owned vehicle ecosystem with rigorous physical verification and seamless communication channels.
              </p>
            </div>

            {/* Right Column: Stacked Step Sequence */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              {/* Step 1 */}
              <div className="flex gap-6 items-start pb-6 border-b border-neutral-100">
                <span className="text-3xl md:text-4xl font-black text-primary-600/20 tracking-tight select-none">
                  01
                </span>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary-600" />
                    100% RTO Verified Listings
                  </h3>
                  {/* Applied max-width cap to respect typographic line length guidelines (~65ch) */}
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
                    Skip the spam. Every listing goes through strict chassis, engine, and owner validation before displaying live on our platform.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start pb-6 border-b border-neutral-100">
                <span className="text-3xl md:text-4xl font-black text-primary-600/20 tracking-tight select-none">
                  02
                </span>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary-600" />
                    Exclusive Verified Dealerships Only
                  </h3>
                  {/* Applied max-width cap to respect typographic line length guidelines (~65ch) */}
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
                    We partner exclusively with rated local dealers across Kukatpally, Begumpet, and Gachibowli multi-brand centers.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <span className="text-3xl md:text-4xl font-black text-primary-600/20 tracking-tight select-none">
                  03
                </span>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary-600" />
                    Secure Integrated Lead Routing
                  </h3>
                  {/* Applied max-width cap to respect typographic line length guidelines (~65ch) */}
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
                    Connect instantly with verified dealers via pre-filled secure WhatsApp threads, ensuring high intent without platform leakage.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      <Testimonials />

      {/* ═══════════════════════════════════════════════
          SECTION 6 — Dealer Success Radial Glow Card
          Dark showroom aesthetic, asymmetric split
      ═══════════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto bg-neutral-900 rounded-3xl overflow-hidden relative border border-neutral-800 shadow-2xl glass-stroke">
          {/* Subtle radial glow background overlay */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 md:p-14 gap-8">
            <div className="max-w-xl text-left">
              {/* Redundant section badge removed */}
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Grow Your Showroom Digitally
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed mb-8">
                Join Hyderabad’s fastest-growing premium pre-owned car network. Set up your digital store, scan custom physical QR standees, and receive real WhatsApp leads today.
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
              <img 
                alt="Dealer Growth Success Showroom" 
                className="rounded-2xl shadow-2xl rotate-2 scale-105 border border-neutral-850" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDGJhL44B7T7EhIivXwErHccW5S4yDZKXT_dW33qsFbvgc0aRWJRsYhZYreyyRcSHxAvMj0scCK6VTNgPdJwZdcAuRtsTEHrHxc9r8WMN0OSQME46gL3OP4TPahDG9ND70O2NgvgOqREYJTArFrojQ0lfqwM6CdLNQ4rVLY3TcCFxiCZD_VnRQAWPAA8-2IN0gdJAZ4yMFK6yx2HRsTU36o_XDMKREVb17CR94BEpMHWvMUfv4pJ1WNjXxrQJriwUxr7ohU2Bkkms"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
