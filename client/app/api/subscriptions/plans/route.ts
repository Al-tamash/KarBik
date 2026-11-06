import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { apiHandler } from "@/lib/guards";

// GET /api/subscriptions/plans — public pricing data
export async function GET() {
  return apiHandler(async () => {
    const rows = await db
      .select()
      .from(plans)
      .where(eq(plans.isActive, true))
      .orderBy(asc(plans.sortOrder));
    return Response.json(rows);
  });
}
