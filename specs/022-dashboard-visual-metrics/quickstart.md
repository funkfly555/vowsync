# Quickstart: Dashboard Visual Metrics Redesign

**Feature**: 022-dashboard-visual-metrics | **Date**: 2026-01-19 | **Phase**: 1

## Overview

Redesign the wedding dashboard with visual data visualization including circular progress charts, pie charts, and horizontal scrolling event timeline.

## Key Components to Build

1. **QuickStatsRow** - 4 gradient icon pills (Guests, Events, Budget, Vendors)
2. **BudgetOverviewCard** - 180px SVG circular progress chart
3. **RsvpStatusCard** - 160px SVG pie chart with legend
4. **EventTimelineCard** - Horizontal scrolling event cards
5. **VendorInvoicesCard** - Status breakdown by amount
6. **ItemsStatusCard** - Items availability summary
7. **BarOrdersStatusCard** - Bar orders status summary

## File Structure

```
src/components/dashboard/
├── QuickStatsRow.tsx          # NEW
├── BudgetOverviewCard.tsx     # NEW
├── RsvpStatusCard.tsx         # NEW
├── EventTimelineCard.tsx      # NEW
├── VendorInvoicesCard.tsx     # NEW
├── ItemsStatusCard.tsx        # NEW
├── BarOrdersStatusCard.tsx    # NEW
├── DashboardStatsGrid.tsx     # EXISTING (will be replaced)
└── DashboardStatCard.tsx      # EXISTING (may be reused)
```

## Critical Specifications

### Quick Stats Gradients
```css
/* Guests */  linear-gradient(135deg, #4CAF50, #81C784)
/* Events */  linear-gradient(135deg, #2196F3, #64B5F6)
/* Budget */  linear-gradient(135deg, #FF9800, #FFB74D)
/* Vendors */ linear-gradient(135deg, #9C27B0, #BA68C8)
```

### RSVP Status Colors
```typescript
const rsvpColors = {
  pending: '#FF9800',    // To Be Sent
  confirmed: '#4CAF50',
  declined: '#F44336',
  invited: '#2196F3',
};
```

### Vendor Invoice Badge Colors
```typescript
const invoiceBadges = {
  overdue: { bg: '#FFEBEE', text: '#C62828' },
  unpaid: { bg: '#FFF3E0', text: '#E65100' },
  partiallyPaid: { bg: '#E3F2FD', text: '#1565C0' },
  paid: { bg: '#E8F5E9', text: '#2E7D32' },
};
```

### Event Colors (use existing utility)
```typescript
import { getEventColor } from '@/lib/utils';
// Returns: #E8B4B8, #F5E6D3, #C9D4C5, #E5D4EF, #FFE5CC, #D4E5F7, #F7D4E5
```

## Data Sources (All Existing)

```typescript
import { useDashboard } from '@/hooks/useDashboard';

const {
  wedding,        // budget_total, budget_actual
  metrics,        // budgetPercentage, totalGuests, eventCount
  events,         // For timeline
  guestStats,     // RSVP breakdown
  vendorStats,    // Invoice amounts by status
  itemsStats,     // total, shortage
  barOrdersStats, // draft, confirmed, delivered
} = useDashboard(weddingId);
```

## SVG Chart Formulas

### Circular Progress (Budget)
```typescript
const circumference = 2 * Math.PI * 80; // radius = 80
const offset = circumference - (percentage / 100) * circumference;
// Apply as strokeDashoffset on progress circle
```

### Pie Chart (RSVP)
```typescript
const total = pending + invited + confirmed + declined;
const circumference = 2 * Math.PI * 60; // radius = 60

// Each segment: stroke-dasharray = [segmentLength, circumference - segmentLength]
// Rotate each segment to start where previous ended
```

## Layout Grid

```typescript
// Desktop: 2 columns (2fr 1fr)
className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6"

// Full width spans
className="col-span-1 lg:col-span-2"
```

## Currency Formatting

```typescript
import { useCurrency } from '@/contexts/CurrencyContext';
const { formatCurrency } = useCurrency();
// formatCurrency(17000) → "R 17,000.00"
```

## Testing Priorities

1. SVG charts render correctly at all viewport sizes
2. Pie chart segments proportionally accurate
3. Event timeline horizontal scroll works on touch devices
4. All edge cases handled (zero data, null values)
5. Accessibility: ARIA labels on charts, keyboard navigation

## Don't Forget

- NO extra padding inside circular progress chart
- Invoice amounts display WITHOUT counts
- Event colors match Events page exactly
- Icons match sidebar navigation icons
- Responsive: 320px to 1440px+
