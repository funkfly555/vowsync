# Tasks: Items Card Table View

**Input**: Design documents from `/specs/031-items-card-table-view/`
**Prerequisites**: plan.md (tech stack, structure), spec.md (8 user stories with priorities)

**Tests**: Manual E2E testing with Playwright MCP only (no automated tests per plan.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Paths follow plan.md structure with `src/components/wedding-items/` for components

---

## Phase 1: Setup (Foundation Types & Utils)

**Purpose**: Create type definitions and utility functions needed by all user stories

- [x] T001 [P] Create item table types (ItemViewMode, ItemTableRow, ItemColumnFilter, ItemSortConfig, ItemFiltersState) in `src/types/item-table.ts`
- [x] T002 [P] Create item table utilities (getItemViewPreference, setItemViewPreference, sortItems, filterItems, markMaxRows) in `src/lib/item-table-utils.ts`
- [x] T003 [P] Create barrel export for table components in `src/components/wedding-items/table/index.ts`

**Checkpoint**: Foundation types and utilities ready - view components can now be built

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create ViewToggle component (copy from guests, update types to ItemViewMode) in `src/components/wedding-items/ViewToggle.tsx`
- [x] T005 Create useItemTableData hook for data transformation with sort/filter/column-filter support in `src/hooks/useItemTableData.ts`
- [x] T006 Update WeddingItemsFilters to add search input with 300ms debounce in `src/components/wedding-items/WeddingItemsFilters.tsx`
- [x] T007 Add view state management (viewMode, selection Set<string>, filters) to WeddingItemsPage in `src/pages/wedding-items/WeddingItemsPage.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Toggle Between Card and Table (Priority: P1) 🎯 MVP

**Goal**: Enable switching between Card View and Table View with localStorage persistence

**Independent Test**: Click the view toggle and verify both views render correctly with the same data. Reload page to verify preference persists.

**Acceptance Criteria**:
- AC1.1: Table View shows columns: Description, Category, Method, Need, Have, Status, Unit Cost, Total Cost, Supplier, Actions
- AC1.2: Card View shows responsive grid (1/2/3 columns)
- AC1.3: Preference persists on page reload
- AC1.4: Active toggle highlighted with dusty rose (#D4A5A5)

### Implementation for User Story 1

- [x] T008 [US1] Create itemTableColumns.ts with column definitions (11 columns) in `src/components/wedding-items/table/itemTableColumns.ts`
- [x] T009 [US1] Create ItemTableView main container with table structure in `src/components/wedding-items/table/ItemTableView.tsx`
- [x] T010 [US1] Create ItemTableHeader with column headers in `src/components/wedding-items/table/ItemTableHeader.tsx`
- [x] T011 [US1] Create ItemTableBody container in `src/components/wedding-items/table/ItemTableBody.tsx`
- [x] T012 [US1] Create ItemTableRow with basic cell rendering in `src/components/wedding-items/table/ItemTableRow.tsx`
- [x] T013 [US1] Create ItemTableCell renderer for different cell types (text, badge, number, currency, actions) in `src/components/wedding-items/table/ItemTableCell.tsx`
- [x] T014 [US1] Update WeddingItemsList to conditionally render Card or Table view based on viewMode in `src/components/wedding-items/WeddingItemsList.tsx`
- [x] T015 [US1] Integrate ViewToggle into WeddingItemsPage header section in `src/pages/wedding-items/WeddingItemsPage.tsx`

**Checkpoint**: User Story 1 complete - Can toggle between Card and Table views with persistence

---

## Phase 4: User Story 2 - Card View with Expandable Details (Priority: P1)

**Goal**: Display collapsed cards with summary info, expand on click to show full details with EventBreakdown

**Independent Test**: Click a card to expand, view all details including EventBreakdown, click chevron to collapse

**Acceptance Criteria**:
- AC2.1: Collapsed card shows: category badge, description, aggregation badge, quantity summary, availability badge, total cost, supplier
- AC2.2: Expanded card shows: cost per unit, cost details, notes, EventBreakdown
- AC2.3: Collapse chevron works
- AC2.4: MAX rows highlighted in blue with "(MAX)" label in EventBreakdown

### Implementation for User Story 2

- [x] T016 [P] [US2] Create ItemCardCollapsed with summary info and checkbox in `src/components/wedding-items/ItemCardCollapsed.tsx`
- [x] T017 [P] [US2] Create ItemCardExpanded with EventBreakdown, actions, and details in `src/components/wedding-items/ItemCardExpanded.tsx`
- [x] T018 [US2] Create ItemCard wrapper with expand/collapse state management in `src/components/wedding-items/ItemCard.tsx`
- [x] T019 [US2] Update WeddingItemsList to use new ItemCard components instead of WeddingItemCard in `src/components/wedding-items/WeddingItemsList.tsx`

**Checkpoint**: User Story 2 complete - Cards expand/collapse with full details

---

## Phase 5: User Story 3 - Table View with Sorting and Filtering (Priority: P1)

**Goal**: Sortable columns with 3-state toggle, Excel-style column filters with active filter badges

**Independent Test**: Click column headers to sort, use column filter dropdowns, verify filter badges appear and can be removed

**Acceptance Criteria**:
- AC3.1: Table shows all 11 columns correctly
- AC3.2: Column header click cycles: ascending → descending → none
- AC3.3: Column filter dropdown on Category, Method, Status, Supplier
- AC3.4: Active filter badges with X to remove
- AC3.5: Sticky table header during scroll

### Implementation for User Story 3

- [x] T020 [P] [US3] Copy and adapt ColumnFilterDropdown from guests (update types) in `src/components/wedding-items/table/ColumnFilterDropdown.tsx`
- [x] T021 [P] [US3] Copy and adapt ActiveFiltersBar from guests (update types) in `src/components/wedding-items/table/ActiveFiltersBar.tsx`
- [x] T022 [US3] Add sorting logic (3-state toggle) to ItemTableHeader in `src/components/wedding-items/table/ItemTableHeader.tsx`
- [x] T023 [US3] Add column filter dropdowns to filterable columns in ItemTableHeader in `src/components/wedding-items/table/ItemTableHeader.tsx`
- [x] T024 [US3] Integrate ActiveFiltersBar above table in ItemTableView in `src/components/wedding-items/table/ItemTableView.tsx`
- [x] T025 [US3] Add sticky header CSS (position: sticky, top: 0) to ItemTableHeader in `src/components/wedding-items/table/ItemTableHeader.tsx`
- [x] T026 [US3] Add footer with "X items displayed" count to ItemTableView in `src/components/wedding-items/table/ItemTableView.tsx`

**Checkpoint**: User Story 3 complete - Table has sorting, filtering, and sticky header

---

## Phase 6: User Story 4 - Table Row Expansion for Details (Priority: P2)

**Goal**: Click table row to expand and show EventBreakdown, Notes, Cost Details

**Independent Test**: Click a table row to expand, view details panel, click again to collapse

**Acceptance Criteria**:
- AC4.1: Row click expands to show EventBreakdown, Notes, Cost Details
- AC4.2: MAX rows highlighted in blue in EventBreakdown
- AC4.3: Second click collapses row

### Implementation for User Story 4

- [x] T027 [US4] Create ItemTableExpandedRow with EventBreakdown, Notes, Cost Details in `src/components/wedding-items/table/ItemTableExpandedRow.tsx`
- [x] T028 [US4] Add expand/collapse state and click handler to ItemTableRow in `src/components/wedding-items/table/ItemTableRow.tsx`
- [x] T029 [US4] Add double-click handler to open Edit modal on ItemTableRow in `src/components/wedding-items/table/ItemTableRow.tsx`

**Checkpoint**: User Story 4 complete - Table rows expand to show full details

---

## Phase 7: User Story 5 - Search and Filter Items (Priority: P2)

**Goal**: Search by description with debounce, filter by category/supplier/method/status

**Independent Test**: Type in search box, apply filters, verify results match criteria, clear filters

**Acceptance Criteria**:
- AC5.1: Search filters by description with 300ms debounce
- AC5.2: Category filter dropdown works
- AC5.3: Availability Status filter works
- AC5.4: "No results found" message with clear filters button
- AC5.5: "Clear all filters" removes all filters

### Implementation for User Story 5

- [x] T030 [US5] Add aggregation method filter dropdown (ADD/MAX/All) to WeddingItemsFilters in `src/components/wedding-items/WeddingItemsFilters.tsx`
- [x] T031 [US5] Add availability status filter dropdown (Sufficient/Shortage/Unknown/All) to WeddingItemsFilters in `src/components/wedding-items/WeddingItemsFilters.tsx`
- [x] T032 [US5] Update filterWeddingItems function to support search, aggregation, and status filters in `src/components/wedding-items/WeddingItemsFilters.tsx`
- [x] T033 [US5] Add "No results found" empty state with clear filters button to WeddingItemsList in `src/components/wedding-items/WeddingItemsList.tsx`

**Checkpoint**: User Story 5 complete - Search and filter work in both views

---

## Phase 8: User Story 6 - Select and Bulk Delete Items (Priority: P2)

**Goal**: Select items with checkboxes, show BulkActionsBar, bulk delete with confirmation

**Independent Test**: Select multiple items, verify BulkActionsBar appears, click Delete Selected, confirm dialog shows count

**Acceptance Criteria**:
- AC6.1: Checkbox selects item in both views
- AC6.2: Header checkbox in table selects all visible items
- AC6.3: BulkActionsBar shows "X items selected"
- AC6.4: Selection preserved when switching views
- AC6.5: Bulk delete confirmation shows item count

### Implementation for User Story 6

- [x] T034 [US6] Create BulkActionsBar with selection count and Delete Selected button in `src/components/wedding-items/BulkActionsBar.tsx`
- [x] T035 [US6] Add header checkbox with select-all logic to ItemTableHeader in `src/components/wedding-items/table/ItemTableHeader.tsx`
- [x] T036 [US6] Add selection checkbox to ItemTableRow in `src/components/wedding-items/table/ItemTableRow.tsx`
- [x] T037 [US6] Add selection checkbox to ItemCardCollapsed in `src/components/wedding-items/ItemCardCollapsed.tsx`
- [x] T038 [US6] Create BulkDeleteDialog with item count confirmation in `src/components/wedding-items/BulkDeleteDialog.tsx`
- [x] T039 [US6] Integrate BulkActionsBar and selection state into WeddingItemsPage in `src/pages/wedding-items/WeddingItemsPage.tsx`
- [x] T040 [US6] Wire up bulk delete mutation (loop through selected IDs) in WeddingItemsPage in `src/pages/wedding-items/WeddingItemsPage.tsx`

**Checkpoint**: User Story 6 complete - Multi-select and bulk delete working

---

## Phase 9: User Story 7 - Inline Edit Event Quantities (Priority: P2)

**Goal**: Edit quantities directly in EventBreakdown with auto-save after 300ms debounce

**Independent Test**: Change a quantity in EventBreakdown, verify auto-save, verify total_required and status update

**Acceptance Criteria**:
- AC7.1: Quantity change auto-saves after 300ms debounce
- AC7.2: total_required recalculates (ADD sums, MAX takes max)
- AC7.3: Availability status badge updates if status changed

### Implementation for User Story 7

- [x] T041 [US7] Verify EventBreakdown already supports onQuantityChange prop with debounce (existing from feature 013)
- [x] T042 [US7] Ensure handleQuantityChange in WeddingItemsPage triggers TanStack Query refetch in `src/pages/wedding-items/WeddingItemsPage.tsx`
- [x] T043 [US7] Add optimistic update for quantity changes to improve UX in `src/hooks/useWeddingItemMutations.ts`

**Checkpoint**: User Story 7 complete - Inline quantity editing with real-time updates

---

## Phase 10: User Story 8 - Summary Statistics (Priority: P3)

**Goal**: Display 4 summary cards that update based on filtered data in real-time

**Independent Test**: View summary cards, apply filters, verify counts update to reflect filtered items

**Acceptance Criteria**:
- AC8.1: Summary shows: Total Items, Total Cost, Shortages count, Sufficient count
- AC8.2: Statistics reflect filtered items, not all items
- AC8.3: Statistics update in real-time on item changes

### Implementation for User Story 8

- [x] T044 [US8] Update WeddingItemsSummary to accept filteredItems prop in `src/components/wedding-items/WeddingItemsSummary.tsx`
- [x] T045 [US8] Pass filteredItems to WeddingItemsSummary in WeddingItemsPage in `src/pages/wedding-items/WeddingItemsPage.tsx`

**Checkpoint**: User Story 8 complete - Summary statistics reflect filtered data

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, error handling, and manual testing

- [x] T046 [P] Add loading states to ItemTableView and card components
- [ ] T047 [P] Add error boundary around Items page
- [x] T048 Ensure keyboard navigation works (Tab, Enter, Escape) across all components
- [x] T049 Verify WCAG 2.1 AA compliance (contrast, focus indicators, aria labels)
- [ ] T050 Manual E2E testing with Playwright MCP - test all 51 acceptance criteria
- [ ] T051 Fix any issues discovered during testing
- [x] T052 Update barrel exports in `src/components/wedding-items/table/index.ts`

**Checkpoint**: Feature complete - all 51 acceptance criteria verified

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1, US2, US3 are P1 priority - complete first
  - US4, US5, US6, US7 are P2 priority - complete after P1 stories
  - US8 is P3 priority - complete last
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - Creates table view foundation
- **User Story 2 (P1)**: Can start after Phase 2 - Independent of US1 (different files)
- **User Story 3 (P1)**: Depends on US1 (extends table components)
- **User Story 4 (P2)**: Depends on US1, US3 (extends table row)
- **User Story 5 (P2)**: Can start after Phase 2 - Extends filter components
- **User Story 6 (P2)**: Depends on US1, US2 (adds selection to both views)
- **User Story 7 (P2)**: Can start after Phase 2 - Uses existing EventBreakdown
- **User Story 8 (P3)**: Can start after Phase 2 - Modifies existing summary component

### Parallel Opportunities

**Phase 1 (all parallel)**:
- T001, T002, T003 can run in parallel

**Phase 2**:
- T004, T005, T006 can run in parallel
- T007 depends on T004 completion

**User Stories**:
- US1 and US2 can start in parallel after Phase 2
- US3 depends on US1 table components
- US5 and US7 can run in parallel (different components)
- US8 can run in parallel with US4, US5, US6, US7

---

## Parallel Example: Phase 1

```bash
# Launch all Setup tasks together:
Task: "Create item table types in src/types/item-table.ts"
Task: "Create item table utilities in src/lib/item-table-utils.ts"
Task: "Create barrel export in src/components/wedding-items/table/index.ts"
```

## Parallel Example: User Story 2

```bash
# Launch collapsed and expanded card components together:
Task: "Create ItemCardCollapsed in src/components/wedding-items/ItemCardCollapsed.tsx"
Task: "Create ItemCardExpanded in src/components/wedding-items/ItemCardExpanded.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (types and utils)
2. Complete Phase 2: Foundational (view toggle, filters, hook)
3. Complete Phase 3: User Story 1 (table view basic rendering)
4. Complete Phase 4: User Story 2 (card view expand/collapse)
5. Complete Phase 5: User Story 3 (table sorting and filtering)
6. **STOP and VALIDATE**: Test view toggle, both views, sorting, filtering
7. Deploy/demo if ready - this is a functional MVP!

### Incremental Delivery

1. MVP (US1-US3) → View toggle with Card and Table working
2. Add US4 → Table row expansion
3. Add US5 → Enhanced search and filter
4. Add US6 → Bulk selection and delete
5. Add US7 → Inline quantity editing
6. Add US8 → Summary statistics from filtered data
7. Polish → Testing and accessibility

### Single Developer Strategy

1. Complete Setup + Foundational (T001-T007)
2. US1 → US2 → US3 (P1 stories in sequence)
3. US4 → US5 → US6 → US7 (P2 stories in sequence)
4. US8 (P3)
5. Polish and testing

---

## Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|----------------------|
| Setup | T001-T003 (3) | All 3 parallel |
| Foundational | T004-T007 (4) | T004-T006 parallel |
| US1 - View Toggle | T008-T015 (8) | T008-T013 partially parallel |
| US2 - Card Details | T016-T019 (4) | T016-T017 parallel |
| US3 - Table Sort/Filter | T020-T026 (7) | T020-T021 parallel |
| US4 - Row Expansion | T027-T029 (3) | Sequential |
| US5 - Search/Filter | T030-T033 (4) | T030-T031 parallel |
| US6 - Bulk Delete | T034-T040 (7) | T034-T038 partially parallel |
| US7 - Inline Edit | T041-T043 (3) | Sequential |
| US8 - Summary Stats | T044-T045 (2) | Sequential |
| Polish | T046-T052 (7) | T046-T047 parallel |

**Total Tasks**: 52
**User Stories**: 8 (3 P1, 4 P2, 1 P3)
**MVP Scope**: User Stories 1-3 (22 tasks including setup)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual E2E testing with Playwright MCP (no automated tests)
- Preserve all existing components per spec requirements
