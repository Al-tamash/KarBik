import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";
import { findDealerInquiry } from "@/lib/inquiry-helpers";

// PATCH /api/inquiries/:id/whatsapp — dealer tracks a WhatsApp contact click
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const user = await requireUser();
    const { id } = await params;

    const { inquiry, error } = await findDealerInquiry(id, user.id);
    if (error) {
      return Response.json({ message: error.message }, { status: error.status });
    }

    const now = new Date();
    const [updated] = await db
      .update(inquiries)
      .set({
        whatsappMessageCount: sql`${inquiries.whatsappMessageCount} + 1`,
        lastContactedAt: now,
        status:
          inquiry.status === "new"
            ? ("contacted" as typeof inquiries.$inferInsert.status)
            : undefined,
        updatedAt: now,
      })
      .where(eq(inquiries.id, inquiry.id))
      .returning();

    return Response.json(updated);
  });
}
