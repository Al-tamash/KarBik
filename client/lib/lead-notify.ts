import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions, user as userTable } from "@/lib/db/schema";
import { sendPushNotification } from "@/lib/push";
import { sendLeadEmail } from "@/lib/lead-alerts";
import { supportAlertEmail } from "@/lib/lead-routing";
import { recordLeadEvent, type LeadChannel } from "@/lib/lead-events";

type LeadSummary = {
  inquiryId: string;
  dealerId: string;
  buyerName: string;
  subject: string;
  message: string;
  carImage?: string;
  channel: LeadChannel;
};

/**
 * Tell the dealer about a lead: web push first, email if no push got through.
 * Every outcome is written to the lead timeline. Used both for a fresh lead and
 * when support releases a held lead.
 */
export async function notifyDealerOfLead(lead: LeadSummary): Promise<void> {
  const { inquiryId, dealerId, channel } = lead;
  try {
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, dealerId));

    if (subs.length === 0) {
      await recordLeadEvent({
        inquiry: inquiryId,
        dealer: dealerId,
        eventType: "no_push_subscription",
        channel,
      });
    }

    let pushDelivered = 0;
    await Promise.all(
      subs.map(async (sub) => {
        const result = await sendPushNotification(sub.subscription, {
          title: "New Inquiry Received! 🚗",
          body: `${lead.buyerName} inquired about: ${lead.subject}.`,
          icon: lead.carImage || "/logo.png",
          data: { url: "/dashboard/inquiries" },
        });
        if (result === "SENT") pushDelivered += 1;
        if (result === "EXPIRED") {
          // Dead endpoint: drop it so it stops silently swallowing alerts.
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        }
        await recordLeadEvent({
          inquiry: inquiryId,
          dealer: dealerId,
          eventType:
            result === "EXPIRED"
              ? "push_expired"
              : result === "SENT"
                ? "push_sent"
                : "push_failed",
          channel,
          metadata: { deviceType: sub.deviceType },
        });
      })
    );

    if (pushDelivered === 0) {
      const [dealerUser] = await db
        .select({ email: userTable.email })
        .from(userTable)
        .where(eq(userTable.id, dealerId))
        .limit(1);
      const emailResult = await sendLeadEmail({
        to: dealerUser?.email ?? "",
        buyerName: lead.buyerName,
        subject: lead.subject,
        message: lead.message,
      });
      await recordLeadEvent({
        inquiry: inquiryId,
        dealer: dealerId,
        eventType:
          emailResult === "SENT"
            ? "email_sent"
            : emailResult === "FAILED"
              ? "email_failed"
              : "email_skipped",
        channel,
      });
    }
  } catch (err) {
    console.error("Dealer notify error:", err);
  }
}

/** Tell KarBik support that a callback is waiting to be verified. */
export async function alertAdminOfHeldLead(lead: LeadSummary): Promise<void> {
  try {
    const result = await sendLeadEmail({
      to: supportAlertEmail(),
      buyerName: lead.buyerName,
      subject: lead.subject,
      message: lead.message,
      audience: "admin",
    });
    await recordLeadEvent({
      inquiry: lead.inquiryId,
      dealer: lead.dealerId,
      eventType: result === "SENT" ? "admin_alerted" : "admin_alert_skipped",
      channel: lead.channel,
      metadata: { result },
    });
  } catch (err) {
    console.error("Admin alert error:", err);
  }
}
