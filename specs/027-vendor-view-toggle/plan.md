# Implementation Plan: Vendors View Toggle

**Branch**: `027-vendor-view-toggle` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/027-vendor-view-toggle/spec.md`

## Summary

Add Card/Table view toggle to the Vendors page, allowing wedding consultants to switch between visual card view and spreadsheet-like table view with inline editing, filtering, and sorting. Follows the established CARD-TABLE-VIEW-PATTERN.md from Phase 026 Guests implementation.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React, Zod
**Storage**: Supabase PostgreSQL (existing tables: vendors, vendor_contacts, vendor_payment_schedule, vendor_invoices)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Desktop-first, responsive)
**Project Type**: Web application (single codebase)
**Performance Goals**: View toggle < 1s, inline edit save < 3s, filter < 500ms
**Constraints**: Table scrolls smoothly with 100+ vendors
**Scale/Scope**: ~50 vendors per wedding typical, up to 500+ for large weddings

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | ✅ |
| II. Design System | Follows color palette (#D4A5A5), typography, spacing specs | ✅ |
| III. Database | UUID PKs, RLS enabled, proper constraints (existing tables) | ✅ |
| IV. Code Quality | TypeScript strict, functional components, proper naming | ✅ |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | ✅ |
| VI. Business Logic | Accurate validations (email, URL, dates, numbers) | ✅ |
| VII. Security | RLS, no API key exposure, input validation (Zod) | ✅ |
| VIII. Testing | Manual testing with Playwright MCP only | ✅ |
| IX. Error Handling | Toast notifications, optimistic updates with rollback | ✅ |
| X. Performance | Lazy loading, memoization, virtual scrolling if needed | ✅ |
| XI. API Handling | Standard Supabase response pattern | ✅ |
| XII. Git Workflow | Feature branch 027-vendor-view-toggle | ✅ |
| XIII. Documentation | JSDoc for complex functions, follow pattern docs | ✅ |
| XIV. Environment | Uses existing .env, no new secrets | ✅ |
| XV. Prohibited | No violations (no 'any', no custom CSS, no class components) | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/027-vendor-view-toggle/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── vendor-table.ts              # TypeScript interfaces for table view
│
├── lib/
│   └── vendor-table-utils.ts        # Transform, filter, sort utilities
│
├── hooks/
│   └── useVendorTableData.ts        # TanStack Query hook for table data
│
├── components/vendors/
│   ├── ViewToggle.tsx               # Reuse from guests (copy or make generic)
│   │
│   └── table/
│       ├── index.ts                 # Barrel export
│       ├── VendorTableView.tsx      # Main table container
│       ├── VendorTableHeader.tsx    # Header with sort/filter
│       ├── VendorTableRow.tsx       # Row with inline editing
│       ├── VendorTableCell.tsx      # Cell renderer (type-specific)
│       ├── ColumnFilterDropdown.tsx # Excel-style filter (copy from guests)
│       ├── ActiveFiltersBar.tsx     # Active filter badges (copy from guests)
│       └── tableColumns.ts          # Column definitions (27 fields + 3 aggregates)
│
└── pages/vendors/
    └── VendorsPage.tsx              # Update to include table view toggle
```

**Structure Decision**: Following established CARD-TABLE-VIEW-PATTERN.md from Phase 026. Most table components can be copied from guests/table/ and adapted for vendor data model.

## Complexity Tracking

> No constitutional violations requiring justification.

---

## Phase 0: Research Summary

### R1: Existing Pattern Analysis

**Decision**: Reuse CARD-TABLE-VIEW-PATTERN.md from Phase 026 Guests implementation
**Rationale**: Pattern is proven, well-documented, and follows constitution
**Files to Reference**:
- `docs/CARD-TABLE-VIEW-PATTERN.md` - Complete implementation guide
- `src/components/guests/table/*` - Working reference implementation
- `src/hooks/useGuestTableData.ts` - Data fetching pattern
- `src/lib/guest-table-utils.ts` - Utility functions

### R2: Database Field Mapping

