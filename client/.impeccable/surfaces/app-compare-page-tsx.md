---
version: 1
slug: "app-compare-page-tsx"
primary_target: "app/compare/page.tsx"
related_targets: ["components/compare","lib/compare.ts","lib/use-lead-flow.ts"]
---

# Compare (app/compare/page.tsx)

Mode: Operate with Persuade edges. Audience: a Hyderabad used-car buyer on a phone who has picked two or three cars and wants to see where they differ, then ask KarBik about the one they lean towards. Job: read the differences fast, then send one lead. Proof on hand: 50 real listings; every car has year, km, owners, fuel, gearbox, body, colour, engine cc, power, ground clearance, 13 to 22 features, insurance text, RC checked. No inspection reports, no ratings, no dealer reviews. Constraints: dealer name, address and phone never appear; no "best", "winner", "recommended"; no loan approval claims; no invented defaults ("Petrol", "0 km"): missing data reads "Not provided"; no orange fill on a row of identical buttons; no cards around sections; no eyebrow labels above headings.

## Direction contract

THESIS: A plain ledger. Three cars across, one fact per row, the difference is the only thing that is emphasised. The page is a tool, so it is quiet; the cars' photos and prices are the loudest things.

OWN-WORLD: White surface, hairline row dividers, Archivo group headings, Inter values, tabular numerals. Blue for links and the selected "Show only differences" switch. RC Green only on a true RC check. Danger red only on an accident report or an insurance date that has passed.

FIRST VIEWPORT (phone 375x812): back link, h1, share and clear actions, one line of context, the "Show only differences" switch, then the three car columns (photo, name, price, Remove). Phones put each row's label above its values so three cars fit across with no sideways scroll; from md the label is a left column.

SECTION FLOW: car header, then groups Price (with the EMI assumption), Basics, Engine, Checks on the car, Features (collapsed, matched by feature name across cars), Ask KarBik (per car: Ask KarBik and Call back). Rows nobody recorded are left out. After the full header scrolls away a one-line bar under the site header keeps the columns named.

STATES: loading (skeleton columns), 0 cars (a grid of real cars to start with), 1 car (that car, then same body type nearest in price to add), 2 to 3 cars (the table), a sold or taken-down car (removed, with a note), load failure (retry). The list lives in localStorage ("compareCars") and in the URL (?cars=id,id) so a comparison can be shared; a link wins over the saved list. Cars are fetched with view=0 so opening a comparison does not add views.

DROPPED: brand row, icon column, uppercase tracking labels, "Cars Selected" counter, table inside a shadowed card, "Petrol" and "Manual" and "0 km" defaults, full-rupee prices, blue "View Details" button.

CTA RULE: Ask KarBik is an outline button (three of the same orange would break the One Orange Rule). It opens WhatsApp through the shared lead flow (lib/use-lead-flow.ts): the same sign-in and mobile-number sheet as the car page, lead source "compare". Call back is a text button. A car that was asked about shows "Sent".

NOT BUILT (needs claims or backend): pros and cons, owner ratings, price-versus-market.

FINISH: 375 and 1440 in light and dark with no horizontal overflow, no broken image, 44px targets, the lead sheet traps focus and returns it, `impeccable detect` clean.
