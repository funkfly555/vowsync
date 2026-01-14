# Tasks: Vendor Management System (Phase 7A)

**Input**: Design documents from `/specs/008-vendor-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: NO automated tests per constitution - manual testing with Playwright MCP only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Web (single frontend)
- **Base path**: `src/` at repository root
- **Components**: `src/components/vendors/`
- **Hooks**: `src/hooks/`
- **Pages**: `src/pages/vendors/`
- **Types**: `src/types/`
- **Schemas**: `src/schemas/`

---

## Phase 1: Setup

**Purpose**: Create directory structure for vendor management feature

- [x] T001 Create vendors component directory at src/components/vendors/
- [x] T002 Create vendors pages directory at src/pages/vendors/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, schemas, and hooks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create Vendor type interfaces in src/types/vendor.ts (Vendor, VendorType, VendorStatus, ContractStatusBadge, PaymentStatusBadge)
- [x] T004 Create VendorDisplay interface with computed fields in src/types/vendor.ts
- [x] T005 Create VendorFilters interface and DEFAULT_VENDOR_FILTERS in src/types/vendor.ts
- [x] T006 Create VendorFormData interface and DEFAULT_VENDOR_FORM in src/types/vendor.ts
- [x] T007 Implement calculateContractStatus function in src/types/vendor.ts (FR-012)
- [x] T008 Implement calculatePaymentStatus placeholder function in src/types/vendor.ts (FR-013)
- [x] T009 Implement maskAccountNumber and toVendorDisplay functions in src/types/vendor.ts
- [x] T010 Create Zod validation schema with VENDOR_TYPES constant in src/schemas/vendor.ts (FR-007, FR-019, FR-020, FR-021)
- [x] T011 [P] Create ContractStatusBadge component in src/components/vendors/ContractStatusBadge.tsx
- [x] T012 [P] Create PaymentStatusBadge component in src/components/vendors/PaymentStatusBadge.tsx

**Checkpoint**: Foundation ready - all types, schemas, and badge components available for user stories

---

## Phase 3: User Story 1 - View and Search Vendors (Priority: P1) 🎯 MVP

**Goal**: Display vendors in card grid with search functionality so consultants can view and find vendors

**Independent Test**: Navigate to /weddings/:weddingId/vendors and verify card grid displays with search working (300ms debounce)

**Acceptance Criteria**:
- Card grid: 3 columns desktop, 2 tablet, 1 mobile
- Each card shows: type icon, company name, contact name, contract badge, payment badge
- Search filters by company_name and contact_name with 300ms debounce
- Empty state when no vendors or no search results

### Implementation for User Story 1

- [x] T013 [US1] Create useVendors hook with TanStack Query in src/hooks/useVendors.ts (fetches all vendors for wedding, transforms to VendorDisplay)
- [x] T014 [US1] Create useDebouncedValue hook if not exists in src/hooks/useDebouncedValue.ts (300ms debounce for search)
- [x] T015 [US1] Create VendorCard component in src/components/vendors/VendorCard.tsx (FR-002: type icon, company name, contact name, badges, hover effect)
- [x] T016 [US1] Create VendorEmptyState component in src/components/vendors/VendorEmptyState.tsx (FR-005: no vendors or no search results)
- [x] T017 [US1] Create VendorList component in src/components/vendors/VendorList.tsx (FR-001: responsive grid, search input, renders VendorCards)
- [x] T018 [US1] Create VendorsPage component in src/pages/vendors/VendorsPage.tsx (page header with title, "Add Vendor" button placeholder, VendorList)
- [x] T019 [US1] Add vendor list route in src/App.tsx (/weddings/:weddingId/vendors → VendorsPage)

**Checkpoint**: User Story 1 complete - consultants can view all vendors in card grid and search by name

---

## Phase 4: User Story 2 - Add New Vendor (Priority: P1) 🎯 MVP

**Goal**: Allow consultants to create new vendors with 3-tab modal form

**Independent Test**: Click "Add Vendor" button, fill form across all 3 tabs, save, and verify vendor appears in list

**Acceptance Criteria**:
- Modal with 3 tabs: Basic Info, Contract Details, Banking Information
- Required fields: vendor_type, company_name, contact_name
- Contract fields only visible when contract_signed is checked (FR-008)
- Insurance fields only visible when insurance_required is checked
- Validation errors displayed on form

### Implementation for User Story 2

- [x] T020 [US2] Create useVendorMutations hook with create mutation in src/hooks/useVendorMutations.ts (invalidates vendors query on success)
- [x] T021 [P] [US2] Create VendorBasicInfoTab component in src/components/vendors/VendorBasicInfoTab.tsx (vendor_type, company_name, contact_name, email, phone, address, website, notes, status)
- [x] T022 [P] [US2] Create VendorContractTab component in src/components/vendors/VendorContractTab.tsx (FR-008: conditional fields based on contract_signed and insurance_required)
- [x] T023 [P] [US2] Create VendorBankingTab component in src/components/vendors/VendorBankingTab.tsx (bank_name, account_name, account_number, branch_code, swift_code)
- [x] T024 [US2] Create VendorModal component in src/components/vendors/VendorModal.tsx (3-tab modal, React Hook Form + Zod, max-w-3xl)
- [x] T025 [US2] Integrate VendorModal into VendorsPage for create mode in src/pages/vendors/VendorsPage.tsx (open modal from "Add Vendor" button)

**Checkpoint**: User Story 2 complete - consultants can add new vendors with full form validation

---

## Phase 5: User Story 3 - Edit Existing Vendor (Priority: P2)

**Goal**: Allow consultants to edit vendor information through pre-populated modal

**Independent Test**: Click edit icon on vendor card, modify data, save, and verify changes persist

**Acceptance Criteria**:
- Modal opens pre-populated with current vendor data across all 3 tabs (FR-009)
- Same validation as create mode
- Changes reflected in card after save

### Implementation for User Story 3

- [x] T026 [US3] Add update mutation to useVendorMutations hook in src/hooks/useVendorMutations.ts
- [x] T027 [US3] Update VendorModal to support edit mode with pre-populated data in src/components/vendors/VendorModal.tsx
- [x] T028 [US3] Add edit button to VendorCard that opens modal in edit mode in src/components/vendors/VendorCard.tsx
- [x] T029 [US3] Integrate edit modal trigger into VendorsPage in src/pages/vendors/VendorsPage.tsx

**Checkpoint**: User Story 3 complete - consultants can edit existing vendor information

---

## Phase 6: User Story 4 - Delete Vendor (Priority: P2)

**Goal**: Allow consultants to delete vendors with confirmation dialog

**Independent Test**: Click delete icon on vendor card, confirm in dialog, verify vendor removed from list

**Acceptance Criteria**:
- Confirmation dialog warns about cascade deletion (FR-010, FR-011)
- Cancel closes dialog without deletion
- Delete removes vendor and refreshes list

### Implementation for User Story 4

- [x] T030 [US4] Add delete mutation to useVendorMutations hook in src/hooks/useVendorMutations.ts
- [x] T031 [US4] Create DeleteVendorDialog component in src/components/vendors/DeleteVendorDialog.tsx (Shadcn AlertDialog, warning about cascade delete)
- [x] T032 [US4] Add delete button to VendorCard that opens confirmation dialog in src/components/vendors/VendorCard.tsx
- [x] T033 [US4] Integrate delete dialog into VendorsPage in src/pages/vendors/VendorsPage.tsx

**Checkpoint**: User Story 4 complete - consultants can delete vendors with cascade behavior

---

## Phase 7: User Story 5 - View Vendor Details (Priority: P2)

**Goal**: Dedicated vendor detail page with tabbed interface

**Independent Test**: Click vendor card (not icons), navigate to detail page, verify tabs and content display correctly

**Acceptance Criteria**:
- Route: /weddings/:weddingId/vendors/:vendorId (FR-014)
- Tabs: Overview, Contract, Payments, Invoices (FR-015)
- Overview tab: basic info + banking details (FR-016)
- Contract tab: contract fields + insurance info (FR-017)
- Payments/Invoices tabs: placeholder messages (FR-018)

### Implementation for User Story 5

- [x] T034 [US5] Create useVendor hook for single vendor fetch in src/hooks/useVendor.ts (TanStack Query, transforms to VendorDisplay)
- [x] T035 [P] [US5] Create VendorOverviewTab component in src/components/vendors/VendorOverviewTab.tsx (basic info card, banking info card)
- [x] T036 [P] [US5] Create VendorContractTabView component in src/components/vendors/VendorContractTabView.tsx (read-only contract details, insurance status)
- [x] T037 [US5] Create VendorDetailPage component in src/pages/vendors/VendorDetailPage.tsx (FR-015: tabbed interface with 4 tabs, placeholder for Payments/Invoices)
- [x] T038 [US5] Add vendor detail route in src/App.tsx (/weddings/:weddingId/vendors/:vendorId → VendorDetailPage)
- [x] T039 [US5] Update VendorCard to navigate to detail page on card click in src/components/vendors/VendorCard.tsx

**Checkpoint**: User Story 5 complete - consultants can view detailed vendor information on dedicated page

---

## Phase 8: User Story 6 - Filter Vendors (Priority: P3)

**Goal**: Advanced filtering by vendor type, contract status, and payment status

**Independent Test**: Apply various filter combinations and verify correct vendors are displayed

**Acceptance Criteria**:
- Type filter dropdown with all vendor types (FR-004)
- Contract status filter: All, Signed, Unsigned, Expiring Soon, Expired
- Payment status filter: All, Paid, Pending, Overdue, Due Soon
- Multiple filters combine with AND logic
- Clear Filters button resets all filters

### Implementation for User Story 6

- [x] T040 [US6] Create VendorFilters component in src/components/vendors/VendorFilters.tsx (type dropdown, contract status dropdown, payment status dropdown, clear button)
- [x] T041 [US6] Add filter state management to VendorList in src/components/vendors/VendorList.tsx (combine with search)
- [x] T042 [US6] Implement client-side filter logic in useVendors hook in src/hooks/useVendors.ts (filter by type, contract status, payment status)
- [x] T043 [US6] Integrate VendorFilters into VendorsPage in src/pages/vendors/VendorsPage.tsx

**Checkpoint**: User Story 6 complete - consultants can filter vendors by multiple criteria

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, edge cases, and accessibility improvements

- [x] T044 Add loading states to VendorsPage (skeleton cards) in src/pages/vendors/VendorsPage.tsx
- [x] T045 Add loading state to VendorDetailPage in src/pages/vendors/VendorDetailPage.tsx
- [x] T046 Add error handling with toast notifications to all mutations in src/hooks/useVendorMutations.ts
- [x] T047 Add error boundary wrapper to VendorsPage in src/pages/vendors/VendorsPage.tsx
- [x] T048 Verify keyboard navigation and focus management in all vendor components
- [x] T049 Verify responsive design (mobile, tablet, desktop) for VendorList grid
- [x] T050 Add masked account number display to VendorCard in src/components/vendors/VendorCard.tsx
- [x] T051 Run manual testing with Playwright MCP per quickstart.md checklist

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS ALL USER STORIES
    ↓
┌───────────────────────────────────────────────────────┐
│  User Stories can proceed in priority order:          │
│                                                       │
│  Phase 3 (US1: View/Search) 🎯 MVP                   │
│      ↓                                                │
│  Phase 4 (US2: Add Vendor) 🎯 MVP                    │
│      ↓                                                │
│  Phase 5 (US3: Edit Vendor) ← depends on US2 modal   │
│  Phase 6 (US4: Delete Vendor) ← can parallel with US3│
│  Phase 7 (US5: Detail Page) ← can parallel with US3-4│
│      ↓                                                │
│  Phase 8 (US6: Filters) ← extends US1                │
└───────────────────────────────────────────────────────┘
    ↓
Phase 9 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (View/Search) | Phase 2 | Foundation complete |
| US2 (Add Vendor) | US1 (needs page to add to) | US1 complete |
| US3 (Edit Vendor) | US2 (shares modal) | US2 complete |
| US4 (Delete Vendor) | US1 (needs cards) | US1 complete |
| US5 (Detail Page) | US1 (needs card click) | US1 complete |
| US6 (Filters) | US1 (extends list) | US1 complete |

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
```bash
# Can run in parallel:
Task T011: ContractStatusBadge component
Task T012: PaymentStatusBadge component
```

**Within Phase 4 (US2)**:
```bash
# Can run in parallel:
Task T021: VendorBasicInfoTab component
Task T022: VendorContractTab component
Task T023: VendorBankingTab component
```

**Within Phase 7 (US5)**:
```bash
# Can run in parallel:
Task T035: VendorOverviewTab component
Task T036: VendorContractTabView component
```

**After US1 Complete**:
```bash
# These stories can proceed in parallel if team capacity allows:
- US4 (Delete) - independent feature
- US5 (Detail Page) - independent feature
- US6 (Filters) - extends US1
```

---

## Parallel Example: Foundation Phase

```bash
# Launch badge components together (T011, T012):
Task: "Create ContractStatusBadge component in src/components/vendors/ContractStatusBadge.tsx"
Task: "Create PaymentStatusBadge component in src/components/vendors/PaymentStatusBadge.tsx"
```

## Parallel Example: US2 Tab Components

```bash
# Launch all tab components together (T021, T022, T023):
Task: "Create VendorBasicInfoTab component in src/components/vendors/VendorBasicInfoTab.tsx"
Task: "Create VendorContractTab component in src/components/vendors/VendorContractTab.tsx"
Task: "Create VendorBankingTab component in src/components/vendors/VendorBankingTab.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T012)
3. Complete Phase 3: User Story 1 - View/Search (T013-T019)
4. Complete Phase 4: User Story 2 - Add Vendor (T020-T025)
5. **STOP and VALIDATE**: Test viewing vendors and adding new vendors
6. Deploy/demo if ready - users can view and create vendors

