import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";

// GET /api/notifications/status — does the signed-in user have any push device?
// The dashboard uses it to warn a dealer who would otherwise miss new leads.
export async function GET() {
  return apiHandler(async () => {
    const user = await requireUser();
    const [row] = await db
      .select({ value: count() })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.id));
    return Response.json({ subscribed: (row?.value ?? 0) > 0 });
  });
}
