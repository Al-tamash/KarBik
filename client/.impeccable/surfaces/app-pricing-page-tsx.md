---
version: 1
slug: "app-pricing-page-tsx"
primary_target: "app/pricing/page.tsx"
related_targets: ["components/pricing/PlanGrid.tsx","components/pricing/PlanCard.tsx","app/dashboard/billing/page.tsx","components/info/InfoPage.tsx","lib/flags.ts","lib/boosts.ts"]
---

# Dealer plans and billing (app/pricing, app/dashboard/billing)

Mode: Persuade (pricing, plain-spoken) and Operate (billing). Audience: a Hyderabad car dealer deciding whether KarBik is worth listing on, then checking their own plan. Job: see exactly what each plan gives and what is charged, and know what happens first (KYC: only 2 cars shown to buyers until it is reviewed). Proof on hand: real plan rows (Free 5 cars, Starter 25 cars and 1 boost credit a month at 999, Pro unlimited and 4 credits at 2,999, monthly, no auto-renewal), real boost prices (1 day 99, 3 days 249, 7 days 499), real limits (the plan limit counts every car listed, live or waiting; until KYC review only 2 cars are shown to buyers and the rest wait for approval; plan fallback to Free when a plan ends; cars already listed stay). Not true today and so never said: analytics or WhatsApp as plan features, a paid dealer badge, a recommended plan, custom volume pricing, payment methods accepted, any claim about leads delivered or search ranking beyond "boosted cars show first in browse with a Featured badge". Constraints (PRODUCT.md): prices are public and stated "+ GST"; invoices come from Edone Solutions; the support number is not repeated (the Contact page is the way); no cards inside cards, no eyebrow labels.

## Direction contract

THESIS: A price list a dealer can believe. Three plain plan cards (the one repeating thing on the page), then a short "Before you pay" in sentences. Nothing is sold with adjectives.

OWN-WORLD: The info-page shell (white surface, Archivo headings, Inter body, hairline sections), widened for three columns. Plan cards are bordered, flat, equal. No orange on this page: none of its actions is the one primary action of a buyer view; the single CTA style is outline until payments open, then the existing checkout button.

PAYMENTS FLAG: `PAYMENTS_ENABLED` (lib/flags.ts) decides the card button and the intro line. Off: "Paid plans open soon. Message support" (to /contact), intro says every dealer starts on Free. On: Subscribe (RazorpayCheckout), signed-out visitors get "Log in to subscribe", buyers get "Register as a dealer".

SECTION FLOW (pricing): h1 Dealer plans, intro, the KYC sentence (before the cards, body size), three plan cards, "Before you pay" (KYC first, 30 days per payment and no auto-renewal and what happens when a plan ends, + GST and invoices from Edone Solutions, boosts with the three pay-per-boost prices).

SECTION FLOW (billing): back to dashboard, h1 Plan and billing, current plan with price and expiry (if any), cars listed against the plan limit (the server counts every non-archived car, live or waiting), how many of them buyers can see (at most 2 until KYC is verified) and how many wait for approval, KYC state, with each block saying "did not load" when its own data failed (never a default), plan boost credits left until the plan ends, and either "online payments open soon, message support" or See plans.

DROPPED: kicker pill, hype headline, Recommended pill, hover lift and coloured shadows, framer stagger, the empty spacer, three trust tiles, payment-methods line, custom volume pricing line, the support number in the invoice line, "forever tier" and "Default Plan", the dealer-badge feature row, strikethrough feature grid, the unreachable success toast with timer, the header comment promising a payment history that does not exist, the blue Upgrade button.

STATES: plans failed to load (message and a Contact link), signed-out (pricing readable, billing redirects to login), buyer (billing redirects to dashboard), payments off, payments on, plan ended (shown as Free).

NOT BUILT (needs backend): payment history, invoices in the dashboard, annual billing, a plan change flow (downgrade or switch), admin manual grants (step 3).

FINISH: 375 and 1440 in light and dark with no horizontal overflow, 44px targets, `impeccable detect` clean, every sentence checked against the code and PRODUCT.md.
