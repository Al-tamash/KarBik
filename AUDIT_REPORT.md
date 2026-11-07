# KarBik site audit — https://www.karbik.com

Audit date: 2026-11-06. Branch: `audit/site-review` (not merged, not deployed).
Production was only **read** (GET requests). Everything that writes (register, login, enquiry, listings) ran on a local production build (`next build` + `next start`) against the **QA** Neon branch `qa-test`. Nothing was written to the production database, and no environment variable was touched.

Evidence lives in `audit/screenshots/` (production, 1440px and 390px, `*-desktop.jpg` / `*-mobile.jpg`, plus `_facts.json`) and `audit/screenshots/after/` (same pages from this branch).

---

## 1. Deployment status and env var check

| Check | Result |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack), React 19, Vercel project `kar-bik`, Root Directory `client` |
| Production responds | Yes: all 10 public routes return 200, DB-backed APIs return data (`/api/cars` 50 listings, `/api/dealers`, `/api/subscriptions/plans`) |
| Latest deployment, build logs, runtime logs (24h) | **Blocked.** The Vercel connector has no access to the team scope yet (`403: Not authorized: scope "mdalqamakalim-3171"`). I asked for the consent link twice; it was not approved. Needs: you approve the link, then I re-run. |
| Env vars set in Vercel | **Blocked**, same reason. Names only, never values. |
| Domains | `karbik.com` returns 308 to `https://www.karbik.com` (www is primary). `http://` upgrades to https. DNS: Vercel nameservers, A records `216.198.79.x` / `64.29.17.x`. Consistent. |
| Security headers | HSTS, X-Frame-Options SAMEORIGIN, nosniff, Referrer-Policy, Permissions-Policy all present. |
| Auth origin check | Fixed earlier today (commit `07facea`, live): `www.karbik.com` and `karbik.com` Origins are accepted, a foreign Origin is rejected. |

**Env var names the code references** (check these exist in Vercel Production):
`DATABASE_URL`, `BETTER_AUTH_SECRET`\*, `NEXT_PUBLIC_APP_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `GEMINI_API_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `RESEND_API_KEY`, `LEAD_EMAIL_FROM`, `SUPPORT_ALERT_EMAIL` (optional).
\* read by Better Auth itself, not by `process.env` in our code. The build fails without it, and production is working, so it is set.
If `RESEND_API_KEY` or `LEAD_EMAIL_FROM` is missing, lead emails are silently skipped (`SKIPPED`), so support would not be emailed about held leads. Please confirm both are set.

**Problem found:** `NEXT_PUBLIC_APP_URL` is `https://karbik.com` (no www) but the site lives on `www`. Result: `og:url`, `robots.txt` Sitemap line and every `<loc>` in `sitemap.xml` point at the apex, which 308-redirects. `og:url` is the home URL on every page (also on `/cars`), and there is no `rel="canonical"`. See open question 3.

---

## 2. Frontend verdict

**Modern: yes, mostly.** Clean card system, Inter + Archivo type, one blue accent, generous spacing, good photography, sensible badges. Mobile has no horizontal scroll on any page (390px). No broken images, no console errors, no failed requests on any route (the `ERR_ABORTED` on `?_rsc=` are Next prefetches cancelled by navigation, harmless). It reads as trustworthy. What lets it down is not styling but **copy that contradicts the product** and a few placeholder-quality details.

### Top 5 changes, in order of impact
1. **Make the trust claims literally true.** `/cars` says "Direct dealer contact: your inquiry reaches the dealer instantly — no middlemen". Under the final lead routing, buyers contact KarBik support first, so this is false. The car page says "RTO VERIFIED" while the cards say "RC VERIFIED" (your decision was "RC checked"). The car page also advertises "Financing partner … Tie-ups with HDFC, ICICI, IDFC & Poonawalla … from 9.5% p.a." and a "4.9 (42 reviews)" rating while only 3 reviews are shown. I did not touch any of this copy; see open questions.
2. **Make the contact form real.** `/contact` shows "Message Sent!" but does nothing (see flow 6). Visitors who write to you are silently lost.
3. **Fix the canonical host** (www vs apex) so Google indexes one set of URLs.
4. **Shorten the mobile homepage and tighten cards.** The mobile home is about 11,700px tall (roughly 14 screens). Featured and Recently Listed could be horizontal carousels on mobile. The price and "EMI from" line wraps awkwardly on the 3-column `/cars` cards.
5. **Stop publishing more data than needed.** `GET /api/cars` returns each car's full `registrationNumber` (e.g. a full plate), the internal `searchVector`, and dealer user ids. Mask plates (`TS 08 ** 8920`) and drop `searchVector`.

