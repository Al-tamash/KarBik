import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, plans } from "@/lib/db/schema";
import { razorpay } from "@/lib/razorpay-server";
import { apiHandler, requireDealer } from "@/lib/guards";

// POST /api/payments/create-order — step 1: create Razorpay order
export async function POST(request: Request) {
  return apiHandler(async () => {
    const user = await requireDealer();
    const body = (await request.json()) as { planId?: string };
    const planId = body.planId;

    if (!planId) {
      return Response.json({ message: "Plan ID is required" }, { status: 400 });
    }

    // SECURITY: never trust the price from the frontend — fetch real plan
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);
    if (!plan) {
      return Response.json({ message: "Plan not found" }, { status: 404 });
    }

    if (plan.priceMonthly === 0) {
      return Response.json(
        { message: "Free plan doesn't require payment" },
        { status: 400 }
      );
    }

    // receipt must be <= 40 characters (Razorpay limit)
    const order = await razorpay.orders.create({
      amount: plan.priceMonthly,
      currency: "INR",
      receipt: `sub_${user.id.slice(-8)}_${Date.now()}`.slice(0, 40),
      notes: {
        dealerId: user.id,
        planId: plan.id,
        planName: plan.name,
      },
    });

    await db.insert(payments).values({
      dealer: user.id,
      plan: plan.id,
      amount: plan.priceMonthly,
      razorpayOrderId: order.id,
      status: "created",
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
    });
  });
}
