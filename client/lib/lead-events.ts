import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { leadEvents } from "@/lib/db/schema";

export type LeadEventType =
  | "inquiry_created"
  | "repeat_contact"
  | "whatsapp_redirect"
  | "push_sent"
  | "push_failed"
  | "push_expired"
  | "no_push_subscription"
  | "email_sent"
  | "email_failed"
  | "email_skipped"
  | "held_for_admin"
  | "admin_alerted"
  | "admin_alert_skipped"
  | "released_to_dealer";

export type LeadChannel = "web" | "whatsapp" | "callback";

export type ClientMeta = {
  ipAddress: string | null;
  userAgent: string | null;
};

/** Best-effort buyer IP + user agent from proxy headers (Vercel sets x-forwarded-for). */
export function getClientMeta(request: Request): ClientMeta {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  return {
    ipAddress: ip ? ip.slice(0, 64) : null,
    userAgent: request.headers.get("user-agent")?.slice(0, 400) ?? null,
  };
}

/**
 * Append a row to the lead audit trail. Never throws: logging must not be able
 * to break lead capture itself.
 */
export async function recordLeadEvent(event: {
  inquiry: string;
  dealer: string;
  eventType: LeadEventType;
  channel?: LeadChannel;
  meta?: ClientMeta;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(leadEvents).values({
      inquiry: event.inquiry,
      dealer: event.dealer,
      eventType: event.eventType,
      channel: event.channel ?? "web",
      ipAddress: event.meta?.ipAddress ?? null,
      userAgent: event.meta?.userAgent ?? null,
      metadata: event.metadata ?? {},
    });
  } catch (err) {
    console.error("Failed to record lead event:", event.eventType, err);
  }
}

/** How many events of a type came from one IP since a point in time (abuse throttle). */
export async function countLeadEventsByIp(where: {
  ipAddress: string;
  eventType: LeadEventType;
  since: Date;
}): Promise<number> {
  try {
    const [row] = await db
      .select({ value: count() })
      .from(leadEvents)
      .where(
        and(
          eq(leadEvents.ipAddress, where.ipAddress),
          eq(leadEvents.eventType, where.eventType),
          gte(leadEvents.createdAt, where.since)
        )
      );
    return row?.value ?? 0;
  } catch (err) {
    // Fail open: a throttle lookup problem must never block a real buyer.
    console.error("Failed to count lead events by IP:", err);
    return 0;
  }
}
