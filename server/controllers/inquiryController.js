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
import Review from "../models/Review.js";
import PushSubscription from "../models/PushSubscription.js";
import { sendPushNotification } from "../utils/push.js";

const CRM_STATUSES = ["new", "contacted", "interested", "test_drive", "closed", "lost", "fake"];
const CRM_PRIORITIES = ["low", "medium", "high"];
const HIGH_INTENT_WORDS = ["test drive", "loan", "finance", "emi", "available", "visit", "buy", "interested"];

function normalizeIndianMobile(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits;

  if (!/^[6-9]\d{9}$/.test(withoutCountryCode)) {
    return null;
  }

  return withoutCountryCode;
}

async function findDealerInquiry(inquiryId, dealerId) {
  const inquiry = await Inquiry.findById(inquiryId).populate("car", "title brand year price images");

  if (!inquiry) {
    return { error: { status: 404, message: "Inquiry not found" } };
  }

  if (inquiry.dealer.toString() !== dealerId) {
    return { error: { status: 403, message: "You can only update inquiries for your own listings" } };
  }

  return { inquiry };
}

function getLeadAssessment({ message, buyerInquiryCountToday, phoneInquiryCountToday }) {
  let score = 50;
  const signals = [];
  const normalizedMessage = String(message || "").trim().toLowerCase();

  if (normalizedMessage.length >= 40) {
    score += 15;
    signals.push("Detailed message");
  }

  if (HIGH_INTENT_WORDS.some((word) => normalizedMessage.includes(word))) {
    score += 20;
    signals.push("High-intent wording");
  }

  if (buyerInquiryCountToday > 3) {
    score -= 20;
    signals.push("Many inquiries from this buyer today");
  }

  if (phoneInquiryCountToday > 2) {
    score -= 25;
    signals.push("Same phone used on multiple inquiries today");
  }

  if (normalizedMessage.length < 12) {
    score -= 15;
    signals.push("Very short message");
  }

  const leadScore = Math.max(0, Math.min(100, score));
  let leadQuality = "new";
  if (leadScore >= 80) leadQuality = "high_intent";
  else if (leadScore >= 55) leadQuality = "good";
  else if (leadScore < 35) leadQuality = "suspicious";

  return { leadScore, leadQuality, leadSignals: signals };
}

