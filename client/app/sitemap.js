const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * sitemap.js — Dynamic Next.js Sitemap Configuration
 * 
 * WHAT: Generates a standard XML sitemap at /sitemap.xml at request time.
 * WHY: Search engine bots require a single index file to discover all active pages.
 *      By fetching car listings and dealer showroom slugs dynamically from the DB,
 *      we ensure new cars and new dealer showrooms are indexed by Google instantly!
 */
export default async function sitemap() {
  const lastModified = new Date();

  // 1. Define the static, core application paths
  const routes = [
    "",           // Homepage
    "/cars",      // Search & Filters directory
    "/pricing",   // B2B Dealer Subscription plans
    "/compare",   // Multi-vehicle comparison dashboard
  ].map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified,
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Fetch all active car listings from the API dynamically using pagination
  let carRoutes = [];
  try {
    let currentPage = 1;
    let totalPages = 1;
    let cars = [];

    // Loop through all pages to retrieve all cars in chunks of 50 (API limit is 50 max)
    while (currentPage <= totalPages) {
      const res = await fetch(`${API}/api/cars?limit=50&page=${currentPage}`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        const pageCars = data.cars || [];
        cars = [...cars, ...pageCars];
        totalPages = data.pages || 1;
        currentPage++;
      } else {
        console.error("SEO Sitemap: Failed to fetch cars page", currentPage, "Status:", res.status);
        break;
      }
    }
    
    carRoutes = cars.map((car) => ({
      url: `${APP_URL}/cars/${car._id}`,
      lastModified: new Date(car.updatedAt || car.createdAt || lastModified),
      changeFrequency: "weekly",
      priority: car.isBoosted ? 0.7 : 0.6,
    }));
  } catch (err) {
    console.error("SEO Sitemap: Failed to fetch dynamic car routes:", err.message);
  }

  // 3. Fetch all active dealer showrooms from the API
  let dealerRoutes = [];
  try {
    const res = await fetch(`${API}/api/dealers`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const dealers = await res.json();
      
      dealerRoutes = dealers.map((dealer) => ({
        url: `${APP_URL}/dealer/${dealer.slug}`,
        lastModified: new Date(dealer.updatedAt || lastModified),
        changeFrequency: "daily",
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error("SEO Sitemap: Failed to fetch dynamic dealer routes:", err.message);
  }

  // 4. Combine and return all sitemap entries
  return [...routes, ...carRoutes, ...dealerRoutes];
}
