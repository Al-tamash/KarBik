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

    // Longer description of the car's condition, features, etc.
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
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

// Create and export the model
// "Car" = the model name, "cars" = the MongoDB collection name (auto-pluralized)
const Car = mongoose.model("Car", carSchema);
export default Car;
