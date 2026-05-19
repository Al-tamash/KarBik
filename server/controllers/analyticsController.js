import mongoose from "mongoose";
import Car from "../models/Car.js";
import Inquiry from "../models/Inquiry.js";
import Boost from "../models/Boost.js";

/**
 * GET /api/analytics/dashboard
 * Fetch aggregated analytics for the logged-in dealer
 */
export async function getDealerAnalytics(req, res) {
  try {
    const dealerId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Get all cars owned by the dealer
    const cars = await Car.find({ dealer: dealerId }).lean();
    
    // 2. Count Total Active Listings
    const totalListings = cars.length;

    // 3. Sum up all views across these cars
    const totalViews = cars.reduce((sum, car) => sum + (car.views || 0), 0);

    // 4. Count total inquiries sent to these cars
    // Get array of car IDs
    const carIds = cars.map(car => car._id);
    const totalInquiries = await Inquiry.countDocuments({ car: { $in: carIds } });

    // 5. Count active boosts
    const activeBoosts = await Boost.countDocuments({
      dealer: dealerId,
      status: "active",
      endDate: { $gt: new Date() }
    });

    // 6. Get Top 5 cars by views
    const topCars = await Car.aggregate([
      { $match: { dealer: dealerId } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      {
        // Lookup inquiries for each top car
        $lookup: {
          from: "inquiries", // The MongoDB collection name for Inquiry model
          localField: "_id",
          foreignField: "car",
          as: "inquiriesList",
        }
      },
      {
        // Add a computed field for inquiry count and format response
        $project: {
          title: 1,
          brand: 1,
          price: 1,
          views: 1,
          images: { $arrayElemAt: ["$images", 0] }, // get first image
          inquiryCount: { $size: "$inquiriesList" }
        }
      }
    ]);

    res.status(200).json({
      overview: {
        totalListings,
        totalViews,
        totalInquiries,
        activeBoosts,
        conversionRate: totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : 0
      },
      topCars
    });
  } catch (error) {
    console.error("getDealerAnalytics error:", error);
    res.status(500).json({ message: "Failed to load analytics data", error: error.message });
  }
}
