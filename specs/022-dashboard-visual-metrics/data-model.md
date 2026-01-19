# Data Model: Dashboard Visual Metrics Redesign

**Feature**: 022-dashboard-visual-metrics | **Date**: 2026-01-19 | **Phase**: 1

## Overview

This feature requires NO new database tables. All data is sourced from existing tables via existing hooks. This document maps the spec requirements to existing data structures.

## Existing Data Sources

### 1. Wedding Table (Budget Data)

**Table**: `weddings`
**Hook**: `useWedding(weddingId)`

| Field | Type | Usage |
|-------|------|-------|
| `budget_total` | numeric | Total budget amount (denominator for percentage) |
| `budget_actual` | numeric | Amount spent (numerator for percentage) |
| `guest_count_adults` | integer | Adult guest count for Quick Stats |
| `guest_count_children` | integer | Child guest count for Quick Stats |

**Calculation**:
```typescript
budgetPercentage = (budget_actual / budget_total) * 100
budgetRemaining = budget_total - budget_actual
```

### 2. Guests Table (RSVP Data)

**Table**: `guests`
**Hook**: `useGuestStats(weddingId)`

| Field | Type | Values |
|-------|------|--------|
| `invitation_status` | text | 'pending', 'invited', 'confirmed', 'declined' |
| `guest_type` | text | 'adult', 'child', or NULL (defaults to adult) |

**Existing Interface**: `GuestStats`
```typescript
interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  responseRate: number;
  adults: number;
  children: number;
  rsvpNotInvited: number;  // invitation_status = 'pending' (To Be Sent)
  rsvpInvited: number;     // invitation_status = 'invited'
  rsvpConfirmed: number;   // invitation_status = 'confirmed'
  rsvpDeclined: number;    // invitation_status = 'declined'
}
```

**RSVP Status Mapping for Pie Chart**:
| Spec Status | DB Value | Color |
|-------------|----------|-------|
| To Be Sent | 'pending' | #FF9800 |
| Invited | 'invited' | #2196F3 |
| Confirmed | 'confirmed' | #4CAF50 |
| Declined | 'declined' | #F44336 |

### 3. Events Table (Timeline Data)

**Table**: `events`
**Hook**: `useEvents(weddingId)`

| Field | Type | Usage |
|-------|------|-------|
| `id` | uuid | Unique identifier |
| `event_name` | text | Display name on card |
| `event_date` | date | Display date |
| `event_start_time` | time | Optional start time |
| `event_order` | integer | Determines card color (1-7 cycle) |
| `expected_guests` | integer | Guest count display |

**Color Assignment**:
```typescript
import { getEventColor } from '@/lib/utils';
// getEventColor(event_order) returns hex color
// Colors cycle: 1→#E8B4B8, 2→#F5E6D3, 3→#C9D4C5, etc.
```

### 4. Vendor Invoices (Invoice Status Data)

**Tables**: `vendors`, `vendor_invoices`
**Hook**: `useVendorStats(weddingId)`

| Field | Type | Usage |
|-------|------|-------|
| `status` | text | 'overdue', 'unpaid', 'partially_paid', 'paid' |
| `total_amount` | numeric | Invoice amount for summing |
| `due_date` | date | Used for overdue calculation |

**Existing Interface**: `VendorStats`
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

**Status Display** (amounts only, no counts per spec):
| Status | Badge BG | Badge Text | Amount Format |
|--------|----------|------------|---------------|
| Overdue | #FFEBEE | #C62828 | R X,XXX.XX |
| Unpaid | #FFF3E0 | #E65100 | R X,XXX.XX |
| Partially Paid | #E3F2FD | #1565C0 | R X,XXX.XX |
| Paid | #E8F5E9 | #2E7D32 | R X,XXX.XX |

### 5. Wedding Items (Items Status Data)

**Table**: `wedding_items`
**Hook**: `useItemsStats(weddingId)`

| Field | Type | Usage |
|-------|------|-------|
| `total_required` | integer | Required quantity |
| `number_available` | integer | Available quantity |
| `total_cost` | numeric | Item cost |

**Existing Interface**: `ItemsStats`
```typescript
interface ItemsStats {
  total: number;      // Total item count
  shortage: number;   // Items where number_available < total_required
  totalCost: number;  // Sum of all total_cost
}
```

