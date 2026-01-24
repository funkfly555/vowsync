# Tasks: Budget-Vendor Integration with Automatic Tracking

**Input**: Design documents from `/specs/029-budget-vendor-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and core type definitions

- [ ] T001 Apply database migration for budget_category_types table via Supabase SQL Editor (see data-model.md)
- [ ] T002 Apply database migration for budget_categories column additions via Supabase SQL Editor
- [ ] T003 Apply database migration for vendors column addition via Supabase SQL Editor
- [ ] T004 Apply database migration for budget_line_items column additions via Supabase SQL Editor
- [ ] T005 Create trigger function recalculate_budget_category_totals via Supabase SQL Editor
- [ ] T006 Create trigger function recalculate_wedding_budget_totals via Supabase SQL Editor
- [ ] T007 [P] Add BudgetCategoryType interface to src/types/budget.ts
- [ ] T008 [P] Add PaymentStatus type and BudgetLineItem interface updates to src/types/budget.ts
- [ ] T009 [P] Add BudgetCategoryDisplay interface with computed fields to src/types/budget.ts
- [ ] T010 [P] Update VendorDisplay interface with defaultBudgetCategoryId in src/types/vendor.ts
- [ ] T011 Create calculation utilities in src/lib/budgetCalculations.ts (formatCurrency, calculateVAT, calculateBudgetCategoryDisplay)

**Checkpoint**: Database schema complete, types defined - ready for user story implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks and utilities required by multiple user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T012 Create useBudgetCategoryTypes hook in src/hooks/useBudgetCategoryTypes.ts
- [ ] T013 Update useBudgetCategories hook to include category_type joins in src/hooks/useBudgetCategories.ts
- [ ] T014 [P] Update vendor Zod schema to include defaultBudgetCategoryId in src/schemas/vendor.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Invoice Creation with Budget Integration (Priority: P1) 🎯 MVP

**Goal**: When a wedding consultant creates an invoice for a vendor, a corresponding budget line item is automatically created in the linked budget category.

**Independent Test**: Create an invoice for a vendor and verify a budget line item appears in the linked budget category with correct projected cost (amount + 15% VAT).

### Implementation for User Story 1

- [ ] T015 [US1] Fetch wedding's budget categories in AddInvoiceModal from src/components/vendors/modals/AddInvoiceModal.tsx
- [ ] T016 [US1] Add budgetCategoryId field to AddInvoiceModal form schema in src/components/vendors/modals/AddInvoiceModal.tsx
- [ ] T017 [US1] Add budget category dropdown to AddInvoiceModal after amount field in src/components/vendors/modals/AddInvoiceModal.tsx
- [ ] T018 [US1] Pre-fill budget category dropdown with vendor's defaultBudgetCategoryId in AddInvoiceModal
- [ ] T019 [US1] Update useCreateInvoice mutation to create budget line item in src/hooks/useVendorInvoiceMutations.ts
- [ ] T020 [US1] Add budget line item creation with projected_cost = invoice total, actual_cost = 0, payment_status = 'unpaid'
- [ ] T021 [US1] Add error handling and toast notifications for budget integration failures

**Checkpoint**: User Story 1 complete - invoices now automatically create budget line items

---

## Phase 4: User Story 2 - Payment Recording with Budget Updates (Priority: P1)

**Goal**: When payments are recorded against invoices, the budget's actual spending updates automatically.

**Independent Test**: Record a payment against an existing invoice and verify the budget line item's actual_cost and category's actual_amount are updated.

**Depends on**: User Story 1 (needs invoices with budget line items to exist)

### Implementation for User Story 2

- [ ] T022 [US2] Calculate existing payments total in RecordPaymentModal from src/components/vendors/modals/RecordPaymentModal.tsx
- [ ] T023 [US2] Add payment validation to prevent exceeding remaining invoice balance in RecordPaymentModal
- [ ] T024 [US2] Create BudgetImpactPreview component showing current → new actual in src/components/vendors/modals/BudgetImpactPreview.tsx
- [ ] T025 [US2] Add BudgetImpactPreview to RecordPaymentModal before submit button
- [ ] T026 [US2] Update payment recording mutation to update budget_line_items.actual_cost in src/hooks/useVendorPaymentMutations.ts
- [ ] T027 [US2] Update payment recording mutation to set payment_status based on payment totals
- [ ] T028 [US2] Add error handling for budget update failures with toast notifications
- [ ] T029 [US2] Verify database triggers recalculate category and wedding totals automatically

**Checkpoint**: User Story 2 complete - payments now automatically update budget actuals

---

## Phase 5: User Story 3 - Budget Category Setup with Predefined Types (Priority: P2)

**Goal**: Wedding consultants can select from 18 predefined category types when creating budget categories.

**Independent Test**: Create a new budget category, select from the dropdown of predefined types, and verify the category is created with the correct type.

### Implementation for User Story 3

- [ ] T030 [P] [US3] Create category type selector component in src/components/budget/CategoryTypeSelector.tsx
- [ ] T031 [US3] Update BudgetCategoryForm to use CategoryTypeSelector in src/components/budget/BudgetCategoryForm.tsx
- [ ] T032 [US3] Add conditional custom name field when "Other/Custom" is selected in BudgetCategoryForm
- [ ] T033 [US3] Add Zod validation requiring custom_name when type is "Other/Custom" in src/schemas/budgetCategory.ts
- [ ] T034 [US3] Update budget category creation mutation to include category_type_id and custom_name
- [ ] T035 [US3] Sort budget categories by category_type.display_order on budget page

**Checkpoint**: User Story 3 complete - budget categories now use predefined types

---

## Phase 6: User Story 4 - Vendor Budget Category Assignment (Priority: P2)

**Goal**: Assign a default budget category to each vendor for automatic invoice allocation.

**Independent Test**: Edit a vendor, select a budget category from the dropdown, save, and verify the assignment persists.

### Implementation for User Story 4

- [ ] T036 [P] [US4] Add budget category dropdown to VendorCard OverviewTab in src/components/vendors/tabs/OverviewTab.tsx
- [ ] T037 [US4] Fetch wedding's budget categories in OverviewTab for dropdown population
- [ ] T038 [US4] Update vendor form data to include defaultBudgetCategoryId field
- [ ] T039 [US4] Update vendor mutation to save default_budget_category_id in src/hooks/useVendorMutations.ts
- [ ] T040 [P] [US4] Create budget category badge component in src/components/vendors/BudgetCategoryBadge.tsx
- [ ] T041 [US4] Add BudgetCategoryBadge to VendorCardCollapsed showing linked category in src/components/vendors/VendorCardCollapsed.tsx

**Checkpoint**: User Story 4 complete - vendors can have default budget categories

---

## Phase 7: User Story 5 - Enhanced Budget Display (Priority: P3)

**Goal**: Show breakdown of projected, actual (paid), invoiced unpaid, and remaining budget amounts with visual progress.

**Independent Test**: Create invoices and payments, then verify the budget display shows correct breakdowns of all amounts.

### Implementation for User Story 5

- [ ] T042 [P] [US5] Create BudgetProgressBar component in src/components/budget/BudgetProgressBar.tsx
- [ ] T043 [US5] Add progress bar showing percentage paid to BudgetCategoryCard in src/components/budget/BudgetCategoryCard.tsx
- [ ] T044 [US5] Display breakdown: Projected | Actual (Paid) | Invoiced Unpaid | Remaining in BudgetCategoryCard
- [ ] T045 [US5] Add warning indicator (yellow) when spending reaches 90% of projected
- [ ] T046 [US5] Add over-budget alert (red) when actual exceeds projected
- [ ] T047 [US5] Format all monetary values using formatCurrency utility (ZAR format)
- [ ] T048 [US5] Update BudgetLineItemRow to show payment_status badge in src/components/budget/BudgetLineItemRow.tsx

**Checkpoint**: User Story 5 complete - budget display shows full financial picture

---

## Phase 8: User Story 6 - Invoice Deletion with Budget Cleanup (Priority: P3)

**Goal**: When an invoice is deleted, the associated budget line item is automatically removed and totals recalculated.

**Independent Test**: Create an invoice, verify budget impact, delete the invoice, and confirm budget totals are restored.

### Implementation for User Story 6

- [ ] T049 [US6] Verify ON DELETE CASCADE is working for budget_line_items when invoice deleted
- [ ] T050 [US6] Add confirmation dialog when deleting invoice mentioning budget impact in src/components/vendors/tabs/PaymentsInvoicesTab.tsx
- [ ] T051 [US6] Verify database triggers recalculate category totals after invoice deletion
- [ ] T052 [US6] Verify database triggers recalculate wedding totals after category update
- [ ] T053 [US6] Add success toast confirming budget was updated after invoice deletion

**Checkpoint**: User Story 6 complete - invoice deletion properly cleans up budget

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [ ] T054 [P] Verify all monetary values display in ZAR format throughout the application
- [ ] T055 [P] Verify loading states exist for all budget-related async operations
- [ ] T056 [P] Verify error boundaries wrap budget components properly
- [ ] T057 Run quickstart.md testing checklist with Playwright MCP
- [ ] T058 Add JSDoc comments to complex functions in budgetCalculations.ts
- [ ] T059 Update CLAUDE.md with new dependencies and technologies if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 and US2 are both P1, but US2 requires US1 to have invoices with budget line items
  - US3 and US4 are P2, can run in parallel after Foundational
  - US5 and US6 are P3, can run in parallel after US1/US2
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundational (Phase 2)
        │
        ├──────────────────────────────────────────────┐
        │                                               │
        ▼                                               ▼
    US1 (P1)                                     US3 (P2)
    Invoice-Budget                               Category Types
        │                                               │
        ▼                                               ▼
    US2 (P1)                                     US4 (P2)
    Payment-Budget                               Vendor Assignment
        │                                               │
        └────────────────┬──────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
       US5 (P3)                    US6 (P3)
       Budget Display              Invoice Deletion
           │                           │
           └─────────────┬─────────────┘
                         │
                         ▼
                   Polish (Phase 9)
```

