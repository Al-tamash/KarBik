---
version: 1
slug: "app-admin-page-tsx"
primary_target: "app/admin/page.tsx"
related_targets: ["app/admin/AdminInquiriesTab.tsx","app/admin/AdminDealersTab.tsx","app/admin/AdminActivityTab.tsx","components/admin/AdminSheet.tsx","lib/audit.ts","app/api/admin/dealers/[id]/plan/route.ts","app/api/admin/audit/route.ts","drizzle/0005_admin_audit_log.sql"]
---

# Admin (app/admin)

Mode: Operate. Audience: KarBik support, usually on a phone, working a queue of buyer leads and a short list of dealers. Job: call the buyer, verify and forward the lead; verify a dealer; give a plan by hand while online payments are off; know what was done. Proof on hand: every lead waits for support (PRODUCT.md, `ROUTE_ALL_LEADS_VIA_SUPPORT`); the dealer sees the support note; payments are off (`PAYMENTS_ENABLED`); there was no record of admin actions. Constraints: nothing in the UI may assert something support did not do (no pre-filled "verified on phone call"); the dealer never learns more than the note the admin wrote; a plan is never given without a written record; no decoration (no icon chips, no uppercase labels, no cards inside cards).

## Direction contract

THESIS: A work queue, not a dashboard. The lead needing a call is the first thing on the screen and it has a Call button.

OWN-WORLD: White surface, hairline-divided lists, Archivo headings, Inter 16px, tabular numbers, ink-filled selected pills and underline tabs (the same as the storefront and lead sheet). Blue for the one decisive action of a row (Verify and forward, Verify dealer, Give plan). No orange (that is the buyer's one action).

LEADS: filters Needs a call (default), Forwarded, All, search. Each lead: name, source if not the car page, time, car link and dealer, the buyer's message, a state line, Call (tel:) and WhatsApp (wa.me) to the buyer, and Verify and forward. The sheet starts with an empty note and cannot be confirmed until "I spoke to the buyer on the phone" is ticked; failures are shown in the sheet. State comes from one function (`leadState`). Sample-dealer leads can be marked verified but are not forwarded, and say so.

DEALERS: verification state, KYC document link, cars, current plan with its end date, Verify or Remove verification, Plan, Dealer login, Storefront. Plan sheet: Starter or Pro, days (1 to 366), a note of at least 5 characters (what was paid, how, reference), Give plan, and End current plan. Login sheet confirms before it resets and shows the temporary password once.

ACTIVITY: read-only list of the latest 100 audit rows. When the table does not exist it says so (migration 0005) instead of showing an empty list.

AUDIT: `admin_audit_log` (actor, actor email, action, target, summary, note, metadata, time). Every admin mutation writes a row best-effort (`recordAdminAction`). Giving or ending a plan writes it first and strictly (`recordAdminActionStrict`): without the table the action answers 503 "apply migration 0005". The password of a login reset is never logged.

DROPPED: "Super Admin Portal", "Hyderabad HQ", the four icon metric cards, the 6-column tables, the pre-filled verification note, "Concierge" wording, the "dispatched to dealers" line that was false for held leads, native confirm() for the login reset, "permanently deleted" (car removal is a soft delete and says so).

NOT BUILT: pagination beyond the latest 100 leads and audit rows, per-dealer plan history, editing a granted plan, redesign of the Cars and Loan leads tabs (they sit in the new shell with their old content; car removal and loan updates are audited).

FINISH: 375 and 1440 in light and dark with no horizontal overflow, 44px targets, the sheet traps focus and returns it, `impeccable detect` clean. Migration 0005 is a file in the repo; it is applied to the production database only on the owner's explicit yes.
