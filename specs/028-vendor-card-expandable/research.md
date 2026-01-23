# Research: Vendor Card Expandable

**Feature**: 028-vendor-card-expandable
**Date**: 2026-01-23
**Status**: Complete

## Research Questions

### RQ1: What existing patterns can we reuse?

**Answer**: The GuestCard expandable pattern from Phase 021 provides a complete, tested implementation.

**Key Pattern Files**:
| File | Purpose | Reuse Strategy |
|------|---------|----------------|
| `GuestCard.tsx` | Main container with SaveStatus, FormProvider, auto-save | Copy structure, adapt for vendor fields |
| `GuestCardCollapsed.tsx` | Collapsed summary with checkbox, badges, chevron | Copy structure, adapt display fields |
| `GuestCardExpanded.tsx` | Expanded view with tabs, AutoSaveIndicator | Copy structure, change tab content |
| `GuestTabs.tsx` | Tab navigation component | Copy, change tab definitions |
| `BasicInfoTab.tsx` | Form fields with react-hook-form | Copy form field patterns |

**Pattern Highlights**:
- `SaveStatus` type: `'idle' | 'saving' | 'saved' | 'error'`
- Auto-save with 500ms debounce using `watch()` subscription
- `FormProvider` wraps expanded content for form context
- `expandedCards: Set<string>` for O(1) expand state lookup
- Transition: `max-h-[2000px] opacity-100` / `max-h-0 opacity-0 overflow-hidden`

### RQ2: What is the exact database schema for related tables?

**Answer**: Verified from `src/types/vendor.ts`:

**VendorPaymentSchedule**:
```typescript
interface VendorPaymentSchedule {
  id: string;
  vendor_id: string;
  milestone_name: string;
  due_date: string;
  amount: number;
  percentage: number | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

**VendorInvoice**:
```typescript
interface VendorInvoice {
  id: string;
  vendor_id: string;
  payment_schedule_id: string | null;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  vat_amount: number;
  total_amount: number; // Generated column in DB
  status: 'unpaid' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  paid_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

**VendorContact**:
```typescript
interface VendorContact {
  id: string;
  vendor_id: string;
  contact_name: string;
  contact_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_primary: boolean;
  is_onsite_contact: boolean;
  created_at: string;
  updated_at: string;
}
```

### RQ3: What existing hooks and mutations exist for vendors?

**Answer**: Need to check existing vendor hooks.

**Existing**:
- `useVendors(weddingId)` - Fetches vendor list
- `useUpdateVendor` - Updates vendor fields (may need expansion)
- `useVendorPaymentSchedule(vendorId)` - Fetches payments for a vendor
- `useVendorInvoices(vendorId)` - Fetches invoices for a vendor
- `useVendorContacts(vendorId)` - Fetches contacts for a vendor

**Needed**:
- Optimistic update pattern for inline editing
- `markPaymentAsPaid(paymentId, paidDate)` mutation
- `markInvoiceAsPaid(invoiceId, paidDate)` mutation

### RQ4: What validation rules are needed?

**Answer**: Based on business rules from spec:

| Field | Rule | Implementation |
|-------|------|----------------|
| vendor_type | Required | `z.nativeEnum(VendorType)` |
| company_name | Required, non-empty | `z.string().min(1)` |
| contact_name | Required, non-empty | `z.string().min(1)` |
| contact_email | Valid email if provided | `z.string().email().optional().or(z.literal(''))` |
| website | Valid URL if provided | `z.string().url().optional().or(z.literal(''))` |
| contract_expiry_date | >= contract_date | `.refine()` on schema |
| contract_value | Positive or null | `z.number().positive().nullable()` |
| cancellation_fee_percentage | 0-100 or null | `z.number().min(0).max(100).nullable()` |
| status | Valid enum | `z.enum(['active', 'inactive', 'backup'])` |

### RQ5: What are the contract status badge rules?

**Answer**: From `calculateContractStatus()` in `src/types/vendor.ts`:

```typescript
// If not signed → Unsigned (yellow)
// If signed but no expiry → Signed (green)
// If expiry < today → Expired (red)
// If expiry <= today + 30 days → Expiring Soon (orange)
// Otherwise → Signed (green)
```

**Badge Config** (from `CONTRACT_STATUS_CONFIG`):
- Signed: `text-green-700 bg-green-100`
- Unsigned: `text-yellow-700 bg-yellow-100`
- Expiring Soon: `text-orange-700 bg-orange-100`
- Expired: `text-red-700 bg-red-100`

### RQ6: How should payment summary be displayed?

**Answer**: Show "X of Y paid" where:
- X = count of payments with status = 'paid'
- Y = total count of payments

If no payments exist, show "-" or "No payments"

### RQ7: What are the empty state messages?

**Answer**: Per spec edge cases:
- Payments tab (no payments): "No payment milestones have been added for this vendor."
- Invoices tab (no invoices): "No invoices have been recorded for this vendor."
- Contacts tab (no contacts): "No additional contacts have been added for this vendor."

## Technology Decisions

### TD1: Form State Management

**Decision**: Use React Hook Form with FormProvider
**Rationale**:
- Matches GuestCard pattern
- Built-in validation with Zod resolver
- `watch()` enables debounced auto-save
- Efficient re-renders with subscription model

### TD2: Data Fetching for Related Tables

**Decision**: Fetch payments, invoices, contacts lazily when tab is activated
**Rationale**:
- Reduces initial load time
- Data is tab-specific
- TanStack Query caches results
- User may not view all tabs

**Implementation**:
```typescript
// In PaymentsTab.tsx
const { data: payments } = useVendorPaymentSchedule(vendorId);
```

### TD3: Auto-Save Debounce Timing

**Decision**: 500ms debounce (matching GuestCard)
**Rationale**:
- Fast enough for responsive feel
- Slow enough to batch rapid typing
- Proven timing from Guest implementation

### TD4: Account Number Masking

**Decision**: Use existing `maskAccountNumber()` from `src/types/vendor.ts`
**Rationale**:
- Function already exists and tested
- Returns `****1234` format
- Handles null/short values

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Should tabs load data lazily? | Yes, fetch on tab activation |
| How to handle payment method for Mark as Paid? | Skip for MVP, can enhance later |
| Should banking info be editable? | No, read-only display with masked account |
| Reset tab on collapse? | Yes, reset to Overview on re-expand |

## References

- [spec.md](./spec.md) - Feature specification
- [CARD-TABLE-VIEW-PATTERN.md](/docs/CARD-TABLE-VIEW-PATTERN.md) - Implementation pattern
- [src/types/vendor.ts](/src/types/vendor.ts) - Type definitions
- [src/components/guests/GuestCard.tsx](/src/components/guests/GuestCard.tsx) - Pattern reference
