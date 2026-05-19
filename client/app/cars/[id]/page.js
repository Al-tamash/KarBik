import React from "react";
import Link from "next/link";
import CarDetailView from "@/components/CarDetailView";

const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * generateMetadata — Dynamic SEO for every car listing
 *
 * This function runs on the server before the page loads.
 * It fetches the car data and sets the page title, description,
 * and OpenGraph tags specifically for this car.
 */
export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const res = await fetch(`${API}/api/cars/${id}`);
    if (!res.ok) return { title: "Car Not Found" };
    
    const car = await res.json();
    const carTitle = `${car.year} ${car.brand} ${car.title}`;
    const firstImage = car.images?.[0]?.url || "";

    return {
      title: carTitle,
      description: car.description?.slice(0, 160) || `Check out this ${carTitle} on AutoBazaar.`,
      openGraph: {
        title: carTitle,
        description: `Price: ₹${car.price.toLocaleString("en-IN")}. Certified used car.`,
        images: firstImage ? [{ url: firstImage }] : [],
      },
    };
  } catch (error) {
    return { title: "AutoBazaar" };
  }
}

export default async function CarDetailPage({ params }) {
  const { id } = await params;

  // Fetch initial data on the server for speed and SEO
  let car = null;
  let dealerProfile = null;
  let reviews = [];
  let similarCars = [];
  let error = "";

  try {
    const carRes = await fetch(`${API}/api/cars/${id}`, { cache: "no-store" });
    if (!carRes.ok) {
      error = "Car not found";
    } else {
      car = await carRes.json();

      // Fetch dealer profile, reviews, and all listings in parallel
      const [profRes, revRes, allCarsRes] = await Promise.all([
        fetch(`${API}/api/trust/profile/${car.dealer}`, { cache: "no-store" }).catch(() => null),
        fetch(`${API}/api/trust/reviews/${car.dealer}`, { cache: "no-store" }).catch(() => null),
        fetch(`${API}/api/cars`, { cache: "no-store" }).catch(() => null),
      ]);

      if (profRes && profRes.ok) dealerProfile = await profRes.json();
      if (revRes && revRes.ok) reviews = await revRes.json();
      
      if (allCarsRes && allCarsRes.ok) {
        const allCarsData = await allCarsRes.json();
        const allCars = allCarsData.cars || [];
        
        // Filter by same brand or same bodyType first, excluding the current car
        let matched = allCars.filter(c => c._id !== car._id && (c.brand === car.brand || c.bodyType === car.bodyType));
        
        // If we don't have enough matching bodyType/brand cars, pad with general cars
        if (matched.length < 4) {
          const generalCars = allCars.filter(c => c._id !== car._id && !matched.some(m => m._id === c._id));
          matched = [...matched, ...generalCars].slice(0, 4);
        } else {
          matched = matched.slice(0, 4);
        }
        similarCars = matched;
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
  const carUrl = `${APP_URL}/cars/${car._id}`;
  
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${car.year} ${car.brand} ${car.title}`,
    "image": car.images?.map(img => img?.url).filter(Boolean) || [],
    "description": car.description || `Certified used ${car.brand} ${car.title} on AutoBazaar`,
    "sku": car._id,
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
      "availability": car.status === "sold" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      "seller": {
        "@type": "AutoDealer",
        "name": dealerProfile?.businessName || "Premium Dealer",
        "telephone": dealerProfile?.phone || ""
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
