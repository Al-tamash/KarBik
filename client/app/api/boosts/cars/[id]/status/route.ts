import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { boosts } from "@/lib/db/schema";
import { apiHandler, requireDealer } from "@/lib/guards";

// GET /api/boosts/cars/:id/status — active boost info for a listing
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    await requireDealer();
    const { id: carId } = await params;

    const [activeBoost] = await db
      .select()
      .from(boosts)
      .where(
        and(
          eq(boosts.car, carId),
          eq(boosts.status, "active"),
          gt(boosts.endDate, new Date())
        )
      )
      .limit(1);

    if (!activeBoost || !activeBoost.endDate) {
      return Response.json({ isBoosted: false });
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysRemaining = Math.max(
      0,
      Math.ceil((activeBoost.endDate.getTime() - Date.now()) / msPerDay)
    );

    return Response.json({
      isBoosted: true,
      endDate: activeBoost.endDate,
      daysRemaining,
    });
  });
}
