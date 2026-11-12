---
version: 1
slug: "app-cars-id-page-tsx"
primary_target: "app/cars/[id]/page.tsx"
related_targets: ["components/CarDetailView.tsx","components/car-detail"]
---

# Car detail (app/cars/[id]/page.tsx)

Mode: Persuade, with Operate precision. Audience: a Hyderabad used-car buyer, mostly on a phone, deciding whether this one car is worth a call. Job: see the car, trust the facts, and tell KarBik support in one tap. Proof on hand: 50 real listings with 4 photos each (some 1), RC checked on all, owners, insurance, accident and service flags, features, description. No inspection reports exist, so none are shown. Constraints: dealer name, address and phone never appear; no "Certified/Assured/Premium"; no loan approval or bank claims; one orange action; cards only for repeating items (similar cars); no nested cards, no bento, no glass, no eyebrow labels above headings.

## Direction contract

THESIS: The honest showroom floor, one car at a time. The photo and the price are the loudest things; every fact under them is a plain labelled row a buyer can scan; the one next step ("Ask KarBik") is always in reach.

OWN-WORLD: White surface on cool ground, hairline dividers instead of boxes, brand blue for links and selected state, Action Orange for the single primary action, WhatsApp Green only on WhatsApp, RC Green only on a true RC check. Archivo headings, Inter everywhere else, tabular numerals on price, EMI and km.

FIRST VIEWPORT (phone 375x812): a compact header (back, save, share), then the gallery edge to edge, then title, one spec line, price in lakh with Est. EMI and the RC Verified badge, then the "Verified dealer · Hyderabad, KarBik support connects you" line. The sticky bottom bar (price, WhatsApp, Call back) is visible from first paint and replaces the bottom nav. Price and the primary action are in the first screen.

SECTION FLOW (phone): gallery, summary, dealer-behind-KarBik line, then a sticky anchor bar (Overview, Checks, Features, EMI, Similar) after the first screen, then Overview (key specs as rows, about this car), Checks on this car (RC, accident, service, insurance, each with "Not provided" fallback), Features (grouped, first rows shown), EMI estimate, How KarBik connects you (3 steps), Dealer reviews (only if real), Similar cars (the only cards; hidden under 2), FAQ (answers match the real lead flow). Desktop: left column content, right column sticky summary with price, EMI, WhatsApp (orange), Call back.

DROPPED: dealer name and card, Pre-Approved Loan box, "KarBik Assured" / "Certified Inspection" labels, bento spec tiles, icon-circle feature cards, registration number, the duplicate contact card in the DOM.

CTA RULE: WhatsApp is the single orange-filled action in the view; Call back is an outline. The lead gate (sign in and mobile number) opens as a bottom sheet on phones and a centred panel from md, with the same fields and handlers as before. No backend change.

FINISH: 375 and 1440 in light and dark with no horizontal overflow, no broken image (1-photo and 0-photo cars included), keyboard focus visible, 44px touch targets, `impeccable detect` clean.
