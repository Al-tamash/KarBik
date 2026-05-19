/**
 * Car Model (Mongoose Schema)
 *
 * A Mongoose Schema is a blueprint that tells MongoDB what shape each
 * document (record) should have. Think of it like a form template:
 * - Every car listing MUST have a title, brand, year, price
 * - Every car listing CAN have a description and images
 * - Every car listing is LINKED to the dealer who created it
 *
 * Without a schema, MongoDB would accept anything — even a car with
 * a price of "banana". The schema enforces rules.
 */
import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    // The listing headline — e.g., "2023 Honda Civic EX"
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    // Car manufacturer — e.g., "Honda", "Toyota", "BMW"
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },

    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },

    variant: {
      type: String,
      trim: true,
      default: '',
    },

    // Manufacturing year — e.g., 2023
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be 1900 or later"],
      max: [new Date().getFullYear() + 1, "Year cannot be in the far future"],
    },

    // Price in your local currency
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'cng', 'hybrid', 'lpg'],
      required: true,
    },

    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'cvt', 'amt'],
      required: true,
    },

    mileage: {
      type: Number,
      required: [true, 'KM driven is required'],
      min: 0,
    },

    bodyType: {
      type: String,
      enum: ['hatchback', 'sedan', 'suv', 'muv', 'coupe', 'convertible', 'pickup', 'van'],
      required: true,
    },

    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
    },

    owners: {
      type: String,
      enum: ['1st owner', '2nd owner', '3rd owner', '4th owner or more'],
      required: true,
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
      default: '',
    },

    insuranceValid: {
      type: String,
      default: '',
    },

    rcVerified: {
      type: Boolean,
      default: false,
    },

    engineCC: {
      type: Number,
      default: null,
    },

    accidentHistory: {
      type: Boolean,
      default: false,
    },

    serviceHistory: {
      type: Boolean,
      default: false,
    },

    // Longer description of the car's condition, features, etc.
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },

    // Analytics: track how many times this listing has been viewed
    views: {
      type: Number,
      default: 0,
    },

    // Trust System: has this car been inspected?
    isInspected: {
      type: Boolean,
      default: false,
    },
    // Trust System: Cloudinary URL for the inspection report PDF/Image
    inspectionReport: {
      url: String,
      publicId: String,
    },

    /**
     * Images array — stores Cloudinary URLs and public IDs
     *
     * Each image object has:
     * - url: the full Cloudinary URL to display the image (e.g., https://res.cloudinary.com/...)
     * - publicId: Cloudinary's unique ID for this image (needed to delete it later)
     *
     * We store publicId because when a dealer deletes a listing,
     * we also need to delete the images from Cloudinary.
     * Without publicId, the images would stay in Cloudinary forever (orphaned files).
     */
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    /**
     * Dealer reference — links this car to the user who created it
     *
     * mongoose.Schema.Types.ObjectId is MongoDB's unique ID type.
     * ref: "user" tells Mongoose this ID points to a document in the "user" collection.
     *
     * This is how we enforce ownership:
     * "Only the dealer who created this listing can edit or delete it."
     */
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt fields
    // createdAt = when the listing was first posted
    // updatedAt = when it was last edited
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// INDEXES — The "Secret Sauce" for Speed
// ─────────────────────────────────────────────

// 1. Text Index: Allows fast keyword search across title and brand
// Without this, $regex search is slow (COLLSCAN)
carSchema.index({ title: "text", brand: "text" });

// 2. Field Indexes: Speeds up filtering by brand, price, and year
carSchema.index({ brand: 1 });
carSchema.index({ price: 1 });
carSchema.index({ year: 1 });
carSchema.index({ fuelType: 1 });
carSchema.index({ transmission: 1 });

// 3. Compound Index: Speeds up the "My Listings" page for dealers
// Sorted by newest first (-1)
carSchema.index({ dealer: 1, createdAt: -1 });

// Create and export the model
// "Car" = the model name, "cars" = the MongoDB collection name (auto-pluralized)
const Car = mongoose.model("Car", carSchema);
export default Car;
