import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans, subscriptions } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";

// GET /api/subscriptions/my-plan — dealer's active plan (free-tier fallback)
export async function GET() {
  return apiHandler(async () => {
    const user = await requireUser();

    const rows = await db
      .select({
        subscription: subscriptions,
        plan: plans,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.plan, plans.id))
      .where(
        and(
          eq(subscriptions.dealer, user.id),
          eq(subscriptions.status, "active"),
          gt(subscriptions.endDate, new Date())
        )
      )
      .limit(1);

    if (rows.length === 0) {
      const [freePlan] = await db
        .select()
        .from(plans)
        .where(eq(plans.slug, "free"))
        .limit(1);
      return Response.json({
        subscription: null,
        plan: freePlan ?? null,
        isFreeTier: true,
      });
    }

    return Response.json({
      subscription: rows[0].subscription,
      plan: rows[0].plan,
      isFreeTier: false,
    });
  });
}
