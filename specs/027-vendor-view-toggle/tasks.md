# Tasks: Vendors View Toggle

**Input**: Design documents from `/specs/027-vendor-view-toggle/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/api-contracts.md

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational types, utilities, and data hook that all user stories depend on

- [ ] T001 [P] Create TypeScript interfaces in src/types/vendor-table.ts (VendorViewMode, VendorTableRow, VendorTableColumnDef, VendorColumnFilter, VendorSortConfig, VendorCellEditPayload)
- [ ] T002 [P] Create utility functions in src/lib/vendor-table-utils.ts (getVendorViewPreference, setVendorViewPreference, maskAccountNumber, formatCurrency, formatPercentage)
- [ ] T003 Create data fetching hook in src/hooks/useVendorTableData.ts with parallel Supabase queries for vendors + aggregate counts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core table components that MUST be complete before ANY user story can be fully implemented

**Note**: These components provide the foundation for all user stories

- [ ] T004 Copy ColumnFilterDropdown.tsx from src/components/guests/table/ to src/components/vendors/table/
- [ ] T005 Copy ActiveFiltersBar.tsx from src/components/guests/table/ to src/components/vendors/table/
- [ ] T006 Create column definitions (30 columns) in src/components/vendors/table/tableColumns.ts per data-model.md
- [ ] T007 Create VendorTableCell.tsx in src/components/vendors/table/ with all 12 cell types (text, email, phone, url, enum, boolean, date, currency, percentage, masked, number, datetime)
- [ ] T008 Create VendorTableRow.tsx in src/components/vendors/table/ with selection checkbox and cell rendering
- [ ] T009 Create VendorTableHeader.tsx in src/components/vendors/table/ with category row, column headers, sticky positioning (z-30, z-40)
- [ ] T010 Create VendorTableView.tsx in src/components/vendors/table/ as main container with scroll handling
- [ ] T011 Create barrel export in src/components/vendors/table/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Toggle Between Card and Table Views (Priority: P1)

**Goal**: Enable users to switch between Card View and Table View for the vendor list with preference persistence

**Independent Test**: Click view toggle, observe view change, refresh page to verify preference persisted

### Implementation for User Story 1

- [ ] T012 [US1] Create ViewToggle component in src/components/vendors/ViewToggle.tsx with Card/Table icons (LayoutGrid, Table2)
- [ ] T013 [US1] Update src/pages/vendors/VendorsPage.tsx to add viewMode state with localStorage persistence
- [ ] T014 [US1] Update src/pages/vendors/VendorsPage.tsx to render ViewToggle in header area
- [ ] T015 [US1] Update src/pages/vendors/VendorsPage.tsx to conditionally render VendorList (card) or VendorTableView (table) based on viewMode
- [ ] T016 [US1] Verify sticky columns work (checkbox + company_name) with horizontal scroll in VendorTableView.tsx
- [ ] T017 [US1] Verify all 30 columns render correctly (27 database fields + 3 aggregates) in table view

**Checkpoint**: User Story 1 complete - View toggle works with persistence, table displays all columns

---

## Phase 4: User Story 2 - Inline Editing with Auto-Save (Priority: P2)

**Goal**: Enable users to edit vendor fields directly in table cells with 500ms debounced auto-save

**Independent Test**: Click editable cell, modify value, observe auto-save after 500ms, verify value persists on refresh

### Implementation for User Story 2

- [ ] T018 [US2] Add useUpdateVendorCell mutation hook in src/hooks/useVendorTableData.ts with optimistic updates and rollback
- [ ] T019 [US2] Implement edit mode in VendorTableCell.tsx - click to edit, blur/Enter to save, Escape to cancel
- [ ] T020 [US2] Add 500ms debounce for auto-save in VendorTableCell.tsx (per FR-014)
- [ ] T021 [US2] Implement Zod validation in VendorTableCell.tsx for required fields and format validation (email, URL, percentage, currency)
- [ ] T022 [US2] Add visual feedback for save states (saving indicator, success highlight, error indicator) in VendorTableCell.tsx
- [ ] T023 [US2] Implement optimistic update with rollback on error in useUpdateVendorCell mutation
- [ ] T024 [US2] Add toast notifications for save success/failure using existing toast system
- [ ] T025 [US2] Implement masked account_number display (****1234) and reveal on edit in VendorTableCell.tsx

**Checkpoint**: User Story 2 complete - All editable cells support inline editing with auto-save

---

## Phase 5: User Story 3 - Column Filtering (Priority: P3)

**Goal**: Enable users to filter vendors by column values using Excel-style dropdown filters

**Independent Test**: Click filter icon on column header, select values, observe filtered results

### Implementation for User Story 3

- [ ] T026 [US3] Add columnFilters state and handlers in VendorTableView.tsx
- [ ] T027 [US3] Integrate ColumnFilterDropdown in VendorTableHeader.tsx for each filterable column
- [ ] T028 [US3] Implement applyColumnFilters utility in src/lib/vendor-table-utils.ts
- [ ] T029 [US3] Wire up ActiveFiltersBar in VendorTableView.tsx to display/remove active filters
- [ ] T030 [US3] Add filter count badge to show number of active column filters in VendorTableHeader.tsx
- [ ] T031 [US3] Implement filter state sharing between Card View and Table View in VendorsPage.tsx (per FR-030)
- [ ] T032 [US3] Add "No vendors match your filters" empty state with clear filters button in VendorTableView.tsx

**Checkpoint**: User Story 3 complete - Column filtering works with filter state shared between views

---

## Phase 6: User Story 4 - Column Sorting (Priority: P4)

**Goal**: Enable users to sort the vendor table by any column with ascending/descending/clear cycle

**Independent Test**: Click column header, observe sort direction change, verify null values sort to end

### Implementation for User Story 4

- [ ] T033 [US4] Add sortConfig state and handleSort handler in VendorTableView.tsx
- [ ] T034 [US4] Implement click-to-sort cycle (asc → desc → none) in VendorTableHeader.tsx
- [ ] T035 [US4] Add sort direction indicators (arrows) to column headers in VendorTableHeader.tsx
- [ ] T036 [US4] Implement sortVendorRows utility in src/lib/vendor-table-utils.ts with null values at end
- [ ] T037 [US4] Wire up sorted rows in VendorTableView.tsx using useMemo for performance

**Checkpoint**: User Story 4 complete - Column sorting works with visual indicators

---

## Phase 7: User Story 5 - View Aggregate Counts (Priority: P5)

**Goal**: Display read-only counts of related records (contacts, payments, invoices) for each vendor

**Independent Test**: View table, verify count columns show correct totals, verify they are read-only

### Implementation for User Story 5

- [ ] T038 [US5] Verify aggregate count queries in useVendorTableData.ts return correct counts from vendor_contacts, vendor_payment_schedule, vendor_invoices
- [ ] T039 [US5] Verify aggregate columns (contacts_count, payments_count, invoices_count) are marked read-only in tableColumns.ts
- [ ] T040 [US5] Verify aggregate cells display "0" for empty counts, not blank or null, in VendorTableCell.tsx
- [ ] T041 [US5] Verify aggregate columns are grouped under "Aggregates" category in VendorTableHeader.tsx

**Checkpoint**: User Story 5 complete - Aggregate counts display correctly as read-only

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cross-cutting improvements

- [ ] T042 Manual testing via Playwright MCP - verify all acceptance scenarios from spec.md
- [ ] T043 Verify selection state (checkboxes) syncs between Card View and Table View per FR-035
- [ ] T044 Verify table scrolls smoothly with 100+ vendors per SC-007
- [ ] T045 [P] Add JSDoc comments to complex functions in useVendorTableData.ts and vendor-table-utils.ts
- [ ] T046 Fix any z-index conflicts or sticky header issues discovered during testing
- [ ] T047 Run quickstart.md validation checklist to ensure all items pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in priority order (P1 → P2 → P3 → P4 → P5)
  - US1 must complete before US2-5 (table view must exist for other features)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (table view must exist for inline editing)
- **User Story 3 (P3)**: Depends on US1 (table view must exist for filtering)
- **User Story 4 (P4)**: Depends on US1 (table view must exist for sorting)
- **User Story 5 (P5)**: Depends on US1 (table view must exist for aggregate display)

### Within Each User Story

- Models/types before services/hooks
- Hooks before components
- Components before page integration
- Core implementation before polish

### Parallel Opportunities

- T001, T002 can run in parallel (different files, no dependencies)
- T004, T005 can run in parallel (copying generic components)
- Within Phase 2, T006-T011 must be sequential (components depend on each other)
- US2, US3, US4, US5 could theoretically run in parallel after US1, but priority order is recommended

---

## Parallel Example: Setup Phase

```bash
# Launch foundation tasks in parallel:
Task: "Create TypeScript interfaces in src/types/vendor-table.ts"
Task: "Create utility functions in src/lib/vendor-table-utils.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test view toggle independently
5. Deploy/demo if ready - users can now see table view!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP - table view exists!)
3. Add User Story 2 → Test independently → Deploy (inline editing works!)
4. Add User Story 3 → Test independently → Deploy (filtering works!)
5. Add User Story 4 → Test independently → Deploy (sorting works!)
6. Add User Story 5 → Test independently → Deploy (aggregates visible!)
7. Each story adds value without breaking previous stories

### Single Developer Strategy

With one developer:

1. Complete Setup + Foundational together
2. Complete User Story 1 (most critical - enables table view)
3. Complete User Story 2 (primary productivity benefit)
4. Complete User Story 3 (enhances data discovery)
5. Complete User Story 4 (expected table feature)
6. Complete User Story 5 (nice-to-have enhancement)
7. Polish phase for final touches

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No automated tests - manual testing with Playwright MCP per constitution
- Follow CARD-TABLE-VIEW-PATTERN.md from Phase 026 for implementation patterns

---

## Summary

| Phase | Story | Tasks | Description |
|-------|-------|-------|-------------|
| Phase 1 | - | 3 | Setup (types, utils, hook) |
| Phase 2 | - | 8 | Foundational (table components) |
| Phase 3 | US1 | 6 | View Toggle (P1 - MVP) |
| Phase 4 | US2 | 8 | Inline Editing (P2) |
| Phase 5 | US3 | 7 | Column Filtering (P3) |
| Phase 6 | US4 | 5 | Column Sorting (P4) |
| Phase 7 | US5 | 4 | Aggregate Counts (P5) |
| Phase 8 | - | 6 | Polish & Validation |

**Total Tasks**: 47
