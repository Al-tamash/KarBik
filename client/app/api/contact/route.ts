import { apiHandler } from "@/lib/guards";
import { contactSchema, sendContactEmail } from "@/lib/contact-mail";
import { getClientMeta } from "@/lib/lead-events";
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY } from "@/lib/lead-routing";

// POST /api/contact — the public contact form. Emails KarBik support via Resend.
//
// Abuse protection is deliberately light and database-free: a honeypot field
// plus a per-IP limit held in this server instance's memory. On serverless the
// limit is per warm instance (best effort); Resend's own quota is the hard cap.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function tooMany(ip: string | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(ip, hits);
    return true;
  }
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear(); // keep memory bounded
  return false;
}

export async function POST(request: Request) {
  return apiHandler(async () => {
    const body = (await request.json()) as unknown;
    const input = contactSchema.parse(body);

    // Bots fill every field. Pretend it worked, send nothing.
    if (input.website && input.website.trim() !== "") {
      return Response.json({ ok: true });
    }

    if (tooMany(getClientMeta(request).ipAddress)) {
      return Response.json(
        { message: "Too many messages from your network. Please try again later." },
        { status: 429 }
      );
    }

    const result = await sendContactEmail(input);
    if (result !== "SENT") {
      return Response.json(
        {
          message: `We couldn't send your message right now. Please email ${SUPPORT_EMAIL} or WhatsApp ${SUPPORT_PHONE_DISPLAY}.`,
        },
        { status: 503 }
      );
    }
    return Response.json({ ok: true });
  });
}
