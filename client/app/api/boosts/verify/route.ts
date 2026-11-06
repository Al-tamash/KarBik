import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { boosts } from "@/lib/db/schema";
import { apiHandler, requireDealer } from "@/lib/guards";
import { BOOST_PLANS } from "@/lib/boosts";
import { isValidRazorpaySignature } from "@/lib/razorpay-signature";

// POST /api/boosts/verify — verify payment + activate boost.
//
// Safe to call more than once: a paid order activates its boost exactly once,
// so replaying a valid signature can never extend or restart a boost.
export async function POST(request: Request) {
  return apiHandler(async () => {
    const user = await requireDealer();
    const body =
      (await request.json()) as Record<"razorpay_order_id" | "razorpay_payment_id" | "razorpay_signature", string | undefined>;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { message: "Missing payment verification details" },
        { status: 400 }
      );
    }

    // The order must exist and belong to the caller (generic 404 otherwise).
    const [boost] = await db
      .select()
      .from(boosts)
      .where(eq(boosts.razorpayOrderId, razorpay_order_id))
      .limit(1);
    if (!boost || boost.dealer !== user.id) {
      return Response.json({ message: "Boost record not found" }, { status: 404 });
    }

    // A bad signature is rejected without touching the order.
    if (
      !isValidRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )
    ) {
      return Response.json(
        { message: "Payment verification failed — invalid signature" },
        { status: 400 }
      );
    }

    const plan = BOOST_PLANS[boost.boostType];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.days);

    // Atomically claim the order: only one request can flip created → active.
    const [activated] = await db
      .update(boosts)
      .set({
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "active",
        startDate,
        endDate,
        updatedAt: new Date(),
      })
      .where(and(eq(boosts.id, boost.id), eq(boosts.status, "created")))
      .returning();

    if (activated) {
      return Response.json({
        message: "Boost activated successfully!",
        boost: { type: activated.boostType, endDate: activated.endDate },
      });
    }

    // Already processed: report the existing boost without changing its dates.
    const [current] = await db
      .select()
      .from(boosts)
      .where(eq(boosts.id, boost.id))
      .limit(1);

    if (
      current &&
      (current.status === "active" || current.status === "expired") &&
      current.razorpayPaymentId === razorpay_payment_id
    ) {
      return Response.json({
        message: "Boost already activated.",
        boost: { type: current.boostType, endDate: current.endDate },
      });
    }

    return Response.json(
      { message: "This boost order cannot be verified" },
      { status: 409 }
    );
  });
}
