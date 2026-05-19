const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * robots.js — Search Crawl Directive Configuration
 * 
 * WHAT: Generates dynamic robots.txt at /robots.txt.
 * WHY: Instructs web crawler bots (Googlebot, Bingbot) on which areas
 *      to crawl (public pages) and which to ignore (protected dealer/buyer dashboards).
 *      It also registers our dynamic /sitemap.xml location for easy discovery.
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",      // Protect private dealer dashboards from SERP indexation
        "/api/",            // Do not index local next.js proxy api routes
        "/compare",         // Do not index workspace comparison builder
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
