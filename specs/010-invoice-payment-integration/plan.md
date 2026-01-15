# Implementation Plan: Vendor Invoice Payment Integration

**Branch**: `010-invoice-payment-integration` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-invoice-payment-integration/spec.md`

## Summary

Link vendor invoices to payments with proper workflow and totals so wedding consultants can track which invoices have been paid and see accurate financial summaries. This feature integrates the existing Phase 7B invoice and payment systems by adding a "Pay This Invoice" button, financial summary cards, automatic invoice status updates when payments are marked as paid, and an Invoice column in the Payments table.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (existing tables: `vendor_invoices`, `vendor_payment_schedule`)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Chrome, Firefox, Safari, Mobile browsers)
**Project Type**: Single SPA (Vite + React)
**Performance Goals**: Summary load < 500ms, Status update < 1s, Tab switch < 200ms
**Constraints**: No database migrations, reuse existing components, ZAR currency formatting
**Scale/Scope**: ~10 files modified/created, 5 user stories, 12 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] |
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

**All gates passed. No violations.**

## Project Structure

### Documentation (this feature)

```text
specs/010-invoice-payment-integration/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 - Technical decisions
├── data-model.md        # Phase 1 - Entity definitions
├── quickstart.md        # Phase 1 - Testing guide
├── contracts/           # Phase 1 - API contracts
│   └── api.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (next command)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── vendor.ts                 # UPDATE - add VendorTotals interface
│
├── hooks/
│   ├── useVendorTotals.ts        # NEW - fetch vendor totals
│   ├── useVendorInvoiceMutations.ts  # UPDATE - add useUpdateInvoiceStatus
│   └── useVendorPaymentMutations.ts  # UPDATE - add useCreatePaymentFromInvoice
│
├── components/vendors/
│   ├── VendorTotalsSummary.tsx   # NEW - financial summary card
│   ├── InvoicesTab.tsx           # UPDATE - add Pay button, summary
│   ├── PaymentsTab.tsx           # UPDATE - add Invoice column, summary
│   └── PaymentScheduleTable.tsx  # UPDATE - add Invoice column
│
├── pages/vendors/
│   └── VendorDetailPage.tsx      # UPDATE - reorder tabs
│
└── lib/
    └── vendorInvoiceStatus.ts    # UPDATE - add status calculation helpers
```

**Structure Decision**: Single SPA structure following existing Phase 7B patterns. All vendor components in `src/components/vendors/`, hooks in `src/hooks/`, types centralized in `src/types/vendor.ts`.

## Complexity Tracking

> No constitution violations. Feature uses existing schema and patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Phases

### Phase 1: Tab Reordering (FR-001)

**Files**: `src/pages/vendors/VendorDetailPage.tsx`

**Changes**:
- Reorder tabs from `[Overview, Contract, Payments, Invoices]`
- To: `[Overview, Contract, Invoices, Payments]`
- Update TabsContent order to match

**Effort**: Small (single file, ~5 lines)

---

### Phase 2: Types & Hook - Vendor Totals

**Files**:
- `src/types/vendor.ts` - Add `VendorTotals` interface
- `src/hooks/useVendorTotals.ts` - New hook

**Implementation**:
```typescript
// types/vendor.ts
interface VendorTotals {
  totalInvoiced: number;
  totalPaid: number;
  balanceDue: number;
}

