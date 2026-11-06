import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dealerProfiles } from "@/lib/db/schema";
import { apiHandler } from "@/lib/guards";

// GET /api/dealers — public: list active micro-websites (sitemap/directory).
// The dealer's own profile editing lives at /api/dealers/profile.
export async function GET() {
  return apiHandler(async () => {
    const rows = await db
      .select({
        slug: dealerProfiles.slug,
        businessName: dealerProfiles.businessName,
        updatedAt: dealerProfiles.updatedAt,
      })
      .from(dealerProfiles)
      .where(eq(dealerProfiles.microWebsiteEnabled, true));
    return Response.json(rows);
  });
}
