import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { apiHandler } from "@/lib/guards";

// GET /api/trust/reviews/:dealerId — public: reviews for a dealer
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  return apiHandler(async () => {
    const { dealerId } = await params;
    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.dealer, dealerId))
      .orderBy(desc(reviews.createdAt));
    return Response.json(rows);
  });
}
