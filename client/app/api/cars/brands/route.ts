import { asc } from "drizzle-orm";
import { publiclyVisible } from "@/lib/car-visibility";
import { db } from "@/lib/db";
import { cars } from "@/lib/db/schema";
import { apiHandler } from "@/lib/guards";

// GET /api/cars/brands — public: unique brand names
export async function GET() {
  return apiHandler(async () => {
    const rows = await db
      .selectDistinct({ brand: cars.brand })
      .from(cars)
      .where(publiclyVisible)
      .orderBy(asc(cars.brand));
    return Response.json(rows.map((row) => row.brand));
  });
}
