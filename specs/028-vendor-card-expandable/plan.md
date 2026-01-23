# Implementation Plan: Vendor Card Expandable

**Branch**: `028-vendor-card-expandable` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/028-vendor-card-expandable/spec.md`

## Summary

Implement expandable vendor cards with 5 tabs (Overview, Contract, Payments, Invoices, Contacts) matching the established Guest page expandable card pattern. Cards display a collapsed summary view showing company name, vendor type badge, contact name, contract status badge, and payment summary, with inline editing in expanded state using auto-save with optimistic updates.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (existing tables: vendors, vendor_contacts, vendor_payment_schedule, vendor_invoices)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Desktop-first, responsive)
**Project Type**: Web application (single codebase)
**Performance Goals**: Card expand < 200ms, auto-save < 3s, "Expand All" with 20 vendors < 500ms
**Constraints**: Smooth 60fps animations, O(1) lookup for expanded state
**Scale/Scope**: ~50 vendors per wedding typical, up to 100 for large weddings

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
| VI. Business Logic | Accurate validations (email, URL, dates, numbers, percentages) | ✅ |
| VII. Security | RLS, no API key exposure, input validation (Zod) | ✅ |
| VIII. Testing | Manual testing with Playwright MCP only | ✅ |
| IX. Error Handling | Toast notifications, optimistic updates with rollback | ✅ |
| X. Performance | Lazy loading tabs, 0.2s animations, O(1) expand lookup | ✅ |
| XI. API Handling | Standard Supabase response pattern | ✅ |
| XII. Git Workflow | Feature branch 028-vendor-card-expandable | ✅ |
| XIII. Documentation | JSDoc for complex functions, follow pattern docs | ✅ |
| XIV. Environment | Uses existing .env, no new secrets | ✅ |
| XV. Prohibited | No violations (no 'any', no custom CSS, no class components) | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/028-vendor-card-expandable/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.md
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── vendor.ts                         # Existing - has all vendor types
│
├── components/vendors/
│   ├── VendorCard.tsx                    # REPLACE - Main expandable card container
│   ├── VendorCardCollapsed.tsx           # NEW - Collapsed summary view
│   ├── VendorCardExpanded.tsx            # NEW - Expanded view with tabs
│   ├── VendorTabs.tsx                    # NEW - Tab navigation component
│   │
│   └── tabs/                             # NEW - Tab content components
│       ├── index.ts                      # Barrel export
│       ├── OverviewTab.tsx               # Basic vendor info + contact
│       ├── ContractTab.tsx               # Contract details + insurance
│       ├── PaymentsTab.tsx               # Payment schedule table
│       ├── InvoicesTab.tsx               # Invoices table
│       └── ContactsTab.tsx               # Contacts table
│
├── hooks/
│   └── useVendorMutations.ts             # UPDATE - Add vendor update mutation
│
├── schemas/
│   └── vendor.ts                         # NEW - Zod validation schemas
│
└── pages/vendors/
    └── VendorsPage.tsx                   # UPDATE - Add expand/collapse state management
```

**Structure Decision**: Following established CARD-TABLE-VIEW-PATTERN.md Section 3 (Card View Pattern) and GuestCard component hierarchy from Phase 021. Reuse patterns from GuestCardCollapsed.tsx, GuestCardExpanded.tsx, and GuestTabs.tsx.

## Complexity Tracking

> No constitutional violations requiring justification.

---

## Phase 0: Research Summary

### R1: Existing Pattern Analysis

**Decision**: Follow GuestCard expandable pattern from Phase 021
**Rationale**: Pattern is proven, well-documented, and follows constitution
**Files to Reference**:
- `src/components/guests/GuestCard.tsx` - Main container with SaveStatus, auto-save, FormProvider
- `src/components/guests/GuestCardCollapsed.tsx` - Collapsed view structure
- `src/components/guests/GuestCardExpanded.tsx` - Expanded view with tabs and AutoSaveIndicator
- `src/components/guests/GuestTabs.tsx` - Tab navigation component
- `src/components/guests/tabs/BasicInfoTab.tsx` - Form field patterns

