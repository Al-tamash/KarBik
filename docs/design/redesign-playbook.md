# Redesign playbook

How KarBik pages get redesigned. The homepage (`client/app/page.tsx`) was the
first page done this way (Nov 2026); every later page follows the same process
so the site reads as one platform.

## Sources of truth (read before touching UI)

| File | What it holds |
|---|---|
| `client/PRODUCT.md` | Users, positioning, truth rules (no invented claims, counts, testimonials; dealer phone never shown; no office hours) |
| `client/DESIGN.md` + `client/.impeccable/design.json` | The visual system: tokens, type ramp, radii, components, named rules (One Orange, Earned Green, Peek, Way-Out, No Repeat, Live Stock…) |
| `client/app/globals.css` | The tokens and component classes the code actually uses (`.btn-cta`, `.btn-whatsapp`, semantic `bg/surface/ink/border`) |
| `client/.impeccable/surfaces/<page>.md` | Per-page direction contract (the homepage's is `app-page-tsx.md`) |
| `docs/adr/0004…`, `docs/adr/0005…` | Why the hand-rolled design system and the dark-mode token layer |

The chosen direction is the **category standard**: White ground, one brand blue,
orange only for the single primary action, search and real cars first, dense
listing cards. The quality bar is **Cars24 + Spinny + CarDekho**. A new page
extends this world; it does not start a new one.

## Steps

1. **Load the impeccable skill** and run its setup (`impeccable context --target <page file>`).
   It reads PRODUCT.md, DESIGN.md and the page's surface brief. Done when the
   skill has loaded context and named the page's mode (Persuade / Operate / Read).
2. **Benchmark the competitors in the browser** (built-in browser pane, phone
   viewport 375×812 first, then desktop). Open the matching page on each:
   - Cars24: `https://www.cars24.com/` and `/buy-used-cars-hyderabad/`
   - Spinny: `https://www.spinny.com/`
   - CarDekho: `https://www.cardekho.com/usedCars` and `/used-cars+in+hyderabad`
   List each site's section headings with
   `[...document.querySelectorAll('h1,h2,h3')].map(h=>h.tagName+': '+h.textContent.trim())`,
   and measure rails and cards (card width, `overflow-x`, what text a card
   carries). Done when you can state, per site, the section order and how the
   page behaves on a phone.
3. **Check the live data before designing any filter, chip, tile or count.**
   Query the dev API (`/api/cars?<filter>&limit=1` → `total`, `/api/cars/brands`).
   Every link must open a non-empty result. Done when every filter value the
   design uses has a count above zero.
4. **Direction.** For a page that only extends the existing world, write or
   update its surface brief (`impeccable surface-brief write <page>`) and build.
   For a genuinely new visual question, use impeccable's decision page (sketches →
   the owner picks). The owner reads Hinglish and wants sketches before a
   visual change of identity (colour, font).
5. **Read `craft-floor.md`** from the impeccable skill immediately before editing, then build.
6. **Verify at 375 and 1440, light and dark,** with full-page captures (see
   *Verification* below). Done when there is no horizontal page overflow and no
   broken image, and every section is seen in both themes.
7. **Finish:** run `impeccable detect --json` on the changed files, then the
   `impeccable-finish-reviewer` agent with: the request, the files, the captures,
   the surface brief and the craft floor. Apply its material fixes and recapture
   until it says ship. If the system changed, rerun `impeccable-documenter` to
   update DESIGN.md.
8. **Update this playbook's *Page log*** with what the page now does and what is still open.

## Patterns proven on the homepage

- **Phones scroll sideways.** Browse sections become snap rails with a peek
  (listing cards 80% wide, category tiles 44%, brands a two-row rail). A rail
  that shows part of a larger set ends in a "See all" tile. From `sm` up they
  become grids. The reference implementation is `client/components/FeaturedCars.tsx`.
- **Listing card = what a buyer scans in a second:** photo, title, km · fuel ·
  gearbox, price in lakh ("₹7.80 Lakh"), "Est. EMI" with its assumptions in a
  tooltip. No dealer name on the card or the car detail page: both say
  "Verified dealer · Hyderabad", and KarBik support names the dealer after the
  lead (decided Nov 2026, see PRODUCT.md). (`client/components/CarCard.tsx`)
- **Badges only when true:** "RC Verified" only when `rcVerified`; "Featured" only when boosted.
- **No car appears twice on one page.** The hero car is removed from the rail.
- **Sections that add browsing without repeating cars:** body type (real stock
  photos), budget bands from live stock, brands from `/api/cars/brands`, an FAQ
  whose answers restate the real lead flow.
- **Phone first screen reaches a car.** Explanatory strips go below the first rail on phones.

## Verification

The browser pane is fine for clicking and for `javascript_tool` measurements. It has limits:
- A screenshot taken after a programmatic `scrollTo` comes back stale. Use the `computer` scroll action instead.
- At desktop sizes the pane crops the page.

For full-page captures, use `playwright-core` against the installed Playwright
headless shell. The script is in [capture-script.md](capture-script.md).
Gotchas found the hard way:

