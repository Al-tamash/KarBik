import { Router } from "express";
import { generateDescription, suggestPrice, autoPopulateSpecs } from "../controllers/aiController.js";
import { protect, dealerOnly } from "../middleware/protect.js";

/**
 * aiRoutes(auth) — Powered by Google Gemini (Phase 13)
 */
export default function aiRoutes(auth) {
  const router = Router();

  // POST /api/ai/description — generates a sales description
  router.post("/description", protect(auth), dealerOnly, generateDescription);

  // POST /api/ai/price-estimate — suggests a market price
  router.post("/price-estimate", protect(auth), dealerOnly, suggestPrice);

  // POST /api/ai/specs — auto-populates car technical specifications & features
  router.post("/specs", protect(auth), dealerOnly, autoPopulateSpecs);

  return router;
}