// hooks/useVendorTotals.ts
export function useVendorTotals(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-totals', vendorId],
    queryFn: async () => {
      // Query invoices and paid payments
      // Calculate totals client-side
    },
    enabled: !!vendorId
  });
}
```

**Effort**: Medium (new hook with two queries)

---

### Phase 3: VendorTotalsSummary Component (FR-008, FR-009)

**Files**: `src/components/vendors/VendorTotalsSummary.tsx` (NEW)

**Features**:
- Card with three metrics: Total Invoiced, Total Paid, Balance Due
- ZAR currency formatting (R X,XXX.XX)
- Loading skeleton state
- Responsive layout (3-col desktop, stacked mobile)
- Balance Due highlighted if > 0

**Effort**: Medium (new component with styling)

---

### Phase 4: Pay This Invoice Button (FR-002, FR-003, FR-004)

**Files**:
- `src/hooks/useVendorPaymentMutations.ts` - Add `useCreatePaymentFromInvoice`
- `src/components/vendors/InvoicesTab.tsx` - Add button to table

**Implementation**:
- Button visible when `invoice.status !== 'paid'`
- On click: Opens PaymentModal with pre-filled values
- Pre-fill: milestone_name, due_date, amount from invoice
- Mutation creates payment + links invoice

**Effort**: Medium (mutation + UI integration)

---

### Phase 5: Invoice Column in Payments Table (FR-010, FR-011)

**Files**:
- `src/components/vendors/PaymentScheduleTable.tsx` - Add column
- `src/components/vendors/PaymentsTab.tsx` - Fetch invoice links

**Implementation**:
- Query invoices linked to payments via `payment_schedule_id`
- Display "Invoice #XXX" or "—" in new column
- Column appears after Amount, before Status

**Effort**: Medium (query modification + table column)

---

### Phase 6: Auto-Update Invoice Status (FR-005, FR-006, FR-007)

**Files**:
- `src/hooks/useVendorPaymentMutations.ts` - Extend `markAsPaid`
- `src/hooks/useVendorInvoiceMutations.ts` - Add `useUpdateInvoiceStatus`

**Implementation**:
- After marking payment as paid, find linked invoices
- Calculate new status: paid (amount >= total) or partially_paid (amount > 0)
- Update invoice status and paid_date
- Invalidate queries for immediate UI update

**Effort**: High (business logic + multiple queries)

---

### Phase 7: Financial Summary Integration

**Files**:
- `src/components/vendors/InvoicesTab.tsx` - Add VendorTotalsSummary
- `src/components/vendors/PaymentsTab.tsx` - Add VendorTotalsSummary

**Implementation**:
- Import and render VendorTotalsSummary at top of each tab
- Pass vendorId prop
- Summary updates automatically via query invalidation

**Effort**: Small (component integration)

---

## Dependencies

### Existing Components (Reuse)

| Component | Path | How Used |
|-----------|------|----------|
| PaymentModal | `src/components/vendors/PaymentModal.tsx` | Open with pre-filled values |
| InvoiceStatusBadge | `src/components/vendors/InvoiceStatusBadge.tsx` | Display status |
| PaymentStatusBadge | `src/components/vendors/PaymentStatusBadge.tsx` | Display status |
| formatCurrency | `src/lib/vendorInvoiceStatus.ts` | ZAR formatting |

### Existing Hooks (Extend)

| Hook | Path | Changes |
|------|------|---------|
| useVendorInvoices | `src/hooks/useVendorInvoices.ts` | May need join with payments |
| useVendorPayments | `src/hooks/useVendorPayments.ts` | May need join with invoices |
| useVendorPaymentMutations | `src/hooks/useVendorPaymentMutations.ts` | Add createFromInvoice, extend markAsPaid |
| useVendorInvoiceMutations | `src/hooks/useVendorInvoiceMutations.ts` | Add updateStatus |

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useVendorTotals.ts` | Fetch and calculate totals |
| `src/components/vendors/VendorTotalsSummary.tsx` | Summary card component |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Race condition on status update | Low | Medium | Use query invalidation, not optimistic updates |
| Performance with many invoices | Low | Low | Monitor, add RPC if needed |
| Partial payment edge cases | Medium | Medium | Thorough manual testing |
| Breaking existing functionality | Low | High | Test existing flows after changes |

---

## Success Criteria

From spec.md:

| ID | Criterion | Verification |
|----|-----------|--------------|
| SC-001 | Invoice-to-payment workflow < 60 seconds | Manual timing |
| SC-002 | Totals update within 2 seconds | Network timing |
| SC-003 | Invoice status updates within 1 second | UI observation |
| SC-004 | 100% of links preserved and displayed | Data verification |
| SC-005 | Overdue invoices identifiable at a glance | Visual check |
| SC-006 | Balance Due calculation always accurate | Multiple test cases |

---

## Next Steps

1. Run `/speckit.tasks` to generate tasks.md with implementation tasks
2. Implement tasks in order (Phase 1 → Phase 7)
3. Run Playwright MCP for E2E testing using quickstart.md checklist
4. Create PR for review

---

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Feature Spec | `specs/010-invoice-payment-integration/spec.md` | Complete |
| Requirements Checklist | `specs/010-invoice-payment-integration/checklists/requirements.md` | Complete |
| Research | `specs/010-invoice-payment-integration/research.md` | Complete |
| Data Model | `specs/010-invoice-payment-integration/data-model.md` | Complete |
| API Contracts | `specs/010-invoice-payment-integration/contracts/api.md` | Complete |
| Quickstart Guide | `specs/010-invoice-payment-integration/quickstart.md` | Complete |
| Implementation Plan | `specs/010-invoice-payment-integration/plan.md` | Complete |
| Tasks | `specs/010-invoice-payment-integration/tasks.md` | Pending (`/speckit.tasks`) |
