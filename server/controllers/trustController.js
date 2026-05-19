import mongoose from "mongoose";
import DealerProfile from "../models/DealerProfile.js";
import Review from "../models/Review.js";
import cloudinary from "../config/cloudinary.js";

function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "autobazaar/verification",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}

// ─────────────────────────────────────────────
// POST /api/trust/verify — Dealer submits verification doc
// ─────────────────────────────────────────────
export async function submitVerification(req, res) {
  try {
    const dealerId = new mongoose.Types.ObjectId(req.user.id);
    const { businessName } = req.body;

    // Check if dealer already has a profile
    let profile = await DealerProfile.findOne({ user: dealerId });

    if (!profile) {
      profile = new DealerProfile({ user: dealerId });
    }

    if (businessName) {
      profile.businessName = businessName;
    }

    // Handle document upload if attached
    if (req.file) {
      // If replacing an old doc, delete the old one from Cloudinary
      if (profile.verificationDoc?.publicId) {
        await cloudinary.uploader.destroy(profile.verificationDoc.publicId);
      }

      // Upload new doc buffer
      const result = await uploadToCloudinary(req.file.buffer);

      profile.verificationDoc = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      
      // Auto-verify for the sake of the tutorial (in reality, an admin would verify)
      profile.isVerified = true;
    }

    await profile.save();

    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Failed to submit verification", error: error.message });
  }
}

// ─────────────────────────────────────────────
// GET /api/trust/profile/:dealerId — Public: Get dealer profile & stats
// ─────────────────────────────────────────────
export async function getDealerProfile(req, res) {
  try {
    const dealerId = new mongoose.Types.ObjectId(req.params.dealerId);
    
    // Default empty profile if they haven't set one up
    let profile = await DealerProfile.findOne({ user: dealerId }).lean();
    if (!profile) {
      profile = {
        user: dealerId,
        businessName: "Independent Dealer",
        isVerified: false,
        averageRating: 0,
        totalReviews: 0
      };
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dealer profile", error: error.message });
  }
}

// ─────────────────────────────────────────────
// POST /api/trust/reviews — Buyer leaves a review
// ─────────────────────────────────────────────
export async function submitReview(req, res) {
  try {
    const { dealerId, rating, comment } = req.body;
    // req.user is set by optionalAuth or protect middleware. 
    // Here we assume buyer is logged in.
    const buyerName = req.user?.name || "Anonymous Buyer";

    if (!dealerId || !rating || !comment) {
      return res.status(400).json({ message: "Dealer, rating, and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      dealer: new mongoose.Types.ObjectId(dealerId),
      buyerId: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this dealer" });
    }

    const review = new Review({
      dealer: new mongoose.Types.ObjectId(dealerId),
      buyerName,
      buyerId: req.user.id,
      rating,
      comment,
    });

    await review.save();

    // Now, recalculate the dealer's average rating
    const allReviews = await Review.find({ dealer: new mongoose.Types.ObjectId(dealerId) });
    const totalReviews = allReviews.length;
    const sumRatings = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = parseFloat((sumRatings / totalReviews).toFixed(1));

    // Update or create Dealer Profile
    await DealerProfile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(dealerId) },
      { 
        averageRating,
        totalReviews,
      },
      { upsert: true, new: true } // upsert creates it if it doesn't exist
    );

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit review", error: error.message });
  }
}

// ─────────────────────────────────────────────
// GET /api/trust/reviews/:dealerId — Public: Get reviews for a dealer
// ─────────────────────────────────────────────
export async function getReviews(req, res) {
  try {
    const reviews = await Review.find({ dealer: new mongoose.Types.ObjectId(req.params.dealerId) })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
}