**Decision**: Use exact snake_case field names from vendors table (27 fields)
**Verified Fields** (from Supabase schema):
- id, wedding_id, vendor_type, company_name, contact_name
- contact_email, contact_phone, address, website, notes, status
- contract_signed, contract_date, contract_expiry_date, contract_value
- cancellation_policy, cancellation_fee_percentage
- insurance_required, insurance_verified, insurance_expiry_date
- bank_name, account_name, account_number, branch_code, swift_code
- created_at, updated_at

**Aggregate Counts** (computed via Supabase count):
- contacts_count (from vendor_contacts)
- payments_count (from vendor_payment_schedule)
- invoices_count (from vendor_invoices)

### R3: Cell Type Mapping

**Decision**: Map vendor fields to appropriate cell types

| Cell Type | Fields |
|-----------|--------|
| text | company_name, contact_name, address, notes, cancellation_policy, bank_name, account_name, branch_code, swift_code |
| email | contact_email |
| phone | contact_phone |
| url | website |
| enum | vendor_type, status |
| boolean | contract_signed, insurance_required, insurance_verified |
| date | contract_date, contract_expiry_date, insurance_expiry_date |
| currency | contract_value |
| percentage | cancellation_fee_percentage |
| masked | account_number |
| number | contacts_count, payments_count, invoices_count (read-only) |
| datetime | created_at, updated_at (read-only) |

### R4: Component Reuse Strategy

**Decision**: Copy and adapt components from guests/table/
**Components to Copy**:
- `ColumnFilterDropdown.tsx` - Generic, works as-is
- `ActiveFiltersBar.tsx` - Generic, works as-is
- `ViewToggle.tsx` - May need slight adaptation for vendor context

**Components to Create New** (vendor-specific):
- `VendorTableView.tsx` - Main container
- `VendorTableHeader.tsx` - Vendor column categories
- `VendorTableRow.tsx` - Vendor row structure
- `VendorTableCell.tsx` - All cell types including new ones (masked, currency, percentage, url, phone)
- `tableColumns.ts` - Vendor-specific column definitions

### R5: Validation Rules

**Decision**: Implement in VendorTableCell using Zod validation before save

| Field | Validation Rule |
|-------|----------------|
| vendor_type | Required, must be valid enum value |
| company_name | Required, non-empty string |
| contact_name | Required, non-empty string |
| contact_email | Optional, valid email format if provided |
| website | Optional, must start with http:// or https:// if provided |
| contract_expiry_date | Must be >= contract_date if both present |
| insurance_expiry_date | Warning if in past when insurance_required=true |
| contract_value | Must be positive number or null |
| cancellation_fee_percentage | Must be 0-100 or null |
| status | Must be 'active', 'inactive', or 'backup' |

---

## Phase 1: Data Model & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Primary Entity**: VendorTableRow (extends Vendor with aggregate counts)
**Column Categories**: basic, contact, contract, insurance, banking, aggregates, metadata

### API Contracts

See [contracts/api-contracts.md](./contracts/api-contracts.md) for complete API definitions.

**Endpoints** (via Supabase client):
- `SELECT * FROM vendors WHERE wedding_id = :weddingId` + aggregate counts
- `UPDATE vendors SET [field] = [value] WHERE id = :vendorId`

### Quickstart

See [quickstart.md](./quickstart.md) for implementation guide.

---

## Implementation Phases

### Phase 1: Foundation (Types, Utils, Hook)

1. Create `src/types/vendor-table.ts` - TypeScript interfaces
2. Create `src/lib/vendor-table-utils.ts` - Utility functions
3. Create `src/hooks/useVendorTableData.ts` - Data fetching hook

### Phase 2: Table Components

4. Copy generic components from guests/table/
5. Create `src/components/vendors/table/tableColumns.ts`
6. Create `src/components/vendors/table/VendorTableCell.tsx`
7. Create `src/components/vendors/table/VendorTableRow.tsx`
8. Create `src/components/vendors/table/VendorTableHeader.tsx`
9. Create `src/components/vendors/table/VendorTableView.tsx`
10. Create barrel export `src/components/vendors/table/index.ts`

### Phase 3: Page Integration

11. Create/adapt `src/components/vendors/ViewToggle.tsx`
12. Update `src/pages/vendors/VendorsPage.tsx` to include view toggle

### Phase 4: Testing & Polish

13. Manual testing via Playwright MCP
14. Fix any styling/behavior issues
15. Verify all 30 columns render correctly (27 fields + 3 aggregates)
