---
version: 1
slug: "app-dealer-forms"
primary_target: "app/dashboard/AddCarWizard.tsx"
related_targets: ["components/dealer/CarChecksFields.tsx","app/dashboard/edit/[id]/page.tsx","app/dashboard/ProfileTab.tsx","app/dashboard/page.tsx","shared/validation.ts","lib/car-format.ts","app/api/ai/description/route.ts","app/api/trust/verify/route.ts"]
---

# Dealer forms: Add car, Edit car, Profile

Mode: Operate. Audience: a Hyderabad dealer on a phone, entering a car or setting up their page. Job: get a listing out with true, clean data. Problem found: the data that reached buyers was wrong or unsafe because of the forms: an accident checkbox with the opposite meaning, a dead RC checkbox, free-text insurance the car page could not read, descriptions with workshop and area names, an AI prompt asking for "persuasive" text, profile fields the public page no longer shows, and an invented "+40% leads" statistic. Constraints (PRODUCT.md): nothing a dealer types may let a buyer skip KarBik (phone, email, link, workshop, showroom, area); claims must be true; the RC Verified and Inspected marks are KarBik's, never the dealer's.

## What changed (targeted, not a rebuild)

ACCIDENT: the checkbox "No accident history" saved `true`, which the car page reads as "Accident reported", and an unanswered box meant "No accident reported". It is now a required radio with no default (`CarChecksFields`): "No accident reported" saves false, "An accident was reported" saves true. The add wizard cannot continue without an answer. On the edit page it starts empty (existing cars cannot tell "no" from "never answered") and is sent only when the dealer answers.

SERVICE, INSURANCE, RC: service is a checkbox (unticked reads "Not provided" on the car page). Insurance is a month and a year (two selects, so it works in every browser) saved as "Valid till March 2026", the format `insuranceHasLapsed` reads (the old placeholder "March 2026" never matched it). The RC checkbox is gone (the server always ignored it); a line says KarBik checks the RC. The edit page now has these three fields too.

TEXT: `findContactDetails` (shared/validation.ts) refuses a phone number, email or link in title, variant and description on save (server and form, live message under the field), and in the business name. The display-time scrub stays as a second line. Hints say not to write workshop, showroom or area names (code cannot catch those). The AI description prompt now uses only the entered details, no condition claims, no superlatives, no dealer, workshop, area or contact details.

VERIFY RTO: off (`VEHICLE_LOOKUP_ENABLED`). The lookup behind it is a mock that invents a make, model, year, fuel, colour, insurance and owner for any plate; the form showed it under a green "RTO Verified" badge and "Auto-Fill Form" wrote it into the listing. The button and the panel are hidden and the route answers 503 until a real provider replaces the mock.

PHOTOS: a hint says the first photo is the cover on every card and must be a plain photo of the car; replacing photos on the edit page says it removes the current ones. The "+40% leads" claim is gone.

PROFILE: only what is used. About, street address and social links are no longer asked (the public page does not show them). The cover banner field appears only while `SHOW_DEALER_BANNER` is on and the rating only while `SHOW_DEALER_REVIEWS` is on. Business name: hint "just your showroom's name", a warning for a tagline after a dash, a block for contact details. Contact phone says it is for KarBik support and never shown to buyers. Hairline sections instead of cards.

NOT DONE (data, not code): existing descriptions that name areas (24 of 50 mention one), the three dealers' stored "About" text, names with taglines, banners, and the accident answer of the 50 existing cars (all stored false, never confirmed). These are the dealers' data to correct.

NOT BUILT: a full re-layout of the wizard (1,490 lines; the problems were logic and data), a photo-order control, automatic collage detection, a "not answered" state for accident in the database.

FINISH: 375 and 1440 in light and dark, accident gate and contact checks exercised against mocked APIs, `impeccable detect` clean, unit tests for the new checks.
