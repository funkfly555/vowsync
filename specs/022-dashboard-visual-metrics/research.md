# Research: Dashboard Visual Metrics Redesign

**Feature**: 022-dashboard-visual-metrics | **Date**: 2026-01-19 | **Phase**: 0

## Executive Summary

Research completed on existing VowSync dashboard implementation. The codebase has a well-structured foundation with TanStack Query v5 for data fetching, existing stats hooks for all required data sources, and a consistent design system. The redesign will enhance the visual presentation with SVG charts and improved layout while leveraging existing data infrastructure.

## Existing Dashboard Architecture

### Main Dashboard Page
**File**: `src/pages/WeddingDashboardPage.tsx`

Current structure:
- Header with back button, wedding names, venue, and date
- `DashboardStatsGrid` - 3x2 responsive grid of stat cards
- Upcoming Tasks section (max 3 tasks, next 7 days)
- Recent Activity section (last 5 activities)
- Quick Actions - 6 action buttons

**Responsive Layout**:
- Desktop: `lg:grid-cols-2` (2 columns)
- Mobile: `grid-cols-1` (single column)
- Gap: `gap-6` (24px)

### Data Fetching Architecture

**Orchestrator Hook**: `src/hooks/useDashboard.ts`

Combines 8 parallel TanStack Query calls:
1. `useWedding(weddingId)` - Wedding details with budget_total, budget_actual
2. `useEvents(weddingId)` - Events with event_order, event_date
3. `useGuestStats(weddingId)` - RSVP breakdown by invitation_status
4. `useRecentActivity(weddingId, 5)` - Last 5 activity log entries
5. `useVendorStats(weddingId)` - Invoice totals by status
6. `useTaskStats(weddingId)` - Upcoming tasks count
7. `useItemsStats(weddingId)` - Items shortage and totals
8. `useBarOrdersStats(weddingId)` - Bar order status breakdown

**Stale Time**: All hooks use 30-second stale time for data freshness.

## Data Sources Analysis

### Guest Statistics
**Hook**: `src/hooks/useGuestStats.ts`
**Table**: `guests`

```typescript
interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  responseRate: number;
  adults: number;
  children: number;
  rsvpNotInvited: number;  // pending status
  rsvpInvited: number;     // invited status
  rsvpConfirmed: number;   // confirmed status
  rsvpDeclined: number;    // declined status
}
```

**Query Fields**: `invitation_status`, `guest_type`

### Vendor Invoice Statistics
**Hook**: `src/hooks/useVendorStats.ts`
**Tables**: `vendors`, `vendor_invoices`

```typescript
interface VendorStats {
  total: number;
  pendingPayments: number;
  overdue: { count: number; totalAmount: number };
  unpaid: { count: number; totalAmount: number };
  partiallyPaid: { count: number; totalAmount: number };
  paid: { count: number; totalAmount: number };
}
```

**Classification Logic**:
- Overdue: status='overdue' OR (unpaid/partially_paid with past due_date)
- Unpaid: status='unpaid' AND not overdue
- Partially Paid: status='partially_paid' AND not overdue
- Paid: status='paid'

### Items Statistics
**Hook**: `src/hooks/useItemsStats.ts`
**Table**: `wedding_items`

```typescript
interface ItemsStats {
  total: number;
  shortage: number;  // where number_available < total_required
  totalCost: number;
}
```

### Bar Orders Statistics
**Hook**: `src/hooks/useBarOrdersStats.ts`
**Table**: `bar_orders`

```typescript
interface BarOrdersStats {
  total: number;
  draft: number;
  confirmed: number;
  delivered: number;
}
```

### Budget Data
**Source**: `useWedding` hook returns wedding with:
- `budget_total`: Total budget amount
- `budget_actual`: Amount spent

**Calculation**: `budgetPercentage = (budget_actual / budget_total) * 100`

## Color System Analysis

### Event Colors (Existing)
**File**: `src/lib/utils.ts` - `getEventColor(order: number)`

```typescript
const eventColors = [
  '#E8B4B8',  // order 1 - dusty rose
  '#F5E6D3',  // order 2 - cream/beige
  '#C9D4C5',  // order 3 - sage green
  '#E5D4EF',  // order 4 - lavender
  '#FFE5CC',  // order 5 - peach
  '#D4E5F7',  // order 6 - light blue
  '#F7D4E5',  // order 7 - pink
];
```

Colors cycle for event_order > 7.

### Brand Colors (Existing)
- **Dusty Rose**: `#D4A5A5` (primary accent)
- **Dusty Rose Hover**: `#C49494`
- Used in Quick Actions buttons

