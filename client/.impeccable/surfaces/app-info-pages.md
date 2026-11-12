---
version: 1
slug: "app-info-pages"
primary_target: "components/info/InfoPage.tsx"
related_targets: ["app/about/page.tsx","app/contact/page.tsx","app/faq/page.tsx","app/how-it-works/page.tsx","components/info/ContactForm.tsx","components/car-detail/HowItWorks.tsx"]
---

# Info pages: About, Contact, FAQ, How it works

Mode: Read (Contact is Read with one form). Audience: a Hyderabad buyer or dealer, usually on a phone, who wants one answer: what KarBik is, how the flow works, what a badge means, how to reach support. Job: find the answer in a screen or two. Proof on hand: the lead flow (support talks first, then connects), RC check, optional inspection report, Razorpay payments, dealer dashboard with CRM, QR and boost. No stats, testimonials, press, founding story or office hours. Constraints (PRODUCT.md): claims literally true, no superlatives, no "verified" steps that are not in the product, no office hours, no reply-time promise, support number only where it is the point (Contact; the footer keeps it), no dealer names, no cards around sections, no eyebrow labels, no hero.

## Direction contract

THESIS: A plain page of true sentences. One narrow column, one h1, one line of intro, hairline-divided sections. The words carry the page; the shell only sets measure and rhythm.

OWN-WORLD: White surface, Archivo headings, Inter body at 16px, ink on white, blue only for text links and the blue submit button, one orange action per page (Browse cars on About and How it works, WhatsApp support on Contact). Native `<details>` for the FAQ.

SHELL: `components/info/InfoPage.tsx` (`InfoPage`, `InfoSection`), max-w-3xl, sections with `border-t` and a `scroll-mt-24` anchor.

PAGES:
- About: how it works for buyers, what a car page tells you (RC Verified defined with its limits, Not provided, optional inspection report), for dealers, who runs KarBik (Edone Solutions, links to Contact).
- Contact: WhatsApp (orange) and Call buttons, email link, the message form (same API, ids and honeypot as before), operator address. No hours, no reply promise.
- FAQ: three groups (buying, dealers, general) in native details, `FAQPage` JSON-LD from the same strings, EMI answer built from `lib/emi.ts` so it cannot drift.
- How it works: buyers and dealers one after the other, `#buyers` and `#dealers` anchors, three numbered steps each (`StepList`, shared with the car page's How KarBik connects you).

DROPPED: kickers and pills ("Support Directory", "Platform Explainer", "Get in Touch"), hero grids, mission card, four icon tiles, "most trusted/transparent" claims, "Direct Contact", "Dealer Reviews", market-size figure, "we experienced this firsthand", area coverage list, business hours, "within 24 hours", "walk-ins by appointment", tabbed segments, ghost step numbers and connector line, dark CTA bands with glow, tab-grid FAQ with framer accordion, QR "verified reviews" claim.

NOT BUILT (needs the owner): a real founder or team line, a reply-time promise, a help centre with search (Spinny has one), a grievance officer line.

FINISH: 375 and 1440 in light and dark with no horizontal overflow, details toggle by keyboard, form shows success only when the API says so, 44px targets, `impeccable detect` clean.
