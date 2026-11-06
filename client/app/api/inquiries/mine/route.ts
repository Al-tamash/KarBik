import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, inquiries } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";

const carFields = {
  id: cars.id,
  title: cars.title,
  brand: cars.brand,
  year: cars.year,
  price: cars.price,
  images: cars.images,
};

// GET /api/inquiries/mine — dealer views inquiries for their listings
export async function GET() {
  return apiHandler(async () => {
    const user = await requireUser();

    const rows = await db
      .select({
        inquiry: inquiries,
        car: carFields,
      })
      .from(inquiries)
      // leftJoin: showroom-level leads (dealer profile callbacks) have no car and
      // must still reach the dealer.
      .leftJoin(cars, eq(inquiries.car, cars.id))
      // A held lead is invisible to the dealer until KarBik support forwards it.
      .where(and(eq(inquiries.dealer, user.id), eq(inquiries.adminHold, false)))
      .orderBy(desc(inquiries.createdAt));

    return Response.json(
      rows.map((row) => ({ ...row.inquiry, car: row.car }))
    );
  });
}
