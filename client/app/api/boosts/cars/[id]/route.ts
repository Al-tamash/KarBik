import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { boosts, cars } from "@/lib/db/schema";
import { razorpay } from "@/lib/razorpay-server";
import { ApiError, apiHandler, requireDealer } from "@/lib/guards";
import { BOOST_PLANS, type BoostType } from "@/lib/boosts";
import {
  CREDIT_BOOST_DAYS,
  CREDIT_BOOST_TYPE,
  creditOrderPrefix,
  getBoostCredits,
} from "@/lib/boost-credits";

// POST /api/boosts/cars/:id — create a boost order for a listing
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const user = await requireDealer();
    const { id: carId } = await params;
    const body = (await request.json()) as {
      boostType?: string;
      useCredit?: boolean;
    };
    const useCredit = body.useCredit === true;
    const boostType = useCredit ? CREDIT_BOOST_TYPE : body.boostType;

    if (!boostType || !(boostType in BOOST_PLANS)) {
      throw new ApiError(400, "Invalid boost type");
    }
    const plan = BOOST_PLANS[boostType as BoostType];

    const [car] = await db
      .select({ dealer: cars.dealer })
      .from(cars)
      .where(eq(cars.id, carId))
      .limit(1);
    if (!car) {
      return Response.json({ message: "Car not found" }, { status: 404 });
    }

    if (car.dealer !== user.id) {
      return Response.json(
        { message: "You can only boost your own listings" },
        { status: 403 }
      );
    }

    // One active boost per listing at a time
    const [activeBoost] = await db
      .select({ id: boosts.id })
      .from(boosts)
      .where(
        and(
          eq(boosts.car, carId),
          eq(boosts.status, "active"),
          gt(boosts.endDate, new Date())
        )
      )
      .limit(1);

    if (activeBoost) {
      return Response.json(
        { message: "This car is already boosted." },
        { status: 400 }
      );
    }

    // Spend a plan credit instead of paying: activates immediately, no Razorpay.
    if (useCredit) {
      const credits = await getBoostCredits(user.id);
      if (!credits.subscriptionId || credits.remaining <= 0) {
        return Response.json(
          { message: "No boost credits left on your plan this month." },
          { status: 409 }
        );
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + CREDIT_BOOST_DAYS);

      await db.insert(boosts).values({
        car: carId,
        dealer: user.id,
        boostType: CREDIT_BOOST_TYPE,
        amount: 0,
        status: "active",
        startDate,
        endDate,
        razorpayOrderId: `${creditOrderPrefix(credits.subscriptionId)}${crypto.randomUUID()}`,
      });

      return Response.json({
        credit: true,
        remaining: credits.remaining - 1,
        endDate,
        planName: plan.label,
      });
    }

    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: "INR",
      receipt: `bst_${user.id.slice(-8)}_${Date.now()}`.slice(0, 40),
      notes: {
        dealerId: user.id,
        carId,
        boostType,
      },
    });

    await db.insert(boosts).values({
      car: carId,
      dealer: user.id,
      boostType: boostType as BoostType,
      amount: plan.amount,
      status: "created",
      razorpayOrderId: order.id,
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.label,
    });
  });
}
