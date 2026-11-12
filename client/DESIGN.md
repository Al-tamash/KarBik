---
name: KarBik
description: Used cars from Hyderabad dealers; search and real cars first, KarBik support in between.
colors:
  highway-blue: "#1B6EF3"
  highway-blue-text: "#0F52BE"
  highway-blue-tint: "#EAF3FE"
  navy-anchor: "#0B2A5B"
  action-orange: "#C2410C"
  action-orange-deep: "#9A3412"
  rc-green: "#15803D"
  whatsapp-green: "#25D366"
  danger-rose: "#E11D48"
  cool-ground: "#F7F8FA"
  surface-white: "#FFFFFF"
  surface-inset: "#EFF1F4"
  hairline: "#DCDEE4"
  hairline-strong: "#B8BCC7"
  ink: "#1B212B"
  ink-strong: "#0E1218"
  ink-muted: "#5D6375"
  ink-subtle: "#666C7D"
  graphite: "#0E1218"
typography:
  display:
    fontFamily: "Archivo, Inter, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Archivo, Inter, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  price:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.375
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  badge: "6px"
  input: "8px"
  button: "10px"
  chip: "12px"
  card: "16px"
  pill: "9999px"
spacing:
  gutter: "16px"
  gutter-wide: "24px"
  rail-gap: "12px"
  grid-gap: "20px"
  card-inset: "16px"
  section: "40px"
  section-wide: "56px"
components:
  button-cta:
    backgroundColor: "{colors.action-orange}"
    textColor: "{colors.surface-white}"
    typography: "{typography.title}"
    rounded: "{rounded.chip}"
    padding: "14px 20px"
  button-cta-hover:
    backgroundColor: "{colors.action-orange-deep}"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp-green}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.chip}"
    padding: "12px 24px"
  button-brand:
    backgroundColor: "{colors.highway-blue}"
    textColor: "{colors.surface-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
  button-outline:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "10px 20px"
  chip:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    height: "44px"
    padding: "0 16px"
  chip-selected:
    backgroundColor: "{colors.highway-blue-tint}"
    textColor: "{colors.highway-blue-text}"
  segment-active:
    backgroundColor: "{colors.ink-strong}"
    textColor: "{colors.surface-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  card-listing:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-inset}"
  badge-rc-verified:
    backgroundColor: "{colors.rc-green}"
    textColor: "{colors.surface-white}"
    typography: "{typography.caption}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.input}"
    padding: "10px 16px"
    height: "44px"
---

# Design System: KarBik

## Overview

**Creative North Star: "The Honest Showroom Floor"**

KarBik is the category standard for an Indian used-car marketplace, executed at full craft: a working marketplace, not an editorial landing page. The page is a cool, near-white floor on which real car photos carry all the colour. Search sits first, real cars with big prices follow, and explanation comes last. The chrome is quiet so that a ₹11.40 Lakh price and a car photo are the loudest things in any viewport.

Colour is functional. Blue says "this is KarBik, and this is where you are"; one deep orange says "do this next"; green appears only when KarBik has actually checked a car's RC. Nothing else is decorated. Density is high but legible: cards are compact, prices are heavy and tabular, and every touch target on a phone is at least 44px.

Mobile is the main screen. On phones, browse sections become horizontal snap rails with a visible peek of the next item, so the first screen reaches a real car rather than a stack of explanations. From the small breakpoint up the same content settles into grids.

**Key Characteristics:**
- Cool near-white ground, white cards, hairline borders, soft card shadow.
- One brand blue for identity, links and selected chips; one deep orange for the single primary action per view.
- Archivo bold for headings, Inter for every UI and body string, heavy tabular numerals for prices.
- 16px card and media radius; pills for tabs and filters.
- Phone browse sections are snap rails with a peek; a rail that shows a subset ends in a "See all" tile.
- Every badge and claim is literally true for the car or dealer it sits on.

## Colors

A restrained cool-graphite neutral system with one identity blue, one action orange and one earned green; photos supply the rest.

