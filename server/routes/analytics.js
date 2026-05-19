import { Router } from "express";
import { protect, dealerOnly } from "../middleware/protect.js";
import { getDealerAnalytics } from "../controllers/analyticsController.js";

export default function analyticsRoutes(auth) {
  const router = Router();

  // GET /api/analytics/dashboard
  router.get("/dashboard", protect(auth), dealerOnly, getDealerAnalytics);

  return router;
}
