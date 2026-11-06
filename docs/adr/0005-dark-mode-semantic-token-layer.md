# Dark mode via semantic token layer, shipped with the redesign

AutoBazaar v1 shipped light-only with pages hardcoding neutral backgrounds. During the 2026 redesign we decided dark mode is in scope, implemented as a semantic token layer (`surface`, `bg`, `border`, `ink`…) mapped onto the existing palette, with Tailwind v4's `@custom-variant dark`, a tri-state Light/Dark/System toggle (system default, localStorage persistence, anti-flash inline script), and a deep indigo-tinted charcoal dark palette derived from `neutral-850/900`. Retrofitting dark mode after all pages were redesigned would mean touching every component twice; shipping it with the redesign means each page is styled exactly once against semantic tokens.

## Consequences

- Every redesigned page must use semantic tokens, never raw `neutral-*`/`primary-*` utilities for surfaces and text, or it silently breaks in dark mode.
- The light theme remains the source of truth for brand accents; dark mode adjusts surfaces/borders/ink only.