### Bugs you listed, and what I found

| Reported | Finding | Status |
|---|---|---|
| "Loading..." left on homepage | Real, but only in the raw HTML: `app/loading.tsx` text streamed with the homepage, so scrapers and no-JS clients saw it (browsers swap it out). | **Fixed** (spinner only, no text). Smoke test added. |
| "…" placeholders in listing sections | Real in raw HTML: stats strip rendered `…`, and Featured / Recently Listed were fetched in the browser after load, so server HTML had empty skeletons. | **Fixed**: homepage now passes the data it already fetches to those components, so first paint has real listings and the real count. |
| Malformed "/cars?brand=Toyota" link label | Not reproducible. The links are `<a href="/cars?brand=Toyota">` with a logo and the text "Toyota". Likely an artefact of a text scrape. The filter works (`?brand=Toyota` keeps the query and filters). | No change |
| Footer tagline missing a word | Not reproducible: it currently reads "A Hyderabad marketplace for used cars from local dealers. Browse listings and talk to KarBik support, who connect you with the dealer. Free for buyers." | No change |

### Other visible bugs found and fixed
- Car title shown as "N10 **(o)** Diesel" (title lower-cased by `toTitleCase`). Now shown as stored.
- "Similar Vehicles" cards and share text: "2024 Mahindra **2024 Mahindra** Xuv 3xo…". One shared helper `lib/car-name.ts` now avoids repeating year and brand (also in JSON-LD, notifications, and the default enquiry text).
- `/pricing` told logged-out visitors "**Current active plan**" on the Free card. Now only shown when signed in.
- The car page renders `ContactCard` twice (mobile + desktop copies), so there are two `<h1>` in the DOM (one hidden by CSS). Low impact; not changed.

---

## 3. Phase 2 flows

Where "local" is stated, the flow ran on a production build of this branch with the QA database. Production itself was not written to.

