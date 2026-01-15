# Tasks: Budget Tracking System

**Input**: Design documents from `/specs/011-budget-tracking/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Manual testing only with Playwright MCP (per constitution) - no automated tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Paths follow established VowSync patterns from Phases 6-10

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create foundational types/utilities shared across all user stories

- [x] T001 Install recharts dependency: `npm install recharts`
- [x] T002 [P] Create TypeScript interfaces for budget entities in `src/types/budget.ts`
- [x] T003 [P] Create Zod validation schema for budget category form in `src/schemas/budgetCategory.ts`
- [x] T004 [P] Create budget status helpers and currency formatter in `src/lib/budgetStatus.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data fetching hooks that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create useBudgetCategories query hook in `src/hooks/useBudgetCategories.ts`
- [x] T006 Create useBudgetCategoryMutations hook (create/update/delete + wedding totals sync) in `src/hooks/useBudgetCategoryMutations.ts`
- [x] T007 Create BudgetPage shell with routing in `src/pages/budget/BudgetPage.tsx`
- [x] T008 Add Budget link to sidebar navigation in wedding detail context

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Budget Overview (Priority: P1) MVP

**Goal**: Display budget overview with stat cards, progress bar, and empty state

**Independent Test**: Navigate to `/weddings/:id/budget`, verify 4 stat cards display (Total Budget, Total Spent, Remaining, % Spent), progress bar shows spending percentage, and data reflects actual database values.

### Implementation for User Story 1

- [x] T009 [P] [US1] Create BudgetStatCards component (4 cards: Total Budget, Total Spent, Remaining, % Spent) in `src/components/budget/BudgetStatCards.tsx`
- [x] T010 [P] [US1] Create BudgetProgressBar component with color-coded status in `src/components/budget/BudgetProgressBar.tsx`
- [x] T011 [US1] Create empty state component for when no categories exist in `src/components/budget/BudgetEmptyState.tsx`
- [x] T012 [US1] Integrate stat cards, progress bar, and empty state into BudgetPage in `src/pages/budget/BudgetPage.tsx`
- [x] T013 [US1] Add loading and error states to BudgetPage in `src/pages/budget/BudgetPage.tsx`

**Checkpoint**: User Story 1 complete - budget overview displays correctly with totals and empty state

---

## Phase 4: User Story 2 - Manage Budget Categories (Priority: P1)

**Goal**: Full CRUD operations for budget categories with table display

**Independent Test**: Add a new category "Venue" with R 50,000 projected, verify it appears in the table. Edit to change projected amount to R 55,000, verify update. Delete a category with R 0 actual, verify removal.

### Implementation for User Story 2

- [x] T014 [P] [US2] Create BudgetStatusBadge component (On Track/90% Spent/Over by X) in `src/components/budget/BudgetStatusBadge.tsx`
- [x] T015 [P] [US2] Create BudgetCategoriesTable component with sortable columns in `src/components/budget/BudgetCategoriesTable.tsx`
- [x] T016 [US2] Create BudgetCategoryModal component (add/edit form with React Hook Form + Zod) in `src/components/budget/BudgetCategoryModal.tsx`
- [x] T017 [US2] Create DeleteBudgetCategoryDialog component with conditional confirmation in `src/components/budget/DeleteBudgetCategoryDialog.tsx`
- [x] T018 [US2] Integrate categories table, modal, and delete dialog into BudgetPage in `src/pages/budget/BudgetPage.tsx`
- [x] T019 [US2] Wire up create mutation in BudgetCategoryModal in `src/components/budget/BudgetCategoryModal.tsx`
- [x] T020 [US2] Wire up edit mutation in BudgetCategoryModal in `src/components/budget/BudgetCategoryModal.tsx`
- [x] T021 [US2] Wire up delete mutation in DeleteBudgetCategoryDialog in `src/components/budget/DeleteBudgetCategoryDialog.tsx`

**Checkpoint**: User Story 2 complete - can add, edit, and delete budget categories

---

## Phase 5: User Story 3 - Track Actual Spending (Priority: P1)

**Goal**: Record actual amounts and display variance with status updates

**Independent Test**: Edit an existing category to add actual amount, verify variance calculation, status badge updates, and wedding totals recalculate.

### Implementation for User Story 3

- [x] T022 [US3] Add actual_amount field to BudgetCategoryModal form in `src/components/budget/BudgetCategoryModal.tsx`
- [x] T023 [US3] Add Variance column to BudgetCategoriesTable in `src/components/budget/BudgetCategoriesTable.tsx`
- [x] T024 [US3] Ensure status badge updates based on actual/projected ratio in `src/components/budget/BudgetStatusBadge.tsx`
- [x] T025 [US3] Verify wedding totals sync after actual amount changes in `src/hooks/useBudgetCategoryMutations.ts`

**Checkpoint**: User Story 3 complete - actual spending tracked with variance display

---

## Phase 6: User Story 4 - View Budget Health Status (Priority: P2)

**Goal**: Visual status badges showing budget health on each category

**Independent Test**: Create categories with different actual/projected ratios, verify correct badge displays: green "On Track" (<90%), orange "90% Spent" (90-99%), red "Over by X" (>100%).

### Implementation for User Story 4

- [x] T026 [US4] Enhance BudgetStatusBadge with threshold-based styling in `src/components/budget/BudgetStatusBadge.tsx`
- [x] T027 [US4] Handle edge case: projected = 0 shows "On Track" in `src/lib/budgetStatus.ts`
- [x] T028 [US4] Add "Over by R X" dynamic amount display in `src/components/budget/BudgetStatusBadge.tsx`

