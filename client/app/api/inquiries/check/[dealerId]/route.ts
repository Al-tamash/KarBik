import { and, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiries, reviews } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";

// GET /api/inquiries/check/:dealerId — has the buyer inquired/reviewed this dealer?
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  return apiHandler(async () => {
    const user = await requireUser();
    const { dealerId } = await params;

    const [inquiryCount] = await db
      .select({ value: count() })
      .from(inquiries)
      .where(
        and(eq(inquiries.buyer, user.id), eq(inquiries.dealer, dealerId))
      );

    const [reviewCount] = await db
      .select({ value: count() })
      .from(reviews)
      .where(and(eq(reviews.buyerId, user.id), eq(reviews.dealer, dealerId)));

    return Response.json({
      hasInquired: (inquiryCount?.value ?? 0) > 0,
      hasReviewed: (reviewCount?.value ?? 0) > 0,
    });
  });
}