| # | Flow | Status | Evidence | Fix applied |
|---|---|---|---|---|
| 1a | Register (buyer) | **Pass** (local) | `POST /api/auth/sign-up/email` 200, lands on `/dashboard`, cookie `better-auth.session_token` httpOnly, SameSite=Lax (Secure on https) | none needed |
| 1b | Login, logout, session survives refresh | **Pass** (local) | e2e `auth` suite 5/5 | none needed |
| 1c | `/login` when already signed in | **Fail → fixed** | Reproduced: stayed on `/login`. Now redirects to `/dashboard` (`/admin` for admins). Same on `/register`. | Yes |
| 1d | Production register/login | **Blocked** | Needs a production test account (a database write). Verified instead that production no longer rejects the `www` Origin: sign-in probe returns 401 "Invalid email or password" (before today's fix: 403 `INVALID_ORIGIN`) | Fix `07facea` already live |
| 2 | Listings on home/cars | **Pass** | 50 listings (5 pages), real data, empty state exists. SSR now includes them. | SSR seeding (above) |
| 2b | Ref `fd952ff2` | **Cannot verify as a car** | See section 5: the ref is the first 8 characters of an *inquiry id*, not a car id. No car or dealer id starts with `fd952ff2`. The car it describes (2021 Mahindra Bolero Neo N10 (O), Southgate Motors, id `b679b107-…`) exists, its page renders (200, price ₹8.9 Lakh, all specs) and `rcVerified: true`. Confirming the inquiry row needs a read-only query on the production DB; I did not run one without your OK. | none |
| 3 | WhatsApp enquiry | **Fail → fixed** | The message repeated year and brand ("the 2021 Mahindra 2021 Mahindra Bolero…") and had no explicit variant. See section 5. | Yes |
| 4 | Dealer create / edit / delete a listing | **Pass** (local, API) | create 201, edit 200 (price and colour changed), delete 200, then the listing is no longer reachable (403/404/410) and gone from the public list. Image upload not exercised (Cloudinary not available locally). | none needed |
| 5a | Pricing | **Pass** after fix | Plans from API (Free ₹0, Starter ₹999/mo, Pro ₹2,999/mo) match the page. Logged-out "Current active plan" bug fixed. | Yes |
| 5b | Compare | **Pass with notes** | Two cars selected: table renders. Notes: the compare bar also overlays the compare page, and the values mix cases ("manual" vs "DIESEL"). | none |
| 6 | Forms | **Mixed → fixed** | Login: wrong password shows "Invalid email or password" and stays put (pass). Register: weak password rejected with a message (pass). **Contact form: fake**, `handleSubmit` only calls `setSubmitted(true)` and shows "Message Sent! We'll respond within 24 hours". It sends nothing. | **Fixed**: real form via Resend (`/api/contact`, see `docs/contact-form-resend.md`). Success is shown only when Resend accepted the email; otherwise an error with the email and WhatsApp fallback. |
| 7 | Search and filters | **Pass** | `?brand=Toyota` keeps the URL and returns only Toyota; `fuelType` and `maxPrice` narrow results correctly; `sort=newest` is appended. | none |

Rate limits are working (a repeated test enquiry returned 429: 3 per phone per day, 5 per buyer per hour, per-IP cap).

---

## 4. Root cause of the sign-in redirect bug

I found three separate causes. Only the first matches "stuck on the sign-in page after a successful login" on production.

1. **Origin check (production, fixed and live in `07facea`).** Better Auth trusts only its `baseURL`, which comes from `NEXT_PUBLIC_APP_URL` = `https://karbik.com`. Visitors are on `https://www.karbik.com` (the apex 308-redirects there), so every sign-in and sign-up POST was rejected with `403 INVALID_ORIGIN`. The form never reached `/dashboard`. Fix: `trustedOrigins` now allows both spellings plus `kar-bik.vercel.app`.
2. **`/login` did not redirect signed-in users** (reproduced on the local build). A user who was already signed in landed on a login form that looked like the login had failed. Fixed in `login/page.tsx` and `register/page.tsx` with `useAppSession`.
3. **Possible client race** (dashboard bounces to `/login` if its session store is still empty right after navigation). I tried to reproduce it four times on the local build (register and login) and it landed on `/dashboard` every time, so I did not change the dashboard. Not proven; keep an eye on it.

Cookie attributes (local, http): `better-auth.session_token`, httpOnly, SameSite=Lax. On https Better Auth adds `Secure` and the `__Secure-` prefix. Host-only (no Domain attribute), so a session is per host: a user who signs in on `karbik.com` is redirected to `www` first, which is fine.

---

## 5. WhatsApp URL for ref `fd952ff2`

**How it works** (`app/api/inquiries/route.ts` + `lib/dealer-public.ts`): the link is built on the server *after* the enquiry is stored, using `wa.me/91<10 digits>?text=<encodeURIComponent(message)>`. `ref` is the first 8 characters of the new **inquiry id**. By your decision (`ROUTE_ALL_LEADS_VIA_SUPPORT = true`) the number is the **KarBik support number 9494720878**, not the dealer's, and the lead is held until support forwards it. This is intended, so the "not the dealer" check is a deliberate pass.

**Before (what production sends today):**
`Hi KarBik, I'm interested in the 2021 Mahindra 2021 Mahindra Bolero Neo N10 (O) Diesel from Southgate Motors - Gachibowli Tech Hub (ref fd952ff2). Please connect me with the dealer.`

**After (this branch), exact URL:**
```
https://wa.me/919494720878?text=Hi%20KarBik%2C%20I'm%20interested%20in%20the%202021%20Mahindra%20Bolero%20Neo%20N10%20(O)%20with%20Multi-Terrain%20Tech%20(Diesel)%20from%20Southgate%20Motors%20-%20Gachibowli%20Tech%20Hub%20(ref%20fd952ff2).%20Please%20connect%20me%20with%20the%20dealer.
```
Decoded: *Hi KarBik, I'm interested in the 2021 Mahindra Bolero Neo N10 (O) with Multi-Terrain Tech (Diesel) from Southgate Motors - Gachibowli Tech Hub (ref fd952ff2). Please connect me with the dealer.*

Checks: international format, no `+`, no spaces: pass. URL-encoded: pass. Year, make, model, variant, fuel, dealer name and ref all present: pass. Number belongs to KarBik support: as designed. A live QA call to the real endpoint returned `201` with a URL in this exact shape (QA marks Southgate as a sample showroom, so that text differs slightly).

**Not verified:** opening the link on a phone. A Windows machine cannot test the WhatsApp app handoff. Please tap it once on a phone after deploy. `wa.me/<number>?text=` is the standard format and the text is plain ASCII, so I expect it to work.

---

## 6. Open questions for you

1. ~~Contact form~~ **Done** with Resend (your choice). Needs, in Vercel Production: `RESEND_API_KEY`, `LEAD_EMAIL_FROM`, and `SUPPORT_ALERT_EMAIL` (set to a working inbox until `support@karbik.com` has MX records). Real send is untested until this branch reaches `main`: Preview has no Resend variables.
2. **Copy that contradicts how leads work:** (a) "Direct dealer contact … no middlemen" on `/cars`; (b) "RTO VERIFIED" on the car page vs "RC checked" elsewhere; (c) the financing-partner card (HDFC, ICICI, IDFC, Poonawalla, "from 9.5% p.a."); (d) "4.9 (42 reviews)" with 3 shown; (e) every card shows INSPECTED, RC VERIFIED and ACCIDENT-FREE. Which of these are true today? I can reword or remove them on your word.
3. **Canonical host.** Recommended: set `NEXT_PUBLIC_APP_URL=https://www.karbik.com` in Vercel and redeploy (I may not change env vars). Or make the apex the primary domain. Sitemap, `og:url` and canonical then follow automatically.
4. **Public data exposure.** Mask the registration number on listings? Drop `searchVector` and dealer user ids from `/api/cars`? The first changes what buyers see.
5. **Ref `fd952ff2`.** OK for me to run one read-only `SELECT` on the production database to confirm that inquiry exists and which car it points to? (No writes.)
6. **Vercel access.** Approve the team-access link so I can read the latest deployment, build and runtime logs, and env var names.
7. **Preview testing.** A Vercel Preview uses the Preview environment's variables. Please confirm its `DATABASE_URL` is a test branch before anyone registers on a preview, otherwise test users would land in the production database.

---

## 7. Changes, tests, preview

**Branch:** `audit/site-review` (from `ts-postgres` = `main` at `07facea`). Not pushed to `main`.
**Preview URL:** see the bottom of this file / the final message; it is created by Vercel when the branch is pushed.

Files changed: `app/page.tsx`, `app/loading.tsx`, `components/{TrustStatsStrip,FeaturedCars,JustArrivedCars,PricingContent,CarDetailView}.tsx`, `components/car-detail/{ContactCard,ImageGallery}.tsx`, `app/(auth)/{login,register}/page.tsx`, `app/api/inquiries/route.ts`, `app/cars/page.tsx`, `app/cars/[id]/page.tsx`; new `lib/car-name.ts`, `lib/whatsapp-message.ts`; `client/package.json` gains scripts only (no new dependencies, lockfile untouched).

**Tests added** (`client/e2e/`, `node:test` + the existing `playwright` dependency):
- `npm run test:unit`: 10 tests (car names, WhatsApp text and URL building, contact schema and email escaping).
- `npm run test:smoke`: 26 read-only tests, safe on production. Includes the "no `Loading...` after 5 seconds" homepage test, raw-HTML placeholder check, filters, pricing, compare, 390px overflow.
- `npm run test:flows`: 13 write tests (register, login, redirect, logout, validation, WhatsApp, dealer create/edit/delete, contact form). Run the local server with blank `RESEND_API_KEY` / `LEAD_EMAIL_FROM` so no real mail is sent. They **refuse to run against karbik.com** and need `E2E_ALLOW_WRITES=1`.
- Env: `BASE_URL`, `HOST_MAP="www.karbik.com=216.198.79.1"` (pins DNS; this computer's resolver still returns the old Hostinger page for karbik.com), `CHROMIUM_PATH`.

**Results:**
| Target | unit | smoke | flows | tsc | eslint | build |
|---|---|---|---|---|---|---|
| This branch, local production build + QA DB | 10/10 | 26/26 | 13/13 | pass | pass | pass |
| Production today (read-only smoke) | n/a | 24/26 | n/a | | | |

The two production failures are exactly the bugs this branch fixes: `Loading...` in the raw homepage HTML, and "Current active plan" shown to logged-out visitors.

`client/scripts/audit-screenshots.ts` regenerates all screenshots (`BASE_URL=… CAR_ID=… npx tsx scripts/audit-screenshots.ts`).
