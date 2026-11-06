import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";
import { findDealerInquiry } from "@/lib/inquiry-helpers";

// PATCH /api/inquiries/:id/notes — dealer saves private CRM notes
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = (await request.json()) as { notes?: unknown };

    const notes =
      typeof body.notes === "string" ? body.notes : "";

    const { inquiry, error } = await findDealerInquiry(id, user.id);
    if (error) {
      return Response.json({ message: error.message }, { status: error.status });
    }

    const [updated] = await db
      .update(inquiries)
      .set({ notes, updatedAt: new Date() })
      .where(eq(inquiries.id, inquiry.id))
      .returning();

    return Response.json(updated);
  });
}
