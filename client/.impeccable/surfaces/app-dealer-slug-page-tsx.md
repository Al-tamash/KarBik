---
version: 1
slug: "app-dealer-slug-page-tsx"
primary_target: "app/dealer/[slug]/page.tsx"
related_targets: ["components/dealer/DealerStorefront.tsx","lib/dealer-name.ts","lib/dealer-public.ts","lib/use-lead-flow.ts"]
---

# Dealer storefront (app/dealer/[slug]/page.tsx)

Mode: Persuade with Operate edges. Audience: a Hyderabad used-car buyer who followed a dealer's shared link (WhatsApp status, QR) and wants to see that dealer's cars, then ask KarBik about one. Job: reach a car, or ask KarBik about the showroom. Proof on hand: the dealer's name, city, verified state, an optional banner photo, and their live listings (3 dealers, 15 to 20 cars each). No real address, no real reviews, no inspection reports. Constraints: no street address, no map, no "visit our showroom"; no phone number anywhere (WhatsApp and Call back are the way to reach KarBik support); no "Premium", "Certified", "dream car"; no ratings, review counts or testimonials while `SHOW_DEALER_REVIEWS` is off; no social links; no "Inspected" badge; no invented stats; the dealer's tagline after " - " in the stored name is not shown.

## Direction contract

THESIS: A showroom shelf. The dealer's name, one honest line, two actions, then the cars. The page is the dealer's stock, so the cars are the loudest thing and the header is quiet.

OWN-WORLD: White surface, hairline dividers, Archivo name, Inter body, tabular numerals. Shared `CarCard` in a grid. One orange: Ask on WhatsApp. Blue for the selected body-type pill only through ink fill, like the lead sheet tabs. RC Green only on the card's true RC badge.

FIRST VIEWPORT (phone 375x812): back to all cars, dealer name (h1), "Verified dealer · Hyderabad · 20 cars", two buttons side by side (orange Ask on WhatsApp, outline Request call back) and a share icon, then the body-type pills, then the first car.

SECTION FLOW: header (optional banner photo without overlay, name, status line, actions), body-type pills with counts and a sort, car grid (1 column on phone, 2 from sm, 3 from lg), How KarBik connects you (shared `HowItWorks`). After a request is sent the two buttons give way to the shared confirmation.

STATES: dealer not found (404), load failure (message with a way back), no cars (message and a link to all cars), a sample showroom (neutral "Sample showroom" label, noindex, leads go to support), no banner (header only).

DROPPED: full-bleed dark hero with grain and gradients, monogram tile, stats bar (vehicle count, rating, status), "About Us" quote, "Visit Our Showroom" with address and location pin, dark map placeholder, Instagram and Facebook buttons, QR and share-channels panel, testimonials band, "Inspected" badge, the page's own car card, a modal with the support number, "Premium" and "dream car" copy.

CTA RULE: Ask on WhatsApp is the single orange action; Request call back is an outline. Both use the shared lead flow (`lib/use-lead-flow.ts`) with `kind: "dealer"`, so the sign-in and mobile-number sheet is the same as on the car page. The API resolves the dealer from the slug; the dealer's user id never reaches the browser. Lead source is `dealer_profile` for a call back; a WhatsApp tap is recorded as `whatsapp`.

SEO: title "{name}: used cars in {city}", description from the live count, JSON-LD AutoDealer with name, url, image and city only (no street address, no rating), sample showrooms noindex.

NOT BUILT (needs claims or content): dealer "About" text (dealers wrote addresses and claims into it; hidden and stripped from the public API), ratings and reviews (flag off), opening hours.

FINISH: 375 and 1440 in light and dark with no horizontal overflow, no broken image, 44px targets, the lead sheet traps focus and returns it, `impeccable detect` clean.
