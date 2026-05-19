/**
 * Inquiry Model (Mongoose Schema)
 *
 * An inquiry is a message from a buyer to a dealer about a specific car.
 * Think of it like a "Contact the seller" form on OLX or CarDekho.
 *
 * Each inquiry stores:
 * - WHO sent it (buyer) and WHO receives it (dealer)
 * - WHICH car it's about
 * - The buyer's contact info (name + phone)
 * - The message text
 */
import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    // The buyer's display name (entered in the form)
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // The buyer's phone number for the dealer to call back
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [15, "Phone number too long"],
    },

    // The inquiry message — what the buyer wants to ask
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },

    /**
     * car — reference to the Car document this inquiry is about
     *
     * We use populate() later to fetch the car's title when
     * displaying inquiries on the dealer's dashboard.
     */
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    /**
     * buyer — reference to the user who sent this inquiry
     *
     * Set automatically from req.user.id (the logged-in buyer).
     * The buyer never types this — it comes from their session.
     */
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    /**
     * dealer — reference to the user who OWNS the car listing
     *
     * We store this directly (instead of looking it up through the car)
     * so querying "all inquiries for dealer X" is fast — one simple filter
     * instead of a join through the Car collection.
     */
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    status: {
      type: String,
      enum: ["new", "contacted", "interested", "test_drive", "closed", "lost", "fake"],
      default: "new",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },

    lastContactedAt: {
      type: Date,
      default: null,
    },

    followUpAt: {
      type: Date,
      default: null,
    },

    whatsappMessageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    leadScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    leadQuality: {
      type: String,
      enum: ["new", "good", "high_intent", "suspicious"],
      default: "new",
    },

    leadSignals: {
      type: [String],
      default: [],
    },

    markedFakeAt: {
      type: Date,
      default: null,
    },
  },
  {
    // createdAt = when the inquiry was sent
    timestamps: true,
  }
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);
export default Inquiry;
