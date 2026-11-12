import React, { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DealerStorefront from "@/components/dealer/DealerStorefront";
import type { ApiCar, ApiPublicDealerProfile } from "@/lib/api-types";
import { API_BASE } from "@/lib/api-base";
import { toBuyerCar } from "@/lib/buyer-car";
import { dealerDisplayName } from "@/lib/dealer-name";
import { SHOW_DEALER_BANNER } from "@/lib/flags";

/**
 * A dealer's storefront. Server component, so search engines and share previews get the
 * name and the cars in the HTML. Public facts only: name, city, verified, banner, cars
 * (see lib/dealer-public.ts). No address, map, phone, social links, ratings or about text.
 */

type DealerPageResponse = {
  profile: ApiPublicDealerProfile;
  cars: ApiCar[];
};

type Loaded =
  | { ok: true; data: DealerPageResponse }
  | { ok: false; notFound: boolean };

/* One fetch per request: the metadata and the page share it. */
const loadDealer = cache(async (slug: string): Promise<Loaded> => {
  try {
    const res = await fetch(`${API_BASE}/api/dealers/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (res.status === 404) return { ok: false, notFound: true };
    if (!res.ok) return { ok: false, notFound: false };
    return { ok: true, data: (await res.json()) as DealerPageResponse };
  } catch {
    return { ok: false, notFound: false };
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadDealer(slug);
  if (!loaded.ok) return { title: loaded.notFound ? "Showroom not found" : "Dealer showroom" };

  const { profile, cars } = loaded.data;
  const name = dealerDisplayName(profile.businessName) || "Dealer showroom";
  const city = profile.city || "Hyderabad";
  const title = `${name}: used cars in ${city}`;
  const description =
    cars.length > 0
      ? `${cars.length} used ${cars.length === 1 ? "car" : "cars"} from ${name} in ${city}. Ask KarBik support and we will connect you with the dealer.`
      : `${name} in ${city}. Ask KarBik support and we will connect you with the dealer.`;
  const bannerUrl = (SHOW_DEALER_BANNER && profile.bannerImage?.url) || "";

  return {
    title,
    description,
    // Sample (demo) showrooms must not be indexed.
    ...(profile.isSample ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url: `${API_BASE}/dealer/${slug}`,
      siteName: "KarBik",
      images: bannerUrl ? [{ url: bannerUrl, alt: name }] : [],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: bannerUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: bannerUrl ? [bannerUrl] : [],
    },
  };
}

export default async function DealerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadDealer(slug);

  if (!loaded.ok && loaded.notFound) notFound();

  if (!loaded.ok) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-surface px-4 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-strong">
          This showroom did not load
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Something went wrong on our side. Try again in a moment, or look at all cars meanwhile.
        </p>
        <Link href="/cars" className="btn btn-cta btn-md mt-6">
          See all cars
        </Link>
      </div>
    );
  }

  const { profile, cars } = loaded.data;
  const name = dealerDisplayName(profile.businessName) || "Dealer showroom";
  const city = profile.city || "Hyderabad";
  const publicSlug = profile.slug || slug;
  const bannerUrl = (SHOW_DEALER_BANNER && profile.bannerImage?.url) || "";

  /* The storefront API returns plain car rows. Blank the dealer id and registration number
     for the browser, and give each card the sample flag it reads from `dealerProfile`. */
  const buyerCars = cars.map((car) => ({
    ...toBuyerCar(car),
    // The card never shows it, and dealers sometimes name a workshop or showroom in it.
    description: "",
    dealerProfile: {
      businessName: "",
      slug: null,
      city,
      averageRating: 0,
      totalReviews: 0,
      isVerified: profile.isVerified,
      isSample: profile.isSample,
    },
  }));

  // Structured data for search results. No street address and no rating: neither is public.
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name,
    url: `${API_BASE}/dealer/${publicSlug}`,
    ...(bannerUrl ? { image: bannerUrl } : {}),
    address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "IN" },
  };

  return (
    <div className="min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson).replace(/</g, "\\u003c") }}
      />
      <DealerStorefront
        slug={publicSlug}
        name={name}
        city={city}
        isVerified={Boolean(profile.isVerified)}
        isSample={Boolean(profile.isSample)}
        bannerUrl={bannerUrl}
        cars={buyerCars}
      />
    </div>
  );
}
