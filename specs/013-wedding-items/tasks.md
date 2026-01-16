# Tasks: Wedding Items Management

**Input**: Design documents from `/specs/013-wedding-items/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Manual testing with Playwright MCP only (per VowSync constitution). No unit tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/` at repository root (VowSync standard structure)
- Types: `src/types/`
- Schemas: `src/schemas/`
- Hooks: `src/hooks/`
- Components: `src/components/wedding-items/`
- Pages: `src/pages/wedding-items/`

---

## Phase 1: Setup

**Purpose**: TypeScript types, Zod schemas, and navigation activation

- [x] T001 [P] Create TypeScript interfaces in src/types/weddingItem.ts (WeddingItem, WeddingItemEventQuantity, WeddingItemWithQuantities, WeddingItemFormData, AvailabilityStatus, WeddingItemsSummary)
- [x] T002 [P] Create Zod validation schemas in src/schemas/weddingItem.ts (weddingItemSchema, eventQuantitySchema)
- [x] T003 Enable Items navigation by setting isPlaceholder: false in src/lib/navigation.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create useWeddingItems hook in src/hooks/useWeddingItems.ts (list query with event quantities)
- [x] T005 [P] Create useWeddingItem hook in src/hooks/useWeddingItem.ts (single item query)
- [x] T006 Create useWeddingItemMutations hook in src/hooks/useWeddingItemMutations.ts (create, update, delete mutations with recalculation logic)
- [x] T007 [P] Create calculateTotalRequired utility function in src/types/weddingItem.ts (ADD/MAX aggregation)
- [x] T008 [P] Create checkAvailability utility function in src/types/weddingItem.ts (sufficient/shortage/unknown)
- [x] T009 [P] Create calculateTotalCost utility function in src/types/weddingItem.ts
- [x] T010 Create WeddingItemsPage shell in src/pages/wedding-items/WeddingItemsPage.tsx (route setup, layout)
- [x] T011 Add route for /weddings/:id/items in src/App.tsx or router configuration

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Manage Wedding Items (Priority: P1) 🎯 MVP

**Goal**: Allow users to create, view, edit, and delete wedding items with all fields (category, description, aggregation method, availability, cost, supplier)

**Independent Test**: Create item → verify in list → edit item → delete item → verify removed

### Implementation for User Story 1

- [x] T012 [P] [US1] Create AggregationMethodBadge component in src/components/wedding-items/AggregationMethodBadge.tsx (ADD=orange, MAX=blue badges)
- [x] T013 [P] [US1] Create AvailabilityStatus component in src/components/wedding-items/AvailabilityStatusBadge.tsx (green/orange/gray status display)
- [x] T014 [P] [US1] Create WeddingItemForm component in src/components/wedding-items/WeddingItemForm.tsx (React Hook Form + Zod, all fields)
- [x] T015 [P] [US1] Create DeleteWeddingItemDialog component in src/components/wedding-items/DeleteWeddingItemDialog.tsx (confirmation dialog)
- [x] T016 [US1] Create WeddingItemModal component in src/components/wedding-items/WeddingItemModal.tsx (create/edit modal wrapper)
- [x] T017 [US1] Create WeddingItemsList component in src/components/wedding-items/WeddingItemsList.tsx (list view with item cards, category display, basic info)
- [x] T018 [US1] Integrate WeddingItemsList into WeddingItemsPage with empty state, loading state, and error handling
- [x] T019 [US1] Add create item flow (Add Item button → modal → form → submit → refresh list)
- [x] T020 [US1] Add edit item flow (click item → modal with prefilled form → submit → refresh)
- [x] T021 [US1] Add delete item flow (delete button → confirmation → delete → refresh list)

**Checkpoint**: At this point, User Story 1 should be fully functional - CRUD operations work, items display in list

---

## Phase 4: User Story 2 - Event Quantities with Real-Time Aggregation (Priority: P1)

**Goal**: Allow specifying quantities per event with automatic ADD/MAX calculation and real-time updates

**Independent Test**: Add event quantities → verify total_required uses correct aggregation → change quantities → verify recalculation

### Implementation for User Story 2

