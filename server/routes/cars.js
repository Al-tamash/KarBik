/**
 * Car Routes — Maps URL paths to controller functions
 *
 * Routes are like a phone directory:
 * "If someone calls GET /api/cars → connect them to getAllCars"
 * "If someone calls POST /api/cars → connect them to createCar"
 *
 * The route file itself should be thin — no business logic here.
 * All the actual work happens in the controller.
 *
 * Middleware chain for protected routes:
 * Request → protect(auth) → dealerOnly → upload → controller
 *
 * Like passing through multiple security checkpoints:
 * 1. protect: "Show me your ID" (are you logged in?)
 * 2. dealerOnly: "Are you a dealer?" (do you have permission?)
 * 3. upload: "Let me scan your files" (handle image attachments)
 * 4. controller: "OK, here's what you asked for" (do the work)
 */
import { Router } from "express";
import { protect, dealerOnly } from "../middleware/protect.js";
import { checkListingLimit } from "../middleware/checkSubscription.js";
import upload from "../middleware/upload.js";
import carUploadRoutes from "./cars-upload.js";
import {
  getAllCars,
  getBrands,
  getMyCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  verifyVehicleDetails,
} from "../controllers/carController.js";

/**
 * carRoutes(auth) — returns a configured Express Router
 *
 * We receive `auth` as a parameter so we can pass it to protect().
 * protect(auth) needs the Better Auth instance to call auth.api.getSession().
 */
export default function carRoutes(auth) {
  const router = Router();

  // PUBLIC routes — no authentication needed
  // Anyone (buyers, dealers, or even non-logged-in visitors) can browse
  router.get("/", getAllCars);
  // /brands and /mine MUST come before /:id — otherwise Express thinks them as car IDs
  router.get("/brands", getBrands);
  router.get("/mine", protect(auth), getMyCars);
  router.get("/verify-vehicle/:regNo", protect(auth), dealerOnly, verifyVehicleDetails);
  router.get("/:id", (req, res) => getCarById(req, res, auth));

  // PROTECTED routes — dealer only
  // upload.array("images", 10) accepts up to 10 image files
  // The field name "images" must match what the frontend form sends
  // checkListingLimit() runs BEFORE upload — no point uploading images
  // if the dealer has hit their plan limit (saves bandwidth + Cloudinary storage)
  router.post("/", protect(auth), dealerOnly, checkListingLimit(), upload.array("images", 10), createCar);
  router.put(
    "/:id", 
    protect(auth), 
    dealerOnly, 
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "inspectionReport", maxCount: 1 }
    ]), 
    updateCar
  );
  router.delete("/:id", protect(auth), dealerOnly, deleteCar);

  // Mount upload routes (for immediate image uploads in wizard)
  router.use("/upload", carUploadRoutes(auth));

  return router;
}
