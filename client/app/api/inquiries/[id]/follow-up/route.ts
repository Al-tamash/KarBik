import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";
import { findDealerInquiry } from "@/lib/inquiry-helpers";

// PATCH /api/inquiries/:id/follow-up — dealer sets or clears a follow-up date
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = (await request.json()) as { followUpAt?: unknown };
    const followUpAt = body.followUpAt;

    const { inquiry, error } = await findDealerInquiry(id, user.id);
    if (error) {
      return Response.json({ message: error.message }, { status: error.status });
    }

    let followUpDate: Date | null = null;
    if (followUpAt) {
      followUpDate = new Date(String(followUpAt));
      if (Number.isNaN(followUpDate.getTime())) {
        return Response.json(
          { message: "Invalid follow-up date" },
          { status: 400 }
        );
      }
    }

    const [updated] = await db
      .update(inquiries)
      .set({ followUpAt: followUpDate, updatedAt: new Date() })
      .where(eq(inquiries.id, inquiry.id))
      .returning();

    return Response.json(updated);
  });
}
