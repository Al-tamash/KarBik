import { Router } from "express";
import { protect, dealerOnly } from "../middleware/protect.js";
import upload from "../middleware/upload.js";
import {
  submitVerification,
  getDealerProfile,
  submitReview,
  getReviews,
} from "../controllers/trustController.js";

export default function trustRoutes(auth) {
  const router = Router();

  // POST /api/trust/verify — Protected (Dealer only)
  // upload.single("verificationDoc") allows parsing one file from the form
  router.post("/verify", protect(auth), dealerOnly, upload.single("verificationDoc"), submitVerification);

  // POST /api/trust/reviews — Protected (Buyer/Logged in user)
  router.post("/reviews", protect(auth), submitReview);

  // GET /api/trust/profile/:dealerId — Public
  router.get("/profile/:dealerId", getDealerProfile);

  // GET /api/trust/reviews/:dealerId — Public
  router.get("/reviews/:dealerId", getReviews);

  return router;
}
