import { and, eq, isNotNull, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, dealerProfiles } from "@/lib/db/schema";
import { publiclyVisible } from "@/lib/car-visibility";
import { API_BASE as APP_URL } from "@/lib/api-base";

/**
 * Dynamic sitemap at /sitemap.xml.
 *
 * It reads the database directly instead of fetching our own /api over HTTP:
 * at build time there is no running server to fetch from, which used to leave
 * the sitemap with only the 4 static routes until the first revalidation.
 */
export const revalidate = 3600;

type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: "daily" | "weekly";
  priority: number;
};

export default async function sitemap(): Promise<SitemapEntry[]> {
  const lastModified = new Date();

  const routes: SitemapEntry[] = ["", "/cars", "/pricing", "/compare", "/about", "/contact", "/faq", "/how-it-works"].map(
    (route) => ({
      url: `${APP_URL}${route}`,
      lastModified,
      changeFrequency: "daily",
      priority: route === "" ? 1.0 : 0.8,
    })
  );

  let carRoutes: SitemapEntry[] = [];
  let dealerRoutes: SitemapEntry[] = [];

  try {
    const [carRows, dealerRows] = await Promise.all([
      db
        .select({ id: cars.id, updatedAt: cars.updatedAt })
        .from(cars)
        .leftJoin(dealerProfiles, eq(dealerProfiles.user, cars.dealer))
        // Sample (demo) showrooms are never offered to search engines.
        .where(
          and(
            publiclyVisible,
            or(isNull(dealerProfiles.isSample), eq(dealerProfiles.isSample, false))
          )
        ),
      db
        .select({ slug: dealerProfiles.slug, updatedAt: dealerProfiles.updatedAt })
        .from(dealerProfiles)
        .where(
          and(
            eq(dealerProfiles.microWebsiteEnabled, true),
            eq(dealerProfiles.isSample, false),
            isNotNull(dealerProfiles.slug)
          )
        ),
    ]);

    carRoutes = carRows.map((car) => ({
      url: `${APP_URL}/cars/${car.id}`,
      lastModified: car.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    dealerRoutes = dealerRows.map((dealer) => ({
      url: `${APP_URL}/dealer/${dealer.slug}`,
      lastModified: dealer.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));
  } catch (err) {
    // A DB hiccup must not break crawling of the static routes.
    console.error("SEO Sitemap: failed to read listings from the database:", err);
  }

  return [...routes, ...carRoutes, ...dealerRoutes];
}
