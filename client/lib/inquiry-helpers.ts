import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import type { InquiryRow } from "@/lib/db/schema";

export const CRM_STATUSES = [
  "new",
  "contacted",
  "interested",
  "test_drive",
  "closed",
  "lost",
  "fake",
] as const;

export const CRM_PRIORITIES = ["low", "medium", "high"] as const;

const HIGH_INTENT_WORDS = [
  "test drive",
  "loan",
  "finance",
  "emi",
  "available",
  "visit",
  "buy",
  "interested",
];

export function normalizeIndianMobile(phone: string): string | null {
  const digits = String(phone ?? "").replace(/\D/g, "");
  const withoutCountryCode =
    digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;

  if (!/^[6-9]\d{9}$/.test(withoutCountryCode)) {
    return null;
  }

  return withoutCountryCode;
}

export async function findDealerInquiry(
  inquiryId: string,
  dealerId: string
): Promise<
  | { error: { status: number; message: string }; inquiry?: never }
  | { inquiry: InquiryRow; error?: never }
> {
  const [inquiry] = await db
    .select()
    .from(inquiries)
    .where(eq(inquiries.id, inquiryId))
    .limit(1);

  if (!inquiry) {
    return { error: { status: 404, message: "Inquiry not found" } };
  }

  // Held leads belong to KarBik support until forwarded: the dealer sees a 404.
  if (inquiry.dealer === dealerId && inquiry.adminHold) {
    return { error: { status: 404, message: "Inquiry not found" } };
  }

  if (inquiry.dealer !== dealerId) {
    return {
      error: {
        status: 403,
        message: "You can only update inquiries for your own listings",
      },
    };
  }

  return { inquiry };
}

export function getLeadAssessment({
  message,
  buyerInquiryCountToday,
  phoneInquiryCountToday,
}: {
  message: string;
  buyerInquiryCountToday: number;
  phoneInquiryCountToday: number;
}): {
  leadScore: number;
  leadQuality: "new" | "good" | "high_intent" | "suspicious";
  leadSignals: string[];
} {
  let score = 50;
  const signals: string[] = [];
  const normalizedMessage = String(message ?? "").trim().toLowerCase();

  if (normalizedMessage.length >= 40) {
    score += 15;
    signals.push("Detailed message");
  }

  if (HIGH_INTENT_WORDS.some((word) => normalizedMessage.includes(word))) {
    score += 20;
    signals.push("High-intent wording");
  }

  if (buyerInquiryCountToday > 3) {
    score -= 20;
    signals.push("Many inquiries from this buyer today");
  }

  if (phoneInquiryCountToday > 2) {
    score -= 25;
    signals.push("Same phone used on multiple inquiries today");
  }

  if (normalizedMessage.length < 12) {
    score -= 15;
    signals.push("Very short message");
  }

  const leadScore = Math.max(0, Math.min(100, score));
  let leadQuality: "new" | "good" | "high_intent" | "suspicious" = "new";
  if (leadScore >= 80) leadQuality = "high_intent";
  else if (leadScore >= 55) leadQuality = "good";
  else if (leadScore < 35) leadQuality = "suspicious";

  return { leadScore, leadQuality, leadSignals: signals };
}

export async function countInquiries(where: {
  buyer?: string;
  phone?: string;
  since: Date;
}): Promise<number> {
  const conditions = [];
  if (where.buyer) conditions.push(eq(inquiries.buyer, where.buyer));
  if (where.phone) conditions.push(eq(inquiries.phone, where.phone));
  conditions.push(gte(inquiries.createdAt, where.since));

  const [row] = await db
    .select({ value: count() })
    .from(inquiries)
    .where(and(...conditions));
  return row?.value ?? 0;
}