### Within Each User Story

- Components before integrations
- Hooks/mutations before UI updates
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T007, T008, T009, T010 can run in parallel (type definitions)

**Phase 2 (Foundational)**:
- T014 can run in parallel with T012, T013

**User Stories**:
- US3 and US4 can run in parallel with each other
- US5 and US6 can run in parallel with each other
- Within US3: T030 can run in parallel
- Within US4: T036 and T040 can run in parallel
- Within US5: T042 can run in parallel

**Phase 9 (Polish)**:
- T054, T055, T056 can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch US1 tasks sequentially:
T015: Fetch budget categories in AddInvoiceModal
T016: Add budgetCategoryId to form schema
T017: Add budget category dropdown to UI
T018: Pre-fill dropdown from vendor default
T019: Update mutation for budget line item creation
T020: Add budget line item with correct values
T021: Add error handling
```

---

## Parallel Example: User Story 3 + 4 (can run in parallel)

```bash
# Developer A: User Story 3
T030: Create CategoryTypeSelector component
T031: Update BudgetCategoryForm
T032: Add conditional custom name field
...

# Developer B: User Story 4
T036: Add budget category dropdown to OverviewTab
T037: Fetch categories for dropdown
T040: Create BudgetCategoryBadge component
...
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (database migrations)
2. Complete Phase 2: Foundational (hooks, types)
3. Complete Phase 3: User Story 1 (invoice → budget)
4. **STOP and VALIDATE**: Test invoice creation → budget line item appears
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Complete P1!)
4. Add User Story 3 + 4 → Test independently → Deploy/Demo (Complete P2!)
5. Add User Story 5 + 6 → Test independently → Deploy/Demo (Complete P3!)
6. Each story adds value without breaking previous stories

### Suggested MVP Scope

- **Phase 1**: Setup (T001-T011)
- **Phase 2**: Foundational (T012-T014)
- **Phase 3**: User Story 1 (T015-T021)

**MVP delivers**: Invoice creation automatically creates budget line items with correct projected costs.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Database triggers handle automatic recalculation of totals
- All monetary values in South African Rand (ZAR) with 2 decimal places
- 15% VAT rate is fixed for all invoices
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