**Checkpoint**: User Story 4 complete - status badges show correct health indicators

---

## Phase 7: User Story 5 - Visualize Budget Allocation (Priority: P2)

**Goal**: Pie chart showing budget allocation across categories

**Independent Test**: Create 3+ categories with different projected amounts, verify pie chart displays proportional slices with category names and amounts.

### Implementation for User Story 5

- [x] T029 [P] [US5] Create BudgetPieChart component with recharts in `src/components/budget/BudgetPieChart.tsx`
- [x] T030 [US5] Add color palette constant (12 colors) to pie chart in `src/components/budget/BudgetPieChart.tsx`
- [x] T031 [US5] Add responsive container and legend to pie chart in `src/components/budget/BudgetPieChart.tsx`
- [x] T032 [US5] Integrate pie chart into BudgetPage layout in `src/pages/budget/BudgetPage.tsx`
- [x] T033 [US5] Handle empty state (hide or show message when no categories) in `src/components/budget/BudgetPieChart.tsx`

**Checkpoint**: User Story 5 complete - pie chart visualizes budget allocation

---

## Phase 8: User Story 6 - Auto-Update Wedding Totals (Priority: P3)

**Goal**: Wedding budget_total and budget_actual auto-sync with category changes

**Independent Test**: Add a category, verify wedding.budget_total increases. Update actual amount, verify wedding.budget_actual updates. Delete category, verify totals decrease.

### Implementation for User Story 6

- [x] T034 [US6] Implement updateWeddingBudgetTotals helper function in `src/hooks/useBudgetCategoryMutations.ts`
- [x] T035 [US6] Call totals sync after create mutation in `src/hooks/useBudgetCategoryMutations.ts`
- [x] T036 [US6] Call totals sync after update mutation in `src/hooks/useBudgetCategoryMutations.ts`
- [x] T037 [US6] Call totals sync after delete mutation in `src/hooks/useBudgetCategoryMutations.ts`
- [x] T038 [US6] Invalidate wedding query after totals update in `src/hooks/useBudgetCategoryMutations.ts`

**Checkpoint**: User Story 6 complete - wedding totals stay synchronized

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsive design, accessibility, and final validation

- [x] T039 [P] Add mobile responsive layout (stat cards stack, table scrolls) in `src/pages/budget/BudgetPage.tsx`
- [x] T040 [P] Add keyboard navigation and focus management to modal in `src/components/budget/BudgetCategoryModal.tsx`
- [x] T041 [P] Add ARIA labels and screen reader support to pie chart in `src/components/budget/BudgetPieChart.tsx`
- [x] T042 [P] Verify WCAG 2.1 AA color contrast on all status badges in `src/components/budget/BudgetStatusBadge.tsx`
- [x] T043 Add toast notifications for all CRUD operations in `src/hooks/useBudgetCategoryMutations.ts`
- [x] T044 Test with 50+ categories for performance validation
- [x] T045 Manual testing with Playwright MCP following quickstart.md scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1-US3 (P1): Core functionality - complete first
  - US4-US5 (P2): Enhancements - can start after foundational
  - US6 (P3): Auto-sync - can be done alongside other stories
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Shares BudgetStatusBadge with US4
- **User Story 3 (P1)**: Depends on US2 (needs modal and table to exist)
- **User Story 4 (P2)**: Can start after Foundational - Enhances BudgetStatusBadge from US2
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independent of other stories
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Independent hook changes

### Within Each User Story

- Models/types before components
- Hooks before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004 can run in parallel (different files)
- T009, T010 can run in parallel (different components)
- T014, T015 can run in parallel (different components)
- T029 can run in parallel with other US5 tasks (independent file)
- T039-T042 can all run in parallel (different files)
- US5 (pie chart) can run in parallel with US1-US4 once foundational is done

---

## Parallel Example: Setup Phase

```bash
# Launch all setup tasks together after T001:
Task: "Create TypeScript interfaces in src/types/budget.ts"
Task: "Create Zod schema in src/schemas/budgetCategory.ts"
Task: "Create status helpers in src/lib/budgetStatus.ts"
```

## Parallel Example: User Story 2

```bash
# Launch component shells together:
Task: "Create BudgetStatusBadge in src/components/budget/BudgetStatusBadge.tsx"
Task: "Create BudgetCategoriesTable in src/components/budget/BudgetCategoriesTable.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (overview display)
4. Complete Phase 4: User Story 2 (CRUD operations)
5. Complete Phase 5: User Story 3 (actual spending)
6. **STOP and VALIDATE**: Test full budget tracking independently
7. Deploy/demo if ready - users can track budgets!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (read-only budget view)
3. Add User Stories 2-3 → Test independently → Deploy/Demo (full CRUD - MVP!)
4. Add User Stories 4-5 → Test independently → Deploy/Demo (visual enhancements)
5. Add User Story 6 → Test independently → Deploy/Demo (auto-sync polish)
6. Complete Polish phase → Final validation

### Single Developer Strategy (Recommended)

1. Complete Setup (T001-T004) - ~30 min
2. Complete Foundational (T005-T008) - ~1 hour
3. Complete US1 (T009-T013) - ~1 hour
4. Complete US2 (T014-T021) - ~2 hours
5. Complete US3 (T022-T025) - ~30 min
6. Complete US4 (T026-T028) - ~30 min
7. Complete US5 (T029-T033) - ~1 hour
8. Complete US6 (T034-T038) - ~30 min
9. Complete Polish (T039-T045) - ~1 hour

**Estimated Total**: ~8 hours

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing only - use Playwright MCP for validation per constitution
- Follow existing VowSync patterns from vendors/, guests/ components
