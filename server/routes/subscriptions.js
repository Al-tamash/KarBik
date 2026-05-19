/**
 * Subscription Routes — Maps URLs to subscription controller functions
 *
 * Two endpoints:
 * GET  /api/subscriptions/plans   → Public: show all plans (pricing page)
 * GET  /api/subscriptions/my-plan → Protected: dealer's active plan
 */
import { Router } from "express";
import { protect } from "../middleware/protect.js";
import { getPlans, getMyPlan } from "../controllers/subscriptionController.js";

export default function subscriptionRoutes(auth) {
  const router = Router();

  // Anyone can view available plans (even logged-out visitors)
  router.get("/plans", getPlans);

  // Only logged-in users can check their own subscription
  router.get("/my-plan", protect(auth), getMyPlan);

  return router;
}
