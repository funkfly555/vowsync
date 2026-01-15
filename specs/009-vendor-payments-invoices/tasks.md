# Tasks: Vendor Payments & Invoices (Phase 7B)

**Input**: Design documents from `/specs/009-vendor-payments-invoices/`
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

**Purpose**: Types, schemas, and utility functions shared across all user stories

- [x] T001 [P] Add VendorPaymentSchedule interface to src/types/vendor.ts
- [x] T002 [P] Add VendorPaymentScheduleFormData interface to src/types/vendor.ts
- [x] T003 [P] Add MarkAsPaidFormData interface to src/types/vendor.ts
- [x] T004 [P] Add VendorInvoice interface to src/types/vendor.ts
- [x] T005 [P] Add VendorInvoiceFormData interface to src/types/vendor.ts
- [x] T006 [P] Add VendorContact interface to src/types/vendor.ts
- [x] T007 [P] Add VendorContactFormData interface to src/types/vendor.ts
- [x] T008 [P] Create payment status calculation utility in src/lib/vendorPaymentStatus.ts
- [x] T009 [P] Create invoice status calculation utility in src/lib/vendorInvoiceStatus.ts
- [x] T010 [P] Create Zod validation schema in src/schemas/paymentSchedule.ts
- [x] T011 [P] Create Zod validation schema in src/schemas/invoice.ts
- [x] T012 [P] Create Zod validation schema in src/schemas/vendorContact.ts

**Checkpoint**: All types, schemas, and utilities ready for hook and component development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data fetching hooks that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Create useVendorPayments query hook in src/hooks/useVendorPayments.ts
- [x] T014 Create useVendorInvoices query hook in src/hooks/useVendorInvoices.ts
- [x] T015 Create useVendorContacts query hook in src/hooks/useVendorContacts.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Payment Schedule (Priority: P1) 🎯 MVP

**Goal**: Display payment milestones table with status badges showing Pending/Due Soon/Overdue/Paid

**Independent Test**: Navigate to vendor detail page → Payments tab → verify table displays with correct status badges and amounts sorted by due date

### Implementation for User Story 1

- [x] T016 [P] [US1] Create PaymentStatusBadge component in src/components/vendors/PaymentStatusBadge.tsx
- [x] T017 [P] [US1] Create PaymentScheduleTable component in src/components/vendors/PaymentScheduleTable.tsx
- [x] T018 [US1] Create PaymentsTab container component in src/components/vendors/PaymentsTab.tsx
- [x] T019 [US1] Update VendorDetailPage to import and use PaymentsTab in src/pages/vendors/VendorDetailPage.tsx

**Checkpoint**: User Story 1 complete - payments table displays with status badges, sorted by due date

---

## Phase 4: User Story 2 - Add Payment Milestone (Priority: P1) 🎯 MVP

**Goal**: Modal form to add new payment milestones with description, due date, amount, and notes

**Independent Test**: Click "Add Payment" → fill form → save → verify new payment appears in table

### Implementation for User Story 2

- [x] T020 [US2] Create useVendorPaymentMutations hook (createPayment) in src/hooks/useVendorPaymentMutations.ts
- [x] T021 [US2] Create PaymentModal component (add mode) in src/components/vendors/PaymentModal.tsx
- [x] T022 [US2] Integrate PaymentModal with PaymentsTab in src/components/vendors/PaymentsTab.tsx

**Checkpoint**: User Story 2 complete - can add new payment milestones via modal

---

## Phase 5: User Story 3 - Mark Payment as Paid (Priority: P1) 🎯 MVP

**Goal**: Dialog to mark pending payments as paid with payment date and optional payment method

**Independent Test**: Click "Mark as Paid" on pending payment → enter date → confirm → verify status changes to Paid (green)

### Implementation for User Story 3

- [x] T023 [US3] Add markAsPaid mutation to useVendorPaymentMutations in src/hooks/useVendorPaymentMutations.ts
- [x] T024 [US3] Create MarkAsPaidDialog component in src/components/vendors/MarkAsPaidDialog.tsx
- [x] T025 [US3] Integrate MarkAsPaidDialog with PaymentScheduleTable in src/components/vendors/PaymentScheduleTable.tsx

**Checkpoint**: User Story 3 complete - can mark payments as paid, status badge updates to green "Paid"

---

## Phase 6: User Story 4 - Edit Payment Milestone (Priority: P2)

**Goal**: Edit existing payment details (only notes editable for paid payments)

