---
name: CivicSathi AI
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#434654'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#8f4e00'
  on-secondary: '#ffffff'
  secondary-container: '#fe9832'
  on-secondary-container: '#683700'
  tertiary: '#034f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#056a00'
  on-tertiary-container: '#7eeb67'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#ffb77a'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6d3a00'
  tertiary-fixed: '#8dfc75'
  tertiary-fixed-dim: '#72de5c'
  on-tertiary-fixed: '#012200'
  on-tertiary-fixed-variant: '#035300'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is engineered to bridge the gap between complex bureaucratic procedures and modern digital simplicity. It targets Indian citizens and residents who require a reliable, high-trust interface for government interactions. The aesthetic is "Administrative Elegance"—a blend of Apple-inspired minimalism with the dignified presence of national identity.

The visual direction leverages **Modern Corporate** and **Glassmorphism** styles. It prioritizes clarity, vast whitespace, and a sophisticated layering system. The emotional response should be one of "effortless authority": the user feels the platform is as powerful as a government institution but as intuitive as a premium consumer app. Subtle glass effects on navigation and overlays provide a sense of technical sophistication and transparency.

## Colors

This design system utilizes a palette that signals both innovation and national heritage.

- **Primary (Royal Blue):** Used for primary actions, active states, and brand-heavy components. It represents trust and stability.
- **Accents (Saffron & Green):** These are used sparingly as "cultural anchors." Saffron is reserved for high-importance alerts or secondary calls-to-action, while Green is utilized for success states and progress indicators.
- **Surface & Background:** The interface relies on a "Pure White" surface strategy against a "Soft Gray" base background to create a clear sense of depth and separation without heavy borders.

## Typography

The design system employs **Inter** for its systematic, utilitarian, and highly legible characteristics. The type hierarchy is tight and disciplined.

- **Headlines:** Use tighter letter-spacing and heavier weights to command attention.
- **Body:** Set with generous line height to ensure readability of complex legal or governmental information.
- **Labels:** Use medium or semibold weights to differentiate from body text, especially in data-heavy views.
- **Optimization:** For mobile, larger display headings are scaled down by approximately 25% to maintain visual balance on smaller viewports.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid Grid**. 
- **Desktop:** A 12-column grid with a max-width of 1280px. Gutters are fixed at 24px, while margins expand to center the content.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.

Spacing follows an 8px rhythmic scale. Components should prioritize "Airy" layouts—using `lg` (48px) and `xl` (80px) vertical spacing between major sections to reduce the cognitive load often associated with government services.

## Elevation & Depth

Visual hierarchy is established through **Ambient Shadows** and **Glassmorphism**.

- **Level 1 (Base):** Flat surfaces with a 1px border in a slightly darker gray (#E5E7EB) to define form.
- **Level 2 (Cards):** Soft, diffused shadows (Y: 4px, Blur: 20px, Spread: 0, Opacity: 5% Black) to lift content.
- **Level 3 (Modals/Dropdowns):** Pronounced shadows with a backdrop blur effect (12px to 20px blur) to create a "Frosted Glass" look that maintains context of the layer below.
- **Tonal Layers:** High-priority AI-driven insights should use a very subtle Royal Blue tint in the background to differentiate from standard content.

## Shapes

The shape language is friendly yet professional. 
- **Standard Components:** Buttons and input fields use a `0.5rem` radius.
- **Containers:** Content cards and sections use `rounded-lg` (1rem) to create a soft, modern container feel.
- **Feature Blocks:** Large promotional or AI summary blocks use `rounded-xl` (1.5rem) to signify a premium "enclosed" experience.
- **Icons:** Should follow a rounded-corner style to match the UI components.

## Components

- **Buttons:** Primary buttons are solid Royal Blue with white text. Secondary buttons use a subtle gray ghost style. Buttons should have a slight scale-down animation (0.98x) on click to feel tactile.
- **Input Fields:** Large, 48px height minimum. Borders are light gray, turning Royal Blue on focus. Labels should stay visible (floating label or top-aligned).
- **Cards:** Always white or glass-textured. No heavy borders; use shadows for definition. Include a 24px internal padding as standard.
- **Chips:** Used for "Status" (e.g., Pending, Approved). Green for success, Saffron for pending/warning.
- **AI Summary Component:** A unique component featuring a subtle gradient border using Primary and Accent colors, with a glassmorphic background to highlight AI-generated government advice.
- **Progress Steppers:** Horizontal for desktop, vertical for mobile. Use the Royal Blue for the active path to guide users through multi-step applications.