// ─────────────────────────────────────────────
// POST /api/inquiries — Buyer sends an inquiry about a car
// ─────────────────────────────────────────────
export async function createInquiry(req, res) {
  try {
    const { car: carId, name, phone, message } = req.body;
    const normalizedPhone = normalizeIndianMobile(phone);

    // Validate required fields
    if (!carId || !name || !phone || !message) {
      return res.status(400).json({ message: "All fields are required (car, name, phone, message)" });
    }

    if (!normalizedPhone) {
      return res.status(400).json({ message: "Enter a valid 10-digit Indian mobile number" });
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

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const duplicateInquiry = await Inquiry.findOne({
      buyer: req.user.id,
      car: carId,
      createdAt: { $gte: oneDayAgo },
    });

    if (duplicateInquiry) {
      return res.status(429).json({ message: "You already sent an inquiry for this car today" });
    }

    const buyerInquiryCountLastHour = await Inquiry.countDocuments({
      buyer: req.user.id,
      createdAt: { $gte: oneHourAgo },
    });

    if (buyerInquiryCountLastHour >= 5) {
      return res.status(429).json({ message: "Too many inquiries. Please try again after some time" });
    }

    const phoneInquiryCountToday = await Inquiry.countDocuments({
      phone: normalizedPhone,
      createdAt: { $gte: oneDayAgo },
    });

    if (phoneInquiryCountToday >= 3) {
      return res.status(429).json({ message: "This phone number has reached today's inquiry limit" });
    }

    const buyerInquiryCountToday = await Inquiry.countDocuments({
      buyer: req.user.id,
      createdAt: { $gte: oneDayAgo },
    });

    const leadAssessment = getLeadAssessment({
      message,
      buyerInquiryCountToday,
      phoneInquiryCountToday,
    });

    // Create the inquiry document
    const inquiry = await Inquiry.create({
      name,
      phone: normalizedPhone,
      message,
      car: carId,
      buyer: req.user.id,
      dealer: car.dealer,
      ...leadAssessment,
    });

    // Send push notification to the dealer
    try {
      const subscriptions = await PushSubscription.find({ userId: car.dealer.toString() });
      const payload = {
        title: "New Inquiry Received! 🚗",
        body: `${name} is interested in your ${car.brand} ${car.title}.`,
        icon: car.images?.[0]?.url || "/logo.png",
        data: { url: "/dashboard/inquiries" }
      };

      await Promise.all(subscriptions.map(sub => sendPushNotification(sub.subscription, payload)));
    } catch (err) {
      console.error("Push notify error:", err);
    }

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
// ─────────────────────────────────────────────
// GET /api/inquiries/check/:dealerId — Check if buyer has inquired with this dealer
// ─────────────────────────────────────────────
export async function checkDealerInquiry(req, res) {
  try {
    const { dealerId } = req.params;
    
    const inquiryCount = await Inquiry.countDocuments({
      buyer: req.user.id,
      dealer: dealerId,
    });

    const reviewCount = await Review.countDocuments({
      buyerId: req.user.id,
      dealer: dealerId,
    });

    res.status(200).json({ 
      hasInquired: inquiryCount > 0,
      hasReviewed: reviewCount > 0
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking status", error: error.message });
  }
}

// PATCH /api/inquiries/:id/status - dealer updates lead status/priority
export async function updateInquiryStatus(req, res) {
  try {
    const { status, priority } = req.body;

    if (!CRM_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid inquiry status" });
    }

    if (priority && !CRM_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: "Invalid inquiry priority" });
    }

    const { inquiry, error } = await findDealerInquiry(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    inquiry.status = status;
    if (priority) inquiry.priority = priority;
    inquiry.markedFakeAt = status === "fake" ? new Date() : null;
    if (status === "contacted" && !inquiry.lastContactedAt) {
      inquiry.lastContactedAt = new Date();
    }

    await inquiry.save();
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: "Failed to update inquiry status", error: error.message });
  }
}

// PATCH /api/inquiries/:id/notes - dealer saves private CRM notes
export async function updateInquiryNotes(req, res) {
  try {
    const notes = typeof req.body.notes === "string" ? req.body.notes : "";

    const { inquiry, error } = await findDealerInquiry(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    inquiry.notes = notes;
    await inquiry.save();

    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: "Failed to update inquiry notes", error: error.message });
  }
}

// PATCH /api/inquiries/:id/follow-up - dealer sets or clears follow-up date
export async function updateInquiryFollowUp(req, res) {
  try {
    const { followUpAt } = req.body;

    const { inquiry, error } = await findDealerInquiry(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    if (!followUpAt) {
      inquiry.followUpAt = null;
    } else {
      const followUpDate = new Date(followUpAt);
      if (Number.isNaN(followUpDate.getTime())) {
        return res.status(400).json({ message: "Invalid follow-up date" });
      }
      inquiry.followUpAt = followUpDate;
    }

    await inquiry.save();
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: "Failed to update follow-up date", error: error.message });
  }
}

// PATCH /api/inquiries/:id/whatsapp - dealer tracks a WhatsApp contact click
export async function trackWhatsAppContact(req, res) {
  try {
    const { inquiry, error } = await findDealerInquiry(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    inquiry.whatsappMessageCount = (inquiry.whatsappMessageCount || 0) + 1;
    inquiry.lastContactedAt = new Date();
    if (inquiry.status === "new") {
      inquiry.status = "contacted";
    }

    await inquiry.save();
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: "Failed to track WhatsApp contact", error: error.message });
  }
}
