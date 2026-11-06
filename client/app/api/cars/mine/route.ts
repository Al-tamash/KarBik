import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { boosts, cars } from "@/lib/db/schema";
import { apiHandler, requireDealer } from "@/lib/guards";

const isBoostedSql = sql<boolean>`exists (
  select 1 from ${boosts}
  where ${boosts.car} = ${cars.id}
    and ${boosts.dealer} = ${cars.dealer}
    and ${boosts.status} = 'active'
    and ${boosts.endDate} > now()
)`;

// GET /api/cars/mine — dealer's own listings with boost flag
export async function GET() {
  return apiHandler(async () => {
    const user = await requireDealer();

    const rows = await db
      .select({ car: cars, isBoosted: isBoostedSql })
      .from(cars)
      .where(and(eq(cars.dealer, user.id), isNull(cars.archivedAt)))
      .orderBy(desc(cars.createdAt));

    return Response.json(
      rows.map((row) => ({ ...row.car, isBoosted: row.isBoosted }))
    );
  });
}
