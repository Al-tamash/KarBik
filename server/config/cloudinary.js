/**
 * Cloudinary Configuration
 *
 * Cloudinary is a cloud service for storing and serving images/videos.
 * Think of it like Google Drive but specifically designed for images —
 * it automatically optimizes, resizes, and delivers images via a fast CDN.
 *
 * We upload car photos here instead of storing them on our own server because:
 * 1. Our server has limited disk space
 * 2. Cloudinary serves images from servers worldwide (faster loading)
 * 3. It handles image resizing and format conversion automatically
 */
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with credentials from .env
// These three values come from your Cloudinary Dashboard
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
