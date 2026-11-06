import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiries, reviews } from "@/lib/db/schema";
import { apiHandler, getSessionUser } from "@/lib/guards";

// GET /api/trust/reviews/eligibility?dealerId=… — may the signed-in user review
// this dealer right now? Lets the UI show the form only to people who can use it.
export async function GET(request: Request) {
  return apiHandler(async () => {
    const dealerId = new URL(request.url).searchParams.get("dealerId") ?? "";
    const user = await getSessionUser();

    if (!user || !dealerId || user.id === dealerId) {
      return Response.json({ eligible: false, reason: "not_allowed" });
    }

    const [contacted] = await db
      .select({ id: inquiries.id })
      .from(inquiries)
      .where(
        and(
          eq(inquiries.buyer, user.id),
          eq(inquiries.dealer, dealerId),
          eq(inquiries.adminHold, false)
        )
      )
      .limit(1);
    if (!contacted) {
      return Response.json({ eligible: false, reason: "no_inquiry" });
    }

    const [already] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.dealer, dealerId), eq(reviews.buyerId, user.id)))
      .limit(1);
    return Response.json(
      already
        ? { eligible: false, reason: "already_reviewed" }
        : { eligible: true }
    );
  });
}
