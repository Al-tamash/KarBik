import express from "express";
import { subscribeUser } from "../controllers/notificationController.js";
import { protect } from "../middleware/protect.js";

export default function notificationRoutes(auth) {
  const router = express.Router();

  // POST /api/notifications/subscribe — Save push subscription
  router.post("/subscribe", protect(auth), subscribeUser);

  return router;
}
