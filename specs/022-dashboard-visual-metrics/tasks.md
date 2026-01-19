# Tasks: Dashboard Visual Metrics Redesign

**Input**: Design documents from `/specs/022-dashboard-visual-metrics/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/components.md, quickstart.md

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Components: `src/components/dashboard/`
- Hooks: `src/hooks/`
- Types: `src/types/`
- Pages: `src/pages/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and component scaffolding

- [x] T001 Create component directory structure at src/components/dashboard/ (verify exists)
- [x] T002 [P] Create QuickStatsRow.tsx scaffold with props interface in src/components/dashboard/QuickStatsRow.tsx
- [x] T003 [P] Create BudgetOverviewCard.tsx scaffold with props interface in src/components/dashboard/BudgetOverviewCard.tsx
- [x] T004 [P] Create RsvpStatusCard.tsx scaffold with props interface in src/components/dashboard/RsvpStatusCard.tsx
- [x] T005 [P] Create EventTimelineCard.tsx scaffold with props interface in src/components/dashboard/EventTimelineCard.tsx
- [x] T006 [P] Create VendorInvoicesCard.tsx scaffold with props interface in src/components/dashboard/VendorInvoicesCard.tsx
- [x] T007 [P] Create ItemsStatusCard.tsx scaffold with props interface in src/components/dashboard/ItemsStatusCard.tsx
- [x] T008 [P] Create BarOrdersStatusCard.tsx scaffold with props interface in src/components/dashboard/BarOrdersStatusCard.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Verify useDashboard hook provides all required data (wedding, metrics, events, guestStats, vendorStats, itemsStats, barOrdersStats) in src/hooks/useDashboard.ts
- [x] T010 Verify getEventColor utility function exists and returns correct colors for event_order 1-7 in src/lib/utils.ts
- [x] T011 Verify useCurrency hook and formatCurrency function work correctly in src/contexts/CurrencyContext.tsx
- [x] T012 Define gradient constants for Quick Stats icons (guests, events, budget, vendors) in src/components/dashboard/QuickStatsRow.tsx
- [x] T013 Define RSVP status color constants (#FF9800 pending, #4CAF50 confirmed, #F44336 declined, #2196F3 invited) in src/components/dashboard/RsvpStatusCard.tsx
- [x] T014 Define vendor invoice badge color constants (overdue, unpaid, partiallyPaid, paid) in src/components/dashboard/VendorInvoicesCard.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Stats Overview (Priority: P1) 🎯 MVP

**Goal**: Display 4 stat pills with circular gradient icons showing Guests, Events, Budget %, and Vendors at a glance

**Independent Test**: Load dashboard, verify Quick Stats row displays 4 circular gradient icons with accurate counts. Test with zero counts to verify "0" displays correctly.

### Implementation for User Story 1

- [x] T015 [US1] Implement StatPill internal component with gradient icon container (56px circle) in src/components/dashboard/QuickStatsRow.tsx
- [x] T016 [US1] Implement gradient background rendering for 4 icon types (Users, Calendar, PiggyBank, FileText) in src/components/dashboard/QuickStatsRow.tsx
- [x] T017 [US1] Implement QuickStatsRow layout with responsive grid (4-col desktop, 2-col mobile) in src/components/dashboard/QuickStatsRow.tsx
- [x] T018 [US1] Add loading skeleton state (4 placeholder pills with pulse animation) in src/components/dashboard/QuickStatsRow.tsx
- [x] T019 [US1] Add value typography (32px bold) and label typography (14px gray-600) in src/components/dashboard/QuickStatsRow.tsx
- [x] T020 [US1] Wire QuickStatsRow to WeddingDashboardPage with data from useDashboard in src/pages/WeddingDashboardPage.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Budget Overview Visualization (Priority: P1)

**Goal**: Display budget status as circular progress chart (180px SVG) with percentage in center and legend showing Total/Spent/Remaining

**Independent Test**: Load dashboard with budget_total=R 60,500 and budget_actual=R 17,000, verify circular chart shows 28% with correct legend values.

### Implementation for User Story 2

- [x] T021 [US2] Implement SVG circular progress chart (viewBox 0 0 180 180, radius 80, strokeWidth 12) in src/components/dashboard/BudgetOverviewCard.tsx
- [x] T022 [US2] Add linearGradient definition for progress stroke (#4CAF50 to #81C784) in src/components/dashboard/BudgetOverviewCard.tsx
- [x] T023 [US2] Implement stroke-dasharray/stroke-dashoffset calculation for progress animation in src/components/dashboard/BudgetOverviewCard.tsx
- [x] T024 [US2] Add center text (42px percentage, 13px "spent" label) in src/components/dashboard/BudgetOverviewCard.tsx
- [x] T025 [US2] Implement legend with colored dots (Total Budget, Spent, Remaining) using formatCurrency in src/components/dashboard/BudgetOverviewCard.tsx
- [x] T026 [US2] Handle edge case: budgetTotal=0 shows 0% gracefully without errors in src/components/dashboard/BudgetOverviewCard.tsx
- [x] T027 [US2] Add loading skeleton state with placeholder circle in src/components/dashboard/BudgetOverviewCard.tsx
- [x] T028 [US2] Add ARIA label for accessibility ("Budget spent: X percent") in src/components/dashboard/BudgetOverviewCard.tsx
- [x] T029 [US2] Wire BudgetOverviewCard to WeddingDashboardPage with data from useDashboard in src/pages/WeddingDashboardPage.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - RSVP Status Visualization (Priority: P1)

**Goal**: Display guest RSVP status as pie chart (160px SVG) showing segments for pending/invited/confirmed/declined with color legend

**Independent Test**: Load dashboard with guests having various invitation_status values, verify pie chart shows correct segment proportions with matching legend colors.

### Implementation for User Story 3

- [x] T030 [US3] Implement SVG pie chart using stroke-dasharray segments (viewBox 0 0 160 160, radius 60) in src/components/dashboard/RsvpStatusCard.tsx
- [x] T031 [US3] Calculate segment percentages from guestStats (rsvpNotInvited, rsvpInvited, rsvpConfirmed, rsvpDeclined) in src/components/dashboard/RsvpStatusCard.tsx
- [x] T032 [US3] Implement rotation calculation for each segment to start where previous ended in src/components/dashboard/RsvpStatusCard.tsx
- [x] T033 [US3] Implement legend with 16px square color indicators and counts in src/components/dashboard/RsvpStatusCard.tsx
- [x] T034 [US3] Handle edge case: all guests same status shows full circle in that color in src/components/dashboard/RsvpStatusCard.tsx
- [x] T035 [US3] Handle edge case: no guests shows empty state message "No guests added yet" in src/components/dashboard/RsvpStatusCard.tsx
- [x] T036 [US3] Add loading skeleton state with placeholder circle in src/components/dashboard/RsvpStatusCard.tsx
- [x] T037 [US3] Add ARIA label for accessibility ("RSVP status breakdown: X pending, Y confirmed...") in src/components/dashboard/RsvpStatusCard.tsx
- [x] T038 [US3] Wire RsvpStatusCard to WeddingDashboardPage with data from useDashboard in src/pages/WeddingDashboardPage.tsx

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Event Timeline (Priority: P2)

**Goal**: Display horizontal scrolling timeline of event cards with event-specific gradient colors matching Events page

**Independent Test**: Load dashboard with multiple events, verify horizontal scroll works and event cards display correct colors from getEventColor(event_order).

### Implementation for User Story 4

- [x] T039 [US4] Implement EventCard internal component with name, date, time, expected guests in src/components/dashboard/EventTimelineCard.tsx
- [x] T040 [US4] Apply getEventColor(event_order) for card background color in src/components/dashboard/EventTimelineCard.tsx
- [x] T041 [US4] Implement horizontal scroll container with overflow-x-auto and scroll-snap-type in src/components/dashboard/EventTimelineCard.tsx
- [x] T042 [US4] Set minimum card width 280px with gap-4 spacing in src/components/dashboard/EventTimelineCard.tsx
- [x] T043 [US4] Format event_date with date-fns and display event_start_time if exists in src/components/dashboard/EventTimelineCard.tsx
- [x] T044 [US4] Handle edge case: no events shows empty state with "Add Event" prompt in src/components/dashboard/EventTimelineCard.tsx
- [x] T045 [US4] Handle edge case: long event names truncate with ellipsis in src/components/dashboard/EventTimelineCard.tsx
- [x] T046 [US4] Add loading skeleton state with placeholder cards in src/components/dashboard/EventTimelineCard.tsx
- [x] T047 [US4] Wire EventTimelineCard to WeddingDashboardPage with data from useDashboard (full width span) in src/pages/WeddingDashboardPage.tsx

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Vendor Invoice Status (Priority: P2)

**Goal**: Display vendor invoice amounts grouped by status (Overdue, Unpaid, Partially Paid, Paid) with colored badges - amounts only, NO invoice counts

**Independent Test**: Load dashboard with vendor invoices, verify amounts display by status WITHOUT counts, formatted as "R X,XXX.XX".

### Implementation for User Story 5

- [x] T048 [US5] Implement StatusRow internal component with badge and right-aligned amount in src/components/dashboard/VendorInvoicesCard.tsx
- [x] T049 [US5] Apply badge colors (overdue:#FFEBEE/#C62828, unpaid:#FFF3E0/#E65100, partiallyPaid:#E3F2FD/#1565C0, paid:#E8F5E9/#2E7D32) in src/components/dashboard/VendorInvoicesCard.tsx
- [x] T050 [US5] Display ONLY amounts (vendorStats.overdue.totalAmount, etc.) using formatCurrency - NO counts in src/components/dashboard/VendorInvoicesCard.tsx
- [x] T051 [US5] Handle edge case: all zeros display "R 0.00" for each status in src/components/dashboard/VendorInvoicesCard.tsx
- [x] T052 [US5] Add loading skeleton state with placeholder rows in src/components/dashboard/VendorInvoicesCard.tsx
- [x] T053 [US5] Wire VendorInvoicesCard to WeddingDashboardPage with data from useDashboard in src/pages/WeddingDashboardPage.tsx

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - Items and Bar Orders Status (Priority: P3)

**Goal**: Display Items Status card (total/shortage) and Bar Orders card (draft/confirmed/delivered) at bottom of dashboard

**Independent Test**: Load dashboard with wedding items and bar orders, verify both cards display correct counts with appropriate color coding.

### Implementation for User Story 6

- [x] T054 [P] [US6] Implement ItemsStatusCard with total items, shortage count, and total cost in src/components/dashboard/ItemsStatusCard.tsx
- [x] T055 [P] [US6] Implement BarOrdersStatusCard with total, draft, confirmed, delivered counts in src/components/dashboard/BarOrdersStatusCard.tsx
- [x] T056 [US6] Add shortage warning styling (red text if > 0, green if = 0) in src/components/dashboard/ItemsStatusCard.tsx
- [x] T057 [US6] Add status color indicators (draft=yellow, confirmed=blue, delivered=green) in src/components/dashboard/BarOrdersStatusCard.tsx
- [x] T058 [US6] Handle edge case: no items/orders shows empty states gracefully in both components
- [x] T059 [US6] Add loading skeleton states for both cards
- [x] T060 [US6] Wire ItemsStatusCard and BarOrdersStatusCard to WeddingDashboardPage with data from useDashboard in src/pages/WeddingDashboardPage.tsx

**Checkpoint**: At this point, User Stories 1-6 should all work independently

---

## Phase 9: User Story 7 - Responsive Layout (Priority: P2)

**Goal**: Implement fully responsive dashboard layout that adapts across mobile (320px), tablet (768px), and desktop (1024px+)

**Independent Test**: View dashboard at 320px, 768px, 1024px, and 1440px viewports, verify grid layout adapts correctly with Event Timeline still scrolling horizontally on mobile.

### Implementation for User Story 7

- [x] T061 [US7] Implement main grid layout (2fr 1fr on desktop, single column on mobile) in src/pages/WeddingDashboardPage.tsx
- [x] T062 [US7] Add full-width span for Quick Stats row (col-span-2 on desktop) in src/pages/WeddingDashboardPage.tsx
- [x] T063 [US7] Add full-width span for Event Timeline (col-span-2 on desktop) in src/pages/WeddingDashboardPage.tsx
- [x] T064 [US7] Ensure Budget Overview takes 2fr and RSVP Status takes 1fr side-by-side on desktop in src/pages/WeddingDashboardPage.tsx
- [x] T065 [US7] Verify Event Timeline horizontal scroll works on mobile (touch-friendly) in src/components/dashboard/EventTimelineCard.tsx
- [x] T066 [US7] Add responsive padding/spacing adjustments for tablet breakpoint in all dashboard components
- [x] T067 [US7] Test and adjust status cards grid (auto-fit minmax(240px, 1fr)) for bottom section in src/pages/WeddingDashboardPage.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T068 Remove or archive old DashboardStatsGrid.tsx component (replaced by new visual components) in src/components/dashboard/
- [x] T069 [P] Ensure all SVG charts have NO extra padding/white space inside (per spec FR-014)
- [x] T070 [P] Verify icons match sidebar navigation icons exactly (per spec FR-013)
- [x] T071 [P] Verify VowSync brand palette used correctly (#D4A5A5, #A8B8A6, #C9A961) throughout
- [x] T072 Validate currency formatting uses "R" prefix with thousands separator throughout
- [x] T073 Run manual testing with Playwright MCP at all viewport sizes (320px, 768px, 1024px, 1440px)
- [x] T074 Verify WCAG 2.1 AA compliance: contrast ratios, keyboard navigation, ARIA labels
- [x] T075 Performance check: Ensure dashboard loads all visual elements within 2 seconds
- [x] T076 Final review of all edge cases (zero data, null values, very large numbers)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 (Quick Stats), US2 (Budget), US3 (RSVP) are P1 - implement first
  - US4 (Timeline), US5 (Invoices), US7 (Responsive) are P2 - implement second
  - US6 (Items/Bar Orders) is P3 - implement last
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 7 (P2)**: Should be implemented AFTER all component stories (US1-US6) to finalize layout

### Within Each User Story

- SVG/visual implementation before wiring to page
- Edge cases after main implementation
- Loading states after main implementation
- Accessibility (ARIA) after visual implementation
- Wire to page as final task

### Parallel Opportunities

- **Phase 1**: T002-T008 can all run in parallel (different component files)
- **Phase 2**: T012-T014 can run in parallel (different files)
- **Phase 3-8**: US1, US2, US3, US4, US5, US6 can all be worked on in parallel by different developers
- **Phase 10**: T069, T070, T071 can run in parallel (different concerns)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all component scaffolds together:
Task: "Create QuickStatsRow.tsx scaffold in src/components/dashboard/QuickStatsRow.tsx"
Task: "Create BudgetOverviewCard.tsx scaffold in src/components/dashboard/BudgetOverviewCard.tsx"
Task: "Create RsvpStatusCard.tsx scaffold in src/components/dashboard/RsvpStatusCard.tsx"
Task: "Create EventTimelineCard.tsx scaffold in src/components/dashboard/EventTimelineCard.tsx"
Task: "Create VendorInvoicesCard.tsx scaffold in src/components/dashboard/VendorInvoicesCard.tsx"
Task: "Create ItemsStatusCard.tsx scaffold in src/components/dashboard/ItemsStatusCard.tsx"
Task: "Create BarOrdersStatusCard.tsx scaffold in src/components/dashboard/BarOrdersStatusCard.tsx"
```

## Parallel Example: P1 User Stories

```bash
# Launch all P1 priority stories together (different components):
Developer A: User Story 1 (QuickStatsRow) - T015-T020
Developer B: User Story 2 (BudgetOverviewCard) - T021-T029
Developer C: User Story 3 (RsvpStatusCard) - T030-T038
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Quick Stats)
4. Complete Phase 4: User Story 2 (Budget Overview)
5. Complete Phase 5: User Story 3 (RSVP Status)
6. **STOP and VALIDATE**: Test all three P1 stories independently
7. Deploy/demo if ready - This is the MVP!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1-3 (P1) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 4-5 (P2 components) → Test independently → Deploy/Demo
4. Add User Story 6 (P3) → Test independently → Deploy/Demo
5. Add User Story 7 (Responsive) → Test at all viewports → Final Demo
6. Polish phase → Final validation

### Single Developer Strategy

With one developer (sequential):

1. Phase 1: Setup (~30 min)
2. Phase 2: Foundational (~1 hour)
3. Phase 3-5: P1 Stories (US1, US2, US3) (~4 hours)
4. **MVP Checkpoint**: Validate core dashboard
5. Phase 6-7: P2 Stories (US4, US5) (~2 hours)
6. Phase 8: P3 Story (US6) (~1 hour)
7. Phase 9: Responsive (US7) (~1 hour)
8. Phase 10: Polish (~1 hour)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing with Playwright MCP only (per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All data comes from existing hooks - no new database tables needed
- Currency formatting: Always use formatCurrency() from useCurrency hook
- Event colors: Always use getEventColor(event_order) from utils
