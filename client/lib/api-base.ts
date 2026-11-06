/**
 * Absolute base URL for server-side fetches (RSC pages, sitemap).
 * Browser code uses relative "/api/..." paths; server code needs an origin.
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
