import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";
import { CRM_PRIORITIES, CRM_STATUSES, findDealerInquiry } from "@/lib/inquiry-helpers";

// PATCH /api/inquiries/:id/status — dealer updates lead status/priority
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = (await request.json()) as { status?: string; priority?: string };
    const status = body.status;
    const priority = body.priority;

    if (!status || !CRM_STATUSES.includes(status as never)) {
      return Response.json({ message: "Invalid inquiry status" }, { status: 400 });
    }

    if (priority && !CRM_PRIORITIES.includes(priority as never)) {
      return Response.json({ message: "Invalid inquiry priority" }, { status: 400 });
    }

    const { inquiry, error } = await findDealerInquiry(id, user.id);
    if (error) {
      return Response.json({ message: error.message }, { status: error.status });
    }

    const now = new Date();
    const [updated] = await db
      .update(inquiries)
      .set({
        status: status as typeof inquiries.$inferInsert.status,
        priority:
          priority !== undefined
            ? (priority as typeof inquiries.$inferInsert.priority)
            : undefined,
        markedFakeAt: status === "fake" ? now : null,
        lastContactedAt:
          status === "contacted" && !inquiry.lastContactedAt ? now : undefined,
        updatedAt: now,
      })
      .where(eq(inquiries.id, inquiry.id))
      .returning();

    return Response.json(updated);
  });
}