- **Port:** run the dev server through `.claude/launch.json` (`karbik-dev`, port 3001, `NEXT_PUBLIC_APP_URL=http://localhost:3001`). Server fetches use `API_BASE`, which must match the port, or the homepage renders its fallbacks.
- **Waiting for the page:** `waitUntil: "networkidle"` never settles on the dev server (the HMR socket stays open). Use `"load"`, then wait for images.
- **Edge `--headless --screenshot` crashes** ("Abnormal renderer termination"). Use playwright-core.
- **Images through `/_next/image`:**
  - The dev optimizer stalled on the JPG/AVIF brand logos, so the small local logos are `unoptimized`.
  - Non-Cloudinary hosts (`stimg.cardekho.com`) refuse the optimizer, so they also need `unoptimized`.
- **Dev indicator:** hide it in captures with `nextjs-portal{display:none}`. Avoid `next build` while the dev server runs, because it rewrites `.next`.

## Page log

| Page | State | Open items |
|---|---|---|
| Home `app/page.tsx` | Redesigned, finish-reviewed, documented (Nov 2026) | Hyderabad area shortcuts and a "Featured" (boosted) rail were left unused by the reviewer's ceiling note |
| Wishlist `app/wishlist` | Built in a separate session (Nov 2026) | Check it against DESIGN.md when next redesigning |
| Listing `app/cars` | Redesigned (Nov 2026) | Split to Server Component (SSR) + CarsCatalogClient, live stock faceted filters, sticky quick pills, mobile drawer with live count, 0 anti-patterns |
| Car detail `app/cars/[id]` | Redesigned (Nov 2026), brief `.impeccable/surfaces/app-cars-id-page-tsx.md` | Phone: photo, summary, sticky anchor tabs, sticky bottom bar (price, call back, orange WhatsApp), bottom nav hidden. Desktop: sticky right panel. Sections: Overview, Checks on this car, Features, EMI estimate, How KarBik connects you, Similar cars, FAQ. One EMI formula in `lib/emi.ts`. Registration number and `searchVector` no longer in public car JSON (`lib/public-car.ts`); the page strips dealer name and slug before props reach the client (`lib/buyer-car.ts`). **Dealer reviews are switched off** (`SHOW_DEALER_REVIEWS` in `lib/flags.ts`; while off, reviews are not fetched or serialised and the dealer user id is blanked) until the owner confirms the DB reviews are real. Descriptions are scrubbed of phone numbers, emails and links (`scrubDescription`); a named workshop in a description is a data edit. Open: public car and dealer-profile APIs still return the dealer's business name, slug and address; insurance dates on many cars are already past |
| Compare, dealer storefront, pricing, how-it-works, about, contact, faq, auth, dashboard | Not redesigned | See Roadmap |

## Roadmap (agreed Nov 2026)

Buyer funnel first, dealer side after. Order:

1. **Car detail** (with the navbar/footer drift fix), full loop.
2. **Compare**, full loop. Sticky first column on phones, "Show only differences" toggle, per-car "Ask KarBik" CTA, empty state with real cars, no "Best/Winner" badges.
3. **Login/register**, full loop. One shared auth component: full page on `/login` and `/register`, bottom sheet inside the lead flow.
4. **Dealer storefront.** Drop street address, "visit our showroom" and "Premium/certified" copy. Contact is "Ask KarBik support".
5. **Contact, FAQ, how-it-works, about**, light loop (one benchmark, captures, detect, finish review at the end), on one shared page template.
6. **Pricing, dashboard, billing, admin** (dealer side), last.

Rules that apply to every page in the roadmap:
- **Section audit.** Each surface brief starts with what is there, what is missing, whether the section flow is right, and what to drop. Add a section directly when it rests on real data or an existing flow. A section that needs new backend, or a new claim (testimonials, stats, ratings, warranty, delivery), goes to a "proposed, not built" list for the owner.
- **Platform review per page.** While on a page, also check navigation, tokens, loading/empty/error states, accessibility (44px targets, contrast, focus), SEO and share cards, and dark mode. Fix cross-cutting drift when you meet it.
- **Competitor research before section flow** on a buyer page. Show the owner a keep / improve / drop / add table and build after approval.
- **Cards only for repeating items** (see DESIGN.md, The Cards Are For Repeating Things Rule).
- **Lead gate stays** (login + phone verification before WhatsApp or call-back), redesigned as a minimal bottom sheet with no backend change.
- **Car detail on phones:** hide the bottom nav, show a sticky bar with price, Est. EMI, WhatsApp (the one orange) and Call back. Keep the EMI calculator as an estimate only, same formula as the card, no bank logos or approval claims.
- **Checks on this car** replaces "KarBik Assured": only recorded RC, accident and service data, "Not provided" where missing.
- Photos stay hotlinked for now. Every photo needs a failure fallback.

Known drift, recorded by the documenter. Fix each item when its page is redesigned
(navbar search label, footer wordmark and footer text classes were fixed with the car detail page):
- **Mobile bottom nav:** its "Account" tab opens `/dashboard`, which is the dealer dashboard; check what a buyer sees there.
- **Logo:** still the generic car icon; PRODUCT.md says it is open to redesign.
- **Car photos:** hotlinked from CarDekho (owner's decision for now).
