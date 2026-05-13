/**
 * Inquiry Controller — Business logic for buyer inquiries
 *
 * Two main operations:
 * 1. createInquiry — buyer sends a message about a specific car
 * 2. getMyInquiries — dealer views all inquiries received
 * 3. getBuyerInquiries — buyer views all inquiries they've sent
 */
import Inquiry from "../models/Inquiry.js";
import Car from "../models/Car.js";

// ─────────────────────────────────────────────
// POST /api/inquiries — Buyer sends an inquiry about a car
// ─────────────────────────────────────────────
export async function createInquiry(req, res) {
  try {
    const { car: carId, name, phone, message } = req.body;

    // Validate required fields
    if (!carId || !name || !phone || !message) {
      return res.status(400).json({ message: "All fields are required (car, name, phone, message)" });
    }

    // Find the car to get the dealer's ID
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car listing not found" });
    }

    // Prevent dealers from inquiring about their own listings
    // (wouldn't make sense to message yourself)
    if (car.dealer.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot inquire about your own listing" });
    }

    // Create the inquiry document
    const inquiry = await Inquiry.create({
      name,
      phone,
      message,
      car: carId,
      buyer: req.user.id,      // from session (protect middleware)
      dealer: car.dealer,       // from the car document
    });

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: "Failed to send inquiry", error: error.message });
  }
}

// ─────────────────────────────────────────────
// GET /api/inquiries/mine — Dealer views inquiries for their listings
// ─────────────────────────────────────────────
export async function getMyInquiries(req, res) {
  try {
    // Find all inquiries where this user is the dealer
    // .populate("car", "title brand year price") fetches the car's details
    // instead of just showing the car's ObjectId
    const inquiries = await Inquiry.find({ dealer: req.user.id })
      .populate("car", "title brand year price images")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inquiries", error: error.message });
  }
}

// ─────────────────────────────────────────────
// GET /api/inquiries/sent — Buyer views inquiries they've sent
// ─────────────────────────────────────────────
export async function getBuyerInquiries(req, res) {
  try {
    const inquiries = await Inquiry.find({ buyer: req.user.id })
      .populate("car", "title brand year price images")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your inquiries", error: error.message });
  }
}
