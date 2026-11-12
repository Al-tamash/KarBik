# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Buyers** in Hyderabad looking for a used car from a local dealer. All segments, from budget family cars to premium SUVs; no single segment is the focus. Free for buyers. Most browse on a phone.
- **Dealers** (used-car showrooms in Hyderabad) who list cars, receive verified leads, and pay for plans and boosts.

## Product Purpose

KarBik is a Hyderabad marketplace for used cars from local dealers. Buyers browse listings, compare cars, and tell KarBik support which car they like (WhatsApp or call back). Support talks to the buyer first, then forwards the lead to the dealer. Success: buyers find a car they trust and reach the dealer through KarBik; dealers get real, pre-qualified leads.

## Positioning

- Local only: Hyderabad dealers, Hyderabad neighbourhoods.
- Every lead is human-checked: buyers never contact a dealer directly; KarBik support verifies and forwards each lead (flag `ROUTE_ALL_LEADS_VIA_SUPPORT`, lib/lead-routing.ts). Dealer phone numbers are never shown.
- Trust badges that are literally true: "RC checked" only on admin-verified cars; "Verified" dealer only after KYC document review.

## Operating Context

- Buyer flow: home → search/filter → listing detail → WhatsApp or call-back to KarBik support.
- Dealer flow: register → storefront + listings → leads dashboard → plans/boosts (Razorpay, monthly only, no auto-renewal).
- Support/admin: verifies leads ("Verify & Forward"), RC and KYC documents.

## Capabilities and Constraints

- Next.js 16 App Router, Tailwind CSS 4, TypeScript strict, Better Auth, Neon Postgres. Light and dark mode exist.
- Inventory is small at launch (about 50 real cars from 3 real dealers: Apex, Heritage, Southgate). Design must not advertise small totals or duplicate the same cars across sections.
- Car photos are currently CarDekho-hosted (stimg.cardekho.com) — known copyright/hotlink risk, owner's decision for now.
- Language: English only.

## Brand Commitments

- Public brand name: **KarBik**. Built and operated by Edone Solutions.
- Logo and wordmark are open to redesign (today it is a generic car icon + text).
- Contact: support@karbik.com, call/WhatsApp 94947 20878. Never print office hours (none given).
- Visual direction (chosen Nov 2026 on the Impeccable decision page): the category standard, executed at full craft. Quality bar: Cars24, Spinny, CarDekho. White ground, one brand blue, orange for primary actions, search-first, dense car cards.
- Claims must be literally true. No superlatives ("most transparent"), no invented verification steps, stats, or testimonials.

## Evidence on Hand

- 50 real listings with photos, 3 real dealers, RC/KYC checks done by the owner.
- No real customer testimonials, reviews volume, press, or sales numbers yet — do not fabricate them.
- Hub images on the current homepage are generated/stock (googleusercontent), not real KarBik locations.

## Product Principles

1. Search and real cars first; explanation second.
2. Every trust signal must be true and specific to the car or dealer it sits on.
3. Local beats generic: Hyderabad areas, local dealers, local support number.
4. Human help is the differentiator: make "KarBik support connects you" visible, not hidden in copy.
5. Mobile is the main screen.
