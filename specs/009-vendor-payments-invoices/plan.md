# Implementation Plan: Vendor Payments & Invoices (Phase 7B)

**Branch**: `009-vendor-payments-invoices` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-vendor-payments-invoices/spec.md`

## Summary

Implement payment schedule and invoice tracking for vendors in the existing VendorDetailPage. This extends Phase 7A by replacing placeholder Payments and Invoices tabs with functional CRUD interfaces. Payment milestones support status badges (Pending, Due Soon, Overdue, Paid) based on date logic. Invoices support auto-calculated VAT totals. Vendor contacts enable multiple contact persons per vendor.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+
**Primary Dependencies**: React Hook Form, Zod, TanStack Query v5, Shadcn/ui, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (tables exist: `vendor_payment_schedule`, `vendor_invoices`, `vendor_contacts`)
**Testing**: Manual testing with Playwright MCP only (NO automated tests per constitution)
**Target Platform**: Web (Vite + React)
**Project Type**: Web (single frontend)
**Performance Goals**: Payment/invoice operations < 2s, form submissions < 1s
**Constraints**: Must integrate seamlessly with Phase 7A VendorDetailPage, no regressions
**Scale/Scope**: ~15 new components, 4 new hooks, 2 new schemas

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

## Project Structure

### Documentation (this feature)

```text
specs/009-vendor-payments-invoices/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── supabase-queries.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── vendors/
│       ├── PaymentsTab.tsx              # NEW - replaces placeholder
│       ├── PaymentScheduleTable.tsx     # NEW - payment list table
│       ├── PaymentModal.tsx             # NEW - add/edit payment modal
│       ├── MarkAsPaidDialog.tsx         # NEW - mark payment as paid
│       ├── DeletePaymentDialog.tsx      # NEW - delete confirmation
│       ├── PaymentStatusBadge.tsx       # NEW - status badge component
│       ├── InvoicesTab.tsx              # NEW - replaces placeholder
│       ├── InvoiceTable.tsx             # NEW - invoice list table
│       ├── InvoiceModal.tsx             # NEW - add/edit invoice modal
│       ├── InvoiceStatusBadge.tsx       # NEW - invoice status badge
│       ├── ContactsSection.tsx          # NEW - contacts list in Overview
│       ├── ContactModal.tsx             # NEW - add/edit contact modal
│       └── DeleteContactDialog.tsx      # NEW - delete contact confirmation
├── hooks/
│   ├── useVendorPayments.ts             # NEW - fetch payments for vendor
│   ├── useVendorPaymentMutations.ts     # NEW - CRUD for payments
│   ├── useVendorInvoices.ts             # NEW - fetch invoices for vendor
│   ├── useVendorInvoiceMutations.ts     # NEW - CRUD for invoices
│   ├── useVendorContacts.ts             # NEW - fetch contacts for vendor
│   └── useVendorContactMutations.ts     # NEW - CRUD for contacts
├── schemas/
│   ├── paymentSchedule.ts               # NEW - Zod validation
│   ├── invoice.ts                       # NEW - Zod validation
│   └── vendorContact.ts                 # NEW - Zod validation
├── types/
│   └── vendor.ts                        # EXTEND - add payment/invoice/contact types
├── lib/
│   └── vendorPaymentStatus.ts           # NEW - status calculation functions
└── pages/
    └── vendors/
        └── VendorDetailPage.tsx         # MODIFY - integrate new tabs
```

**Structure Decision**: Single web frontend following established VowSync patterns from Phase 7A.

## Complexity Tracking

> No constitution violations - all requirements met with standard patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
