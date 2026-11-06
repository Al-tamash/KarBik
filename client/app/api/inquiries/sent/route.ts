import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, inquiries } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";

// GET /api/inquiries/sent — buyer views inquiries they've sent
export async function GET() {
  return apiHandler(async () => {
    const user = await requireUser();

    const rows = await db
      .select({
        inquiry: inquiries,
        car: {
          id: cars.id,
          title: cars.title,
          brand: cars.brand,
          year: cars.year,
          price: cars.price,
          images: cars.images,
        },
      })
      .from(inquiries)
      // leftJoin so showroom-level inquiries (no car) still show up for the buyer.
      .leftJoin(cars, eq(inquiries.car, cars.id))
      .where(eq(inquiries.buyer, user.id))
      .orderBy(desc(inquiries.createdAt));

    return Response.json(
      rows.map((row) => ({ ...row.inquiry, car: row.car }))
    );
  });
}
