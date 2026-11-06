# Refine the hand-rolled design system; no UI framework

A UI audit before the 2026 redesign found ~92% token compliance across 20 pages (~1,959 token usages vs ~160 raw-palette leaks concentrated in 8 files: CarDetailView, ContactCard, AnalyticsTab, dealer/[slug], billing, edit/[id], homepage hero, CarCard). We decided to refine the existing globals.css system in place — migrate leaks to tokens, complete partial colour scales, lock radius/shadow rules — rather than adopt shadcn/ui or any component library, which would have forced a rewrite of all 20 pages for no user-visible gain.

## Considered Options

- **shadcn/ui + Radix** — rejected: large churn, duplicate primitives, and the existing CSS-class system was already consistently adopted.
- **CSS-in-JS / styled-components** — rejected: conflicts with Tailwind v4 CSS-first tokens already in use.