### R2: Database Field Mapping

**Decision**: Use exact snake_case field names from vendors table (27 fields)
**Verified Fields** (from src/types/vendor.ts):

**Basic Info (Overview Tab)**:
- id, wedding_id, vendor_type, company_name, contact_name
- contact_email, contact_phone, address, website, notes, status

**Contract Details (Contract Tab)**:
- contract_signed, contract_date, contract_expiry_date, contract_value
- cancellation_policy, cancellation_fee_percentage

**Insurance (Contract Tab)**:
- insurance_required, insurance_verified, insurance_expiry_date

**Banking (Contract Tab - Read-only display)**:
- bank_name, account_name, account_number, branch_code, swift_code

**Metadata**:
- created_at, updated_at

### R3: Related Tables

**vendor_payment_schedule** (Payments Tab):
- id, vendor_id, milestone_name, due_date, amount, percentage
- status (pending/paid/overdue/cancelled), paid_date, payment_method, payment_reference, notes

**vendor_invoices** (Invoices Tab):
- id, vendor_id, payment_schedule_id, invoice_number, invoice_date, due_date
- amount, vat_amount, total_amount, status (unpaid/paid/partially_paid/overdue/cancelled)
- paid_date, payment_method, payment_reference, notes

**vendor_contacts** (Contacts Tab):
- id, vendor_id, contact_name, contact_role, contact_email, contact_phone
- is_primary, is_onsite_contact

### R4: Tab Structure Decision

**Decision**: 5 tabs matching spec requirements
| Tab | Content | Editable Fields |
|-----|---------|-----------------|
| Overview | Basic vendor info, contact details, status, notes | All fields |
| Contract | Contract details, insurance, banking | Contract + insurance fields; banking read-only |
| Payments | Payment schedule table | Status (Mark as Paid action) |
| Invoices | Invoices table | Status (Mark as Paid action) |
| Contacts | Contacts table | Read-only display |

### R5: Validation Rules

**Decision**: Implement in Zod schema with field-level validation

| Field | Validation Rule |
|-------|----------------|
| vendor_type | Required, must be valid VendorType enum |
| company_name | Required, non-empty string |
| contact_name | Required, non-empty string |
| contact_email | Optional, valid email format if provided |
| website | Optional, must start with http:// or https:// if provided |
| contract_expiry_date | Must be >= contract_date if both present |
| contract_value | Must be positive number or null |
| cancellation_fee_percentage | Must be 0-100 or null |
| status | Must be 'active', 'inactive', or 'backup' |

### R6: Design System Specifications

