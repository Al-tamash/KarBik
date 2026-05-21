import { Router } from "express";
import { protect, dealerOnly } from "../middleware/protect.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

export default function carUploadRoutes(auth) {
  const router = Router();

  router.post("/", protect(auth), dealerOnly, upload.array("images", 10), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      const images = [];
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "autobazaar/cars",
              resource_type: "auto",
              transformation: [
                { width: 1200, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      res.status(200).json({ images });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload images", error: error.message });
    }
  });

  router.delete("/:publicId", protect(auth), dealerOnly, async (req, res) => {
    try {
      await cloudinary.uploader.destroy(req.params.publicId);
      res.status(200).json({ message: "Image deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete image", error: error.message });
    }
  });

  return router;
}
