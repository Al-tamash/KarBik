import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dealerProfiles } from "@/lib/db/schema";
import { apiHandler } from "@/lib/guards";
import { generateSlug } from "@/lib/slug";

// GET /api/dealers/check-slug/:slug — public: slug availability
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return apiHandler(async () => {
    const { slug: rawSlug } = await params;
    const slug = generateSlug(rawSlug);

    if (!slug || slug.length < 3) {
      return Response.json(
        { available: false, message: "Slug must be at least 3 characters" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ user: dealerProfiles.user })
      .from(dealerProfiles)
      .where(eq(dealerProfiles.slug, slug))
      .limit(1);

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const isOwn =
      existing && userId !== null && existing.user === userId;

    return Response.json({
      available: !existing || isOwn,
      slug,
    });
  });
}
