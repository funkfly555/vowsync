# Quickstart: Dashboard Bug Fixes

**Feature**: 023-dashboard-bug-fixes
**Date**: 2026-01-19

## Prerequisites

- Node.js 18+
- pnpm installed
- Access to development database

## Quick Implementation Guide

### BUG 1: Fix Vendors Page TypeError (P1)

**File**: `src/components/vendors/ContractStatusBadge.tsx`

**Current Code (line 18-19)**:
```tsx
export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
  const config = CONTRACT_STATUS_CONFIG[status.label];
```

**Fixed Code**:
```tsx
export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
  // Defensive null check - display default if status undefined
  if (!status?.label) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          'px-2 py-1 text-xs font-medium',
          'bg-gray-100',
          'text-gray-700',
          className
        )}
      >
        Unknown
      </Badge>
    );
  }

  const config = CONTRACT_STATUS_CONFIG[status.label];
```

---

### BUG 2: Fix Event Timeline Horizontal Scroll (P2)

**File**: `src/components/dashboard/EventTimelineCard.tsx`

**Change 1 - EventCard sizing (lines 43-50)**:

**Current**:
```tsx
className={cn(
  'min-w-[280px] max-w-[320px] rounded-lg p-4',
```

**Fixed**:
```tsx
className={cn(
  'min-w-[200px] max-w-[260px] rounded-lg p-4',
```

**Change 2 - Container gap (line 154)**:

**Current**:
```tsx
className={cn(
  'flex gap-4',
```

**Fixed**:
```tsx
className={cn(
  'flex gap-3',
```

---

### BUG 3: Fix Budget Chart Legend Overlap (P3)

**File**: `src/components/budget/BudgetPieChart.tsx`

**Current renderLegend function (lines 55-72)**:
```tsx
return (
  <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
    {payload.map((entry: { value: string; color: string }, index: number) => {
      const dataItem = chartData.find((d) => d.name === entry.value);
      return (
        <li key={`legend-${index}`} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700">
            {entry.value} ({dataItem?.percentage.toFixed(0)}%)
          </span>
        </li>
      );
    })}
  </ul>
);
```

**Fixed renderLegend function**:
```tsx
return (
  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 max-h-[180px] overflow-y-auto">
    {payload.map((entry: { value: string; color: string }, index: number) => {
      const dataItem = chartData.find((d) => d.name === entry.value);
      return (
        <div key={`legend-${index}`} className="flex items-center gap-2 text-xs">
          <span
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700 truncate">
            {entry.value} ({dataItem?.percentage.toFixed(0)}%)
          </span>
        </div>
      );
    })}
  </div>
);
```

**Key Changes**:
1. `ul` → `div` with `grid grid-cols-2`
2. `li` → `div`
3. `text-sm` → `text-xs` (smaller font for better fit)
4. Added `truncate` for long category names
5. Added `max-h-[180px] overflow-y-auto` for 15+ categories
6. Changed color indicator from `rounded-full` to `rounded-sm`

---

## Verification Steps

### Manual Testing with Playwright MCP

```bash
# 1. Start dev server
pnpm dev

# 2. Test Vendors Page (BUG 1)
# - Navigate to /weddings/{id}/vendors
# - Verify page loads without console errors
# - Verify all vendor cards display correctly

# 3. Test Event Timeline (BUG 2)
# - Navigate to /weddings/{id} (dashboard)
# - Resize browser to 1366px width
# - Verify no horizontal scrollbar on page
# - Verify timeline cards are visible

# 4. Test Budget Chart (BUG 3)
# - Navigate to /weddings/{id}/budget
# - Ensure 12+ budget categories exist
# - Verify legend labels don't overlap
# - Verify all labels are readable
```

### Success Criteria Checklist

- [ ] Vendors page loads with zero console errors
- [ ] All vendor cards display (including incomplete data)
- [ ] Event timeline shows without page-level horizontal scroll at 1366px
- [ ] Event timeline shows without page-level horizontal scroll at 1440px
- [ ] Event timeline shows without page-level horizontal scroll at 1920px
- [ ] Budget chart legend readable with 12+ categories
- [ ] Budget chart legend scrollable with 15+ categories
- [ ] Mobile responsive layouts still work

## Files Modified

| File | Change |
|------|--------|
| `src/components/vendors/ContractStatusBadge.tsx` | Add null check |
| `src/components/dashboard/EventTimelineCard.tsx` | Reduce card widths and gap |
| `src/components/budget/BudgetPieChart.tsx` | Grid legend layout |
