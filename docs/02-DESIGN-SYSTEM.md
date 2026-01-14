# Design System & Visual Identity

## Research Summary

Based on analysis of successful wedding planning applications, we've identified best practices:

- **Color Scheme:** Romantic yet professional - dusty rose, sage green, champagne tones
- **Typography:** Clean sans-serif for body (Inter), elegant serif for headers (Playfair Display)  
- **Layout:** Card-based design, ample whitespace, visual hierarchy
- **Mobile:** Touch-friendly (44px+ touch targets), readable fonts (16px minimum)

## Color Palette

### Primary Colors

```css
--brand-primary:      #D4A5A5;  /* Dusty Rose */
--brand-secondary:    #A8B8A6;  /* Sage Green */
--accent-gold:        #C9A961;  /* Accent Gold */
```

**Rationale:** Dusty rose conveys elegance and romance (common in luxury wedding apps). Sage green provides natural, calming balance. Gold adds sophistication.

### Neutral Colors

```css
--background-light:   #FAFAFA;
--background-white:   #FFFFFF;
--surface:            #F5F5F5;
--border-light:       #E8E8E8;
```

### Text Colors

```css
--text-primary:       #2C2C2C;
--text-secondary:     #6B6B6B;
--text-disabled:      #A0A0A0;
--text-inverse:       #FFFFFF;
```

### Semantic Colors

```css
--success:            #4CAF50;
--warning:            #FF9800;
--error:              #F44336;
--info:               #2196F3;
```

### Event Type Colors (Visual Differentiation)

```css
--event-1:            #E8B4B8;
--event-2:            #F5E6D3;
--event-3:            #C9D4C5;
--event-4:            #E5D4EF;
--event-5:            #FFE5CC;
--event-6:            #D4E5F7;
--event-7:            #F7D4E5;
```

**Usage:** Apply to event cards, timeline views, attendance matrices to quickly distinguish events.

## Typography

### Font Stack

Based on research, these fonts provide optimal readability and professional appearance:

```css
--font-primary: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Playfair Display', Georgia, serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

**Rationale:**
- **Inter:** Clean, highly readable, professional. Popular in modern SaaS apps.
- **Playfair Display:** Elegant serif for headings. Adds sophistication without being overly ornate.
- **JetBrains Mono:** For code/technical displays if needed.

### Font Sizes & Weights

```css
/* Display */
--text-display-lg:    48px / 700;    /* Hero sections */
--text-display-md:    36px / 700;    /* Page titles */

/* Headings */
--text-h1:            32px / 600;    /* Section titles */
--text-h2:            24px / 600;    /* Subsections */
--text-h3:            20px / 600;    /* Card titles */

/* Body */
--text-body-lg:       18px / 400;    /* Important content */
--text-body:          16px / 400;    /* Standard text - MINIMUM for accessibility */
--text-body-sm:       14px / 400;    /* Secondary text */
--text-caption:       12px / 400;    /* Labels, helpers */

