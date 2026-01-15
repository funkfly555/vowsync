# Tasks: Vendor Invoice Payment Integration

**Input**: Design documents from `/specs/010-invoice-payment-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing with Playwright MCP only (per constitution - NO automated tests)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types and hooks shared across all user stories

- [x] T001 [P] Add VendorTotals interface to src/types/vendor.ts
- [x] T002 [P] Add PaymentWithInvoice interface to src/types/vendor.ts
- [x] T003 Create useVendorTotals query hook in src/hooks/useVendorTotals.ts

**Checkpoint**: Types and totals hook ready for component development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core mutations that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add useCreatePaymentFromInvoice mutation to src/hooks/useVendorPaymentMutations.ts
- [x] T005 Add useUpdateInvoiceStatus mutation to src/hooks/useVendorInvoiceMutations.ts
- [x] T006 Extend useMarkPaymentAsPaid to update linked invoice status in src/hooks/useVendorPaymentMutations.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Pay an Invoice (Priority: P1) 🎯 MVP

**Goal**: Allow consultants to pay an invoice directly from the Invoices tab with automatic linking

**Independent Test**: Create an invoice, click "Pay This Invoice", complete the payment, verify invoice status updates to "paid" - delivers end-to-end invoice payment tracking

### Implementation for User Story 1

- [x] T007 [P] [US1] Create VendorTotalsSummary component in src/components/vendors/VendorTotalsSummary.tsx
- [x] T008 [US1] Add "Pay This Invoice" button to InvoiceTable rows in src/components/vendors/InvoiceTable.tsx
- [x] T009 [US1] Add PaymentModal integration with pre-filled values in src/components/vendors/InvoicesTab.tsx
- [x] T010 [US1] Wire up useCreatePaymentFromInvoice mutation in InvoicesTab for "Pay This Invoice" workflow

**Checkpoint**: User Story 1 complete - can pay invoice, payment auto-linked, invoice status updates

---

## Phase 4: User Story 2 - View Financial Summary (Priority: P1) 🎯 MVP

**Goal**: Display Total Invoiced, Total Paid, and Balance Due summary card for each vendor

**Independent Test**: Add invoices and payments, verify summary card displays correct totals - delivers immediate financial visibility

### Implementation for User Story 2

- [x] T011 [US2] Integrate VendorTotalsSummary into InvoicesTab in src/components/vendors/InvoicesTab.tsx
- [x] T012 [US2] Integrate VendorTotalsSummary into PaymentsTab in src/components/vendors/PaymentsTab.tsx
- [x] T013 [US2] Add loading skeleton state to VendorTotalsSummary in src/components/vendors/VendorTotalsSummary.tsx
- [x] T014 [US2] Verify query invalidation updates totals on invoice/payment changes

**Checkpoint**: User Story 2 complete - financial summary visible on both tabs with real-time updates

---

## Phase 5: User Story 3 - View Invoice Link in Payments (Priority: P2)

**Goal**: Show which invoice each payment is for (if linked) in the Payments table

**Independent Test**: Create linked and unlinked payments, verify Invoice column shows "Invoice #XXX" or "—"

### Implementation for User Story 3

- [x] T015 [US3] Add invoice link query to useVendorPayments or PaymentsTab in src/hooks/useVendorPayments.ts
- [x] T016 [US3] Add "Invoice" column to PaymentScheduleTable in src/components/vendors/PaymentScheduleTable.tsx
- [x] T017 [US3] Display "Invoice #XXX" or "—" based on linked invoice in PaymentScheduleTable

**Checkpoint**: User Story 3 complete - payments show linked invoice reference

---

## Phase 6: User Story 4 - Partial Payment Tracking (Priority: P2)

**Goal**: Display "Partially Paid" status when invoice is partially covered by payments

**Independent Test**: Create invoice for R 10,000, pay R 5,000, verify invoice shows "Partially Paid" with orange badge

### Implementation for User Story 4

- [x] T018 [US4] Add calculateInvoiceStatusFromPayment helper to src/lib/vendorInvoiceStatus.ts
- [x] T019 [US4] Update invoice status calculation to handle partial payments in useMarkPaymentAsPaid
- [x] T020 [US4] Verify InvoiceStatusBadge displays correct colors (green=paid, orange=partial, red=overdue)

**Checkpoint**: User Story 4 complete - partial payment status displays correctly

---

## Phase 7: User Story 5 - Tab Order for Workflow (Priority: P3)

**Goal**: Reorder tabs so Invoices appears before Payments matching natural workflow

**Independent Test**: Navigate to vendor detail page, verify tabs appear as: Overview, Contract, Invoices, Payments

### Implementation for User Story 5

- [x] T021 [US5] Reorder tabs array in VendorDetailPage in src/pages/vendors/VendorDetailPage.tsx
- [x] T022 [US5] Update TabsContent order to match new tab order in VendorDetailPage

**Checkpoint**: User Story 5 complete - tabs in correct workflow order

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, cleanup, and validation

- [x] T023 Add error handling with toast notifications to all new mutations
- [x] T024 Verify responsive design of VendorTotalsSummary (3-col desktop, stacked mobile)
- [x] T025 Add ARIA labels and keyboard navigation to new UI elements
- [x] T026 Verify currency formatting displays correctly (R X,XXX.XX) throughout
- [x] T027 Run manual E2E testing with Playwright MCP per quickstart.md checklist
- [x] T028 Verify no regressions in existing Phase 7B functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T003) completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - P1 stories (US1, US2) form MVP and should complete first
  - P2 stories (US3, US4) extend functionality
  - P3 story (US5) is UX polish
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Requires VendorTotalsSummary from US1
- **User Story 3 (P2)**: Can start after Foundational - Independent from US1/US2
- **User Story 4 (P2)**: Can start after Foundational - Requires markAsPaid extension from Foundational
- **User Story 5 (P3)**: Can start after Foundational - Independent, can run in parallel

### Parallel Opportunities

- **Phase 1**: T001-T002 can run in parallel (different type additions)
- **Phase 2**: T004-T006 must be sequential (T006 extends T004)
- **Phase 3 (US1)**: T007 can run in parallel with other setup
- **Phase 5 (US3)**: T015-T017 can run in parallel with US4 tasks
- **Phase 7 (US5)**: T021-T022 can run in parallel with US3/US4

---

## Parallel Example: Setup + Foundational

```bash
# Launch all type definitions together:
Task: "Add VendorTotals interface to src/types/vendor.ts"
Task: "Add PaymentWithInvoice interface to src/types/vendor.ts"

