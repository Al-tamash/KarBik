---
name: High-Performance Luxury Digital Design System
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f4'
  surface-container-highest: '#e4e1ee'
  on-surface: '#1b1b24'
  on-surface-variant: '#464555'
  inverse-surface: '#302f39'
  inverse-on-surface: '#f3effc'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#fcf8ff'
  on-background: '#1b1b24'
  surface-variant: '#e4e1ee'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  section-gap-lg: 120px
  section-gap-sm: 64px
---

## Brand & Style

This design system embodies the intersection of Hyderabadi heritage and global automotive excellence. It is designed to feel like a high-performance engine: precise, powerful, and impeccably polished. The aesthetic is rooted in **Premium Glassmorphism** and **Modern Corporate** styles, drawing inspiration from industry leaders like Tesla and Stripe.

The personality is authoritative yet welcoming. It leverages "cinematic" dark mode sections for hero experiences—evoking the feeling of a luxury showroom at night—transitioning into clean, airy light mode areas for detailed browsing and transactions. The emotional goal is to instill absolute confidence and "tech-forward" luxury in the user.

## Colors

The palette is anchored by **Indigo (#4F46E5)**, representing stability and high-end technology. **Accent Orange (#F97316)** is used sparingly for high-priority Calls to Action (CTAs), cutting through the cool tones to drive conversion. 

For the "Cinematic" experience:
- **Hero Sections:** Use a deep Zinc-950 background with subtle Indigo radial gradients to create depth.
- **Content Areas:** Transition to a clean White/Zinc-50 background to ensure maximum readability for technical specifications.
- **Semantic Colors:** Emerald (#10B981) is reserved strictly for success states, such as "Verified Seller" badges or successful booking confirmations.

## Typography

The typography system uses **Hanken Grotesk** for headlines to provide a sharp, contemporary, and technical feel. It is paired with **Inter** for body copy and UI labels, ensuring world-class legibility across dense data sets (car specs, pricing, mileage).

- **Display Styles:** Reserved for hero headers and price points. Use tight letter spacing for a "premium-machined" look.
- **Labels:** Use `label-caps` for car categories and status indicators to create a distinct visual hierarchy against body text.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The spacing rhythm is based on an **8px linear scale**, favoring generous "breathable" margins to reflect a premium, uncluttered brand.

- **Floating Panels:** Content containers should frequently utilize `inner-padding: 32px` to emphasize the glassmorphic "floating" effect.
- **Vertical Rhythm:** Sections are separated by large gaps (120px on desktop) to allow the high-fidelity automotive photography to take center stage.

## Elevation & Depth

This system moves away from traditional heavy shadows in favor of **Glassmorphism and Tonal Layers**.

1.  **Backdrop Blurs:** Floating elements (Nav bars, Search widgets) use a `20px to 40px` backdrop-blur with a semi-transparent surface.
2.  **Glass Strokes:** Every elevated container must have a subtle `1px` inner-border (stroke). In light mode, this is a white stroke at 40% opacity; in dark mode, it is a Zinc-700 stroke at 50% opacity.
3.  **Shadows:** Use only one type of shadow—an "Ambient Glow"—which is a very large, ultra-soft Indigo-tinted shadow with 5% opacity, used to lift primary cards off the background.

## Shapes

The shape language is **Rounded (Level 2)**. 
- **Base UI (Buttons/Inputs):** 0.5rem (8px) radius.
- **Cards & Floating Panels:** 1rem (16px) radius.
- **Feature Hero Elements:** 1.5rem (24px) radius.

This moderate roundedness balances the "friendliness" of a marketplace with the "structural integrity" of automotive engineering. Avoid sharp 0px corners to maintain the sophisticated, modern feel.

## Components

### Buttons
- **Primary:** Solid Indigo with a subtle top-down gradient. High-gloss finish.
- **CTA:** Accent Orange, reserved for "Book Test Drive" or "Buy Now."
- **Ghost:** Glass-style with a 1px border for secondary actions like "View Specs."

### Glass Navigation
- A sticky header with a `blur(24px)` effect. It should be transparent at the top of the page and transition to a slightly tinted Zinc-900 (Dark) or White (Light) as the user scrolls.

### Automotive Cards
- Feature high-aspect-ratio imagery (16:9). 
- Use "Floating Labels" for fuel type, transmission, and year. 
- Prices are always displayed in the `headline-md` style for prominence.

### Advanced Search Widget
- A "floating" horizontal bar that sits at the bottom of the Hero section. 
- Uses glassmorphic layers to separate inputs (Make, Model, Budget). 
- Features smooth micro-interactions: inputs expand slightly on focus.

### High-Fidelity Widgets
- **Spec Grid:** A 2x2 or 4x2 grid of icons and text using the Zinc-100 background and Indigo icons to represent technical data (Horsepower, 0-60mph, Battery Range).