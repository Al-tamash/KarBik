/**
 * Dealer Routes — Maps URLs to dealer controller functions (Phase 12)
 *
 * Two types of routes:
 * 1. PUBLIC routes — anyone can view a dealer's micro-website
 * 2. PROTECTED routes — only the logged-in dealer can update their profile
 *
 * IMPORTANT: Route order matters in Express!
 * /check-slug/:slug MUST come BEFORE /:slug, otherwise Express
 * would interpret "check-slug" as a dealer slug and call getDealerBySlug.
 */
import { Router } from "express";
import { protect, dealerOnly } from "../middleware/protect.js";
import upload from "../middleware/upload.js";
import {
  getDealerBySlug,
  updateDealerProfile,
  checkSlugAvailable,
  getAllDealers,
} from "../controllers/dealerController.js";

export default function dealerRoutes(auth) {
  const router = Router();

  // GET /api/dealers — Public: list all active dealer profiles (for sitemap/directory)
  // Must be placed before the /:slug wildcard route
  router.get("/", getAllDealers);

  // GET /api/dealers/check-slug/:slug — Public: check if a slug is available
  // Must be BEFORE /:slug to prevent "check-slug" being matched as a dealer slug
  router.get("/check-slug/:slug", checkSlugAvailable);

  // PATCH /api/dealers/profile — Protected: dealer updates their micro-website settings
  // upload.single("bannerImage") parses the banner file from the form data
  router.patch(
    "/profile",
    protect(auth),
    dealerOnly,
    upload.single("bannerImage"),
    updateDealerProfile
  );

  // GET /api/dealers/:slug — Public: fetch dealer's micro-website data
  // This is the main endpoint that powers the public dealer page
  router.get("/:slug", getDealerBySlug);

  return router;
}