### 6. Bar Orders (Bar Orders Status Data)

**Table**: `bar_orders`
**Hook**: `useBarOrdersStats(weddingId)`

| Field | Type | Usage |
|-------|------|-------|
| `status` | text | 'draft', 'confirmed', 'delivered' |

**Existing Interface**: `BarOrdersStats`
```typescript
interface BarOrdersStats {
  total: number;
  draft: number;
  confirmed: number;
  delivered: number;
}
```

## Component Data Requirements

### Quick Stats Row

| Stat | Data Source | Display |
|------|-------------|---------|
| Guests | `guestStats.total` or `wedding.guest_count_adults + wedding.guest_count_children` | Total count |
| Events | `events.length` | Event count |
| Budget | `metrics.budgetPercentage` | Percentage spent |
| Vendors | `vendorStats.total` | Vendor count |

### Budget Overview Card

| Element | Data Source | Calculation |
|---------|-------------|-------------|
| Percentage | `metrics.budgetPercentage` | (budget_actual / budget_total) * 100 |
| Total Budget | `wedding.budget_total` | formatCurrency() |
| Spent | `wedding.budget_actual` | formatCurrency() |
| Remaining | Calculated | budget_total - budget_actual |

### RSVP Status Card

| Segment | Data Source | Color |
|---------|-------------|-------|
| To Be Sent | `guestStats.rsvpNotInvited` | #FF9800 |
| Invited | `guestStats.rsvpInvited` | #2196F3 |
| Confirmed | `guestStats.rsvpConfirmed` | #4CAF50 |
| Declined | `guestStats.rsvpDeclined` | #F44336 |

**Pie Chart Calculation**:
```typescript
// Convert counts to percentages for stroke-dasharray
const total = rsvpNotInvited + rsvpInvited + rsvpConfirmed + rsvpDeclined;
const pendingPercent = (rsvpNotInvited / total) * 100;
// etc.
```

### Event Timeline Card

| Element | Data Source |
|---------|-------------|
| Event Name | `event.event_name` |
| Event Date | `event.event_date` (format with date-fns) |
| Expected Guests | `event.expected_guests` |
| Card Color | `getEventColor(event.event_order)` |

### Vendor Invoices Card

| Row | Amount Source |
|-----|---------------|
| Overdue | `vendorStats.overdue.totalAmount` |
| Unpaid | `vendorStats.unpaid.totalAmount` |
| Partially Paid | `vendorStats.partiallyPaid.totalAmount` |
| Paid | `vendorStats.paid.totalAmount` |

### Items Status Card

| Element | Data Source |
|---------|-------------|
| Total Items | `itemsStats.total` |
| Available | Calculated from individual items if needed |
| Shortage Count | `itemsStats.shortage` |

### Bar Orders Status Card

| Element | Data Source |
|---------|-------------|
| Total Orders | `barOrdersStats.total` |
| Draft | `barOrdersStats.draft` |
| Confirmed | `barOrdersStats.confirmed` |
| Delivered | `barOrdersStats.delivered` |

## Type Extensions (New)

No new types required. All existing types in `src/types/dashboard.ts` support the redesign:

- `DashboardMetrics` - Has all budget/guest metrics
- `GuestStats` - Has all 4 RSVP status counts
- `VendorStats` - Has all 4 invoice status amounts
- `ItemsStats` - Has total, shortage, totalCost
- `BarOrdersStats` - Has all 3 status counts
- `DashboardData` - Aggregates all above via `useDashboard`

## Currency Formatting

**Utility**: `src/lib/currency.ts`
**Context**: `src/contexts/CurrencyContext.tsx`

```typescript
import { useCurrency } from '@/contexts/CurrencyContext';

const { formatCurrency } = useCurrency();
// formatCurrency(17000) → "R 17,000.00"
```

## Database Schema Reference

No changes required. Existing tables:

```sql
-- Already exists, no modifications needed
weddings (budget_total, budget_actual, guest_count_adults, guest_count_children)
events (event_name, event_date, event_start_time, event_order, expected_guests)
guests (invitation_status, guest_type)
vendor_invoices (status, total_amount, due_date)
wedding_items (total_required, number_available, total_cost)
bar_orders (status)
```

## Migration Requirements

**None** - This is a frontend-only feature using existing data.