### Status Colors (Current Usage)
| Status | Color | Hex |
|--------|-------|-----|
| Confirmed/Paid/Success | Green | Various greens |
| Declined/Overdue/Error | Red | Various reds |
| Invited/Confirmed Secondary | Blue | Various blues |
| Pending/Draft/Warning | Yellow | Various yellows |
| Empty/No Data | Gray | Various grays |

## Existing Component Patterns

### DashboardStatCard
**File**: `src/components/dashboard/DashboardStatCard.tsx`

**Styling**:
- Background: white (#FFFFFF)
- Border: 1px solid #E8E8E8
- Border-radius: rounded-lg (8px)
- Box-shadow: 0 2px 8px rgba(0,0,0,0.08)
- Padding: p-6 (24px)

**Progress Bar Pattern**:
- Background: bg-gray-200
- Height: h-2
- Border-radius: rounded-full
- Dynamic colors based on percentage thresholds

### Loading States
- 6 skeleton cards with `h-[140px] bg-gray-100 animate-pulse rounded-lg`

## Currency Formatting

**File**: `src/lib/currency.ts`

```typescript
// Default currency is ZAR (South African Rand)
formatCurrency(1000, 'ZAR') // → "R 1,000.00"
```

**CurrencyContext** provides app-wide currency formatting via `useCurrency()` hook.

## Icon Library

**Package**: `lucide-react`

Relevant icons already in use:
- `Users` - Guests
- `PiggyBank` - Budget
- `Calendar` - Events
- `FileText` - Invoices
- `Armchair` - Items
- `Wine` - Bar Orders

## Design Recommendations

### SVG Chart Implementation

**Circular Progress (Budget)**:
- ViewBox: `0 0 180 180`
- Circle radius: 80, stroke-width: 12
- Use `stroke-dasharray` and `stroke-dashoffset` for progress
- Transform: `rotate(-90deg)` for starting at top
- Gradient: Use `<linearGradient>` with IDs

**Pie Chart (RSVP)**:
- ViewBox: `0 0 160 160`
- Use `stroke-dasharray` segments on circle
- Calculate segment sizes from percentages
- Legend with 16px color squares

### Quick Stats Implementation

Recommend gradient backgrounds using CSS:
```css
background: linear-gradient(135deg, #4CAF50, #81C784);
```

56px diameter circular containers for icons.

### Event Timeline

- Minimum card width: 280px
- Horizontal scroll with `overflow-x-auto`
- Snap scrolling: `scroll-snap-type: x mandatory`
- Use `getEventColor(event_order)` for card backgrounds

## Technical Constraints

1. **No New Database Tables**: All data already available via existing hooks
2. **Maintain Hook Stale Time**: Keep 30-second refresh for real-time feel
3. **SVG Only**: No external charting libraries (spec requirement)
4. **Responsive**: Must work 320px to 1440px+
5. **WCAG 2.1 AA**: Maintain contrast ratios, keyboard navigation

## Reusable Assets

### Can Reuse As-Is:
- `useDashboard.ts` orchestrator hook
- `useGuestStats.ts` for RSVP data
- `useVendorStats.ts` for invoice data
- `useItemsStats.ts` for items data
- `useBarOrdersStats.ts` for bar order data
- `getEventColor()` for event timeline colors
- `formatCurrency()` for currency display
- `useCurrency()` context hook

### Needs Modification:
- `WeddingDashboardPage.tsx` - New layout with visual components
- `DashboardStatsGrid.tsx` - Replace with new visual components (or remove)

### New Components Required:
1. `QuickStatsRow.tsx` - 4 stat pills with gradient icons
2. `BudgetOverviewCard.tsx` - Circular progress SVG
3. `RsvpStatusCard.tsx` - Pie chart SVG
4. `EventTimelineCard.tsx` - Horizontal scrolling events
5. `VendorInvoicesCard.tsx` - Status breakdown by amount
6. `ItemsStatusCard.tsx` - Items availability summary
7. `BarOrdersStatusCard.tsx` - Bar orders status summary

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| SVG performance on mobile | Keep SVG simple, use CSS transforms |
| Horizontal scroll UX | Add scroll indicators, touch-friendly |
| Chart accessibility | Add ARIA labels, screen reader text |
| Large numbers overflow | Use responsive font sizes, abbreviations |
| Zero data edge cases | Design empty states for all charts |

## Research Sources

- Codebase exploration via Serena MCP
- Existing dashboard components analysis
- Type definitions in `src/types/dashboard.ts`
- Hook implementations in `src/hooks/`
- Utility functions in `src/lib/`
