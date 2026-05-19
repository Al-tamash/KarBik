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
import mongoose from "mongoose";
import Car from "../models/Car.js";
import Boost from "../models/Boost.js";
import cloudinary from "../config/cloudinary.js";
import { searchCarsSchema, createCarSchema, updateCarSchema } from "../utils/validation.js";

/**
 * Helper: Upload a single image buffer to Cloudinary with Optimization
 *
 * We add transformations to:
 * 1. Resize images if they are too large (max 1200px width)
 * 2. q_auto: automatically compress for best quality/size ratio
 * 3. f_auto: automatically serve in modern formats (WebP/AVIF)
 */
function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "autobazaar/cars",
        resource_type: "auto",
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
}

/**
 * Helper: Escape special regex characters
 * Prevents NoSQL injection and Regular Expression Denial of Service (ReDoS)
 */
function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

function normalizeSearchQuery(query) {
  const normalized = { ...query };

  if (normalized.maxKm && !normalized.maxMileage) {
    normalized.maxMileage = normalized.maxKm;
  }

  if (normalized.ownerCount && !normalized.owners) {
    const ownerMap = {
      1: "1st owner",
      2: "2nd owner",
      3: "3rd owner",
    };
    normalized.owners = ownerMap[normalized.ownerCount] || normalized.ownerCount;
  }

  const lowerCaseKeys = ["fuelType", "transmission", "bodyType"];
  lowerCaseKeys.forEach((key) => {
    if (typeof normalized[key] === "string") {
      normalized[key] = normalized[key].toLowerCase();
    }
  });

  if (normalized.fuelType === "ev") {
    normalized.fuelType = "electric";
  }

  delete normalized.maxKm;
  delete normalized.ownerCount;
  return normalized;
}

function exactText(value) {
  return { $regex: `^${escapeRegex(value)}$`, $options: "i" };
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
    // Validate query parameters with Zod
    const validated = searchCarsSchema.parse(normalizeSearchQuery(req.query));

    const {
      search,
      brand,
      fuelType,
      transmission,
      bodyType,
      owners,
      minYear, maxYear,
      minPrice, maxPrice,
      maxMileage,
      sort: sortParam,
      page,
      limit,
    } = validated;

    const filter = {};
    const andFilters = [];

    if (search) {
      const escapedSearch = escapeRegex(search);
      andFilters.push({
        $or: [
          { title: { $regex: escapedSearch, $options: "i" } },
          { brand: { $regex: escapedSearch, $options: "i" } },
          { model: { $regex: escapedSearch, $options: "i" } },
        ],
      });
    }

    if (brand) filter.brand = exactText(brand);
    if (fuelType) filter.fuelType = exactText(fuelType);
    if (transmission) filter.transmission = exactText(transmission);
    if (bodyType) filter.bodyType = exactText(bodyType);
    if (owners) {
      const legacyOwnerCount = Number.parseInt(owners, 10);
      andFilters.push({
        $or: [
          { owners: exactText(owners) },
          ...(Number.isNaN(legacyOwnerCount) ? [] : [{ ownerCount: legacyOwnerCount }]),
        ],
      });
    }

    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = Number(minYear);
      if (maxYear) filter.year.$lte = Number(maxYear);
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (maxMileage) {
      const mileageLimit = Number(maxMileage);
      andFilters.push({
        $or: [
          { mileage: { $lte: mileageLimit } },
          { kmDriven: { $lte: mileageLimit } },
        ],
      });
    }

    if (andFilters.length > 0) {
      filter.$and = andFilters;
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

    // Find all active boosts
    const activeBoostedIds = await Boost.find({
      status: "active",
      endDate: { $gt: new Date() }
    }).distinct("car");

    // Execute query with filters, sorting (boosted first), and pagination
    const [cars, total] = await Promise.all([
      Car.aggregate([
        { $match: filter },
        { 
          $addFields: {
            isBoosted: { $in: ["$_id", activeBoostedIds] }
          }
        },
        { $sort: { isBoosted: -1, ...sortObj } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: "dealerprofiles",
            localField: "dealer",
            foreignField: "user",
            as: "dealerProfile"
          }
        },
        {
          $addFields: {
            dealerProfile: { $arrayElemAt: ["$dealerProfile", 0] }
          }
        }
      ]),
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
    
    // Find all active boosts for this dealer
    const activeBoostedIds = await Boost.find({
      dealer: req.user.id,
      status: "active",
      endDate: { $gt: new Date() }
    }).distinct("car");

    // Fetch this dealer's cars and add isBoosted flag
    const cars = await Car.aggregate([
      { $match: { dealer: new mongoose.Types.ObjectId(req.user.id) } }, // Cast to ObjectId for aggregation
      { 
        $addFields: {
          isBoosted: { $in: ["$_id", activeBoostedIds] }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your cars", error: error.message });
  }
}

// ─────────────────────────────────────────────
// GET /api/cars/:id — Public: fetch a single car
// ─────────────────────────────────────────────
export async function getCarById(req, res, auth) {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      // 404 = "Not Found" — the car with this ID doesn't exist
      return res.status(404).json({ message: "Car not found" });
    }

    // Check if the current user is the owner (dealer)
    let isOwner = false;
    if (auth) {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.id === car.dealer.toString()) {
        isOwner = true;
      }
    }

    // Only increment views if the user is NOT the owner
    // We use updateOne with $inc to bypass full document validation (avoids crash on legacy seed documents)
    if (!isOwner) {
      await Car.updateOne({ _id: car._id }, { $inc: { views: 1 } });
      car.views = (car.views || 0) + 1;
    }

    res.status(200).json(car.toObject ? car.toObject() : car);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car", error: error.message });
  }
}

// ─────────────────────────────────────────────
// POST /api/cars — Dealer only: create a new listing
// ─────────────────────────────────────────────
export async function createCar(req, res) {
  try {
    // Validate request body with Zod
    const { 
      title, brand, model, variant, year, price, 
      fuelType, transmission, bodyType, owners, mileage, 
      color, city, registrationNumber, insuranceValid, 
      rcVerified, accidentHistory, serviceHistory,
      description 
    } = createCarSchema.parse(req.body);

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
      model,
      variant,
      year: Number(year),
      price: Number(price),
      fuelType,
      transmission,
      bodyType,
      owners,
      mileage: Number(mileage),
      color,
      city,
      registrationNumber,
      insuranceValid,
      rcVerified,
      accidentHistory,
      serviceHistory,
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

    // Validate and update text fields
    const parsedBody = updateCarSchema.parse(req.body);
    Object.assign(car, parsedBody);

    // If new images were uploaded, replace the old ones
    if (req.files && req.files.images && req.files.images.length > 0) {
      // Step 1: Delete old images from Cloudinary
      for (const oldImage of car.images) {
        await deleteFromCloudinary(oldImage.publicId);
      }

      // Step 2: Upload new images
      const newImages = [];
      for (const file of req.files.images) {
        const result = await uploadToCloudinary(file.buffer);
        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      car.images = newImages;
    }

    // Process inspection report if uploaded
    if (req.files && req.files.inspectionReport && req.files.inspectionReport.length > 0) {
      const file = req.files.inspectionReport[0];
      
      // Delete old report if it exists
      if (car.inspectionReport && car.inspectionReport.publicId) {
        await deleteFromCloudinary(car.inspectionReport.publicId);
      }

      const result = await uploadToCloudinary(file.buffer);
      car.inspectionReport = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      car.isInspected = true;
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