### Primary
- **Highway Blue** (highway-blue): brand identity (wordmark "Bik", location pin, hero headline emphasis), the signed-out "Sign up" pill, compare toggles when on, the focus ring family. Small text in blue always steps one shade deeper to **Highway Blue Text** (highway-blue-text) so it clears 4.5:1; a global override remaps blue-600 text to it. Selected chips sit on **Blue Tint** (highway-blue-tint) with a blue-600 border.
- **Navy Anchor** (navy-anchor): the dark end of the blue scale; reserved for anchoring blue-on-blue contexts and selection text.

### Secondary
- **Action Orange** (action-orange): the fill of the single primary action in a view ("Show all cars", "Show SUV cars"), white text at 5.2:1. Hover and active go to **Action Orange Deep** (action-orange-deep). Also used as a small icon tint on the paid "Featured" photo badge. The vivid orange-500 exists in the scale but only carries dark text when used as a fill.

### Tertiary
- **RC Green** (rc-green): the "RC Verified" photo badge and its trust-strip icon, nothing else in buyer-facing chrome.
- **WhatsApp Green** (whatsapp-green): only on WhatsApp buttons, always with dark ink text (9.4:1), because white on it fails.
- **Danger Rose** (danger-rose): saved-to-wishlist heart, errors, destructive actions.

### Neutral
- **Cool Ground** (cool-ground): page background.
- **Surface White** (surface-white): cards, inputs, header, alternating full-bleed sections.
- **Surface Inset** (surface-inset): image placeholders, inset fields, hover wash on ghost controls.
- **Hairline** (hairline) / **Hairline Strong** (hairline-strong): card and section borders; strong for chip and input outlines and card hover.
- **Ink Strong** (ink-strong): headings, prices, active segment fill. **Ink** (ink): body text. **Ink Muted** (ink-muted): secondary text, chevrons. **Ink Subtle** (ink-subtle): placeholders and captions (5.2:1 on white).
- **Graphite** (graphite): the dealer band and the footer, the two dark blocks on a light page.

