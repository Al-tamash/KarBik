/**
 * Homepage — search and real cars first, explanation last.
 * Direction: the category standard (Cars24 / Spinny / CarDekho level),
 * recorded in .impeccable/surfaces/app-page-tsx.md.
 */

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, BadgeCheck, MessageCircle, ChevronRight, Store } from "lucide-react";

import type { ApiCar } from "@/lib/api-types";
import { API_BASE } from "@/lib/api-base";
import { SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "@/lib/lead-routing";
import HeroSearchWidget from "@/components/HeroSearchWidget";
import FeaturedCars from "@/components/FeaturedCars";

export const metadata = {
  title: "Used Cars in Hyderabad from Local Dealers | KarBik",
  description: "Browse used cars in Hyderabad from local dealers. Browse listings, compare cars and talk to KarBik support on WhatsApp or phone, who will connect you with the dealer. Free for buyers.",
  keywords: ["used cars in hyderabad", "second hand cars hyderabad", "pre-owned cars hyderabad", "verified car dealers hyderabad"],
};

const QUICK_LINKS: Array<{ label: string; href: string }> = [
  { label: "SUVs", href: "/cars?bodyType=suv" },
  { label: "Sedans", href: "/cars?bodyType=sedan" },
  { label: "Hatchbacks", href: "/cars?bodyType=hatchback" },
  { label: "Automatic", href: "/cars?transmission=automatic" },
  { label: "Diesel", href: "/cars?fuelType=diesel" },
  { label: "Electric", href: "/cars?fuelType=electric" },
  { label: "Under ₹10 L", href: "/cars?maxPrice=1000000" },
  { label: "Above ₹20 L", href: "/cars?minPrice=2000000" },
];

// Logos we hold. Brands come from the live stock (/api/cars/brands), so no
// tile opens an empty page; a brand without a logo gets a wordmark.
const BRAND_LOGOS: Record<string, string> = {
  Hyundai: "/images/company-logo-img/hyundai.png",
  Tata: "/images/company-logo-img/tata.png",
  Kia: "/images/company-logo-img/kia-logo.avif",
  Mahindra: "/images/company-logo-img/mahindra-logo.jpg",
  Toyota: "/images/company-logo-img/toy.jpg",
  Honda: "/images/company-logo-img/honda.jpg",
  MG: "/images/company-logo-img/mg-motors-logo.png",
};

const BODY_TYPES = [
  { label: "SUV", value: "suv" },
  { label: "Sedan", value: "sedan" },
  { label: "Hatchback", value: "hatchback" },
  { label: "MUV", value: "muv" },
] as const;

// Bands follow the live stock: nothing is listed under ₹5 L yet.
const BUDGETS = [
  { label: "Under ₹10 Lakh", href: "/cars?maxPrice=1000000" },
  { label: "₹10–15 Lakh", href: "/cars?minPrice=1000000&maxPrice=1500000" },
  { label: "₹15–20 Lakh", href: "/cars?minPrice=1500000&maxPrice=2000000" },
  { label: "Above ₹20 Lakh", href: "/cars?minPrice=2000000" },
];

const FAQS = [
  {
    q: "Is KarBik free for buyers?",
    a: "Yes. Browsing, comparing cars and talking to KarBik support cost you nothing.",
  },
  {
    q: "Can I call the dealer directly?",
    a: "No. Tap WhatsApp or ask for a call back. KarBik support talks to you first, then connects you with the dealer. Dealer phone numbers are not shown on the site.",
  },
  {
    q: "Who owns the cars on KarBik?",
    a: "Hyderabad car dealers. Every car is listed by a dealer; KarBik runs the marketplace and the support desk.",
  },
  {
    q: "What does “RC Verified” mean?",
    a: "KarBik has checked the registration certificate of that car. Cars without the badge have not been checked yet.",
  },
  {
    q: "What does “Verified dealer” mean?",
    a: "KarBik has reviewed the dealer’s business documents.",
  },
  {
    q: "Where do I see the car and take a test drive?",
    a: "At the dealer in Hyderabad. KarBik support sets up the visit once you have picked a car.",
  },
];

type BodyTile = { label: string; value: string; image: string };

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as T) : fallback;
  } catch {
    return fallback;
  }
}

