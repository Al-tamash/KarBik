import { and, asc, count, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { boosts, cars, dealerProfiles } from "@/lib/db/schema";
import {
  createCarSchema,
  searchCarsSchema,
  type SearchCarsInput,
} from "@autobazaar/shared";
import {
  apiHandler,
  getActiveSubscription,
  requireDealer,
} from "@/lib/guards";
import {
  extractImagesFromBody,
  parseFormData,
  validateFiles,
} from "@/lib/form";
import { uploadCarImage } from "@/lib/cloudinary-server";
import { stripPrivateCarFields } from "@/lib/public-car";
import { keepOwnedImages } from "@/lib/asset-ownership";
import { publiclyVisible, UNVERIFIED_LIVE_LISTING_QUOTA } from "@/lib/car-visibility";

function normalizeSearchQuery(query: Record<string, string>) {
  const normalized: Record<string, string> = { ...query };

  if (normalized.maxKm && !normalized.maxMileage) {
    normalized.maxMileage = normalized.maxKm;
  }

  if (normalized.ownerCount && !normalized.owners) {
    const ownerMap: Record<string, string> = {
      "1": "1st owner",
      "2": "2nd owner",
      "3": "3rd owner",
    };
    normalized.owners =
      ownerMap[normalized.ownerCount] ?? normalized.ownerCount;
  }

  for (const key of ["fuelType", "transmission", "bodyType"] as const) {
    if (typeof normalized[key] === "string") {
      normalized[key] = normalized[key].toLowerCase();
    }
  }

  if (normalized.fuelType === "ev") {
    normalized.fuelType = "electric";
  }

  delete normalized.maxKm;
  delete normalized.ownerCount;
  return normalized;
}

const isBoostedSql = sql<boolean>`exists (
  select 1 from ${boosts}
  where ${boosts.car} = ${cars.id}
    and ${boosts.status} = 'active'
    and ${boosts.endDate} > now()
)`;

// GET /api/cars — public listings with search, filters, sort, pagination
export async function GET(request: Request) {
  return apiHandler(async () => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const validated: SearchCarsInput = searchCarsSchema.parse(
      normalizeSearchQuery(query)
    );

    const conditions = [publiclyVisible];

    if (validated.location) {
      conditions.push(
        sql`lower(${cars.city}) = ${validated.location.toLowerCase()}`
      );
    }
    if (validated.search) {
      conditions.push(
        sql`${cars.searchVector} @@ websearch_to_tsquery('english', ${validated.search})`
      );
    }
    if (validated.brand)
      conditions.push(sql`lower(${cars.brand}) = ${validated.brand.toLowerCase()}`);
    if (validated.fuelType) conditions.push(eq(cars.fuelType, validated.fuelType));
    if (validated.transmission)
      conditions.push(eq(cars.transmission, validated.transmission));
    if (validated.bodyType) conditions.push(eq(cars.bodyType, validated.bodyType));
    if (validated.owners) conditions.push(eq(cars.owners, validated.owners));
    if (validated.minYear !== undefined)
      conditions.push(gte(cars.year, validated.minYear));
    if (validated.maxYear !== undefined)
      conditions.push(lte(cars.year, validated.maxYear));
    if (validated.minPrice !== undefined)
      conditions.push(gte(cars.price, validated.minPrice));
    if (validated.maxPrice !== undefined)
      conditions.push(lte(cars.price, validated.maxPrice));
    if (validated.maxMileage !== undefined)
      conditions.push(lte(cars.mileage, validated.maxMileage));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const pageNum = Math.max(1, validated.page);
    const limitNum = Math.min(50, Math.max(1, validated.limit));
    const offset = (pageNum - 1) * limitNum;

    const sortColumn =
      validated.sort === "price_asc"
        ? asc(cars.price)
        : validated.sort === "price_desc"
          ? desc(cars.price)
          : validated.sort === "year_desc"
            ? desc(cars.year)
            : desc(cars.createdAt);

    const [rows, totalRows] = await Promise.all([
      db
        .select({
          car: cars,
          dealerProfile: {
            businessName: dealerProfiles.businessName,
            slug: dealerProfiles.slug,
            city: dealerProfiles.city,
            averageRating: dealerProfiles.averageRating,
            totalReviews: dealerProfiles.totalReviews,
            isVerified: dealerProfiles.isVerified,
            isSample: dealerProfiles.isSample,
          },
        })
        .from(cars)
        .leftJoin(dealerProfiles, eq(dealerProfiles.user, cars.dealer))
        .where(where)
        .orderBy(desc(isBoostedSql), sortColumn)
        .limit(limitNum)
        .offset(offset),
      db.select({ value: count() }).from(cars).where(where),
    ]);

    const total = totalRows[0]?.value ?? 0;

    return Response.json({
      cars: rows.map((row) => ({
        ...stripPrivateCarFields(row.car),
        dealerProfile: row.dealerProfile ?? null,
      })),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  });
}

// POST /api/cars — dealer only: create listing
export async function POST(request: Request) {
  return apiHandler(async () => {
    const user = await requireDealer();

    // Listing-limit enforcement (free default when no active subscription)
    const subscription = await getActiveSubscription(user.id);
    const listingLimit = subscription?.listingLimit ?? 5;
    const planName = subscription?.planName ?? "Free";

    const [{ value: currentCount }] = await db
      .select({ value: count() })
      .from(cars)
      .where(and(eq(cars.dealer, user.id), isNull(cars.archivedAt)));

    if (currentCount >= listingLimit) {
      return Response.json(
        {
          message: `You've reached your listing limit (${currentCount}/${listingLimit}) on the ${planName} plan. Upgrade to list more cars.`,
          currentCount,
          listingLimit,
          planName,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Unverified dealers get a small live quota; anything beyond it waits for
    // admin approval so a brand-new account cannot flood the marketplace.
    const [dealerProfile] = await db
      .select({ isVerified: dealerProfiles.isVerified })
      .from(dealerProfiles)
      .where(eq(dealerProfiles.user, user.id))
      .limit(1);
    const [{ value: liveCount }] = await db
      .select({ value: count() })
      .from(cars)
      .where(and(eq(cars.dealer, user.id), publiclyVisible));
    const pendingApproval =
      !dealerProfile?.isVerified && liveCount >= UNVERIFIED_LIVE_LISTING_QUOTA;

    const { body, fileGroups } = await parseFormData(request);
    const files = fileGroups["images"] ?? [];
    validateFiles(files);

    const parsed = createCarSchema.parse(body);

    let images = [];
    for (const file of files) {
      images.push(
        await uploadCarImage(Buffer.from(await file.arrayBuffer()), user.id)
      );
    }
    // Pre-uploaded images arrive as client-supplied records: keep only the ones
    // in this dealer's own folder so nobody can claim another dealer's assets.
    const bodyImages = keepOwnedImages(user.id, extractImagesFromBody(body));
    if (bodyImages.length > 0) {
      images = [...images, ...bodyImages];
    }

    const [car] = await db
      .insert(cars)
      .values({
        title: parsed.title,
        brand: parsed.brand,
        model: parsed.model,
        variant: parsed.variant,
        year: parsed.year,
        price: parsed.price,
        fuelType: parsed.fuelType,
        transmission: parsed.transmission,
        bodyType: parsed.bodyType,
        owners: parsed.owners,
        mileage: parsed.mileage,
        color: parsed.color,
        city: parsed.city,
        registrationNumber: parsed.registrationNumber,
        insuranceValid: parsed.insuranceValid,
        // "RTO Verified" is a platform claim, never a dealer's: only an admin
        // can set it (PATCH /api/admin/cars/:id).
        rcVerified: false,
        accidentHistory: parsed.accidentHistory,
        serviceHistory: parsed.serviceHistory,
        description: parsed.description,
        engineCC: parsed.engineCC ?? null,
        power: parsed.power,
        groundClearance: parsed.groundClearance,
        certifiedMileage: parsed.certifiedMileage,
        features: parsed.features ?? undefined,
        images,
        pendingApproval,
        dealer: user.id,
      })
      .returning();

    return Response.json(car, { status: 201 });
  });
}
