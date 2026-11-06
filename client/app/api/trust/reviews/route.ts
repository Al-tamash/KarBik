import { and, avg, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dealerProfiles, inquiries, reviews } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";

// POST /api/trust/reviews — a buyer reviews a dealer they actually contacted.
export async function POST(request: Request) {
  return apiHandler(async () => {
    const user = await requireUser();
    const body = (await request.json()) as {
      dealerId?: unknown;
      rating?: unknown;
      comment?: unknown;
    };

    const dealerId = typeof body.dealerId === "string" ? body.dealerId : "";
    const rating = typeof body.rating === "number" ? body.rating : Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";
    const buyerName = user.name || "Anonymous Buyer";

    if (!dealerId || !comment) {
      return Response.json(
        { message: "Dealer, rating, and comment are required" },
        { status: 400 }
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return Response.json(
        { message: "Rating must be a whole number from 1 to 5" },
        { status: 400 }
      );
    }
    if (comment.length < 3 || comment.length > 1000) {
      return Response.json(
        { message: "Comment must be between 3 and 1000 characters" },
        { status: 400 }
      );
    }
    if (dealerId === user.id) {
      return Response.json(
        { message: "You cannot review yourself" },
        { status: 400 }
      );
    }

    // Only a buyer who sent this dealer an inquiry may review them. This is what
    // makes the "Verified buyer" label on a review true.
    const [contacted] = await db
      .select({ id: inquiries.id })
      .from(inquiries)
      .where(
        and(
          eq(inquiries.buyer, user.id),
          eq(inquiries.dealer, dealerId),
          // a callback still held by KarBik support has not reached the dealer yet
          eq(inquiries.adminHold, false)
        )
      )
      .limit(1);
    if (!contacted) {
      return Response.json(
        { message: "You can review a dealer after you have sent them an inquiry" },
        { status: 403 }
      );
    }

    let review;
    try {
      [review] = await db
        .insert(reviews)
        .values({
          dealer: dealerId,
          buyerName,
          buyerId: user.id,
          rating,
          comment,
        })
        .returning();
    } catch (err) {
      // reviews_dealer_buyer_uq: the database guarantees one review per pair,
      // even if two requests race.
      // Drizzle wraps the driver error, so the Postgres code is on `cause`.
      const pgCode =
        (err as { code?: string }).code ??
        (err as { cause?: { code?: string } }).cause?.code;
      if (pgCode === "23505") {
        return Response.json(
          { message: "You have already reviewed this dealer" },
          { status: 409 }
        );
      }
      throw err;
    }

    // Recompute aggregate stats on the DB engine
    const [stats] = await db
      .select({
        totalReviews: count(),
        averageRating: avg(reviews.rating),
      })
      .from(reviews)
      .where(eq(reviews.dealer, dealerId));

    const totalReviews = stats?.totalReviews ?? 0;
    const averageRating = stats?.averageRating
      ? Number.parseFloat(Number(stats.averageRating).toFixed(1))
      : 0;

    // Update only an existing profile. Never create one for an arbitrary id.
    await db
      .update(dealerProfiles)
      .set({ totalReviews, averageRating, updatedAt: new Date() })
      .where(eq(dealerProfiles.user, dealerId));

    return Response.json(
      { message: "Review submitted successfully", review },
      { status: 201 }
    );
  });
}
