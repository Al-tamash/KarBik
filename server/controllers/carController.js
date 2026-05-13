/**
 * Car Controller — Business Logic for CRUD operations
 *
 * Controllers contain the actual logic for each route.
 * The route file says "when someone hits POST /api/cars, run createCar."
 * This file defines WHAT createCar actually does.
 *
 * Pattern: Routes → Controller → Model → Database
 * Think of it like a restaurant:
 * - Route = the waiter (takes the order)
 * - Controller = the chef (does the work)
 * - Model = the recipe book (knows the data structure)
 * - Database = the pantry (stores the ingredients)
 */
import Car from "../models/Car.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Helper: Upload a single image buffer to Cloudinary
 *
 * Cloudinary's upload_stream expects a readable stream, but Multer
 * gives us a Buffer (raw bytes in memory). We wrap the upload in a
 * Promise so we can use async/await instead of callbacks.
 *
 * folder: "autobazaar/cars" organizes images in Cloudinary's media library
 */
function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "autobazaar/cars",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Write the buffer to the stream and close it
    stream.end(fileBuffer);
  });
}

/**
 * Helper: Delete an image from Cloudinary by its publicId
 *
 * When a dealer deletes a listing or replaces images, we must also
 * remove the old images from Cloudinary. Otherwise they'd sit there
 * forever, using up storage quota (orphaned files).
 */
async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Log but don't crash — the car should still be deletable
    // even if Cloudinary cleanup fails
    console.error(`Failed to delete Cloudinary image: ${publicId}`, error);
  }
}

// ─────────────────────────────────────────────
// GET /api/cars — Public: fetch car listings with search, filters, sort, pagination
// ─────────────────────────────────────────────
export async function getAllCars(req, res) {
  try {
    const {
      search,    // text search across title and brand
      brand,     // filter by exact brand name
      minYear, maxYear,   // year range
      minPrice, maxPrice, // price range
      sort: sortParam,    // sorting option
      page = 1,           // current page (default: 1)
      limit = 12,         // items per page (default: 12)
    } = req.query;

    // Build a MongoDB filter object dynamically
    // Only add conditions that the user actually sent
    const filter = {};

    // Text search — matches title OR brand using case-insensitive regex
    // "i" flag means case-insensitive: "honda" matches "Honda"
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    // Brand filter — exact match (case-insensitive)
    if (brand) {
      filter.brand = { $regex: `^${brand}$`, $options: "i" };
    }

    // Year range filter
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = Number(minYear); // greater than or equal
      if (maxYear) filter.year.$lte = Number(maxYear); // less than or equal
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting options
    let sortObj = { createdAt: -1 }; // default: newest first
    if (sortParam === "price_asc") sortObj = { price: 1 };
    if (sortParam === "price_desc") sortObj = { price: -1 };
    if (sortParam === "year_desc") sortObj = { year: -1 };

    // Pagination math
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with filters, sorting, and pagination
    const [cars, total] = await Promise.all([
      Car.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Car.countDocuments(filter),
    ]);

    res.status(200).json({
      cars,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars", error: error.message });
  }
}

// ─────────────────────────────────────────────
// GET /api/cars/brands — Public: get all unique brand names
// ─────────────────────────────────────────────
export async function getBrands(req, res) {
  try {
    // .distinct("brand") returns an array of unique values for the brand field
    const brands = await Car.distinct("brand");
    res.status(200).json(brands.sort());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch brands", error: error.message });
  }
}

// ─────────────────────────────────────────────
// GET /api/cars/mine — Protected: fetch only the logged-in dealer's listings
// ─────────────────────────────────────────────
export async function getMyCars(req, res) {
  try {
    // req.user.id is set by the protect middleware after session verification
    // We filter by dealer field to get only THIS dealer's cars
    const cars = await Car.find({ dealer: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your cars", error: error.message });
  }
}

// ─────────────────────────────────────────────
// GET /api/cars/:id — Public: fetch a single car
// ─────────────────────────────────────────────
export async function getCarById(req, res) {
  try {
    const car = await Car.findById(req.params.id).lean();

    if (!car) {
      // 404 = "Not Found" — the car with this ID doesn't exist
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car", error: error.message });
  }
}

// ─────────────────────────────────────────────
// POST /api/cars — Dealer only: create a new listing
// ─────────────────────────────────────────────
export async function createCar(req, res) {
  try {
    const { title, brand, year, price, description } = req.body;

    // Upload each image file to Cloudinary
    // req.files is an array populated by Multer's upload.array() middleware
    const images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload the buffer (raw bytes) to Cloudinary
        const result = await uploadToCloudinary(file.buffer);

        // Store the URL (for displaying) and publicId (for deleting later)
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    // Create the car document in MongoDB
    // req.user.id comes from the protect middleware (set after session check)
    const car = await Car.create({
      title,
      brand,
      year: Number(year),
      price: Number(price),
      description: description || "",
      images,
      dealer: req.user.id,
    });

    // 201 = "Created" — a new resource was successfully created
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ message: "Failed to create car", error: error.message });
  }
}

// ─────────────────────────────────────────────
// PUT /api/cars/:id — Dealer owner only: update a listing
// ─────────────────────────────────────────────
export async function updateCar(req, res) {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // OWNERSHIP CHECK: Only the dealer who created this listing can edit it
    // car.dealer is a MongoDB ObjectId, req.user.id is a string — we must
    // convert to string for comparison
    if (car.dealer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden — this is not your listing" });
    }

    // Update text fields (only if they're provided in the request)
    const { title, brand, year, price, description } = req.body;
    if (title) car.title = title;
    if (brand) car.brand = brand;
    if (year) car.year = Number(year);
    if (price) car.price = Number(price);
    if (description !== undefined) car.description = description;

    // If new images were uploaded, replace the old ones
    if (req.files && req.files.length > 0) {
      // Step 1: Delete old images from Cloudinary
      for (const oldImage of car.images) {
        await deleteFromCloudinary(oldImage.publicId);
      }

      // Step 2: Upload new images
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      car.images = newImages;
    }

    // .save() persists the changes to MongoDB
    await car.save();

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: "Failed to update car", error: error.message });
  }
}

// ─────────────────────────────────────────────
// DELETE /api/cars/:id — Dealer owner only: delete a listing
// ─────────────────────────────────────────────
export async function deleteCar(req, res) {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // OWNERSHIP CHECK
    if (car.dealer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden — this is not your listing" });
    }

    // Delete all images from Cloudinary before removing the DB record
    // If we skip this, images become orphaned (stored but never used)
    for (const image of car.images) {
      await deleteFromCloudinary(image.publicId);
    }

    // deleteOne() removes the document from MongoDB
    await car.deleteOne();

    res.status(200).json({ message: "Car listing deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete car", error: error.message });
  }
}
