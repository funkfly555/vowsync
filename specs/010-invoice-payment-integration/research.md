# Research: Vendor Invoice Payment Integration

**Feature Branch**: `010-invoice-payment-integration`
**Date**: 2026-01-15
**Status**: Complete - No unknowns

## Overview

This feature integrates the existing invoice and payment systems to provide a unified workflow for wedding consultants. All technical decisions are informed by the existing Phase 7B implementation and the user's comprehensive technical plan.

---

## Research Findings

### R1: Invoice-Payment Linking Strategy

**Decision**: Use existing `payment_schedule_id` foreign key on `vendor_invoices` table

**Rationale**:
- The `vendor_invoices` table already has a `payment_schedule_id` column (nullable FK to `vendor_payment_schedule`)
- This supports the one-invoice-to-one-payment relationship for simple cases
- For partial payments, the same invoice can be linked to multiple payments sequentially
- No database migration required

**Alternatives Considered**:
- Junction table for many-to-many: Rejected - adds complexity, current schema is sufficient
- Array of payment IDs on invoice: Rejected - violates normalization, harder to query

---

### R2: Invoice Status Auto-Update Strategy

**Decision**: Update invoice status in the `useMarkPaymentAsPaid` mutation after payment is marked paid

**Rationale**:
- Keeps business logic centralized in the mutation
- Uses TanStack Query's `onSuccess` to invalidate related queries
- Follows existing pattern from Phase 7B payment mutations
- Ensures UI updates automatically via query invalidation

**Alternatives Considered**:
- Database trigger: Rejected - harder to debug, violates "logic in application" pattern
- Separate scheduled job: Rejected - not real-time, adds infrastructure complexity
- Optimistic updates: Considered but deferred - current approach is simpler

---

### R3: Financial Summary Calculation

**Decision**: Create `useVendorTotals` hook that fetches and calculates totals client-side

**Rationale**:
- Two separate Supabase queries (invoices total_amount, payments with status='paid')
- Client-side calculation of `balanceDue = totalInvoiced - totalPaid`
- Uses TanStack Query for caching and automatic refetching
- Invalidated when invoices or payments change

**Alternatives Considered**:
- Database view: Rejected - requires migration, adds maintenance burden
- Supabase RPC function: Considered but deferred - client-side is simpler for now
- Combined query with join: Rejected - harder to maintain separate invalidation

---

### R4: "Pay This Invoice" Workflow

**Decision**: Use `useCreatePaymentFromInvoice` mutation that creates payment and links invoice atomically

**Rationale**:
- Single mutation handles both operations
- Pre-fills payment with invoice data (amount, due_date, milestone_name)
- Links invoice to new payment by updating `payment_schedule_id`
- Opens existing PaymentModal in "add" mode with pre-filled values

**Alternatives Considered**:
- Two-step process (create then link): Rejected - could leave orphaned records
- New dedicated "PayInvoice" modal: Rejected - reuse existing PaymentModal

---

### R5: Tab Ordering

**Decision**: Change tab order from `[Overview, Contract, Payments, Invoices]` to `[Overview, Contract, Invoices, Payments]`

**Rationale**:
- Matches natural workflow: receive invoice → create payment
- Invoices come before payments chronologically in vendor relationships
- User explicitly requested this order in spec

**Implementation**:
- Update `VendorDetailPage.tsx` tabs array and TabsContent order
- No component restructuring needed

---

### R6: Invoice Column in Payments Table

**Decision**: Query invoices with matching `payment_schedule_id` and display in new column

**Rationale**:
- Extend existing `useVendorPayments` or create parallel query for invoice links
- Display "Invoice #XXX" or "—" based on linked invoice
- Clicking invoice number could navigate to invoice (future enhancement)

**Implementation Options**:
1. Modify `useVendorInvoices` to return map of payment_id → invoice_number
2. Query invoices separately and join client-side
3. Use Supabase join in payments query

**Selected**: Option 1 - minimal changes, efficient data structure

---

### R7: Currency Formatting

**Decision**: Use existing ZAR formatting with "R" prefix (e.g., "R 5,000.00")

**Rationale**:
- Matches existing Phase 7B implementation
- South African Rand is the target currency per project requirements
- `formatCurrency` utility already exists in codebase

**No changes required** - reuse existing formatting.

---

### R8: Status Badge Colors

**Decision**: Use existing color palette from constitution and Phase 7B

| Status | Background | Text |
|--------|------------|------|
| Paid | #4CAF50 (Green) | White |
| Unpaid | #FF9800 (Orange) | White |
| Partially Paid | #FF9800 (Orange) | White |
| Overdue | #F44336 (Red) | White |

**Rationale**:
- Matches existing `InvoiceStatusBadge` and `PaymentStatusBadge` components
- Consistent with design system semantic colors
- No changes required

---

## Dependencies

### Existing Code to Reuse

| Component/Hook | Location | Purpose |
|----------------|----------|---------|
| `PaymentModal` | `src/components/vendors/PaymentModal.tsx` | Reuse for "Pay This Invoice" |
| `InvoiceStatusBadge` | `src/components/vendors/InvoiceStatusBadge.tsx` | Status display |
| `PaymentStatusBadge` | `src/components/vendors/PaymentStatusBadge.tsx` | Status display |
| `useVendorInvoices` | `src/hooks/useVendorInvoices.ts` | Fetch invoices |
| `useVendorPayments` | `src/hooks/useVendorPayments.ts` | Fetch payments |
| `formatCurrency` | `src/lib/vendorInvoiceStatus.ts` | Currency formatting |

### New Code Required

| Component/Hook | Location | Purpose |
|----------------|----------|---------|
| `useVendorTotals` | `src/hooks/useVendorTotals.ts` | Financial summary data |
| `VendorTotalsSummary` | `src/components/vendors/VendorTotalsSummary.tsx` | Financial summary card |
| `useCreatePaymentFromInvoice` | `src/hooks/useVendorPaymentMutations.ts` | New mutation |
| `useUpdateInvoiceStatus` | `src/hooks/useVendorInvoiceMutations.ts` | Status update mutation |

### Modifications Required

| File | Changes |
|------|---------|
| `VendorDetailPage.tsx` | Reorder tabs |
| `InvoicesTab.tsx` | Add summary card, "Pay This Invoice" button |
| `PaymentsTab.tsx` | Add summary card, Invoice column |
| `useVendorPaymentMutations.ts` | Extend `markAsPaid` to update linked invoice status |
| `types/vendor.ts` | Add `VendorTotals` interface |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Race condition on status update | Invoice status could be stale | Use query invalidation, not optimistic updates |
| Performance with many invoices | Slow totals calculation | Monitor, add Supabase RPC if needed |
| Partial payment edge cases | Incorrect status | Thorough testing of edge cases |

---

## Conclusion

All research questions have been resolved. The implementation follows established patterns from Phase 7B and requires no database migrations or new external dependencies.

**Ready for**: Phase 1 (Design & Contracts)
