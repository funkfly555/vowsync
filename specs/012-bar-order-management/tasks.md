# Tasks: Bar Order Management

**Input**: Design documents from `/specs/012-bar-order-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Manual testing only with Playwright MCP (per constitution) - no automated tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Paths follow established VowSync patterns from Phases 6-11

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational types, schemas, and utilities shared across all user stories

- [x] T001 [P] Create TypeScript interfaces for bar order entities in `src/types/barOrder.ts`
- [x] T002 [P] Create Zod validation schema for bar order form in `src/schemas/barOrder.ts`
- [x] T003 [P] Create Zod validation schema for bar order item form in `src/schemas/barOrderItem.ts`
- [x] T004 [P] Create bar order status helpers and color mappings in `src/lib/barOrderStatus.ts`
- [x] T005 [P] Create client-side calculation helpers in `src/lib/barOrderCalculations.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data fetching hooks that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create useBarOrders query hook for list view in `src/hooks/useBarOrders.ts`
- [x] T007 Create useBarOrder query hook for single order with items in `src/hooks/useBarOrder.ts`
- [x] T008 Create useBarOrderMutations hook (order CRUD + item CRUD) in `src/hooks/useBarOrderMutations.ts`
- [x] T009 Create BarOrdersPage shell with routing in `src/pages/bar-orders/BarOrdersPage.tsx`
- [x] T010 Add Bar Orders route to App.tsx router configuration
- [x] T011 Add Bar Orders link to sidebar navigation in `src/lib/navigation.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Bar Orders List (Priority: P1) 🎯 MVP

**Goal**: Display bar orders in a card grid with status, guest count, and total units visible at a glance

**Independent Test**: Navigate to `/weddings/:id/bar-orders` and verify the list displays with order cards showing event name, guest count, total units, and status. Empty state should show helpful message when no orders exist.

### Implementation for User Story 1

- [x] T012 [P] [US1] Create BarOrderStatusBadge component with color mappings in `src/components/bar-orders/BarOrderStatusBadge.tsx`
- [x] T013 [P] [US1] Create BarOrderEmptyState component in `src/components/bar-orders/BarOrderEmptyState.tsx`
- [x] T014 [P] [US1] Create BarOrderCard component displaying order summary in `src/components/bar-orders/BarOrderCard.tsx`
- [x] T015 [US1] Integrate card grid, empty state, and loading states into BarOrdersPage in `src/pages/bar-orders/BarOrdersPage.tsx`
- [x] T016 [US1] Add "Create Bar Order" button to BarOrdersPage header in `src/pages/bar-orders/BarOrdersPage.tsx`

**Checkpoint**: User Story 1 complete - bar orders list displays correctly with cards and empty state

---

## Phase 4: User Story 2 - Create Bar Order with Consumption Model (Priority: P1)

**Goal**: Create new bar orders with event linkage and customizable consumption parameters that auto-calculate servings per person

**Independent Test**: Create a new bar order, link it to an event, customize consumption parameters, and verify total servings per person is auto-calculated correctly.

### Implementation for User Story 2

- [x] T017 [P] [US2] Create ConsumptionModelForm component for parameter inputs in `src/components/bar-orders/ConsumptionModelForm.tsx`
- [x] T018 [US2] Create BarOrderModal component (create/edit form with React Hook Form + Zod) in `src/components/bar-orders/BarOrderModal.tsx`
- [x] T019 [US2] Implement event selection dropdown with guest count auto-population in `src/components/bar-orders/BarOrderModal.tsx`
- [x] T020 [US2] Implement vendor selection dropdown (optional linkage) in `src/components/bar-orders/BarOrderModal.tsx`
- [x] T021 [US2] Implement real-time servings per person preview calculation in `src/components/bar-orders/BarOrderModal.tsx`
- [x] T022 [US2] Wire up create mutation to BarOrderModal in `src/components/bar-orders/BarOrderModal.tsx`
- [x] T023 [US2] Integrate BarOrderModal into BarOrdersPage for creating orders in `src/pages/bar-orders/BarOrdersPage.tsx`

**Checkpoint**: User Story 2 complete - can create bar orders with consumption model

---

## Phase 5: User Story 3 - Add Beverage Items with Auto-Calculation (Priority: P1)

**Goal**: Add beverage items to orders with percentage allocation and automatic calculation of servings, units, and costs

**Independent Test**: Add beverage items (wine 40%, beer 30%, spirits 30%) to an order and verify calculated servings and units needed are correct.

### Implementation for User Story 3

- [x] T024 [US3] Create BarOrderDetailPage shell in `src/pages/bar-orders/BarOrderDetailPage.tsx`
- [x] T025 [US3] Add route for bar order detail page in App.tsx
- [x] T026 [P] [US3] Create BarOrderItemsTable component displaying items with calculations in `src/components/bar-orders/BarOrderItemsTable.tsx`
- [x] T027 [US3] Create BarOrderItemModal component (add/edit item form) in `src/components/bar-orders/BarOrderItemModal.tsx`
- [x] T028 [US3] Implement real-time item calculation preview in BarOrderItemModal in `src/components/bar-orders/BarOrderItemModal.tsx`
- [x] T029 [US3] Wire up create/update/delete item mutations in `src/hooks/useBarOrderMutations.ts`
- [x] T030 [US3] Integrate items table and item modal into BarOrderDetailPage in `src/pages/bar-orders/BarOrderDetailPage.tsx`
- [x] T031 [US3] Add "Add Item" button and item management UI to detail page in `src/pages/bar-orders/BarOrderDetailPage.tsx`

**Checkpoint**: User Story 3 complete - can add, edit, delete beverage items with auto-calculations

---

## Phase 6: User Story 4 - Percentage Validation (Priority: P2)

**Goal**: Display warnings when percentages don't total 100% and prevent saves when outside 90-110% range

**Independent Test**: Add items totaling 90%, 100%, and 110% and verify appropriate warnings/errors display.

### Implementation for User Story 4

- [x] T032 [P] [US4] Create PercentageWarning component for warning/error display in `src/components/bar-orders/PercentageWarning.tsx`
- [x] T033 [US4] Implement percentage total calculation helper in `src/lib/barOrderCalculations.ts`
- [x] T034 [US4] Integrate PercentageWarning into BarOrderDetailPage in `src/pages/bar-orders/BarOrderDetailPage.tsx`
- [x] T035 [US4] Add save validation to prevent saves when percentage outside 90-110% in `src/pages/bar-orders/BarOrderDetailPage.tsx`

**Checkpoint**: User Story 4 complete - percentage validation with warnings and blocking errors

---

## Phase 7: User Story 5 - Order Status Management (Priority: P2)

**Goal**: Track bar order status through draft → confirmed → ordered → delivered lifecycle

**Independent Test**: Change an order status from draft to confirmed to ordered to delivered and verify status badge updates correctly.

### Implementation for User Story 5

- [x] T036 [US5] Add status dropdown to BarOrderModal for editing in `src/components/bar-orders/BarOrderModal.tsx`
- [x] T037 [US5] Wire up edit mutation to BarOrderModal in `src/components/bar-orders/BarOrderModal.tsx`
- [x] T038 [US5] Add edit order button to BarOrderCard in `src/components/bar-orders/BarOrderCard.tsx`
- [x] T039 [US5] Add edit order functionality to BarOrderDetailPage header in `src/pages/bar-orders/BarOrderDetailPage.tsx`
- [x] T040 [P] [US5] Create DeleteBarOrderDialog component in `src/components/bar-orders/DeleteBarOrderDialog.tsx`
- [x] T041 [US5] Integrate delete functionality into BarOrderCard and detail page in `src/pages/bar-orders/BarOrdersPage.tsx`

**Checkpoint**: User Story 5 complete - full order lifecycle management with edit and delete

---

## Phase 8: User Story 6 - View Order Summary Totals (Priority: P2)

**Goal**: Display aggregated totals (total units, total cost, total percentage) for each bar order

**Independent Test**: Create an order with multiple items and verify summary totals correctly aggregate units and costs.

### Implementation for User Story 6

- [x] T042 [P] [US6] Create BarOrderSummary component displaying totals in `src/components/bar-orders/BarOrderSummary.tsx`
- [x] T043 [US6] Implement summary calculation helper in `src/lib/barOrderCalculations.ts`
- [x] T044 [US6] Integrate summary component into BarOrderDetailPage in `src/pages/bar-orders/BarOrderDetailPage.tsx`
- [x] T045 [US6] Display total units and cost in BarOrderCard for list view in `src/components/bar-orders/BarOrderCard.tsx`

**Checkpoint**: User Story 6 complete - order summary totals visible in detail and list views

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsive design, accessibility, and final validation

- [x] T046 [P] Add mobile responsive layout (cards stack, table scrolls) in `src/pages/bar-orders/BarOrdersPage.tsx`
- [x] T047 [P] Add mobile responsive layout to detail page in `src/pages/bar-orders/BarOrderDetailPage.tsx`
- [x] T048 [P] Add keyboard navigation and focus management to modals in `src/components/bar-orders/BarOrderModal.tsx`
- [x] T049 [P] Add keyboard navigation to item modal in `src/components/bar-orders/BarOrderItemModal.tsx`
- [x] T050 [P] Add ARIA labels and screen reader support to items table in `src/components/bar-orders/BarOrderItemsTable.tsx`
- [x] T051 [P] Verify WCAG 2.1 AA color contrast on all status badges in `src/components/bar-orders/BarOrderStatusBadge.tsx`
- [x] T052 Add toast notifications for all CRUD operations in `src/hooks/useBarOrderMutations.ts`
- [x] T053 Add loading and error states to detail page in `src/pages/bar-orders/BarOrderDetailPage.tsx`
- [ ] T054 Manual testing with Playwright MCP following quickstart.md scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1-US3 (P1): Core functionality - complete first
  - US4-US6 (P2): Enhancements - can start after P1 stories
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Shares BarOrderStatusBadge with US1
- **User Story 3 (P1)**: Depends on US2 (needs order to exist before adding items)
- **User Story 4 (P2)**: Depends on US3 (needs items to validate percentages)
- **User Story 5 (P2)**: Can start after US2 - Independent status management
- **User Story 6 (P2)**: Depends on US3 (needs items to calculate totals)

### Within Each User Story

- Types/schemas before components
- Hooks before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001-T005 can run in parallel (different files)
- T012-T014 can run in parallel (different components)
- T017, T026 can run in parallel (different components)
- T032, T040, T042 can run in parallel (different components)
- T046-T051 can all run in parallel (different files)

---

## Parallel Example: Setup Phase

```bash
# Launch all setup tasks together:
Task: "Create TypeScript interfaces in src/types/barOrder.ts"
Task: "Create Zod schema in src/schemas/barOrder.ts"
Task: "Create Zod schema in src/schemas/barOrderItem.ts"
Task: "Create status helpers in src/lib/barOrderStatus.ts"
Task: "Create calculation helpers in src/lib/barOrderCalculations.ts"
```

## Parallel Example: User Story 1

```bash
# Launch component shells together:
Task: "Create BarOrderStatusBadge in src/components/bar-orders/BarOrderStatusBadge.tsx"
Task: "Create BarOrderEmptyState in src/components/bar-orders/BarOrderEmptyState.tsx"
Task: "Create BarOrderCard in src/components/bar-orders/BarOrderCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (list view)
4. Complete Phase 4: User Story 2 (create orders)
5. Complete Phase 5: User Story 3 (add items)
6. **STOP and VALIDATE**: Test full bar order creation independently
7. Deploy/demo if ready - users can create bar orders with calculations!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (read-only list view)
3. Add User Stories 2-3 → Test independently → Deploy/Demo (full CRUD - MVP!)
4. Add User Stories 4-6 → Test independently → Deploy/Demo (validation + status + totals)
5. Complete Polish phase → Final validation

### Single Developer Strategy (Recommended)

1. Complete Setup (T001-T005) - ~30 min
2. Complete Foundational (T006-T011) - ~1 hour
3. Complete US1 (T012-T016) - ~45 min
4. Complete US2 (T017-T023) - ~1.5 hours
5. Complete US3 (T024-T031) - ~1.5 hours
6. Complete US4 (T032-T035) - ~30 min
7. Complete US5 (T036-T041) - ~45 min
8. Complete US6 (T042-T045) - ~30 min
9. Complete Polish (T046-T054) - ~1 hour

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing only - use Playwright MCP for validation per constitution
- Follow existing VowSync patterns from vendors/, budget/ components
- Database tables already exist - no schema changes needed
