import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cars,
  dealerProfiles,
  inquiries,
  user as userTable,
} from "@/lib/db/schema";
import { apiHandler, requireUser } from "@/lib/guards";
import {
  countInquiries,
  getLeadAssessment,
  normalizeIndianMobile,
} from "@/lib/inquiry-helpers";
import { alertAdminOfHeldLead, notifyDealerOfLead } from "@/lib/lead-notify";
import {
  HOLD_CALLBACKS_FOR_ADMIN,
  ROUTE_ALL_LEADS_VIA_SUPPORT,
  SUPPORT_PHONE,
} from "@/lib/lead-routing";
import { publiclyVisible } from "@/lib/car-visibility";
import { buildWhatsAppUrl } from "@/lib/dealer-public";
import { displayCarName } from "@/lib/car-name";
import { describeCar } from "@/lib/whatsapp-message";
import {
  countLeadEventsByIp,
  getClientMeta,
  recordLeadEvent,
  type LeadChannel,
} from "@/lib/lead-events";

// "compare" = the buyer asked from the compare page. Support sees it as a badge in the
// admin list (leadSource is free text, so no migration), which says which cars were
// weighed against each other.
const LEAD_SOURCES = ["car_detail", "dealer_profile", "whatsapp", "callback", "compare"];

/**
 * What the BUYER gets back. Deliberately a small allow-list: the inquiry row
 * also holds the dealer's private CRM notes, admin notes and the spam score,
 * none of which a buyer may see.
 */
function buyerView(
  inquiry: typeof inquiries.$inferSelect,
  whatsappUrl: string | null
) {
  return {
    id: inquiry.id,
    car: inquiry.car,
    dealer: inquiry.dealer,
    status: inquiry.status,
    leadSource: inquiry.leadSource,
    createdAt: inquiry.createdAt,
    whatsappUrl,
  };
}
// Deliberately generous: Indian mobile carriers put many subscribers behind one
// shared (CGNAT) IP, so a tight per-IP cap would block genuine buyers. Per-account
// and per-phone limits do the fine-grained work; this only stops bulk abuse.
const MAX_INQUIRIES_PER_IP_PER_HOUR = 30;