const STEPS = [
  { title: "Pick a car", body: "Browse listings from Hyderabad dealers, compare up to three cars and save the ones you like." },
  { title: "Tell KarBik support", body: "Tap WhatsApp or ask for a call back. Support talks to you first about the car you chose." },
  { title: "Meet the dealer", body: "KarBik connects you with the dealer for a visit and test drive. Free for buyers." },
];

function formatLakh(price: number): string {
  const lakh = price / 100000;
  return `₹${lakh >= 100 ? (lakh / 100).toFixed(2) + " Cr" : lakh.toFixed(2) + " L"}`;
}

export default async function Home() {
  // One request feeds the hero photo and the listing rail; the hero car (a
  // boosted listing when there is one) is taken out of the rail so no car shows
  // twice. Body-type tiles use a real photo from that category, one not already
  // in the rail where possible. On failure the rail fetches on the client and
  // the hero shows the support panel.
  const [carsData, brandList, ...bodyLists] = await Promise.all([
    getJson<{ cars?: ApiCar[] }>("/api/cars?limit=9", {}),
    getJson<string[]>("/api/cars/brands", []),
    ...BODY_TYPES.map((t) => getJson<{ cars?: ApiCar[] }>(`/api/cars?bodyType=${t.value}&limit=6`, {})),
  ]);
  const fetchedCars: ApiCar[] = (carsData as { cars?: ApiCar[] }).cars ?? [];
  const withPhoto = fetchedCars.filter((c) => (c.images?.length ?? 0) > 0);
  const heroCar = withPhoto.find((c) => c.isBoosted) ?? withPhoto[0] ?? null;
  const initialCars = fetchedCars.filter((c) => c.id !== heroCar?.id).slice(0, 8);
  // Brands we hold a logo for (the mass-market names) lead; the rest follow A–Z.
  const brandRank = (b: string) => (b.toLowerCase().startsWith("maruti") ? 0 : BRAND_LOGOS[b] ? 1 : 2);
  const brands = (Array.isArray(brandList) ? (brandList as string[]) : [])
    .slice()
    .sort((a, b) => brandRank(a) - brandRank(b) || a.localeCompare(b));
  const railIds = new Set(initialCars.map((c) => c.id));
  const bodyTiles: BodyTile[] = BODY_TYPES.flatMap((t, i) => {
    const list = ((bodyLists[i] as { cars?: ApiCar[] })?.cars ?? []).filter((c) => (c.images?.length ?? 0) > 0);
    const pick = list.find((c) => !railIds.has(c.id)) ?? list[0];
    return pick ? [{ label: t.label, value: t.value, image: pick.images[0].url }] : [];
  });

  const heroTitle = heroCar ? [heroCar.year, heroCar.brand, heroCar.model].filter(Boolean).join(" ") || heroCar.title : "";
  const waText = encodeURIComponent("Hi KarBik, I'm looking for a used car in Hyderabad.");
  const waHref = `https://wa.me/91${SUPPORT_PHONE}?text=${waText}`;

  // What the badges mean (true statements only). Phones show it after the car
  // rail so the first screen reaches a car; wider screens show it under the hero.
  const trustStrip = (
    <ul className="grid gap-x-8 gap-y-3 border-y border-border py-4 text-sm text-ink sm:grid-cols-3">
    <li className="flex items-start gap-2">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-700" aria-hidden />
      <span><strong className="font-semibold text-ink-strong">RC Verified</strong> only on cars whose registration KarBik has checked</span>
    </li>
    <li className="flex items-start gap-2">
      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
      <span><strong className="font-semibold text-ink-strong">Verified dealer</strong> after KarBik reviews their documents</span>
    </li>
    <li className="flex items-start gap-2">
      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
      <span>
        WhatsApp or call{" "}
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-700 underline-offset-4 hover:underline tabular-nums">
          {SUPPORT_PHONE_DISPLAY}
        </a>
      </span>
    </li>
        </ul>
  );

  return (
    <div className="bg-bg min-h-screen">
      {/* ─── Quick category strip ─── */}
      <nav aria-label="Popular searches" className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 scrollbar-hide">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="whitespace-nowrap px-3 py-3 text-sm font-semibold text-ink-muted transition-colors hover:text-primary-700"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ─── Hero: search first, a real car beside it ─── */}
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-4 pt-6 sm:px-6 md:pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="min-w-0">
          {/* Headline matches headline ramp token (1.875rem / text-3xl) up to display token (3.5rem) on desktop */}
          <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-ink-strong text-balance sm:text-5xl lg:text-[3.5rem]">
            Used cars from <span className="text-primary-600">Hyderabad dealers</span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Free for buyers. KarBik support talks to you first, then connects you with the dealer.
          </p>
          <div className="mt-5 sm:mt-6">
            <HeroSearchWidget initialBrands={brands} />
          </div>
        </div>

        {heroCar ? (
          <Link
            href={`/cars/${heroCar.id}`}
            // Desktop only: on phones the search card is the hero and the car rail follows.
            className="group relative hidden aspect-[5/4] overflow-hidden rounded-2xl bg-surface-alt shadow-card lg:block"
          >
            <Image
              src={heroCar.images[0].url}
              alt={heroTitle}
              fill
              priority
              // Non-Cloudinary hosts (stimg.cardekho.com) refuse server-side fetches,
              // so the optimizer 400s; load those directly like CarCard does.
              unoptimized={!heroCar.images[0].url.includes("res.cloudinary.com")}
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 rounded-xl bg-surface/95 p-4 shadow-lg">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-strong">{heroTitle}</p>
                <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-ink-strong tabular-nums">{formatLakh(heroCar.price)}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-700">
                View car <ChevronRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <p className="font-display text-2xl font-bold text-ink-strong">Talk to KarBik support</p>
            <p className="mt-2 text-ink-muted">Tell us the car and budget you have in mind.</p>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg mt-5 rounded-xl">
              <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp {SUPPORT_PHONE_DISPLAY}
            </a>
          </div>
        )}
      </section>

      <section aria-label="How KarBik checks cars" className="mx-auto hidden max-w-7xl px-4 sm:block sm:px-6">
        {trustStrip}
      </section>

      {/* ─── Listings ─── */}
      <FeaturedCars initialCars={initialCars.length > 0 ? initialCars : undefined} />

      <section aria-label="How KarBik checks cars" className="px-4 pb-8 sm:hidden">
        {trustStrip}
      </section>

      {/* ─── Browse by body type (real photos from stock) ─── */}
      {bodyTiles.length > 0 && (
        <section className="border-t border-border bg-surface py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink-strong md:text-3xl">Browse by body type</h2>
            <div className="-mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
              {bodyTiles.map((t) => (
                <Link
                  key={t.value}
                  href={`/cars?bodyType=${t.value}`}
                  className="group w-[44%] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary-400 sm:w-auto"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-surface-alt">
                    <Image
                      src={t.image}
                      alt=""
                      fill
                      unoptimized={!t.image.includes("res.cloudinary.com")}
                      sizes="(max-width: 640px) 44vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  </span>
                  <span className="flex items-center justify-between px-3 py-3 text-base font-bold text-ink-strong group-hover:text-primary-700">
                    {t.label}
                    <ChevronRight className="h-4 w-4 text-ink-muted" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Browse by budget ─── */}
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink-strong md:text-3xl">Browse by budget</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
            {BUDGETS.map((b) => (
              <Link
                key={b.label}
                href={b.href}
                className="group flex min-h-16 items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-4 transition-colors hover:border-primary-400"
              >
                <span className="whitespace-nowrap text-sm font-bold text-ink-strong tabular-nums group-hover:text-primary-700 sm:text-base">{b.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Browse by brand (only brands in stock) ─── */}
      {brands.length > 0 && (
        <section className="border-t border-border bg-surface py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink-strong md:text-3xl">Browse by brand</h2>
            <div className="-mx-4 mt-5 grid auto-cols-[30%] grid-flow-col grid-rows-2 gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-5 sm:grid-rows-none sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-8">
              {brands.map((brand) => {
                const logo = BRAND_LOGOS[brand];
                const isMaruti = brand.toLowerCase().startsWith("maruti");
                return (
                  <Link
                    key={brand}
                    href={`/cars?brand=${encodeURIComponent(brand)}`}
                    className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-2 py-3 transition-colors hover:border-primary-400"
                  >
                    {/* Logos sit on one white plate in both themes; brands without a logo show their name once */}
                    {(isMaruti || logo) && (
                      <span className="relative flex h-10 w-16 items-center justify-center rounded-lg bg-white">
                        {isMaruti ? (
                          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-neutral-500" aria-hidden>
                            <path d="M17.369 19.995C13.51 22.39 12 24 12 24L.105 15.705s5.003-3.715 9.186-.87l5.61 3.882.683-.453L.106 7.321s2.226-.65 6.524-3.315C10.49 1.609 12 0 12 0l11.895 8.296s-5.003 3.715-9.187.87L9.1 5.281l-.683.454L23.893 16.68s-2.224.649-6.524 3.315Z" />
                          </svg>
                        ) : (
                          // Logos are 2-17 KB files; serving them as-is skips the optimizer,
                          // which stalled on the JPG/AVIF ones in testing.
                          <Image src={logo as string} alt="" fill unoptimized sizes="64px" className="object-contain p-1" />
                        )}
                      </span>
                    )}
                    <span
                      className={`text-center font-semibold group-hover:text-primary-700 ${
                        isMaruti || logo ? "text-sm text-ink" : "text-base font-bold text-ink-strong"
                      }`}
                    >
                      {brand}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── How buying works ─── */}
      <section className="py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink-strong md:text-3xl">How buying on KarBik works</h2>
            <p className="mt-3 max-w-sm text-ink-muted">You never have to chase a dealer. KarBik support handles the first conversation.</p>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg mt-6 rounded-xl">
              <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp KarBik
            </a>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              // A numbered list at every width: the order carries the meaning.
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700 tabular-nums">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink-strong">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Questions buyers ask ─── */}
      <section className="border-t border-border bg-surface py-10 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink-strong md:text-3xl">Questions buyers ask</h2>
          <div className="divide-y divide-border border-y border-border">
            {FAQS.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-semibold text-ink-strong [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-90" aria-hidden />
                </summary>
                <p className="max-w-[65ch] pb-4 leading-relaxed text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── For dealers ─── */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-2xl bg-neutral-900 p-8 dark:ring-1 dark:ring-neutral-700 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl">
            <h2 className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
              <Store className="h-7 w-7 shrink-0 text-neutral-300" aria-hidden />
              Car dealer in Hyderabad? List your cars on KarBik
            </h2>
            <p className="mt-2 text-neutral-300">
              Get a storefront page and buyer leads that KarBik support has already spoken to. Monthly plans, no auto-renewal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register?role=dealer" className="btn btn-lg rounded-xl bg-white text-neutral-900 hover:bg-neutral-100">
              Register as dealer
            </Link>
            <Link href="/pricing" className="btn btn-lg rounded-xl border border-neutral-600 text-white hover:bg-neutral-800">
              See plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
