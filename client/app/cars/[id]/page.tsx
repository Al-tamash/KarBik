import React from "react";
import Link from "next/link";
import CarDetailView from "@/components/CarDetailView";
import type { ApiCar, ApiPublicDealerProfile, ApiReview } from "@/lib/api-types";
import { API_BASE } from "@/lib/api-base";

/**
 * generateMetadata — Dynamic SEO for every car listing
 *
 * This function runs on the server before the page loads.
 * It fetches the car data and sets the page title, description,
 * and OpenGraph tags specifically for this car.
 */
/**
 * Dealers often type the year and brand into the title already
 * ("2023 Tata Nexon EV"), so blindly prefixing them gave "2023 Tata 2023 Tata Nexon EV".
 * Only add what is missing.
 */
function displayCarName(car: Pick<ApiCar, "year" | "brand" | "title">): string {
  const title = car.title.trim();
  const hasYear = (" " + title + " ").includes(" " + car.year + " ");
  const hasBrand = title.toLowerCase().includes(car.brand.toLowerCase());
  return [hasYear ? "" : String(car.year), hasBrand ? "" : car.brand, title]
    .filter(Boolean)
    .join(" ");
}

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
      description: car.description?.slice(0, 160) || `Check out this ${carTitle} on KarBik.`,
      openGraph: {
        title: carTitle,
        description: `Price: ₹${car.price.toLocaleString("en-IN")}. Certified used car.`,
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

      // Fetch dealer profile, reviews, and similar cars in parallel
      // We pass the brand and bodyType directly to the backend to get highly optimized dynamic recommendations
      const [profRes, revRes, similarRes] = await Promise.all([
        fetch(`${API_BASE}/api/trust/profile/${car.dealer}`, { cache: "no-store" }).catch(() => null),
        fetch(`${API_BASE}/api/trust/reviews/${car.dealer}`, { cache: "no-store" }).catch(() => null),
        fetch(`${API_BASE}/api/cars?brand=${car.brand}&bodyType=${car.bodyType}&limit=5`, { cache: "no-store" }).catch(() => null),
      ]);

      if (profRes && profRes.ok) dealerProfile = (await profRes.json()) as ApiPublicDealerProfile;
      if (revRes && revRes.ok) reviews = (await revRes.json()) as ApiReview[];

      if (similarRes && similarRes.ok) {
        const similarData = (await similarRes.json()) as { cars?: ApiCar[] };
        const matchedCars = similarData.cars || [];

        // Exclude the currently viewed car from the similar recommendations
        const currentId = car.id;
        similarCars = matchedCars.filter(c => c.id !== currentId).slice(0, 4);
      }
    }
  } catch (err) {
    error = "Failed to load car details";
  }

  if (error || !car) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 text-center px-4">
        <span className="text-5xl mb-4">😔</span>
        <h1 className="text-xl font-black text-neutral-900 mb-2">
          {error || "Car not found"}
        </h1>
        <Link href="/cars" className="mt-4 text-sm font-bold text-primary hover:underline">
          ← Back to listings
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
    "description": car.description || `Certified used ${car.brand} ${car.title} on KarBik`,
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
      "seller": {
        "@type": "AutoDealer",
        "name": dealerProfile?.businessName || "Premium Dealer"
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Head script injection for SEO Product parsing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <CarDetailView
        car={car}
        initialDealerProfile={dealerProfile}
        initialReviews={reviews}
        similarCars={similarCars}
      />
    </div>
  );
}