// POST /api/inquiries — buyer sends an inquiry about a car.
//
// This is the only door to a dealer's contact channel. With channel=whatsapp the
// lead is stored (and audited) FIRST, and only then is the dealer's wa.me link
// built server-side and returned. The dealer's number is never shipped to the
// browser ahead of a recorded lead.
export async function POST(request: Request) {
  return apiHandler(async () => {
    const user = await requireUser();
    const meta = getClientMeta(request);
    const body = (await request.json()) as Record<string, unknown>;
    const carId =
      typeof body.car === "string" &&
      body.car.length === 36 &&
      body.car !== "00000000-0000-0000-0000-000000000000"
        ? body.car
        : null;
    const directDealerId = typeof body.dealer === "string" ? body.dealer : "";
    const name = (typeof body.name === "string" ? body.name : "")
      .trim()
      .slice(0, 100);
    const phone = typeof body.phone === "string" ? body.phone : "";
    const message = (typeof body.message === "string" ? body.message : "")
      .trim()
      .slice(0, 1000);
    const wantsWhatsApp = body.channel === "whatsapp";
    const channel: LeadChannel = wantsWhatsApp
      ? "whatsapp"
      : body.channel === "callback"
        ? "callback"
        : "web";
    const requestedSource =
      typeof body.leadSource === "string" ? body.leadSource : "";
    // A WhatsApp tap is recorded as "whatsapp" (channel and source are the same thing
    // for support), except from the compare page, where where-it-came-from matters more.
    const leadSource =
      requestedSource === "compare"
        ? "compare"
        : wantsWhatsApp
          ? "whatsapp"
          : LEAD_SOURCES.includes(requestedSource)
            ? requestedSource
            : "car_detail";

    const normalizedPhone = normalizeIndianMobile(phone);

    if ((!carId && !directDealerId) || !name || !phone || !message) {
      return Response.json(
        { message: "All fields are required (car or dealer, name, phone, message)" },
        { status: 400 }
      );
    }

    if (!normalizedPhone) {
      return Response.json(
        { message: "Enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    let targetDealerId = directDealerId;
    let notificationCarTitle = "General Showroom Inquiry";
    let notificationCarImage = "/logo.png";
    let whatsappSubject = "your showroom";

    if (carId) {
      const [car] = await db
        .select()
        .from(cars)
        .where(and(eq(cars.id, carId), publiclyVisible))
        .limit(1);
      if (!car) {
        return Response.json({ message: "Car listing not found" }, { status: 404 });
      }

      if (car.dealer === user.id) {
        return Response.json(
          { message: "You cannot inquire about your own listing" },
          { status: 400 }
        );
      }

      targetDealerId = car.dealer;
      notificationCarTitle = displayCarName(car);
      notificationCarImage = car.images?.[0]?.url || "/logo.png";
      whatsappSubject = `the ${describeCar(car)}`;
    } else {
      if (targetDealerId === user.id) {
        return Response.json(
          { message: "You cannot inquire about your own showroom" },
          { status: 400 }
        );
      }
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // One lookup drives both routing and the WhatsApp link.
    const [dealerRow] = await db
      .select({
        phone: dealerProfiles.phone,
        isSample: dealerProfiles.isSample,
        businessName: dealerProfiles.businessName,
      })
      .from(dealerProfiles)
      .where(eq(dealerProfiles.user, targetDealerId))
      .limit(1);
    const isSample = dealerRow?.isSample ?? false;

    // Every lead waits for KarBik support first (buyers never reach a dealer
    // directly). A sample (demo) showroom never gets a lead at all.
    const viaSupport = isSample || ROUTE_ALL_LEADS_VIA_SUPPORT;
    const holdForAdmin = viaSupport || (HOLD_CALLBACKS_FOR_ADMIN && !wantsWhatsApp);

    // Resolve the wa.me link only after the lead is safely stored. For a sample
    // listing it points at KarBik support, not at the fictional dealer's number.
    async function whatsappUrlFor(inquiryId: string): Promise<string | null> {
      if (!wantsWhatsApp) return null;
      const ref = inquiryId.slice(0, 8);
      const dealerName = dealerRow?.businessName?.trim();
      return viaSupport
        ? buildWhatsAppUrl(
            SUPPORT_PHONE,
            isSample
              ? `Hi KarBik, I'm interested in ${whatsappSubject} (a sample listing, ref ${ref}). Please help me find similar cars.`
              : `Hi KarBik, I'm interested in ${whatsappSubject}${dealerName ? ` from ${dealerName}` : ""} (ref ${ref}). Please connect me with the dealer.`
          )
        : buildWhatsAppUrl(
            dealerRow?.phone,
            `Hi, I'm interested in ${whatsappSubject} listed on KarBik (ref ${ref}). Please share details.`
          );
    }

    // Duplicate check: same buyer inquired about the same car or showroom within 24h
    const duplicateConditions = [
      eq(inquiries.buyer, user.id),
      gte(inquiries.createdAt, oneDayAgo),
    ];
    if (carId) {
      duplicateConditions.push(eq(inquiries.car, carId));
    } else {
      duplicateConditions.push(eq(inquiries.dealer, targetDealerId));
    }

    const [duplicate] = await db
      .select()
      .from(inquiries)
      .where(and(...duplicateConditions))
      .limit(1);

    if (duplicate) {
      if (wantsWhatsApp) {
        // A second WhatsApp tap is still a real contact attempt: log it against
        // the original lead and let the buyer through instead of failing silently.
        await recordLeadEvent({
          inquiry: duplicate.id,
          dealer: duplicate.dealer,
          eventType: "repeat_contact",
          channel,
          meta,
        });
        return Response.json(
          buyerView(duplicate, await whatsappUrlFor(duplicate.id)),
          { status: 200 }
        );
      }
      return Response.json(
        { message: "You already sent an inquiry for this car/showroom today" },
        { status: 429 }
      );
    }

    const buyerInquiryCountLastHour = await countInquiries({
      buyer: user.id,
      since: oneHourAgo,
    });
    if (buyerInquiryCountLastHour >= 5) {
      return Response.json(
        { message: "Too many inquiries. Please try again after some time" },
        { status: 429 }
      );
    }

    if (meta.ipAddress) {
      const ipCount = await countLeadEventsByIp({
        ipAddress: meta.ipAddress,
        eventType: "inquiry_created",
        since: oneHourAgo,
      });
      if (ipCount >= MAX_INQUIRIES_PER_IP_PER_HOUR) {
        return Response.json(
          { message: "Too many inquiries from your network. Please try again later" },
          { status: 429 }
        );
      }
    }

    const phoneInquiryCountToday = await countInquiries({
      phone: normalizedPhone,
      since: oneDayAgo,
    });
    if (phoneInquiryCountToday >= 3) {
      return Response.json(
        { message: "This phone number has reached today's inquiry limit" },
        { status: 429 }
      );
    }

    const buyerInquiryCountToday = await countInquiries({
      buyer: user.id,
      since: oneDayAgo,
    });

    const leadAssessment = getLeadAssessment({
      message,
      buyerInquiryCountToday,
      phoneInquiryCountToday,
    });

    const [inquiry] = await db
      .insert(inquiries)
      .values({
        name,
        phone: normalizedPhone,
        message,
        car: carId,
        buyer: user.id,
        dealer: targetDealerId,
        leadSource,
        isVerifiedByAdmin: false,
        adminHold: holdForAdmin,
        ...leadAssessment,
      })
      .returning();

    // Proof of lead: immutable record of when, from where, via which channel.
    await recordLeadEvent({
      inquiry: inquiry.id,
      dealer: targetDealerId,
      eventType: "inquiry_created",
      channel,
      meta,
      metadata: { leadScore: leadAssessment.leadScore, leadSource },
    });

    // Permanently remember buyer phone on user record if not yet set (1-time registration)
    try {
      await db
        .update(userTable)
        .set({ phone: normalizedPhone })
        .where(
          and(
            eq(userTable.id, user.id),
            sql`${userTable.phone} is null or ${userTable.phone} = ''`
          )
        );
    } catch (err) {
      console.warn("Failed to update user profile phone:", err);
    }

    const summary = {
      inquiryId: inquiry.id,
      dealerId: targetDealerId,
      buyerName: name,
      subject: notificationCarTitle,
      message,
      carImage: notificationCarImage,
      channel,
    };

    if (holdForAdmin) {
      // The dealer must not see this yet: record why, and tell KarBik support.
      await recordLeadEvent({
        inquiry: inquiry.id,
        dealer: targetDealerId,
        eventType: "held_for_admin",
        channel,
        metadata: { reason: isSample ? "sample_listing" : viaSupport ? "support_first" : "callback_review" },
      });
      await alertAdminOfHeldLead(summary);
    } else {
      await notifyDealerOfLead(summary);
    }

    const whatsappUrl = await whatsappUrlFor(inquiry.id);
    if (wantsWhatsApp) {
      await recordLeadEvent({
        inquiry: inquiry.id,
        dealer: targetDealerId,
        eventType: "whatsapp_redirect",
        channel,
        meta,
        metadata: { linkIssued: Boolean(whatsappUrl) },
      });
    }

    return Response.json(buyerView(inquiry, whatsappUrl), { status: 201 });
  });
}
