# Data Model: Dashboard Bug Fixes

**Feature**: 023-dashboard-bug-fixes
**Date**: 2026-01-19
**Status**: N/A - No data model changes required

## Summary

This feature is a bug-fix-only release. No database schema changes, new entities, or API modifications are required.

## Existing Entities (Reference Only)

The following existing types are relevant to the bug fixes but require no modifications:

### ContractStatusBadge (vendor.ts:83-86)

```typescript
export interface ContractStatusBadge {
  label: ContractStatusLabel;
  color: 'green' | 'yellow' | 'orange' | 'red';
}
```

**Usage**: Passed to `ContractStatusBadge` component. Bug fix adds null check for when this is undefined.

### PaymentStatusBadge (vendor.ts:95-98)

```typescript
export interface PaymentStatusBadge {
  label: PaymentStatusLabel;
  color: 'green' | 'blue' | 'red' | 'orange';
}
```

**Usage**: Passed to `PaymentStatusBadge` component. Already has defensive fallback.

### VendorDisplay (vendor.ts:107-111)

```typescript
export interface VendorDisplay extends Vendor {
  contractStatus: ContractStatusBadge;
  paymentStatus: PaymentStatusBadge;
  maskedAccountNumber: string | null;
}
```

**Usage**: Extended vendor type with computed display properties.

### EventData (EventTimelineCard.tsx:13-20)

```typescript
interface EventData {
  id: string;
  event_name: string;
  event_date: string;
  event_start_time?: string | null;
  event_order: number;
  expected_guests?: number | null;
}
```

**Usage**: Event data for timeline cards. No changes needed.

### BudgetCategory (budget.ts)

```typescript
interface BudgetCategory {
  category_name: string;
  projected_amount: number;
  // ... other fields
}
```

**Usage**: Budget data for pie chart. No changes needed.

## State Transitions

No state machine changes required.

## Validation Rules

No new validation rules required. Existing Zod schemas remain unchanged.