# Then hook (depends on types):
Task: "Create useVendorTotals query hook in src/hooks/useVendorTotals.ts"

# Then mutations (depend on hook):
Task: "Add useCreatePaymentFromInvoice mutation..."
Task: "Add useUpdateInvoiceStatus mutation..."
```

---

## Parallel Example: Independent User Stories

```bash
# After Foundational phase completes, these can run in parallel:

# Developer A: US1 (Pay Invoice)
Task: "[US1] Create VendorTotalsSummary component..."
Task: "[US1] Add 'Pay This Invoice' button..."

# Developer B: US3 (Invoice Link in Payments)
Task: "[US3] Add invoice link query..."
Task: "[US3] Add 'Invoice' column..."

# Developer C: US5 (Tab Order)
Task: "[US5] Reorder tabs array..."
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006)
3. Complete Phase 3: User Story 1 - Pay Invoice (T007-T010)
4. Complete Phase 4: User Story 2 - Financial Summary (T011-T014)
5. **STOP and VALIDATE**: Test MVP independently with Playwright MCP
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → **Can pay invoices with auto-linking** (Core MVP!)
3. Add User Story 2 → Test → **Financial visibility complete** (Full MVP!)
4. Add User Story 3 → Test → **Payment-to-invoice traceability**
5. Add User Story 4 → Test → **Partial payment tracking**
6. Add User Story 5 → Test → **Improved UX workflow**
7. Complete Polish → **Phase 010 complete**

### Suggested MVP Scope

**MVP = User Stories 1 + 2** (14 tasks: T001-T014)

This delivers:
- Pay invoices with automatic payment linking ✅
- Invoice status auto-updates when payment marked as paid ✅
- Financial summary card on Invoices and Payments tabs ✅
- Real-time total updates ✅

Consultants can track invoice payments end-to-end with just the MVP.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing with Playwright MCP replaces automated tests (per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
