import { and, count, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { boosts, cars, inquiries } from "@/lib/db/schema";
import { apiHandler, requireDealer } from "@/lib/guards";

// GET /api/analytics/dashboard — dealer analytics overview + top listings
export async function GET() {
  return apiHandler(async () => {
    const user = await requireDealer();

    const [listingStats] = await db
      .select({
        totalListings: count(),
        totalViews: sql<number>`coalesce(sum(${cars.views}), 0)`,
      })
      .from(cars)
      .where(and(eq(cars.dealer, user.id), isNull(cars.archivedAt)));

    const totalListings = listingStats?.totalListings ?? 0;
    const totalViews = Number(listingStats?.totalViews ?? 0);

    // Count by the inquiry's own dealer so showroom-level leads (no car) are included.
    const [inquiryCount] = await db
      .select({ value: count() })
      .from(inquiries)
      .where(and(eq(inquiries.dealer, user.id), eq(inquiries.adminHold, false)));

    const totalInquiries = inquiryCount?.value ?? 0;

    const [boostCount] = await db
      .select({ value: count() })
      .from(boosts)
      .where(
        and(
          eq(boosts.dealer, user.id),
          eq(boosts.status, "active"),
          gt(boosts.endDate, new Date())
        )
      );

    const activeBoosts = boostCount?.value ?? 0;

    const topCarRows = await db
      .select({
        id: cars.id,
        title: cars.title,
        brand: cars.brand,
        price: cars.price,
        views: cars.views,
        firstImage: sql<
          { url: string; publicId: string } | null
        >`(${cars.images} -> 0)`,
        inquiryCount: sql<number>`(
          select count(*) from ${inquiries} where ${inquiries.car} = ${cars.id} and ${inquiries.adminHold} = false
        )`,
      })
      .from(cars)
      .where(and(eq(cars.dealer, user.id), isNull(cars.archivedAt)))
      .orderBy(desc(cars.views))
      .limit(5);

    return Response.json({
      overview: {
        totalListings,
        totalViews,
        totalInquiries,
        activeBoosts,
        conversionRate:
          totalViews > 0
            ? ((totalInquiries / totalViews) * 100).toFixed(1)
            : "0.0",
      },
      topCars: topCarRows.map((row) => ({
        id: row.id,
        title: row.title,
        brand: row.brand,
        price: row.price,
        views: row.views,
        images: row.firstImage ? [row.firstImage] : [],
        inquiryCount: Number(row.inquiryCount),
      })),
    });
  });
}