Dark mode is class-based and maps the same semantic roles onto the graphite family (ground #0E1218, surface #141922, inset #1B212B, hairline #272E3A); pale tints become translucent colour-mix washes and coloured text lifts one shade lighter. Pages reference the semantic roles, never raw neutrals, so both modes hold.

### Named Rules
**The One Orange Rule.** Each view has exactly one orange-filled action. Everything else is blue text, an outline, WhatsApp green, or ink. If a second orange button appears, one of them is wrong.

**The Earned Green Rule.** Success green marks only a true RC check (and success states in forms). It is never decoration, never a generic "trust" tint, and never shown on a car KarBik has not checked.

**The Blue Is Where-You-Are Rule.** Blue carries identity, links ("View all cars", "View car") and selected chips. Segmented tabs and the listing filter pills select with an ink-strong fill instead, so blue never competes with the orange action inside the search card.

## Typography

**Display Font:** Archivo (self-hosted via next/font, falling back to Inter, system-ui)
**Body Font:** Inter (self-hosted, with system-ui)

**Character:** Archivo is a bold, tightly tracked automotive grotesque used only for page and section headings; Inter does every working job, from chips to prices, with tabular figures wherever a number is compared.

### Hierarchy
- **Display** (Archivo 700, 2rem phone / 3rem sm / 3.5rem lg, line-height 1.05, tight tracking, balanced wrap): the homepage H1 only.
- **Headline** (Archivo 700, 1.5rem phone / 1.875rem md, tight tracking): section headings ("Cars for sale in Hyderabad", "Browse by budget").
- **Price** (Inter 800, 1.25rem phone / 1.5rem sm, tight tracking, tabular): the listing price, always in Lakh/Cr ("₹11.40 Lakh"), the heaviest text on a card.
- **Title** (Inter 700, 1rem, 1.375): card titles (year, brand, model on one clamped line), tile labels; step titles at 1.125rem.
- **Body** (Inter 400, 1rem, 1.6): paragraphs and FAQ answers, capped at 65ch.
- **Label** (Inter 600, 0.875rem): chips, tabs, nav links, spec line ("33k km · Petrol · Automatic").
- **Caption** (Inter 400, 0.75rem): EMI estimate, badges, helper text.

### Named Rules
**The Archivo Is For Headings Rule.** Archivo appears on headings and the header wordmark only. Body copy, buttons, chips and prices are Inter.

**The Tabular Money Rule.** Every price, EMI, km figure, phone number and budget band is set with tabular numerals.

## Layout

A single 1280px (max-w-7xl) column with a 16px gutter on phones and 24px from sm. Sections alternate between the cool ground and full-bleed white bands separated by hairline top borders; vertical rhythm is 40px per section on phones and 56px from md, with the "How buying works" band at 48/64px.

The hero is a two-column grid from lg (about 1.05fr text and search to 1fr real car photo, 48px gap); on phones the photo is dropped and the search card is the hero so the listing rail follows immediately. The trust strip sits under the hero from sm and moves below the listing rail on phones.

On phones every browse section is a horizontal snap rail: it bleeds to the screen edge (negative gutter margin, matching inner padding and scroll padding), hides the scrollbar, snaps to item starts with a 12px gap, and sizes items so the next one peeks (listing cards 80% wide, body-type tiles 44%, brand tiles a two-row rail at 30%). From sm the same items become grids with a 20px gap: listings 2, 3 then 4 columns; body types 4; budgets 2 then 4; brands 5 then 8. Quick filters and the category strip are single-line horizontal scrollers at every width.

Touch targets are 44px minimum on coarse pointers and below 768px for buttons, inputs and chips.

### Named Rules
**The Peek Rule.** A phone rail always shows part of the next item; a rail whose items fit exactly reads as the end of the page.

**The Way-Out Rule.** A rail that shows a subset of a larger set (the listing rail) ends in a "See all" tile: dashed strong hairline, blue-tint chevron disc, label naming the active filter. Rails that already show the complete set (body types, in-stock brands) do not need one.

**The No Repeat Rule.** No car appears twice on a page. The hero car is removed from the listing rail, and category tiles pick a photo not already in the rail when one exists.

**The Live Stock Rule.** Budget bands, brand tiles and body-type tiles come from or are checked against live inventory, so no shortcut opens an empty results page.

## Elevation & Depth

A hybrid: hairline borders define every container, and a soft, low-contrast shadow lifts cards a little off the cool ground. Depth responds to intent on listing cards only. Floating chrome (the hero price tag, the search modal) uses the larger ambient shadows.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 2px 8px rgb(0 0 0 / 0.06), 0 0 1px rgb(0 0 0 / 0.1)`): listing cards, the hero search card, the hero photo.
- **Card hover** (`box-shadow: 0 8px 24px rgb(0 0 0 / 0.10), 0 0 1px rgb(0 0 0 / 0.1)`): listing cards on hover, with the border stepping to hairline-strong.
- **Small** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)`): photo badges, icon toggles over photos, filled buttons.
- **Floating** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)`): the price tag over the hero photo; extra-large for modals.

### Named Rules
**The Lift Is For Listings Rule.** Only listing cards gain a shadow on hover. Category, budget and brand tiles respond with a blue-400 border and blue-700 label; dashboards and forms never lift.

## Shapes

Softly rounded, never bubbly. Cards, media, hero search card, tiles and the dealer band share one 16px radius; chips and the orange CTA use 12px; inputs 8px; standard buttons 10px; photo overlay badges 6px. Tabs, filter pills, avatars, step numbers and the header search field are full pills. Radii of 24px and up are not used. Photos are clipped to their card's top corners at 4:3 (5:4 for the hero photo) and scale by 2 to 4 percent on hover inside the clip.

## Components

### Buttons
Confident, flat fills with no gradients.
- **Shape:** 12px on hero-scale actions, 10px on standard sizes; full pill for the header "Sign up".
- **Primary action:** Action Orange fill, white bold text, full width in the search card, 14px vertical padding, label naming the result ("Show SUV cars"). Hover to Action Orange Deep.
- **WhatsApp:** WhatsApp Green with dark ink text and the message icon, the support-contact action wherever support is offered.
- **Brand:** Highway Blue pill with white text for account entry; hover blue-700.
- **Outline / Ghost:** white with strong hairline, or text-only with an inset wash on hover.
- **On graphite:** white fill with graphite text, plus a neutral-600 outline secondary.
- **Focus:** 2px blue-500 outline at 2px offset, everywhere.

### Chips
- **Choice chips** (search card): 44px tall, 12px radius, strong hairline on white, Label type. Selected: blue-600 border, Blue Tint fill, Highway Blue Text. Hover: blue-400 border.
- **Segmented tabs and filter pills:** full pill. Active fills Ink Strong with white text; inactive is muted text (tabs) or a white pill with strong hairline (filters).

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Surface White on Cool Ground.
- **Shadow Strategy:** Card rest, Card hover on listing cards only (see Elevation).
- **Border:** 1px hairline, hairline-strong on hover.
- **Internal Padding:** 16px; search card 16px phone, 20px from sm.

### Listing Card (signature)
The unit a buyer scans in a second: 4:3 photo, one-line title (year brand model), optional variant in muted text, one spec line built only from filled fields, then the price pinned to the bottom with "Est. EMI ₹X/mo" beneath and its assumptions in a tooltip. Over the photo: top-left a white "Featured" (paid boost) or "Sample listing" tag; top-right round compare and save toggles (36px, white at 95%); bottom-left the RC Green "RC Verified" badge only when true; bottom-right a translucent graphite photo count. The dealer is not named on the card. No placeholder photos: a missing image shows a car outline and "Photos coming soon".

### Inputs / Fields
- **Style:** white, strong hairline, 8px radius (the header search is a pill on Surface Inset), Ink Strong text, Ink Subtle placeholder.
- **Focus:** border to blue-500 with a 2px blue-100 ring; the header field also turns white.
- **Error / Disabled:** rose-500 border and rose-100 ring; disabled sits on Surface Inset with subtle text.

### Navigation
A sticky 64px white header with a hairline bottom: Archivo wordmark with a blue "Bik", a pill "Hyderabad" location chip, a wide pill search field from lg, semibold nav links in ink that turn blue-700 on hover, and the blue "Sign up" pill. Phones collapse to search and menu icons in 44px targets, with a drop-down panel of 12px-radius rows. Under the header, a white category strip of single-line quick links (muted semibold text, blue on hover) scrolls horizontally.

### Trust Strip
Three plain statements between hairlines, each led by a 16px icon: RC Green shield for "RC Verified", blue badge for "Verified dealer", blue message icon with the support number as a tabular blue link. It explains what the badges mean; it never adds claims.

### Graphite Bands
The dealer pitch and the footer are the only dark blocks on a light page: Graphite fill, white Archivo heading, neutral-300 body, white and outline buttons. In dark mode the dealer band gains a neutral-700 ring so it still separates from the ground.

## Do's and Don'ts

### Do:
- **Do** give each view exactly one Action Orange fill, and name what it returns ("Show Under ₹10 L cars").
- **Do** use Highway Blue for identity, links and selected chips, and step blue text to blue-700 for contrast.
- **Do** reserve RC Green for cars KarBik has actually checked, and say exactly what each badge means.
- **Do** set headings in Archivo bold with tight tracking and everything else in Inter; set every number tabular.
- **Do** use a 16px radius and 1px hairline on every card, tile and media frame.
- **Do** turn phone browse sections into edge-bleeding snap rails with a peek, and end a subset rail in a "See all" tile.
- **Do** source budget bands, brand tiles and category photos from live stock, and keep every car to one appearance per page.
- **Do** label estimates as estimates ("Est. EMI") and put the assumptions where the reader can check them.
- **Do** put WhatsApp Green buttons in dark ink text, and keep touch targets at 44px or more on phones.

### Don't:
- **Don't** place a second orange-filled button in a view, or use vivid orange-500 with white text.
- **Don't** show green, "Verified" or "Featured" on a car or dealer where it is not literally true.
- **Don't** print superlatives, totals of listings or dealers, invented stats, testimonials or office hours.
- **Don't** show the same car in two sections, or a shortcut that opens an empty results page.
- **Don't** reference raw neutral utilities for surfaces, borders or text in pages; use the semantic roles so dark mode holds.
- **Don't** use radii of 24px or more, arbitrary radius values, or extra-large shadows on cards.
- **Don't** lift non-listing tiles, forms or dashboards on hover.
- **Don't** use generated or stock location photography; photos are real listings.
