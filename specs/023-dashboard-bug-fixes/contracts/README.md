# API Contracts: Dashboard Bug Fixes

**Feature**: 023-dashboard-bug-fixes
**Date**: 2026-01-19
**Status**: N/A - No API changes required

## Summary

This feature is a bug-fix-only release targeting UI components. No API changes, new endpoints, or contract modifications are required.

## Existing Contracts (Unchanged)

The following API interactions are used by the affected components but require no modifications:

### Vendors Query

```typescript
// Used by VendorsPage.tsx via useVendors hook
const { data: vendors } = useQuery({
  queryKey: ['vendors', weddingId],
  queryFn: () => supabase
    .from('vendors')
    .select('*')
    .eq('wedding_id', weddingId)
});
```

**Status**: No changes - vendor data shape unchanged.

### Events Query

```typescript
// Used by dashboard via wedding data
const { data: events } = useQuery({
  queryKey: ['events', weddingId],
  queryFn: () => supabase
    .from('events')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('event_order', { ascending: true })
});
```

**Status**: No changes - event data shape unchanged.

### Budget Categories Query

```typescript
// Used by BudgetPage.tsx
const { data: categories } = useQuery({
  queryKey: ['budget-categories', weddingId],
  queryFn: () => supabase
    .from('budget_categories')
    .select('*')
    .eq('wedding_id', weddingId)
});
```

**Status**: No changes - budget data shape unchanged.

## Component Contracts

### ContractStatusBadge Props (Updated)

**Before**:
```typescript
interface ContractStatusBadgeProps {
  status: ContractStatusBadge;  // Required, crashes if undefined
  className?: string;
}
```

**After** (defensive):
```typescript
interface ContractStatusBadgeProps {
  status: ContractStatusBadge | undefined;  // Now handles undefined
  className?: string;
}
```

### No Other Component Contract Changes

- `EventTimelineCard` props unchanged
- `BudgetPieChart` props unchanged
- Only internal styling/layout modified
