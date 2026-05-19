/**
 * Wishlist Model (Mongoose Schema)
 *
 * Stores all buyer favorite listings.
 * - Links a user's ID to a car's listing ID.
 * - Automatically keeps track of when it was saved (timestamps).
 * - Enforces that a user can only wishlist a specific car ONCE.
 */
import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
  {
    // Links back to the user's ID from Better Auth
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true, // Speeds up searching for a specific user's wishlist
    },

    // Links to the Car model for displaying listing details
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car", // Refers to the Car mongoose model
      required: true,
    },
  },
  { 
    // Automatically creates 'createdAt' and 'updatedAt' fields
    timestamps: true 
  }
);

// COMPOUND INDEX:
// This unique constraint ensures a user cannot wishlist the same car multiple times.
// MongoDB will instantly reject any attempt to insert a duplicate { user, car } pair.
WishlistSchema.index({ user: 1, car: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