**Independent Test**: Click edit icon on payment row → modify fields → save → verify changes persist

### Implementation for User Story 4

- [x] T026 [US4] Add updatePayment mutation to useVendorPaymentMutations in src/hooks/useVendorPaymentMutations.ts
- [x] T027 [US4] Extend PaymentModal to support edit mode with pre-populated values in src/components/vendors/PaymentModal.tsx
- [x] T028 [US4] Add edit action to PaymentScheduleTable rows in src/components/vendors/PaymentScheduleTable.tsx

**Checkpoint**: User Story 4 complete - can edit payment milestones (read-only fields for paid payments)

---

## Phase 7: User Story 5 - Delete Payment Milestone (Priority: P2)

**Goal**: Delete payment milestones with confirmation (warning for paid payments)

**Independent Test**: Click delete icon → confirm in dialog → verify payment removed from table

### Implementation for User Story 5

- [x] T029 [US5] Add deletePayment mutation to useVendorPaymentMutations in src/hooks/useVendorPaymentMutations.ts
- [x] T030 [US5] Create DeletePaymentDialog component in src/components/vendors/DeletePaymentDialog.tsx
- [x] T031 [US5] Add delete action to PaymentScheduleTable rows in src/components/vendors/PaymentScheduleTable.tsx

**Checkpoint**: User Story 5 complete - can delete payment milestones with confirmation

---

## Phase 8: User Story 6 - View Invoices (Priority: P2)

**Goal**: Display invoices table with invoice number, dates, amounts (with VAT), and status badges

**Independent Test**: Navigate to vendor detail page → Invoices tab → verify table displays with amounts and status

### Implementation for User Story 6

- [x] T032 [P] [US6] Create InvoiceStatusBadge component in src/components/vendors/InvoiceStatusBadge.tsx
- [x] T033 [P] [US6] Create InvoiceTable component in src/components/vendors/InvoiceTable.tsx
- [x] T034 [US6] Create InvoicesTab container component in src/components/vendors/InvoicesTab.tsx
- [x] T035 [US6] Update VendorDetailPage to import and use InvoicesTab in src/pages/vendors/VendorDetailPage.tsx

**Checkpoint**: User Story 6 complete - invoices table displays with status badges and calculated totals

---

## Phase 9: User Story 7 - Add/Edit Invoice (Priority: P2)

**Goal**: Modal form to add/edit invoices with auto-calculated VAT (15% South African rate)

**Independent Test**: Click "Add Invoice" → fill form → verify VAT auto-calculates → save → verify invoice appears

### Implementation for User Story 7

- [x] T036 [US7] Create useVendorInvoiceMutations hook in src/hooks/useVendorInvoiceMutations.ts
- [x] T037 [US7] Create InvoiceModal component with VAT calculation in src/components/vendors/InvoiceModal.tsx
- [x] T038 [US7] Create DeleteInvoiceDialog component in src/components/vendors/DeleteInvoiceDialog.tsx
- [x] T039 [US7] Integrate InvoiceModal and DeleteInvoiceDialog with InvoicesTab in src/components/vendors/InvoicesTab.tsx

**Checkpoint**: User Story 7 complete - can add/edit/delete invoices with VAT auto-calculation

---

## Phase 10: User Story 8 - View Vendor Contacts (Priority: P3)

**Goal**: Display vendor contacts list with name, role, email, phone in Overview tab

**Independent Test**: Navigate to vendor Overview tab → verify contacts section displays

### Implementation for User Story 8

- [x] T040 [US8] Create ContactsSection component in src/components/vendors/ContactsSection.tsx
- [x] T041 [US8] Update VendorDetailPage Overview tab to include ContactsSection in src/pages/vendors/VendorDetailPage.tsx

**Checkpoint**: User Story 8 complete - contacts display in vendor Overview tab

---

## Phase 11: User Story 9 - Manage Vendor Contacts (Priority: P3)

**Goal**: Add, edit, and delete vendor contacts with primary contact designation

**Independent Test**: Add contact → edit role → delete → verify all operations persist

### Implementation for User Story 9

- [x] T042 [US9] Create useVendorContactMutations hook in src/hooks/useVendorContactMutations.ts
- [x] T043 [US9] Create ContactModal component in src/components/vendors/ContactModal.tsx
- [x] T044 [US9] Create DeleteContactDialog component in src/components/vendors/DeleteContactDialog.tsx
- [x] T045 [US9] Integrate ContactModal and DeleteContactDialog with ContactsSection in src/components/vendors/ContactsSection.tsx

