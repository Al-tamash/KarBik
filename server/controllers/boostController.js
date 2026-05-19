import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Boost from "../models/Boost.js";
import Car from "../models/Car.js";

// Boost pricing config (in paise)
export const BOOST_PLANS = {
  "1day": { label: "1 Day Spotlight", amount: 9900, days: 1 },
  "3day": { label: "3 Day Spotlight", amount: 24900, days: 3 },
  "7day": { label: "7 Day Spotlight", amount: 49900, days: 7 },
};

/**
 * POST /api/cars/:id/boost
 * Create a Razorpay order for boosting a car
 */
export async function createBoostOrder(req, res) {
  try {
    const { boostType } = req.body;
    const carId = req.params.id;

    if (!BOOST_PLANS[boostType]) {
      return res.status(400).json({ message: "Invalid boost type" });
    }

    const plan = BOOST_PLANS[boostType];

    // Find the car and verify ownership
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (car.dealer.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only boost your own listings" });
    }

    // Check if car already has an active boost
    const activeBoost = await Boost.findOne({
      car: carId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (activeBoost) {
      return res.status(400).json({ message: "This car is already boosted." });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: "INR",
      receipt: `bst_${req.user.id.slice(-8)}_${Date.now()}`,
      notes: {
        dealerId: req.user.id,
        carId: carId,
        boostType: boostType,
      },
    });

    // Create Boost record in DB
    await Boost.create({
      car: carId,
      dealer: req.user.id,
      boostType: boostType,
      amount: plan.amount,
      status: "created",
      razorpayOrderId: order.id,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.label,
    });
  } catch (error) {
    console.error("createBoostOrder error:", error.message || error.error?.description || error);
    res.status(500).json({ message: "Failed to create boost order" });
  }
}

/**
 * POST /api/boosts/verify
 * Verify payment and activate boost
 */
export async function verifyBoostPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification details" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Boost.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({ message: "Payment verification failed — invalid signature" });
    }

    // Find the pending boost
    const boost = await Boost.findOne({ razorpayOrderId: razorpay_order_id });
    if (!boost) {
      return res.status(404).json({ message: "Boost record not found" });
    }

    // Update boost to active
    const plan = BOOST_PLANS[boost.boostType];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.days);

    boost.razorpayPaymentId = razorpay_payment_id;
    boost.razorpaySignature = razorpay_signature;
    boost.status = "active";
    boost.startDate = startDate;
    boost.endDate = endDate;
    await boost.save();

    res.json({
      message: "Boost activated successfully!",
      boost: {
        type: boost.boostType,
        endDate: boost.endDate,
      },
    });
  } catch (error) {
    console.error("verifyBoostPayment error:", error.message);
    res.status(500).json({ message: "Boost payment verification failed" });
  }
}

/**
 * GET /api/cars/:id/boost-status
 * Get the boost status of a specific car
 */
export async function getBoostStatus(req, res) {
  try {
    const carId = req.params.id;

    const activeBoost = await Boost.findOne({
      car: carId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (!activeBoost) {
      return res.json({ isBoosted: false });
    }

    const daysRemaining = Math.max(
      0,
      Math.ceil((new Date(activeBoost.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    );

    res.json({
      isBoosted: true,
      endDate: activeBoost.endDate,
      daysRemaining,
    });
  } catch (error) {
    console.error("getBoostStatus error:", error.message);
    res.status(500).json({ message: "Failed to fetch boost status" });
  }
}
