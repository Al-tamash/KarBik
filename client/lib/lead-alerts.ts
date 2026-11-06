import { API_BASE } from "@/lib/api-base";

export type EmailAlertResult = "SENT" | "FAILED" | "SKIPPED";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Email the dealer about a new lead. This is the fallback for when web push
 * cannot reach them (no subscription, expired endpoint, notifications blocked).
 *
 * Needs two env vars; without them it reports SKIPPED so the lead timeline still
 * shows that no alert could be delivered:
 *   RESEND_API_KEY   — Resend API key
 *   LEAD_EMAIL_FROM  — e.g. "KarBik <alerts@your-verified-domain.com>"
 *
 * The buyer's phone number is intentionally not in the email: the dealer opens
 * the dashboard, where every contact attempt is recorded.
 */
export async function sendLeadEmail(args: {
  to: string;
  buyerName: string;
  subject: string;
  message: string;
  /** "admin" = a callback is waiting for KarBik support; default is the dealer. */
  audience?: "dealer" | "admin";
}): Promise<EmailAlertResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_EMAIL_FROM;
  if (!apiKey || !from || !args.to) return "SKIPPED";

  const isAdmin = args.audience === "admin";
  const dashboardUrl = `${API_BASE}${isAdmin ? "/admin" : "/dashboard"}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#111">
      <h2 style="margin:0 0 12px">${isAdmin ? "Callback request waiting for KarBik support" : "New buyer inquiry"}</h2>
      <p style="margin:0 0 8px"><strong>${escapeHtml(args.buyerName)}</strong> is interested in
      <strong>${escapeHtml(args.subject)}</strong>.</p>
      <blockquote style="margin:12px 0;padding:8px 12px;border-left:3px solid #ddd;color:#444">
        ${escapeHtml(args.message.slice(0, 300))}
      </blockquote>
      <p style="margin:16px 0">
        <a href="${dashboardUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">
          ${isAdmin ? "Open admin panel" : "Open your leads"}
        </a>
      </p>
      <p style="font-size:12px;color:#777">${isAdmin ? "Call the buyer, confirm what they want, then verify and forward the lead to the dealer from the admin panel." : "Reply to the buyer quickly — fast responses convert best."}</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: `${isAdmin ? "Callback to verify" : "New inquiry"}: ${args.subject}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Lead email rejected:", res.status, await res.text());
      return "FAILED";
    }
    return "SENT";
  } catch (err) {
    console.error("Lead email error:", err);
    return "FAILED";
  }
}
