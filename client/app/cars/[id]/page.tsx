import React from "react";
import Link from "next/link";
import CarDetailView from "@/components/CarDetailView";
import type { ApiCar, ApiPublicDealerProfile, ApiReview } from "@/lib/api-types";
import { displayCarName } from "@/lib/car-name";
import { API_BASE } from "@/lib/api-base";
import { formatPrice } from "@/lib/car-format";
import { scrubDescription, toBuyerCar, toBuyerDealer } from "@/lib/buyer-car";
import { SHOW_DEALER_REVIEWS } from "@/lib/flags";

/**
 * generateMetadata — Dynamic SEO for every car listing
 *
 * This function runs on the server before the page loads.
 * It fetches the car data and sets the page title, description,
 * and OpenGraph tags specifically for this car.
 */

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // view=0: metadata is not a page view; the page render below counts it once.
    const res = await fetch(`${API_BASE}/api/cars/${id}?view=0`);
    if (!res.ok) return { title: "Car Not Found" };

    const car = (await res.json()) as ApiCar;
    const carTitle = displayCarName(car);
    const firstImage = car.images?.[0]?.url || "";

    return {
      title: carTitle,
      // Sample (demo) inventory must not be indexed by search engines.
      ...(car.dealerIsSample ? { robots: { index: false, follow: false } } : {}),
      description: scrubDescription(car.description).slice(0, 160) || `Check out this ${carTitle} on KarBik.`,
      openGraph: {
        title: carTitle,
        description: `Used car in Hyderabad. Price: ${formatPrice(car.price)}. Ask KarBik support to connect you with the dealer.`,
        images: firstImage ? [{ url: firstImage }] : [],
      },
    };
  } catch (error) {
    return { title: "KarBik" };
  }
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch initial data on the server for speed and SEO
  let car: ApiCar | null = null;
  let dealerProfile: ApiPublicDealerProfile | null = null;
  let reviews: ApiReview[] = [];
  let similarCars: ApiCar[] = [];
  let error = "";

  try {
    const carRes = await fetch(`${API_BASE}/api/cars/${id}`, { cache: "no-store" });
    if (!carRes.ok) {
      error = "Car not found";
    } else {
      car = (await carRes.json()) as ApiCar;

      // Dealer profile, reviews and candidates for "Similar cars", in parallel.
      // Candidates: same body type, plus same brand (a buyer weighing a Baleno also looks
      // at other Marutis). They are ranked by how close the price is, below.
      const [profRes, revRes, bodyRes, brandRes] = await Promise.all([
        fetch(`${API_BASE}/api/trust/profile/${car.dealer}`, { cache: "no-store" }).catch(() => null),
        // Reviews are off (lib/flags.ts): do not fetch them, so they are never serialised.
        SHOW_DEALER_REVIEWS
          ? fetch(`${API_BASE}/api/trust/reviews/${car.dealer}`, { cache: "no-store" }).catch(() => null)
          : Promise.resolve(null),
        fetch(`${API_BASE}/api/cars?bodyType=${encodeURIComponent(car.bodyType)}&limit=20`, { cache: "no-store" }).catch(() => null),
        fetch(`${API_BASE}/api/cars?brand=${encodeURIComponent(car.brand)}&limit=10`, { cache: "no-store" }).catch(() => null),
      ]);

      if (profRes && profRes.ok) dealerProfile = (await profRes.json()) as ApiPublicDealerProfile;
      if (revRes && revRes.ok) reviews = (await revRes.json()) as ApiReview[];

      const pool = new Map<string, ApiCar>();
      for (const res of [bodyRes, brandRes]) {
        if (!res || !res.ok) continue;
        const data = (await res.json()) as { cars?: ApiCar[] };
        for (const c of data.cars ?? []) if (c.id !== car.id) pool.set(c.id, c);
      }
      // Closest price first; the current car is never in the list.
      const basePrice = car.price;
      similarCars = [...pool.values()]
        .sort((a, b) => Math.abs(a.price - basePrice) - Math.abs(b.price - basePrice))
        .slice(0, 4);
    }
  } catch (err) {
    error = "Failed to load car details";
  }

  if (error || !car) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-surface px-4 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-strong">
          {error || "Car not found"}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          This car may have been sold or taken down. The listing page shows what is available now.
        </p>
        <Link href="/cars" className="btn btn-cta btn-md mt-6">
          See all cars
        </Link>
      </div>
    );
  }

  // Dynamic Product JSON-LD schema for Google Rich Search Results
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const carUrl = `${APP_URL}/cars/${car.id}`;

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": displayCarName(car),
    "image": car.images?.map(img => img?.url).filter(Boolean) || [],
    "description": scrubDescription(car.description) || `Used ${car.brand} ${car.title} in Hyderabad on KarBik`,
    "sku": car.id,
    "brand": {
      "@type": "Brand",
      "name": car.brand
    },
    "offers": {
      "@type": "Offer",
      "url": carUrl,
      "priceCurrency": "INR",
      "price": car.price,
      "itemCondition": "https://schema.org/UsedCondition",
      "availability": "https://schema.org/InStock",
      // The dealer is not named in public markup; KarBik is the point of contact.
      "seller": {
        "@type": "Organization",
        "name": "KarBik"
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Head script injection for SEO Product parsing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <CarDetailView
        car={toBuyerCar(car)}
        initialDealerProfile={toBuyerDealer(dealerProfile, car)}
        initialReviews={reviews}
        similarCars={similarCars.map(toBuyerCar)}
      />
    </div>
  );
}