**Colors** (from spec input):
- Primary: #D4A5A5 (dusty rose)
- Primary Hover: #C99595
- Success: #4CAF50
- Selection: bg-[#D4A5A5]/10 (10% opacity)
- Border: #E8E8E8
- Text Primary: #2C2C2C
- Text Secondary: #5C4B4B
- Muted: #6B7280

**Card Styling**:
- Border radius: 8px (rounded-lg)
- Padding: 24px (p-6)
- Shadow default: 0 2px 8px rgba(0,0,0,0.08)
- Shadow hover: 0 4px 12px rgba(0,0,0,0.12)
- Transition: 0.2s ease

**Tab Styling**:
- Active: border-b-2 border-[#D4A5A5] text-[#D4A5A5]
- Inactive: border-transparent text-gray-500 hover:text-gray-700
- Height: 48px
- Font: 14px/500 (text-sm font-medium)

**Typography**:
- Card title: 20px/600 (text-xl font-semibold)
- Labels: 12px/500 uppercase tracking-wider
- Body: 14px/400 (text-sm)
- Badges: 12px/500 (text-xs font-medium)

---

## Phase 1: Data Model & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Primary Entity**: Vendor (existing type from src/types/vendor.ts)
**Related Entities**: VendorPaymentSchedule, VendorInvoice, VendorContact

### API Contracts

See [contracts/api-contracts.md](./contracts/api-contracts.md) for complete API definitions.

**Endpoints** (via Supabase client):
- `SELECT * FROM vendors WHERE wedding_id = :weddingId`
- `UPDATE vendors SET [field] = [value] WHERE id = :vendorId`
- `SELECT * FROM vendor_payment_schedule WHERE vendor_id = :vendorId`
- `UPDATE vendor_payment_schedule SET status = 'paid', paid_date = :date WHERE id = :paymentId`
- `SELECT * FROM vendor_invoices WHERE vendor_id = :vendorId`
- `UPDATE vendor_invoices SET status = 'paid', paid_date = :date WHERE id = :invoiceId`
- `SELECT * FROM vendor_contacts WHERE vendor_id = :vendorId`

### Quickstart

See [quickstart.md](./quickstart.md) for implementation guide.

---

## Implementation Phases

### Phase 1: Foundation (State Management + Types)

1. Update `src/pages/vendors/VendorsPage.tsx` to add:
   - `expandedCards: Set<string>` state
   - `handleToggleExpand`, `handleExpandAll`, `handleCollapseAll` callbacks
   - Pass expanded state to VendorCard components

2. Create `src/schemas/vendor.ts` with Zod validation schemas

### Phase 2: Card Components

3. Create `src/components/vendors/VendorCardCollapsed.tsx`:
   - Checkbox, company name, vendor type badge
   - Contact name, contract status badge, payment summary
   - Expand/collapse chevron

4. Create `src/components/vendors/VendorTabs.tsx`:
   - 5 tabs: Overview, Contract, Payments, Invoices, Contacts
   - Follow GuestTabs.tsx pattern

5. Create `src/components/vendors/VendorCardExpanded.tsx`:
   - Tab navigation, content rendering
   - AutoSaveIndicator footer

6. Replace `src/components/vendors/VendorCard.tsx`:
   - Main container with FormProvider
   - SaveStatus state, auto-save with debounce
   - Coordinate collapsed/expanded views

### Phase 3: Tab Components

7. Create `src/components/vendors/tabs/OverviewTab.tsx`:
   - Two-column layout: Basic Info (left), Contact Info (right)
   - Editable fields: vendor_type, company_name, contact_name, contact_email, contact_phone, address, website, status, notes

8. Create `src/components/vendors/tabs/ContractTab.tsx`:
   - Three sections: Contract Details, Insurance, Banking
   - Editable contract/insurance fields
   - Read-only banking display with masked account number

9. Create `src/components/vendors/tabs/PaymentsTab.tsx`:
   - Table: Milestone, Due Date, Amount, Status
   - "Mark as Paid" action button
   - Footer with total paid vs total contract value

10. Create `src/components/vendors/tabs/InvoicesTab.tsx`:
    - Table: Invoice #, Date, Due Date, Amount, VAT, Total, Status
    - "Mark as Paid" action button
    - Footer with total invoices amount

11. Create `src/components/vendors/tabs/ContactsTab.tsx`:
    - Table: Name, Role, Email, Phone, Primary, On-site
    - Primary contact visual indicator
    - Read-only display

12. Create `src/components/vendors/tabs/index.ts` barrel export

### Phase 4: Hooks & Integration

13. Update `src/hooks/useVendorMutations.ts`:
    - Add updateVendor mutation
    - Add markPaymentAsPaid mutation
    - Add markInvoiceAsPaid mutation

14. Wire up VendorsPage.tsx:
    - Pass all callbacks to VendorCard
    - Handle selection state with expand state

### Phase 5: Testing & Polish

15. Manual testing via Playwright MCP:
    - Test expand/collapse individual cards
    - Test expand/collapse all
    - Test each tab renders correctly
    - Test inline editing with auto-save
    - Test validation errors
    - Test Mark as Paid actions
    - Test selection state in both collapsed/expanded
    - Test keyboard navigation

16. Fix any styling/behavior issues
17. Verify animations are smooth (60fps)
