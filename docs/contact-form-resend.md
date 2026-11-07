# Contact form with Resend (reusable guide)

A public contact form that emails your support inbox through [Resend](https://resend.com).
No database table. The email is the record, and `reply_to` is the visitor, so replying in your inbox answers them.
Built for KarBik (Next.js App Router, Vercel). The same steps work in any project.

## 1. One-time Resend setup (about 15 minutes)

1. Sign up at resend.com. Check resend.com/pricing for current free-plan limits.
2. **Domains, Add Domain**: add your domain (here `karbik.com`).
3. Resend lists DNS records (a DKIM `TXT` named `resend._domainkey`, and `CNAME`s such as `send` and `rsend` on the "Forge" setup). Add **exactly those** where your DNS lives (here: Vercel, Domains, DNS Records). Names are relative to the domain.
4. Click **Verify** in Resend. It can take minutes to a few hours. Wait for status **Verified**.
5. **API Keys, Create**, permission **Sending access**. The key is shown once: put it in a password manager. Never paste it in chat or commit it.
6. **Leave "Enable receiving" OFF.** It is for inbound mail and needs an MX record on the root domain, which would clash with your real mailbox.

## 2. Environment variables (Vercel, Settings, Environment Variables, Production)

| Name | Value |
|---|---|
| `RESEND_API_KEY` | the key from step 5 |
| `LEAD_EMAIL_FROM` | `KarBik <alerts@karbik.com>` (no quotes; any name `@` your verified domain) |
| `SUPPORT_ALERT_EMAIL` | the inbox that should receive messages (default `support@karbik.com`) |

Changing env vars only affects **new** deployments: redeploy after saving.
Both `RESEND_API_KEY` and `LEAD_EMAIL_FROM` must be set, otherwise the code reports `SKIPPED` and sends nothing.

## 3. Code (copy these into another project)

- `client/lib/contact-mail.ts`: zod schema, email builder (HTML-escaped, no header injection), Resend call. Only dependency: `zod`. Replace the `supportAlertEmail()` import with your own recipient.
- `client/app/api/contact/route.ts`: validates, honeypot, small per-IP limit (in memory), returns `200 {ok:true}` only when Resend accepted the email, else `503` with a human message. Replace `apiHandler` with a try/catch if you do not have one.
- `client/app/contact/page.tsx`: the form posts to `/api/contact`, shows success only on `200`, shows the server's message on error, has a hidden honeypot field `website`.

The Resend call is a plain `fetch`, no SDK:

```ts
await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ from, to: [to], reply_to: visitorEmail, subject, html, text }),
});
```

## 4. Testing without sending real email

- `npm run test:unit`: schema, HTML escaping, subject line.
- `npm run test:flows` (needs `E2E_ALLOW_WRITES=1`, non-production URL): the API rejects bad input, ignores honeypot hits, and the page shows success or error from a mocked API.
- **Run the local server with blank keys** so tests never send mail: `RESEND_API_KEY= LEAD_EMAIL_FROM= npx next start`. A local `.env.local` that holds real keys WILL send real emails (it did once during development).
- Real end-to-end check: after deploying, submit the form once on the live site and look in the inbox (and Spam) and in Resend, Logs.

## 5. Gotchas

- The sender must be on the **verified** domain. A Gmail address as `from` is rejected.
- First emails from a new domain can land in **Spam**; mark "Not spam".
- If sending fails, check Resend **Logs**: it shows sent, bounced or rejected, and why.
- The recipient mailbox must really receive mail (needs MX records). If your DNS moved to a new provider, re-create the mailbox's MX records there. KarBik's `support@karbik.com` had none after the DNS move.
- The per-IP limit lives in one server instance's memory, so on serverless it is best effort. Resend's quota is the hard cap.
