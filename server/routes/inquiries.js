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
  checkDealerInquiry,
  updateInquiryStatus,
  updateInquiryNotes,
  updateInquiryFollowUp,
  trackWhatsAppContact,
} from "../controllers/inquiryController.js";

export default function inquiryRoutes(auth) {
  const router = Router();

  // POST /api/inquiries — buyer sends an inquiry (any logged-in user)
  router.post("/", protect(auth), createInquiry);

  // GET /api/inquiries/mine — dealer views received inquiries
  router.get("/mine", protect(auth), getMyInquiries);

  // GET /api/inquiries/sent — buyer views their sent inquiries
  router.get("/sent", protect(auth), getBuyerInquiries);

  // GET /api/inquiries/check/:dealerId — check if user has sent inquiry to this dealer
  router.get("/check/:dealerId", protect(auth), checkDealerInquiry);

  // PATCH /api/inquiries/:id/status - dealer updates CRM status and priority
  router.patch("/:id/status", protect(auth), updateInquiryStatus);

  // PATCH /api/inquiries/:id/notes - dealer saves private CRM notes
  router.patch("/:id/notes", protect(auth), updateInquiryNotes);

  // PATCH /api/inquiries/:id/follow-up - dealer sets or clears a follow-up date
  router.patch("/:id/follow-up", protect(auth), updateInquiryFollowUp);

  // PATCH /api/inquiries/:id/whatsapp - dealer tracks WhatsApp contact clicks
  router.patch("/:id/whatsapp", protect(auth), trackWhatsAppContact);

  return router;
}
