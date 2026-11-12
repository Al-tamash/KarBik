/**
 * Account email: the password-reset link.
 *
 * Delivery goes through Resend, the same way lead alerts do (lib/lead-alerts.ts), and needs
 * the same two env vars. Without them nothing is sent and the problem is logged, so a
 * missing key never turns into a crash on the sign-in page.
 *   RESEND_API_KEY   Resend API key
 *   LEAD_EMAIL_FROM  e.g. "KarBik <alerts@your-verified-domain.com>"
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail(args: { to: string; name: string; url: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("Password reset email not sent: RESEND_API_KEY or LEAD_EMAIL_FROM is not set.");
    return;
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1B212B">
      <h2 style="margin:0 0 12px">Choose a new password</h2>
      <p style="margin:0 0 12px">Hi ${escapeHtml(args.name || "there")}, we got a request to reset the password for your KarBik account.</p>
      <p style="margin:16px 0">
        <a href="${escapeHtml(args.url)}" style="background:#C2410C;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">
          Choose a new password
        </a>
      </p>
      <p style="font-size:12px;color:#5D6375;word-break:break-all">Button not working? Copy this link into your browser:<br>${escapeHtml(args.url)}</p>
      <p style="font-size:14px;color:#5D6375">The link works once and for one hour. If you did not ask for this, you can ignore this email; your password stays as it is.</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [args.to], subject: "Reset your KarBik password", html }),
    });
    if (!res.ok) console.error("Password reset email rejected:", res.status, await res.text());
  } catch (err) {
    console.error("Password reset email error:", err);
  }
}
