# Implementation Plan: Budget-Vendor Integration with Automatic Tracking

**Branch**: `029-budget-vendor-integration` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/029-budget-vendor-integration/spec.md`

## Summary

This feature implements automatic synchronization between vendor invoices/payments and the wedding budget system. When a wedding consultant creates an invoice for a vendor, a corresponding budget line item is automatically created in the linked budget category. When payments are recorded, the budget actuals update in real-time. The system provides 18 predefined wedding budget category types (Venue, Catering, Photography, etc.) and allows vendors to have a default budget category assignment for streamlined invoice creation.

**Technical Approach**: Database-first implementation with new `budget_category_types` lookup table, updates to `budget_categories`, `vendors`, and `budget_line_items` tables. Frontend integration through modified AddInvoiceModal with budget category selector, updated RecordPaymentModal with budget impact preview, and enhanced budget display components showing projected/actual/invoiced-unpaid/remaining breakdowns.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (existing tables: `budget_categories`, `budget_line_items`, `vendors`, `vendor_invoices`, `vendor_payment_schedule`)
**Testing**: Manual testing with Playwright MCP only
**Target Platform**: Web (React SPA via Vite)
**Project Type**: Web application (React frontend with Supabase backend)
**Performance Goals**: Budget updates within 2 seconds of invoice/payment creation, FCP < 1.2s, TTI < 3.5s
**Constraints**: All monetary values in South African Rand (ZAR), 15% VAT rate, 100% accuracy on budget calculations
**Scale/Scope**: Single wedding at a time, typical 10-50 vendors per wedding, 50-200 invoices per wedding

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

**Constitution Compliance Notes:**
- All database queries use snake_case field names (Supabase PostgreSQL convention)
- Budget calculations use formulas from Constitution VI (variance = actual - projected)
- New tables follow UUID PKs, RLS enabled, created_at/updated_at pattern
- Form validation via Zod, all inputs validated client and server side

## Project Structure

### Documentation (this feature)

```text
specs/029-budget-vendor-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── budget-category-types.ts
│   ├── budget-categories.ts
│   ├── budget-line-items.ts
│   └── vendor-budget-integration.ts
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── budget/
│   │   ├── BudgetCategoryCard.tsx        # UPDATE: Enhanced display
│   │   ├── BudgetCategoryForm.tsx        # UPDATE: Category type selector
│   │   ├── BudgetLineItemRow.tsx         # UPDATE: Payment status display
│   │   └── BudgetProgressBar.tsx         # NEW: Visual progress indicator
│   ├── vendors/
│   │   ├── modals/
│   │   │   ├── AddInvoiceModal.tsx       # UPDATE: Budget category selector
│   │   │   └── RecordPaymentModal.tsx    # UPDATE: Budget impact preview
│   │   ├── tabs/
│   │   │   └── OverviewTab.tsx           # UPDATE: Default budget category field
│   │   └── VendorCard.tsx                # UPDATE: Budget category badge
│   └── ui/                               # Existing Shadcn components
├── hooks/
│   ├── useBudgetCategories.ts            # UPDATE: Include category types
│   ├── useBudgetCategoryTypes.ts         # NEW: Fetch predefined types
│   ├── useBudgetLineItems.ts             # UPDATE: Invoice/payment integration
│   └── useVendorInvoiceMutations.ts      # UPDATE: Budget line item creation
├── lib/
│   ├── budgetCalculations.ts             # NEW: Calculation utilities
│   └── vendorInvoiceStatus.ts            # UPDATE: Budget integration
├── schemas/
│   ├── budgetCategory.ts                 # UPDATE: Category type validation
│   └── vendor.ts                         # UPDATE: Default category field
└── types/
    ├── budget.ts                         # UPDATE: New interfaces
    └── vendor.ts                         # UPDATE: Budget category reference
```

**Structure Decision**: Web application using existing VowSync `src/` structure. All new components follow established patterns in `components/budget/` and `components/vendors/`. Database operations through Supabase client in `lib/supabase.ts`. Type definitions in `types/`, validation schemas in `schemas/`, query hooks in `hooks/`.

## Complexity Tracking

> No constitutional violations requiring justification. Feature aligns with all 15 gates.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Lookup Table | New `budget_category_types` table | 18 predefined types need consistent ordering and potential future localization |
| Auto-Recalculation | Trigger-based in PostgreSQL | Ensures accuracy regardless of client; reduces round-trips |
| Budget Line Item Linking | 1:1 with vendor_invoice | Spec requirement: each invoice creates exactly one budget line item |
