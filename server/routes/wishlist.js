/**
 * Wishlist Routes
 *
 * Maps API endpoints to their controller handlers.
 * Enforces authentication guards using the protect middleware.
 */
import { Router } from "express";
import { protect } from "../middleware/protect.js";
import {
  toggleWishlist,
  checkWishlistStatus,
  getWishlist,
} from "../controllers/wishlistController.js";

/**
 * wishlistRoutes(auth) — Returns configured Express Router
 * Passed the auth instance to protect sessions.
 */
export default function wishlistRoutes(auth) {
  const router = Router();

  // All wishlist operations require user to be logged in!
  // Therefore, we pass protect(auth) on every route:
  
  // 1. GET /api/wishlist — Retrieve all favorited listings
  router.get("/", protect(auth), getWishlist);

  // 2. GET /api/wishlist/check/:carId — Check if a specific car is favorited
  router.get("/check/:carId", protect(auth), checkWishlistStatus);

  // 3. POST /api/wishlist/toggle/:carId — Add/remove car from favorites
  router.post("/toggle/:carId", protect(auth), toggleWishlist);

  return router;
}
