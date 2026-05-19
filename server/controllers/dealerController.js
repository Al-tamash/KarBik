/**
 * Dealer Controller — Business logic for dealer micro-website (Phase 12)
 *
 * Three main operations:
 * 1. getDealerBySlug — public: returns profile + cars + reviews for the micro-website
 * 2. updateDealerProfile — protected: dealer updates their micro-website settings
 * 3. checkSlugAvailable — public: checks if a slug is already taken
 *
 * WHY a separate controller instead of adding to trustController?
 * Single Responsibility: trustController handles verification + reviews.
 * dealerController handles the micro-website feature. Keeping them separate
 * means each file stays focused and easy to understand.
 */
import mongoose from "mongoose";
import DealerProfile from "../models/DealerProfile.js";
import Car from "../models/Car.js";
import Review from "../models/Review.js";
import cloudinary from "../config/cloudinary.js";

/**
 * generateSlug — converts a business name into a URL-friendly slug
 *
 * Example: "Premium Auto Motors!" → "premium-auto-motors"
 *
 * How it works:
 * 1. Convert to lowercase
 * 2. Replace spaces and special characters with hyphens
 * 3. Remove consecutive hyphens (e.g., "a--b" → "a-b")
 * 4. Remove leading/trailing hyphens
 */
function generateSlug(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphens
    .replace(/-+/g, "-")          // collapse multiple hyphens
    .replace(/^-|-$/g, "");       // remove leading/trailing hyphens
}

/**
 * uploadToCloudinary — uploads a file buffer to Cloudinary
 *
 * We use a stream-based upload because multer gives us a buffer (raw bytes),
 * not a file path. Cloudinary's upload_stream accepts raw bytes.
 */
function uploadToCloudinary(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}

// ─────────────────────────────────────────────
// GET /api/dealers/check-slug/:slug — Check if a slug is available
// ─────────────────────────────────────────────
export async function checkSlugAvailable(req, res) {
  try {
    const slug = generateSlug(req.params.slug);

    if (!slug || slug.length < 3) {
      return res.status(400).json({ available: false, message: "Slug must be at least 3 characters" });
    }

    // Check if any other dealer already uses this slug
    const existing = await DealerProfile.findOne({ slug }).lean();

    // If no one has this slug, it's available
    // If the current user owns it, it's also "available" (they're re-saving their own)
    const isOwn = existing && req.query.userId && existing.user.toString() === req.query.userId;

    res.status(200).json({
      available: !existing || isOwn,
      slug,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to check slug", error: error.message });
  }
}

// ─────────────────────────────────────────────
// GET /api/dealers — Public: List all active dealer profiles (for sitemap/directory)
// ─────────────────────────────────────────────
export async function getAllDealers(req, res) {
  try {
    const dealers = await DealerProfile.find({ microWebsiteEnabled: true })
      .select("slug businessName updatedAt")
      .lean();
    res.status(200).json(dealers);
  } catch (error) {
    res.status(500).json({ message: "Failed to list dealers", error: error.message });
  }
}

// ─────────────────────────────────────────────
// GET /api/dealers/:slug — Public: Get dealer micro-website data
// ─────────────────────────────────────────────
export async function getDealerBySlug(req, res) {
  try {
    const slug = req.params.slug.toLowerCase().trim();

    // Find the dealer profile by their URL-friendly slug
    const profile = await DealerProfile.findOne({ slug, microWebsiteEnabled: true }).lean();

    if (!profile) {
      return res.status(404).json({ message: "Dealer page not found" });
    }

    /**
     * Fetch all related data in parallel using Promise.all
     *
     * Why parallel? Each database query takes time. If we run them one after
     * another (sequentially), total time = query1 + query2 + query3.
     * With Promise.all, all three run at the same time, so total time =
     * max(query1, query2, query3). Much faster!
     */
    const [cars, reviews] = await Promise.all([
      // Get all cars listed by this dealer, sorted newest first
      Car.find({ dealer: profile.user })
        .sort({ createdAt: -1 })
        .lean(),

      // Get all reviews for this dealer, sorted newest first
      Review.find({ dealer: profile.user })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Return everything the frontend needs in a single response
    res.status(200).json({
      profile,
      cars,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dealer page", error: error.message });
  }
}

// ─────────────────────────────────────────────
// PATCH /api/dealers/profile — Dealer updates micro-website settings
// ─────────────────────────────────────────────
export async function updateDealerProfile(req, res) {
  try {
    const dealerId = new mongoose.Types.ObjectId(req.user.id);
    const { slug, about, phone, address, city, socialLinks } = req.body;

    // Find or create the dealer's profile document
    let profile = await DealerProfile.findOne({ user: dealerId });
    if (!profile) {
      profile = new DealerProfile({ user: dealerId });
    }

    // ── Validate and set the slug ──
    if (slug !== undefined) {
      const cleanSlug = generateSlug(slug);

      if (cleanSlug.length < 3) {
        return res.status(400).json({ message: "Slug must be at least 3 characters long" });
      }

      if (cleanSlug.length > 60) {
        return res.status(400).json({ message: "Slug cannot exceed 60 characters" });
      }

      // Check if another dealer already uses this slug
      const existing = await DealerProfile.findOne({
        slug: cleanSlug,
        user: { $ne: dealerId }, // $ne = "not equal" — exclude the current dealer
      });

      if (existing) {
        return res.status(409).json({ message: "This URL is already taken. Try a different one." });
      }

      profile.slug = cleanSlug;
    }

    // ── Update text fields (only if provided) ──
    if (about !== undefined) profile.about = about;
    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;
    if (city !== undefined) profile.city = city;

    // ── Update social links ──
    // When sent via FormData, socialLinks arrives as a JSON string, not an object.
    // We need to parse it first.
    let parsedSocialLinks = socialLinks;
    if (typeof socialLinks === "string") {
      try { parsedSocialLinks = JSON.parse(socialLinks); } catch { parsedSocialLinks = null; }
    }

    if (parsedSocialLinks) {
      profile.socialLinks = {
        whatsapp: parsedSocialLinks.whatsapp || profile.socialLinks?.whatsapp || "",
        instagram: parsedSocialLinks.instagram || profile.socialLinks?.instagram || "",
        facebook: parsedSocialLinks.facebook || profile.socialLinks?.facebook || "",
      };
    }

    // ── Handle banner image upload ──
    if (req.file) {
      // Delete old banner from Cloudinary if replacing
      if (profile.bannerImage?.publicId) {
        await cloudinary.uploader.destroy(profile.bannerImage.publicId);
      }

      const result = await uploadToCloudinary(req.file.buffer, "autobazaar/banners");

      profile.bannerImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // Enable the micro-website if the dealer has set a slug
    if (profile.slug) {
      profile.microWebsiteEnabled = true;
    }

    await profile.save();

    res.status(200).json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (slug already exists)
    if (error.code === 11000) {
      return res.status(409).json({ message: "This URL is already taken. Try a different one." });
    }
    console.error("Dealer profile update error:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
}
