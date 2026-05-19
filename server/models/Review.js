import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    // The dealer being reviewed
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Better Auth User
    },
    // The name of the buyer who left the review
    buyerName: {
      type: String,
      required: true,
    },
    // The unique ID of the buyer (from Better Auth)
    buyerId: {
      type: String,
      required: true,
    },
    // The star rating (1 to 5)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // The written text of the review
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
