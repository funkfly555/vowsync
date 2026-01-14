# Research: Vendor Payments & Invoices (Phase 7B)

**Date**: 2026-01-14
**Status**: Complete - No NEEDS CLARIFICATION items

## Executive Summary

All technical decisions for Phase 7B are resolved. Database tables already exist with RLS enabled. This feature extends Phase 7A patterns with minimal new decisions required.

---

## Research Findings

### 1. Database Schema

**Decision**: Use existing Supabase tables (`vendor_payment_schedule`, `vendor_invoices`, `vendor_contacts`)

**Rationale**:
- Tables were created in Phase 1 database foundation
- All required columns exist with proper constraints
- RLS policies already configured via wedding ownership chain
- `total_amount` is a generated column (auto-calculated from `amount + vat_amount`)

**Alternatives Considered**:
- Creating new tables: Rejected - tables already exist
- Modifying schema: Not needed - schema is complete

**Verification**:
```sql
-- vendor_payment_schedule columns confirmed:
-- id, vendor_id, milestone_name, due_date, amount, percentage, status,
-- paid_date, payment_method, payment_reference, notes, created_at, updated_at

-- vendor_invoices columns confirmed:
-- id, vendor_id, payment_schedule_id, invoice_number, invoice_date, due_date,
-- amount, vat_amount, total_amount (generated), status, paid_date,
-- payment_method, payment_reference, notes, created_at, updated_at

-- vendor_contacts columns confirmed:
-- id, vendor_id, contact_name, contact_role, contact_email, contact_phone,
-- is_primary, is_onsite_contact, created_at, updated_at
```

---

### 2. Payment Status Logic

**Decision**: Client-side status calculation based on dates

**Rationale**:
- Status depends on current date comparison with due_date
- Database stores raw status but UI calculates display status dynamically
- Consistent with Phase 7A contract status badge pattern

**Status Calculation Rules**:
| Condition | Status | Badge Color | Icon |
|-----------|--------|-------------|------|
| `paid_date IS NOT NULL` | Paid | Green (#4CAF50) | ✅ |
| `status = 'cancelled'` | Cancelled | Gray (#9E9E9E) | ⊘ |
| `due_date < today AND paid_date IS NULL` | Overdue | Red (#F44336) | ❌ |
| `due_date within 7 days AND paid_date IS NULL` | Due Soon | Orange (#FF9800) | ⚠️ |
| `due_date > 7 days AND paid_date IS NULL` | Pending | Blue (#2196F3) | ⏳ |

**Alternatives Considered**:
- Database trigger for status: Rejected - triggers don't know "current date" context
- Scheduled jobs: Rejected - adds complexity, not needed for small scale

---

### 3. Invoice Status Logic

**Decision**: Similar pattern to payments with invoice-specific statuses

**Rationale**:
- Invoices have additional Draft/Sent states
- Overdue calculated dynamically like payments
- Status stored in DB but display may override based on dates

**Status Rules**:
| Condition | Status | Badge Color |
|-----------|--------|-------------|
| `status = 'paid'` | Paid | Green |
| `status = 'cancelled'` | Cancelled | Gray |
| `due_date < today AND status IN ('unpaid', 'partially_paid')` | Overdue | Red |
| `status = 'unpaid'` | Unpaid | Blue |
| `status = 'partially_paid'` | Partial | Yellow |

---

### 4. Component Architecture

**Decision**: Separate tab components with shared modal patterns

**Rationale**:
- Follows Phase 7A VendorDetailPage tab structure
- Reuses Shadcn Dialog, Table, Form patterns
- Enables lazy loading of tab content

**Component Hierarchy**:
```
VendorDetailPage
├── PaymentsTab
│   ├── PaymentScheduleTable
│   │   └── PaymentStatusBadge
│   ├── PaymentModal (add/edit)
│   ├── MarkAsPaidDialog
│   └── DeletePaymentDialog
├── InvoicesTab
│   ├── InvoiceTable
│   │   └── InvoiceStatusBadge
│   ├── InvoiceModal (add/edit)
│   └── DeleteInvoiceDialog
└── ContactsSection (in Overview tab)
    ├── ContactModal
    └── DeleteContactDialog
```

**Alternatives Considered**:
- Single PaymentsInvoicesTab: Rejected - too complex, violates SRP
- Separate pages: Rejected - tabs provide better UX for related data

---

### 5. Form Validation Schemas

**Decision**: Zod schemas matching database constraints

**Rationale**:
- Consistent with Phase 7A vendor schema patterns
- Client-side validation prevents invalid submissions
- Error messages match field labels

**Payment Schema Fields**:
```typescript
milestone_name: z.string().min(1, "Description is required")
due_date: z.string().min(1, "Due date is required")
amount: z.number().positive("Amount must be positive")
percentage: z.number().min(0).max(100).optional()
notes: z.string().optional()
```

**Invoice Schema Fields**:
```typescript
invoice_number: z.string().min(1, "Invoice number is required")
invoice_date: z.string().min(1, "Invoice date is required")
due_date: z.string().min(1, "Due date is required")
amount: z.number().positive("Amount must be positive")
vat_amount: z.number().min(0, "VAT cannot be negative")
notes: z.string().optional()
```

---

### 6. Currency Formatting

**Decision**: South African Rand (ZAR) with R prefix

**Rationale**:
- VowSync is targeted at South African wedding consultants
- Consistent with existing budget display patterns
- Uses `Intl.NumberFormat` for locale-aware formatting

**Implementation**:
```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2
  }).format(amount);
}
// Output: "R 1,500.00"
```

---

### 7. TanStack Query Patterns

**Decision**: Consistent query key structure with Phase 7A

**Rationale**:
- Enables proper cache invalidation
- Follows established patterns from useVendors, useGuests hooks

**Query Keys**:
```typescript
// Payments
['vendor-payments', vendorId]

// Invoices
['vendor-invoices', vendorId]

// Contacts
['vendor-contacts', vendorId]
```

**Invalidation on Mutation**:
- Create/Update/Delete payment → invalidate `['vendor-payments', vendorId]`
- Create/Update/Delete invoice → invalidate `['vendor-invoices', vendorId]`
- Create/Update/Delete contact → invalidate `['vendor-contacts', vendorId]`

---

## Dependencies Verified

| Dependency | Version | Purpose | Status |
|------------|---------|---------|--------|
| @tanstack/react-query | ^5.x | Server state management | ✅ Installed |
| react-hook-form | ^7.x | Form handling | ✅ Installed |
| zod | ^3.x | Validation schemas | ✅ Installed |
| date-fns | ^3.x | Date calculations | ✅ Installed |
| lucide-react | ^0.x | Icons | ✅ Installed |
| @supabase/supabase-js | ^2.x | Database client | ✅ Installed |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Payment status shows stale data | Low | Medium | TanStack Query handles refetching on focus |
| VAT calculation precision errors | Low | High | Use `toFixed(2)` for display, store raw decimals |
| Large number of payments slows UI | Low | Medium | Implement pagination if >50 payments per vendor |

---

## Conclusion

All technical decisions are resolved. Implementation can proceed without further research. The feature builds on established Phase 7A patterns with minimal new complexity.
