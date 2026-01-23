# Tasks: Guest View Toggle - Card and Table Views

**Input**: Design documents from `/specs/026-guest-view-toggle/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in specification - test tasks excluded

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## User Story Summary

| Story | Priority | Description | Tasks |
|-------|----------|-------------|-------|
| US1 | P1 | View Toggle Interface | 5 |
| US2 | P1 | Card View Preservation | 2 |
| US3 | P1 | Table View Basic Display | 10 |
| US4 | P2 | Event Attendance Columns | 4 |
| US5 | P2 | Table Inline Editing | 6 |
| US6 | P3 | Table Sorting and Filtering | 5 |
| US7 | P3 | Column Resizing | 3 |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install @tanstack/react-virtual dependency for row virtualization
- [X] T002 [P] Create TypeScript types file in src/types/guest-table.ts
- [X] T003 [P] Create utility functions file in src/lib/guest-table-utils.ts
- [X] T004 [P] Create table column definitions in src/components/guests/table/tableColumns.ts

**Checkpoint**: Foundation types and utilities ready for component development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story components can be built

**⚠️ CRITICAL**: No user story component work can begin until this phase is complete

- [X] T005 Implement transformToTableRows() pivot function in src/lib/guest-table-utils.ts
- [X] T006 [P] Implement applyGuestFilters() filter function in src/lib/guest-table-utils.ts
- [X] T007 [P] Implement sortRows() sorting function in src/lib/guest-table-utils.ts
- [X] T008 [P] Implement getNestedValue() helper for dot-notation paths in src/lib/guest-table-utils.ts
- [X] T009 [P] Define BASE_COLUMNS array with all 30 column definitions in src/components/guests/table/tableColumns.ts
- [X] T010 [P] Implement generateEventColumns() function in src/components/guests/table/tableColumns.ts
- [X] T011 Create useGuestTableData hook with parallel Supabase queries in src/hooks/useGuestTableData.ts
- [X] T012 [P] Add useUpdateGuestCell mutation to src/hooks/useGuestTableData.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Toggle Interface (Priority: P1) 🎯 MVP

**Goal**: Users can see toggle buttons at the top of the Guests page to switch between Card View and Table View with localStorage persistence

**Independent Test**: Verify toggle buttons render, respond to clicks, display correct active/inactive states, and persist preference across browser sessions

### Implementation for User Story 1

- [X] T013 [P] [US1] Create ViewToggle component with active/inactive styling in src/components/guests/ViewToggle.tsx
- [X] T014 [US1] Add viewMode state with localStorage initialization to src/pages/GuestListPage.tsx
- [X] T015 [US1] Add useEffect for localStorage persistence to src/pages/GuestListPage.tsx
- [X] T016 [US1] Render ViewToggle component above filters in src/pages/GuestListPage.tsx
- [X] T017 [US1] Add conditional rendering for Card/Table view in src/pages/GuestListPage.tsx

**Checkpoint**: User Story 1 complete - toggle buttons visible, functional, preference persists

---

## Phase 4: User Story 2 - Card View Preservation (Priority: P1)

**Goal**: Card View works exactly as before with zero regressions - all expand, tabs, inline edit, auto-save functionality unchanged

**Independent Test**: Run existing Card View tests, verify all 6 tabs work, search/filters work, inline editing auto-saves

### Implementation for User Story 2

- [X] T018 [US2] Verify Card View renders correctly when viewMode === 'card' in src/pages/GuestListPage.tsx
- [X] T019 [US2] Test shared filter state works with Card View in src/pages/GuestListPage.tsx

**Checkpoint**: User Story 2 complete - Card View unchanged, zero regressions

---

## Phase 5: User Story 3 - Table View Basic Display (Priority: P1)

**Goal**: Users can see all guest data in a comprehensive table format with 30 base columns grouped by category

**Independent Test**: Switch to Table View, verify all 30 columns render with correct data and category grouping

### Implementation for User Story 3

- [X] T020 [P] [US3] Create GuestTableCell component with type-specific rendering in src/components/guests/table/GuestTableCell.tsx
- [X] T021 [P] [US3] Create GuestTableRow component with cell rendering in src/components/guests/table/GuestTableRow.tsx
- [X] T022 [P] [US3] Create GuestTableHeader component with category grouping in src/components/guests/table/GuestTableHeader.tsx
- [X] T023 [P] [US3] Create GuestTableBody component with row container in src/components/guests/table/GuestTableBody.tsx
- [X] T024 [US3] Create GuestTableView container component in src/components/guests/table/GuestTableView.tsx
- [X] T025 [US3] Add horizontal scroll container with border styling in src/components/guests/table/GuestTableView.tsx
- [X] T026 [US3] Implement category header row with correct colspan in src/components/guests/table/GuestTableHeader.tsx
- [X] T027 [US3] Add loading and error states to GuestTableView in src/components/guests/table/GuestTableView.tsx
- [X] T028 [US3] Create barrel export in src/components/guests/table/index.ts
- [X] T029 [US3] Wire GuestTableView to GuestListPage when viewMode === 'table' in src/pages/GuestListPage.tsx

**Checkpoint**: User Story 3 complete - Table View displays all 30 columns with category headers

---

## Phase 6: User Story 4 - Event Attendance Columns (Priority: P2)

**Goal**: Table View displays dynamic event columns (3 per event: Attending, Shuttle TO, Shuttle FROM) with color-coded headers

**Independent Test**: Create events, verify each event generates 3 columns in correct order with unique colors

### Implementation for User Story 4

- [X] T030 [US4] Generate dynamic event columns from events data in src/components/guests/table/GuestTableView.tsx
- [X] T031 [US4] Implement event column color coding with HSL rotation in src/components/guests/table/GuestTableHeader.tsx
- [X] T032 [US4] Display event attendance data in cells (checkbox for attending, text for shuttles) in src/components/guests/table/GuestTableCell.tsx
- [X] T033 [US4] Handle wedding with 0 events gracefully (show only base columns) in src/components/guests/table/GuestTableView.tsx

**Checkpoint**: User Story 4 complete - Event columns appear dynamically with color coding

---

## Phase 7: User Story 5 - Table Inline Editing (Priority: P2)

**Goal**: Users can edit guest data directly in table cells with auto-save (500ms debounce)

**Independent Test**: Click editable cells, modify values, verify auto-save triggers and data persists

### Implementation for User Story 5

- [X] T034 [US5] Add edit mode state management to GuestTableRow in src/components/guests/table/GuestTableRow.tsx
- [X] T035 [US5] Implement text input editing in GuestTableCell in src/components/guests/table/GuestTableCell.tsx
- [X] T036 [US5] Implement checkbox toggle with immediate save in src/components/guests/table/GuestTableCell.tsx
- [X] T037 [US5] Implement dropdown selection for enum fields in src/components/guests/table/GuestTableCell.tsx
- [X] T038 [US5] Implement date picker for date fields in src/components/guests/table/GuestTableCell.tsx
- [X] T039 [US5] Add 500ms debounced auto-save using useUpdateGuestCell mutation in src/components/guests/table/GuestTableRow.tsx

**Checkpoint**: User Story 5 complete - Inline editing works with auto-save

---

## Phase 8: User Story 6 - Table Sorting and Filtering (Priority: P3)

**Goal**: Users can sort columns (ascending/descending) and filter by column-specific criteria

**Independent Test**: Click sort icons, verify data reorders; use filter dropdowns, verify rows filter correctly

### Implementation for User Story 6

- [X] T040 [US6] Add sortConfig state to GuestTableView in src/components/guests/table/GuestTableView.tsx
- [X] T041 [US6] Implement sort icons (↕/↑/↓) in column headers in src/components/guests/table/GuestTableHeader.tsx
- [X] T042 [US6] Apply client-side sorting using sortRows() in src/components/guests/table/GuestTableView.tsx
- [X] T043 [P] [US6] Create ColumnFilter popover component in src/components/guests/table/ColumnFilter.tsx
- [X] T044 [US6] Add column filter state and apply filters in src/components/guests/table/GuestTableView.tsx

**Checkpoint**: User Story 6 complete - Sorting and filtering functional

---

## Phase 9: User Story 7 - Column Resizing (Priority: P3)

**Goal**: Users can resize table columns by dragging column borders

**Independent Test**: Drag column border, verify width changes and minimum width enforced

### Implementation for User Story 7

- [ ] T045 [P] [US7] Create ColumnResizer drag handle component in src/components/guests/table/ColumnResizer.tsx (DEFERRED - P3)
- [ ] T046 [US7] Add columnWidths state and mouse drag logic to GuestTableView in src/components/guests/table/GuestTableView.tsx (DEFERRED - P3)
- [ ] T047 [US7] Apply custom column widths to header and body cells in src/components/guests/table/GuestTableHeader.tsx and GuestTableRow.tsx (DEFERRED - P3)

**Checkpoint**: User Story 7 complete - Column resizing functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [X] T048 Ensure view switch completes pending auto-saves in src/pages/GuestListPage.tsx
- [X] T049 [P] Add keyboard navigation support (Tab, Enter, Escape) to GuestTableCell in src/components/guests/table/GuestTableCell.tsx
- [X] T050 [P] Optimize performance with React.memo for row/cell components
- [X] T051 [P] Add empty state when no guests match filters in src/components/guests/table/GuestTableBody.tsx
- [X] T052 Verify bulk selection (selectedGuests) works with Table View in src/pages/GuestListPage.tsx
- [X] T053 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1, US2, US3 are P1 priority - complete in order
  - US4, US5 are P2 priority - can start after P1 stories
  - US6, US7 are P3 priority - can start after P2 stories
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after US1 - Verifies Card View unchanged
- **User Story 3 (P1)**: Can start after US1 - Core table functionality
- **User Story 4 (P2)**: Depends on US3 (table structure) - Extends with event columns
- **User Story 5 (P2)**: Depends on US3 (table structure) - Adds inline editing
- **User Story 6 (P3)**: Depends on US3 (table structure) - Adds sort/filter
- **User Story 7 (P3)**: Depends on US3 (table structure) - Adds resize

### Within Each User Story

- Models/types before components
- Utility functions before components that use them
- Container components depend on child components
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- T020-T023 (US3 components) can run in parallel
- T043 (ColumnFilter) can run in parallel with other US6 tasks
- T045 (ColumnResizer) can run in parallel with other US7 tasks

---

## Parallel Example: User Story 3

```bash
# Launch all child components for User Story 3 together:
Task: "Create GuestTableCell component in src/components/guests/table/GuestTableCell.tsx"
Task: "Create GuestTableRow component in src/components/guests/table/GuestTableRow.tsx"
Task: "Create GuestTableHeader component in src/components/guests/table/GuestTableHeader.tsx"
Task: "Create GuestTableBody component in src/components/guests/table/GuestTableBody.tsx"

