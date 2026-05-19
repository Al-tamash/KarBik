import { Router } from "express";
import { protect, dealerOnly } from "../middleware/protect.js";
import {
  createBoostOrder,
  verifyBoostPayment,
  getBoostStatus,
} from "../controllers/boostController.js";

export default function boostRoutes(auth) {
  const router = Router();

  // Route to create a boost order (must include car ID in URL)
  // Example: POST /api/boosts/cars/:id/boost  <-- Wait, the workflow says POST /api/cars/:id/boost
  // Let's adjust based on the workflow:
  // If mounted at /api/boosts:
  // POST /api/boosts/cars/:id (create order)
  // POST /api/boosts/verify (verify payment)
  // GET /api/boosts/cars/:id/status (get status)

  router.post("/verify", protect(auth), dealerOnly, verifyBoostPayment);
  
  // These routes relate to a specific car
  router.post("/cars/:id", protect(auth), dealerOnly, createBoostOrder);
  router.get("/cars/:id/status", protect(auth), getBoostStatus);

  return router;
}
