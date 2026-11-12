---
version: 1
slug: "app-cars-page-tsx"
primary_target: "app/cars/page.tsx"
related_targets:
  - "components/cars/CarsCatalogView.tsx"
  - "components/cars/CarsSidebarFilter.tsx"
  - "components/cars/CarsMobileFilterDrawer.tsx"
  - "components/CarCard.tsx"
---

# Browse Cars (app/cars/page.tsx)

Mode: Operate. Audience: Hyderabad used-car buyers filtering inventory; secondary: dealers. Job: quickly narrow down and discover cars by budget, body type, brand, transmission, fuel, and inspect trust indicators before reaching support. Proof on hand: ~50 real listings, RC checks, verified dealers. Constraints: no dead-end filters (e.g. Under ₹3L when min price is ₹5.4L), no glassmorphic blur layers, no fake promotional interruptions inside listing maps.

## Direction contract

THESIS: KarBik's search page is an efficient, category-standard used car search engine. It operates with high information density, instant feedback, and zero decorative fluff.

OWN-WORLD: White surfaces (`#FFFFFF`) on cool `#F7F8FA` ground, hairline borders (`#DCDEE4`), brand blue (`#1B6EF3`) for active filter states and interactive elements, deep orange (`#C2410C`) for primary CTAs, and verified green (`#15803D`) for RC verification. Archivo headings, Inter body and tabular numerals for pricing.

FIRST VIEWPORT: Breadcrumbs ("Home > Used Cars in Hyderabad"), page title with true total count ("Used cars in Hyderabad (50 cars)"), horizontal quick-filter pills (SUV, Sedan, Automatic, Under ₹10L, Petrol, Diesel) on both mobile and desktop. Below: 280px left sidebar filter on desktop, 3-column car grid. On mobile: compact vertical list/grid with bottom sticky bar trigger for Sort and Filters.

FINISH: Zero anti-patterns, full keyboard and screen-reader accessibility, seamless URL searchParams synchronization, SSR initial paint without skeleton flashing.