- [x] T022 [P] [US2] Create EventQuantitiesTable component in src/components/wedding-items/EventQuantitiesTable.tsx (table with event rows, quantity inputs)
- [x] T023 [US2] Add quantity input with inline editing (debounced save on change)
- [x] T024 [US2] Implement MAX highlighting (highlight row with highest quantity when method is MAX)
- [x] T025 [US2] Add aggregation method display in table footer (shows "Total (ADD): X" or "Total (MAX): X")
- [x] T026 [US2] Integrate EventQuantitiesTable into WeddingItemModal/WeddingItemForm
- [x] T027 [US2] Implement real-time recalculation when quantities change (update total_required, total_cost)
- [x] T028 [US2] Implement aggregation method change recalculation (when switching ADD ↔ MAX)
- [x] T029 [US2] Display calculated total_required in item card/list view

**Checkpoint**: Event quantities work with real-time aggregation calculations

---

## Phase 5: User Story 3 - Availability Status and Shortage Warnings (Priority: P2)

**Goal**: Display visual indicators for sufficient, shortage, or unknown availability status

**Independent Test**: Set number_available on item → verify correct status color/message based on comparison to total_required

### Implementation for User Story 3

- [x] T030 [US3] Integrate AvailabilityStatus component into WeddingItemsList item cards
- [x] T031 [US3] Add shortage count to summary statistics (moved to Phase 7 with WeddingItemsSummary)
- [x] T032 [US3] Style availability badges per design system (green=sufficient, orange=shortage, gray=unknown)

**Checkpoint**: Availability status displays correctly for all three states

---

## Phase 6: User Story 4 - Filter and Search Items (Priority: P2)

**Goal**: Filter items by category and supplier with clear filters functionality

**Independent Test**: Create items with different categories/suppliers → apply filters → verify correct filtering

### Implementation for User Story 4

- [x] T033 [P] [US4] Extract unique categories from items for category filter dropdown
- [x] T034 [P] [US4] Extract unique suppliers from items for supplier filter dropdown
- [x] T035 [US4] Add category filter dropdown to WeddingItemsPage header
- [x] T036 [US4] Add supplier filter dropdown to WeddingItemsPage header
- [x] T037 [US4] Implement client-side filtering logic (filter items based on selected category/supplier)
- [x] T038 [US4] Add "Clear filters" button that resets all filters
- [x] T039 [US4] Update item count display to show filtered count vs total count

**Checkpoint**: Filtering works for category and supplier with clear functionality

---

## Phase 7: User Story 5 - Cost Tracking and Summary (Priority: P3)

**Goal**: Track cost_per_unit, calculate total_cost, and display summary statistics

**Independent Test**: Set cost_per_unit → verify total_cost calculation → view summary totals

### Implementation for User Story 5

- [x] T040 [P] [US5] Create WeddingItemsSummary component in src/components/wedding-items/WeddingItemsSummary.tsx
- [x] T041 [US5] Calculate summary statistics (totalItems, totalCost, itemsWithCost, itemsWithoutCost, shortageCount, sufficientCount, unknownAvailabilityCount)
- [x] T042 [US5] Display summary card at top of WeddingItemsPage
- [x] T043 [US5] Display total_cost in item cards (with proper currency formatting)
- [x] T044 [US5] Handle items without cost (display as "Cost not set")

**Checkpoint**: Cost tracking and summary statistics display correctly

---

## Phase 8: User Story 6 - Event-by-Event Breakdown (Priority: P3)

**Goal**: Show detailed event breakdown with inline quantity editing and MAX highlighting

**Independent Test**: Expand item → see event table with name, date, quantity → edit inline → verify update

### Implementation for User Story 6

- [x] T045 [US6] Add expandable/collapsible section to item cards or detail view for event breakdown
- [x] T046 [US6] Display event breakdown table (event name, date, quantity_required)
- [x] T047 [US6] Enable inline quantity editing in breakdown table
- [x] T048 [US6] Highlight highest quantity row for MAX aggregation items

**Checkpoint**: Event breakdown displays with inline editing and MAX highlighting

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T049 [P] Add loading skeletons for all loading states
- [x] T050 [P] Add empty state messages for no items, no events, no filters match
- [x] T051 Implement error boundaries with user-friendly error messages
- [x] T052 [P] Add toast notifications for all CRUD operations (success/error)
- [x] T053 Ensure keyboard navigation works for all interactive elements (via Shadcn/Radix)
- [x] T054 [P] Add proper focus management in modals (via Shadcn Dialog)
- [x] T055 Verify mobile responsive layout (single column cards, horizontal scroll for tables)
- [x] T056 [P] Add number formatting for large quantities (e.g., 10,000 → "10,000")
- [x] T057 [P] Add currency formatting for costs (R X,XXX.XX format)
- [ ] T058 Run quickstart.md validation scenarios (24 test scenarios)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 - US2 depends on US1 for item creation
  - US3 and US4 are both P2 - can proceed after US1/US2
  - US5 and US6 are both P3 - can proceed after US1/US2
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS ALL)
    ↓
