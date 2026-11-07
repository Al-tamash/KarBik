/**
 * Contact-form email: validation + delivery through Resend.
 *
 * Uses the same two environment variables as the lead alerts, so no new
 * configuration is needed:
 *   RESEND_API_KEY   Resend API key
 *   LEAD_EMAIL_FROM  verified sender, e.g. "KarBik <alerts@karbik.com>"
 * and delivers to supportAlertEmail() (SUPPORT_ALERT_EMAIL, default support@karbik.com).
 * `reply_to` is set to the visitor, so replying in the inbox answers them directly.
 *
 * No database table is involved: the email is the record.
 */
import { z } from "zod";
import { supportAlertEmail } from "@/lib/lead-routing";

export const CONTACT_TOPICS = {
  buying: "Buying a car",
  selling: "Listing a car (Dealer)",
  subscription: "Subscription & Billing",
  report: "Report a listing",
  partnership: "Partnership inquiry",
  other: "Other",
} as const;

export type ContactTopic = keyof typeof CONTACT_TOPICS;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().max(200).pipe(z.email("Enter a valid email address")),
  topic: z.enum(Object.keys(CONTACT_TOPICS) as [ContactTopic, ...ContactTopic[]], {
    message: "Pick a topic",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please write a few more words so we can help")
    .max(2000, "Message is too long (2000 characters max)"),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactMailResult = "SENT" | "FAILED" | "SKIPPED";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Header values must never contain line breaks (header injection). */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function buildContactEmail(input: Pick<ContactInput, "name" | "email" | "topic" | "message">) {
  const topicLabel = CONTACT_TOPICS[input.topic];
  const name = oneLine(input.name);
  const subject = `Contact form: ${topicLabel} (${name})`.slice(0, 200);
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h2 style="margin:0 0 12px">New message from the KarBik contact form</h2>
      <p style="margin:0 0 4px"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(input.email)}&gt;</p>
      <p style="margin:0 0 12px"><strong>Topic:</strong> ${escapeHtml(topicLabel)}</p>
      <blockquote style="margin:12px 0;padding:8px 12px;border-left:3px solid #ddd;color:#333;white-space:pre-wrap">${escapeHtml(input.message)}</blockquote>
      <p style="font-size:12px;color:#777">Reply to this email to answer the sender directly.</p>
    </div>`;
  const text = `From: ${name} <${input.email}>\nTopic: ${topicLabel}\n\n${input.message}\n\nReply to this email to answer the sender directly.`;
  return { subject, html, text };
}

export async function sendContactEmail(
  input: Pick<ContactInput, "name" | "email" | "topic" | "message">
): Promise<ContactMailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_EMAIL_FROM;
  const to = supportAlertEmail();
  if (!apiKey || !from || !to) return "SKIPPED";

  const { subject, html, text } = buildContactEmail(input);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], reply_to: input.email, subject, html, text }),
    });
    if (!res.ok) {
      console.error("Contact email rejected:", res.status, await res.text());
      return "FAILED";
    }
    return "SENT";
  } catch (err) {
    console.error("Contact email error:", err);
    return "FAILED";
  }
}