/* Interactive */
--text-button:        16px / 500;    /* Buttons, CTAs */
```

**Note:** 16px is the minimum body text size per accessibility guidelines (Apple HIG, Material Design).

### Line Height

```css
--line-height-heading:  1.2;
--line-height-body:     1.6;
--line-height-compact:  1.4;
```

**Rationale:** 1.6 for body text improves readability. 1.2 for headings prevents excessive space.

## Spacing System

Based on 8px grid system:

```css
--space-xs:   4px;
--space-sm:   8px;
--space-md:   16px;
--space-lg:   24px;
--space-xl:   32px;
--space-2xl:  48px;
--space-3xl:  64px;
```

## Component Styles

### Cards

```css
border-radius: 8px;
box-shadow: 0 2px 8px rgba(0,0,0,0.08);
padding: 24px;
border: 1px solid #E8E8E8;
background: #FFFFFF;
```

**Hover:**
```css
box-shadow: 0 4px 12px rgba(0,0,0,0.12);
transform: translateY(-2px);
transition: all 0.2s ease;
```

### Buttons

**Primary (Filled):**
```css
background: var(--brand-primary);
color: #FFFFFF;
height: 40px;
padding: 12px 24px;
border-radius: 6px;
font-weight: 500;
transition: all 0.2s;
```

**Hover:**
```css
background: darken(var(--brand-primary), 10%);
box-shadow: 0 4px 8px rgba(212,165,165,0.3);
```

**Secondary (Outlined):**
```css
background: transparent;
border: 2px solid var(--brand-primary);
color: var(--brand-primary);
```

**Tertiary (Text Only):**
```css
background: transparent;
color: var(--brand-primary);
```

**Sizes:**
- Small: height 32px, padding 8px 16px
- Medium: height 40px, padding 12px 24px (default)
- Large: height 48px, padding 16px 32px

### Form Inputs

```css
height: 40px;
padding: 0 12px;
border-radius: 6px;
border: 1px solid #E8E8E8;
background: #FFFFFF;
font-size: 16px; /* iOS zoom fix */
transition: border-color 0.2s;
```

**Focus:**
```css
border: 2px solid var(--brand-primary);
outline: none;
```

**Error:**
```css
border-color: var(--error);
```

### Tables

```css
/* Header */
thead {
  background: #F5F5F5;
  font-weight: 600;
}

/* Rows */
tbody tr {
  border-bottom: 1px solid #E8E8E8;
  transition: background 0.2s;
}

tbody tr:hover {
  background: #FAFAFA;
}

/* Cells */
td, th {
  padding: 12px 16px;
  text-align: left;
}
```

### Modals/Dialogs

```css
background: #FFFFFF;
border-radius: 12px;
box-shadow: 0 20px 60px rgba(0,0,0,0.3);
max-width: 600px;
padding: 32px;
```

**Overlay:**
```css
background: rgba(0,0,0,0.5);
backdrop-filter: blur(4px);
```

### Badges/Status Indicators

```css
padding: 4px 8px;
border-radius: 12px;
font-size: 12px;
font-weight: 500;
display: inline-flex;
align-items: center;
```

**Status Colors:**
- Success: `#4CAF50` background, white text
- Warning: `#FF9800` background, white text
- Error: `#F44336` background, white text
- Info: `#2196F3` background, white text

## Layout Grid

```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}
```

**Responsive Breakpoints:**
```css
--mobile:       320px - 767px;
--tablet:       768px - 1023px;
--desktop:      1024px - 1439px;
--desktop-lg:   1440px+;
```

## Iconography

**Icon Library:** Lucide Icons (or similar)

**Sizes:**
- Small: 16px
- Medium: 20px (default)
- Large: 24px
- XL: 32px

## Animation & Transitions

```css
--transition-fast:   0.15s ease;
--transition-base:   0.2s ease;
--transition-slow:   0.3s ease;
```

**Common Animations:**
- Hover: `0.2s ease`
- Modal open/close: `0.3s ease`
- Page transitions: `0.2s ease`

## Accessibility

### Touch Targets (Mobile)

Minimum: **44px × 44px** (iOS guidelines)

### Color Contrast

- Text on background: Minimum 4.5:1 (WCAG AA)
- Large text (18px+): Minimum 3:1

### Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
```

## Dark Mode (Future)

Reserved color tokens for future dark mode:

```css
--dark-bg-primary:    #1A1A1A;
--dark-bg-secondary:  #2C2C2C;
--dark-text-primary:  #FFFFFF;
--dark-text-secondary: #B0B0B0;
```

## Design Principles

1. **Clarity:** Every element has a clear purpose
2. **Consistency:** Patterns repeat throughout the app
3. **Hierarchy:** Important content stands out
4. **Efficiency:** Minimize clicks to complete tasks
5. **Delight:** Subtle animations, polished details
6. **Accessibility:** Works for all users, all devices

## Component Library

Recommended: **Shadcn/ui** + Tailwind CSS

Benefits:
- Copy/paste components (no npm bloat)
- Built on Radix UI (accessibility)
- Fully customizable
- TypeScript support

Alternative: **Chakra UI**, **Mantine**