Phase 3: US1 - CRUD Items (P1, MVP)
    ↓
Phase 4: US2 - Event Quantities (P1, depends on US1 for items to exist)
    ↓
┌───────────────┬───────────────┐
↓               ↓               ↓
Phase 5: US3    Phase 6: US4    Phase 7: US5
(Availability)  (Filtering)     (Costs)
    ↓               ↓               ↓
    └───────────────┴───────────────┘
                ↓
        Phase 8: US6 (Event Breakdown)
                ↓
        Phase 9: Polish
```

### Parallel Opportunities

**Setup Phase (parallel)**:
- T001, T002, T003 can all run in parallel

**Foundational Phase (parallel within phase)**:
- T004, T005 can run in parallel (hooks)
- T007, T008, T009 can run in parallel (utility functions)

**User Story 1 (parallel within story)**:
- T012, T013, T014, T015 can run in parallel (independent components)

**User Story 2 (parallel within story)**:
- T022 can run in parallel with other stories after T012-T015 complete

**User Story 4 (parallel within story)**:
- T033, T034 can run in parallel (category and supplier extraction)

**User Story 5 (parallel within story)**:
- T040 can run in parallel with other P3 stories

**Polish Phase (parallel)**:
- T049, T050, T052, T054, T055, T056, T057 can run in parallel

---

## Parallel Example: Setup Phase

```bash
# Launch all setup tasks together:
Task: "Create TypeScript interfaces in src/types/weddingItem.ts"
Task: "Create Zod validation schemas in src/schemas/weddingItem.ts"
Task: "Enable Items navigation in src/lib/navigation.ts"
```

## Parallel Example: Foundational Phase

```bash
# Launch hooks in parallel:
Task: "Create useWeddingItems hook in src/hooks/useWeddingItems.ts"
Task: "Create useWeddingItem hook in src/hooks/useWeddingItem.ts"

# Launch utility functions in parallel:
Task: "Create calculateTotalRequired utility function"
Task: "Create checkAvailability utility function"
Task: "Create calculateTotalCost utility function"
```

## Parallel Example: User Story 1

```bash
# Launch independent components in parallel:
Task: "Create AggregationMethodBadge component"
Task: "Create AvailabilityStatus component"
Task: "Create WeddingItemForm component"
Task: "Create DeleteWeddingItemDialog component"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T011)
3. Complete Phase 3: User Story 1 - CRUD (T012-T021)
4. Complete Phase 4: User Story 2 - Event Quantities (T022-T029)
5. **STOP and VALIDATE**: Test core functionality
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (CRUD) → Deploy (items can be created/managed)
3. Add User Story 2 (Quantities) → Deploy (aggregation works)
4. Add User Stories 3+4 (Availability + Filtering) → Deploy (usability improved)
5. Add User Stories 5+6 (Costs + Breakdown) → Deploy (full feature)
6. Polish → Final release

### Single Developer Strategy

Execute phases sequentially in priority order:
1. Setup → Foundational → US1 → US2 → (MVP complete!)
2. Continue with US3 → US4 → US5 → US6 → Polish

---

## Summary

| Phase | Tasks | Parallel Tasks | Story |
|-------|-------|----------------|-------|
| Setup | 3 | 3 | - |
| Foundational | 8 | 6 | - |
| US1 - CRUD | 10 | 4 | P1 |
| US2 - Quantities | 8 | 1 | P1 |
| US3 - Availability | 3 | 0 | P2 |
| US4 - Filtering | 7 | 2 | P2 |
| US5 - Costs | 5 | 1 | P3 |
| US6 - Breakdown | 4 | 0 | P3 |
| Polish | 10 | 7 | - |
| **Total** | **58** | **24** | - |

**MVP Scope**: Phases 1-4 (29 tasks) - Delivers CRUD + Event Quantities with Aggregation
