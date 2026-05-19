/**
 * DealerProfile Model (Mongoose Schema)
 *
 * Stores all dealer-specific information that Better Auth doesn't handle:
 * - Verification status and documents
 * - Review ratings
 * - Micro-website configuration (Phase 12): slug, about, banner, contact info
 *
 * Think of this as the dealer's "business card" in the database.
 * Better Auth stores login credentials (email/password).
 * DealerProfile stores everything about their business identity.
 */
import mongoose from "mongoose";

const DealerProfileSchema = new mongoose.Schema(
  {
    // Links back to the user's ID from Better Auth
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },

    // The dealer's business/showroom name
    businessName: {
      type: String,
      default: "",
    },

    // Has the dealer uploaded valid documents?
    isVerified: {
      type: Boolean,
      default: false,
    },

    // The Cloudinary URL of their business license or ID
    verificationDoc: {
      url: String,
      publicId: String,
    },

    // Mathematical average of all their reviews
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Total number of reviews they have received
    totalReviews: {
      type: Number,
      default: 0,
    },

    // ─── Phase 12: Micro-Website Fields ───

    /**
     * slug — URL-friendly identifier for the dealer's public page
     *
     * Example: "premium-auto-motors" → /dealer/premium-auto-motors
     *
     * Why sparse + unique?
     * - "unique" means no two dealers can have the same slug
     * - "sparse" means MongoDB ignores documents where slug is null/undefined
     *   Without sparse, only ONE dealer could have slug = null (all others would
     *   violate the unique constraint). With sparse, any number of dealers can
     *   have no slug set yet.
     */
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
      maxlength: [60, "Slug cannot exceed 60 characters"],
    },

    // A short paragraph describing the dealer's business
    about: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "About section cannot exceed 1000 characters"],
    },

    // Dealer's contact phone number (displayed on micro-website)
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // Physical showroom address
    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
    },

    // City name — used for local SEO and filtering
    city: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * bannerImage — the wide banner image at the top of the micro-website
     *
     * Stored as a Cloudinary upload (same pattern as car images).
     * publicId is needed to delete the old banner when uploading a new one.
     */
    bannerImage: {
      url: String,
      publicId: String,
    },

    // Social media links displayed on the micro-website
    socialLinks: {
      whatsapp: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },

    /**
     * microWebsiteEnabled — becomes true when the dealer saves their profile
     * with at least a slug. This acts as a "go live" switch.
     * If false, GET /api/dealers/:slug returns 404.
     */
    microWebsiteEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.DealerProfile || mongoose.model("DealerProfile", DealerProfileSchema);