# Then create container (depends on children):
Task: "Create GuestTableView container component in src/components/guests/table/GuestTableView.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Toggle Interface)
4. Complete Phase 4: User Story 2 (Card View Preservation)
5. Complete Phase 5: User Story 3 (Table View Basic Display)
6. **STOP and VALIDATE**: Both views work, toggle persists, table shows all columns
7. Deploy/demo if ready - this is a usable MVP!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1-US3 → **MVP with basic Table View** → Deploy/Demo
3. Add US4 → Event attendance columns → Deploy/Demo
4. Add US5 → Inline editing → Deploy/Demo
5. Add US6 → Sorting and filtering → Deploy/Demo
6. Add US7 → Column resizing → Deploy/Demo
7. Each story adds value without breaking previous stories

### Estimated Effort by Phase

| Phase | Estimated Time |
|-------|---------------|
| Setup | 30 min |
| Foundational | 2 hours |
| US1: View Toggle | 1 hour |
| US2: Card View Preservation | 30 min |
| US3: Table Basic Display | 4 hours |
| US4: Event Columns | 2 hours |
| US5: Inline Editing | 3 hours |
| US6: Sorting & Filtering | 2 hours |
| US7: Column Resizing | 1.5 hours |
| Polish | 1 hour |
| **Total** | **~18 hours** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Reuse existing: useGuestMutations.ts, GuestFiltersState, BulkActionsBar, Shadcn/ui components
