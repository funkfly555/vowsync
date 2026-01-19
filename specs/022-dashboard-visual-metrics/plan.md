# Implementation Plan: Dashboard Visual Metrics Redesign

**Branch**: `022-dashboard-visual-metrics` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-dashboard-visual-metrics/spec.md`

## Summary

Redesign the wedding dashboard with visual data visualization including circular progress charts, pie charts, and horizontal scrolling event timeline. Key components: Quick Stats row with 4 gradient icon pills, Budget Overview card with SVG circular progress, RSVP Status pie chart, Event Timeline with horizontal scrolling cards, Vendor Invoices status breakdown, Items Status, and Bar Orders cards. All components must use the VowSync design system colors and follow responsive grid layout (2fr 1fr on desktop, single column on mobile).

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (existing tables: weddings, events, guests, vendor_invoices, wedding_items, bar_orders)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Chrome, Firefox, Safari, mobile browsers)
**Project Type**: Web application (frontend only - Supabase backend)
**Performance Goals**: FCP < 1.2s, TTI < 3.5s, LCP < 2.5s, dashboard load < 2s
**Constraints**: Responsive (320px-1440px+), WCAG 2.1 AA accessibility, real-time data updates
**Scale/Scope**: Single wedding dashboard view, 6 visualization cards, 7 data sources

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] (existing tables) |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate calculations, proper validations | [x] |
| VII. Security | RLS, no API key exposure, input validation | [x] |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [x] |
| XI. API Handling | Standard response format, error pattern | [x] |
| XII. Git Workflow | Feature branches, descriptive commits | [x] |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] |
| XIV. Environment | Uses .env, no secrets in git | [x] |
| XV. Prohibited | No violations of prohibited practices | [x] |

**All gates passed** - No violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/022-dashboard-visual-metrics/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── components.md    # Component API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── dashboard/
│       ├── QuickStatsRow.tsx          # 4 stat pills with gradient icons
│       ├── BudgetOverviewCard.tsx     # Circular progress chart (180px SVG)
│       ├── RsvpStatusCard.tsx         # Pie chart (160px SVG)
│       ├── EventTimelineCard.tsx      # Horizontal scrolling events
│       ├── VendorInvoicesCard.tsx     # Status breakdown by amount
│       ├── ItemsStatusCard.tsx        # Items availability summary
│       └── BarOrdersStatusCard.tsx    # Bar orders status summary
├── hooks/
│   ├── useDashboard.ts                # Existing - may need updates
│   ├── useGuestStats.ts               # Existing - RSVP counts
│   ├── useVendorStats.ts              # Existing - invoice totals
│   ├── useItemsStats.ts               # Existing - items counts
│   └── useBarOrdersStats.ts           # Existing - bar order counts
├── pages/
│   └── WeddingDashboardPage.tsx       # Existing - will be modified
├── types/
│   └── dashboard.ts                   # Dashboard-specific types
└── lib/
    └── currency.ts                    # Currency formatting (existing)
```

**Structure Decision**: Extend existing VowSync structure with new dashboard visualization components. All new components go in `src/components/dashboard/`. Reuse existing hooks where possible; the main page component `WeddingDashboardPage.tsx` will be modified to use the new visual layout.

## Complexity Tracking

> No violations - all implementations follow constitution guidelines.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Design Specifications

### Color System (from user input)

**Quick Stats Gradient Icons:**
- Guests: `linear-gradient(135deg, #4CAF50, #81C784)`
- Events: `linear-gradient(135deg, #2196F3, #64B5F6)`
- Budget: `linear-gradient(135deg, #FF9800, #FFB74D)`
- Vendors: `linear-gradient(135deg, #9C27B0, #BA68C8)`

**RSVP Status Colors:**
- Pending (To Be Sent): `#FF9800`
- Confirmed: `#4CAF50`
- Declined: `#F44336`
- Invited: `#2196F3`

**Vendor Invoice Badge Colors:**
- Overdue: bg `#FFEBEE`, text `#C62828`
- Unpaid: bg `#FFF3E0`, text `#E65100`
- Partially Paid: bg `#E3F2FD`, text `#1565C0`
- Paid: bg `#E8F5E9`, text `#2E7D32`

**Event Timeline Colors (by event_order):**
- Event 1: `#E8B4B8`
- Event 2: `#F5E6D3`
- Event 3: `#C9D4C5`
- Event 4: `#E5D4EF`
- Event 5: `#FFE5CC`
- Event 6: `#D4E5F7`
- Event 7: `#F7D4E5`

### SVG Chart Specifications

**Budget Circular Progress:**
- ViewBox: `0 0 180 180`
- Circle radius: 80, stroke-width: 12
- Background circle: stroke `#F5F5F5`, fill none
- Progress circle: stroke `url(#budgetGradient)`, stroke-linecap round
- Gradient: from `#4CAF50` to `#81C784`
- Transform: `rotate(-90deg)` on both circles, transform-origin center
- Center text: 42px bold percentage, 13px label below
- NO extra padding/white space inside

**RSVP Pie Chart:**
- Diameter: 160px
- Use stroke-dasharray for segments
- Legend: 16px square color indicators

### Layout Grid

**Desktop (>1024px):**
- Main grid: 2 columns (2fr 1fr)
- Budget Overview: col-span-1
- RSVP Status: col-span-1
- Event Timeline: col-span-2 (full width)
- Status cards: auto-fit grid minmax(240px, 1fr)

**Tablet (768px-1024px):**
- Maintain 2-column where possible
- Reduce card padding

**Mobile (<768px):**
- Single column layout
- Event Timeline still horizontal scrolling