### Incremental Delivery

| Increment | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 + US2 | View vendors, add vendors |
| +1 | US3 | Edit vendor information |
| +2 | US4 | Delete unwanted vendors |
| +3 | US5 | Detailed vendor view |
| +4 | US6 | Advanced filtering |
| Final | Polish | Error handling, loading states |

### Story Point Estimates

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Setup | 2 | Trivial |
| Foundational | 10 | Medium (types, schemas) |
| US1 View/Search | 7 | Medium (hooks, grid, search) |
| US2 Add Vendor | 6 | High (3-tab modal) |
| US3 Edit Vendor | 4 | Low (reuses modal) |
| US4 Delete Vendor | 4 | Low (dialog) |
| US5 Detail Page | 6 | Medium (new page, tabs) |
| US6 Filters | 4 | Low (extends US1) |
| Polish | 8 | Low (refinements) |
| **Total** | **51** | |

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 51 |
| Setup tasks | 2 |
| Foundational tasks | 10 |
| US1 tasks | 7 |
| US2 tasks | 6 |
| US3 tasks | 4 |
| US4 tasks | 4 |
| US5 tasks | 6 |
| US6 tasks | 4 |
| Polish tasks | 8 |
| Parallel opportunities | 8 task groups |
| MVP scope | US1 + US2 (25 tasks) |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- NO automated tests per VowSync constitution - manual testing only
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Follow Phase 6B (Guest Management) patterns for consistency
