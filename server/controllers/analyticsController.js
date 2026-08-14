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

    // High-performance single-pass aggregation query to count listings, sum total views, and gather ID arrays
    // This executes on the MongoDB server directly, completely bypassing heavy document payload transfers
    const statsResult = await Car.aggregate([
      { $match: { dealer: dealerId } },
      {
        $group: {
          _id: null,
          totalListings: { $sum: 1 },
          totalViews: { $sum: { $ifNull: ["$views", 0] } },
          carIds: { $push: "$_id" }
        }
      }
    ]);

    const overview = statsResult[0] || { totalListings: 0, totalViews: 0, carIds: [] };
    const totalListings = overview.totalListings;
    const totalViews = overview.totalViews;

    // Count total inquiries sent to these cars using the gathered aggregated car IDs array
    const totalInquiries = await Inquiry.countDocuments({ car: { $in: overview.carIds } });

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
