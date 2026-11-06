import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leadEvents } from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";
import { findDealerInquiry } from "@/lib/inquiry-helpers";

// GET /api/inquiries/:id/events — dealer reads the proof-of-lead timeline
// (created, WhatsApp redirect, push delivered/failed) for one of their leads.
// The buyer's IP is intentionally not returned to dealers.
export async function GET(
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

    const events = await db
      .select({
        id: leadEvents.id,
        eventType: leadEvents.eventType,
        channel: leadEvents.channel,
        createdAt: leadEvents.createdAt,
      })
      .from(leadEvents)
      .where(eq(leadEvents.inquiry, inquiry.id))
      .orderBy(asc(leadEvents.createdAt));

    return Response.json({ inquiryId: inquiry.id, events });
  });
}
