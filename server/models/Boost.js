/**
 * Boost Model
 *
 * Stores active and past car listing boosts.
 * A boost makes a car appear at the top of search results.
 */
import mongoose from "mongoose";

const boostSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    boostType: {
      type: String,
      enum: ["1day", "3day", "7day"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "paid", "active", "failed", "expired"],
      default: "created",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
  },
  { timestamps: true }
);

const Boost = mongoose.model("Boost", boostSchema);
export default Boost;
