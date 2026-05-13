/**
 * Inquiry Routes — Maps URL paths to inquiry controller functions
 *
 * All inquiry routes are protected — you must be logged in.
 * There's no "dealerOnly" gate because both roles use these endpoints:
 * - Buyers POST to create inquiries
 * - Dealers GET to view received inquiries
 * - Buyers GET /sent to view their own sent inquiries
 */
import { Router } from "express";
import { protect } from "../middleware/protect.js";
import {
  createInquiry,
  getMyInquiries,
  getBuyerInquiries,
} from "../controllers/inquiryController.js";

export default function inquiryRoutes(auth) {
  const router = Router();

  // POST /api/inquiries — buyer sends an inquiry (any logged-in user)
  router.post("/", protect(auth), createInquiry);

  // GET /api/inquiries/mine — dealer views received inquiries
  router.get("/mine", protect(auth), getMyInquiries);

  // GET /api/inquiries/sent — buyer views their sent inquiries
  router.get("/sent", protect(auth), getBuyerInquiries);

  return router;
}
