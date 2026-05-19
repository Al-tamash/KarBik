/**
 * Wishlist Controller
 *
 * WHAT: Manages the request/response logic for buyer favorites in MongoDB.
 * WHY: Keeps our routes clean by centralizing all the database queries here.
 *      Handles all errors and returns standardized JSON payloads.
 */
import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Car from "../models/Car.js";

/**
 * POST /api/wishlist/toggle/:carId
 * Toggles a car in the buyer's wishlist.
 * If already wishlisted → removes it.
 * If not wishlisted → adds it.
 */
export async function toggleWishlist(req, res) {
  try {
    const buyerId = new mongoose.Types.ObjectId(req.user.id);
    const { carId } = req.params;

    // 1. Verify if the car actually exists in the database
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ message: "Invalid Car ID format" });
    }
    const carExists = await Car.findById(carId);
    if (!carExists) {
      return res.status(404).json({ message: "Car listing not found" });
    }

    const targetCarId = new mongoose.Types.ObjectId(carId);

    // 2. Check if this car is already wishlisted by the user
    const existingFavorite = await Wishlist.findOne({
      user: buyerId,
      car: targetCarId,
    });

    if (existingFavorite) {
      // If it exists, the user wants to REMOVE it (unfavorite)
      await Wishlist.deleteOne({ _id: existingFavorite._id });
      return res.status(200).json({ 
        isWishlisted: false, 
        message: "Successfully removed from wishlist" 
      });
    } else {
      // If it doesn't exist, the user wants to ADD it (favorite)
      const newFavorite = new Wishlist({
        user: buyerId,
        car: targetCarId,
      });
      await newFavorite.save();
      return res.status(201).json({ 
        isWishlisted: true, 
        message: "Successfully added to wishlist" 
      });
    }
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    res.status(500).json({ 
      message: "Failed to toggle wishlist status", 
      error: error.message 
    });
  }
}

/**
 * GET /api/wishlist/check/:carId
 * Checks if a specific car is currently in the buyer's wishlist.
 * Used at the frontend to render the active red heart vs black heart outline.
 */
export async function checkWishlistStatus(req, res) {
  try {
    const buyerId = new mongoose.Types.ObjectId(req.user.id);
    const { carId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ message: "Invalid Car ID format" });
    }

    // Query Mongoose for the specific user and car pair
    const favorite = await Wishlist.findOne({
      user: buyerId,
      car: new mongoose.Types.ObjectId(carId),
    });

    res.status(200).json({ isWishlisted: !!favorite });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to check wishlist status", 
      error: error.message 
    });
  }
}

/**
 * GET /api/wishlist
 * Fetches all cars wishlisted by the currently logged-in user.
 * Populates all car listing details so they can be rendered in a bento list/dashboard.
 */
export async function getWishlist(req, res) {
  try {
    const buyerId = new mongoose.Types.ObjectId(req.user.id);

    // Find wishlist records and populate the linked Car details!
    // .populate("car") resolves the car reference ID into a full Car object.
    const favorites = await Wishlist.find({ user: buyerId })
      .populate("car")
      .sort({ createdAt: -1 })
      .lean();

    // Filter out any favorites where the car listing might have been deleted
    const validFavorites = favorites.filter(f => f.car !== null);

    res.status(200).json(validFavorites);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch wishlist", 
      error: error.message 
    });
  }
}