**Checkpoint**: User Story 9 complete - full CRUD for vendor contacts

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, cleanup, and validation

- [x] T046 Verify all tabs integrate correctly in VendorDetailPage in src/pages/vendors/VendorDetailPage.tsx
- [x] T047 Add loading states to all tab components (PaymentsTab, InvoicesTab)
- [x] T048 Add error handling with toast notifications to all mutations
- [x] T049 Verify currency formatting (ZAR with R prefix) displays correctly throughout
- [x] T050 Run manual E2E testing with Playwright MCP per quickstart.md checklist
- [x] T051 Verify no regressions in Phase 7A vendor functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T012) completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US3) form MVP and should complete first
  - P2 stories (US4-US7) extend functionality
  - P3 stories (US8-US9) add supporting features
- **Polish (Phase 12)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Requires US1 PaymentsTab to exist
- **User Story 3 (P1)**: Can start after Foundational - Requires US1 PaymentScheduleTable to exist
- **User Story 4 (P2)**: Requires US2 PaymentModal to exist (extends it)
- **User Story 5 (P2)**: Requires US1 PaymentScheduleTable to exist
- **User Story 6 (P2)**: Can start after Foundational - Independent from payments
- **User Story 7 (P2)**: Requires US6 InvoicesTab to exist
- **User Story 8 (P3)**: Can start after Foundational - Independent from payments/invoices
- **User Story 9 (P3)**: Requires US8 ContactsSection to exist

### Parallel Opportunities

- **Phase 1**: All T001-T012 can run in parallel (different files)
- **Phase 2**: T013-T015 can run in parallel (different hook files)
- **Phase 3**: T016-T017 can run in parallel (different component files)
- **Phase 8**: T032-T033 can run in parallel (different component files)
- **User Stories 1, 6, 8**: Can be developed in parallel (independent tabs/sections)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all type definitions together:
Task: "Add VendorPaymentSchedule interface to src/types/vendor.ts"
Task: "Add VendorInvoice interface to src/types/vendor.ts"
Task: "Add VendorContact interface to src/types/vendor.ts"

# Launch all schemas together:
Task: "Create Zod validation schema in src/schemas/paymentSchedule.ts"
Task: "Create Zod validation schema in src/schemas/invoice.ts"
Task: "Create Zod validation schema in src/schemas/vendorContact.ts"

# Launch all status utilities together:
Task: "Create payment status calculation utility in src/lib/vendorPaymentStatus.ts"
Task: "Create invoice status calculation utility in src/lib/vendorInvoiceStatus.ts"
```

---

## Parallel Example: Independent User Stories

```bash
# After Foundational phase completes, these can run in parallel:

# Developer A: Payments (US1)
Task: "[US1] Create PaymentStatusBadge component in src/components/vendors/PaymentStatusBadge.tsx"
Task: "[US1] Create PaymentScheduleTable component in src/components/vendors/PaymentScheduleTable.tsx"

# Developer B: Invoices (US6)
Task: "[US6] Create InvoiceStatusBadge component in src/components/vendors/InvoiceStatusBadge.tsx"
Task: "[US6] Create InvoiceTable component in src/components/vendors/InvoiceTable.tsx"

# Developer C: Contacts (US8)
Task: "[US8] Create ContactsSection component in src/components/vendors/ContactsSection.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (T001-T012)
2. Complete Phase 2: Foundational (T013-T015)
3. Complete Phase 3: User Story 1 - View Payments (T016-T019)
4. Complete Phase 4: User Story 2 - Add Payment (T020-T022)
5. Complete Phase 5: User Story 3 - Mark as Paid (T023-T025)
6. **STOP and VALIDATE**: Test MVP independently with Playwright MCP
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → **Payments visible** (MVP milestone)
3. Add User Story 2 → Test → **Can add payments**
4. Add User Story 3 → Test → **Can complete payments** (Full MVP!)
5. Add User Stories 4-5 → Test → **Full payment CRUD**
6. Add User Stories 6-7 → Test → **Invoice tracking**
7. Add User Stories 8-9 → Test → **Contact management**
8. Complete Polish → **Phase 7B complete**

### Suggested MVP Scope

**MVP = User Stories 1, 2, 3** (25 tasks: T001-T025)

This delivers:
- View payment schedule with status badges ✅
- Add new payment milestones ✅
- Mark payments as paid ✅

Consultants can track payments end-to-end with just the MVP.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing with Playwright MCP replaces automated tests (per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
