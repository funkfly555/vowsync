# Tasks: Wedding Dashboard

**Input**: Design documents from `/specs/004-wedding-dashboard/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/api.md (complete)

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create TypeScript types and utility functions required by all dashboard components

- [x] T001 [P] Create dashboard types file at `src/types/dashboard.ts` with DashboardMetrics, GuestStats, ActivityItem, QuickAction, DashboardData interfaces (per data-model.md)
- [x] T002 [P] Add dashboard utility functions to `src/lib/utils.ts`: calculateDaysUntil(date), formatBudgetPercentage(spent, total), getRelativeTimeString(date)

**Checkpoint**: Types and utilities ready for hook and component development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks and routing that MUST be complete before ANY user story components can be implemented

**Note**: No database migrations required - this feature uses existing tables (weddings, events, guests, activity_log)

- [x] T003 Create `useGuestStats` hook in `src/hooks/useGuestStats.ts` - fetches guest counts by invitation_status using Supabase aggregation queries (per contracts/api.md Q3)
- [x] T004 Create `useRecentActivity` hook in `src/hooks/useRecentActivity.ts` - fetches recent activity_log entries with limit parameter (per contracts/api.md Q4)
- [x] T005 Create `useDashboard` orchestrator hook in `src/hooks/useDashboard.ts` - combines useWedding, useEvents, useGuestStats, useRecentActivity with parallel TanStack Query (per research.md Decision 2)
- [x] T006 Add dashboard route to `src/App.tsx`: `/weddings/:weddingId` -> WeddingDashboardPage (per contracts/api.md Route Contract)
- [x] T007 [P] Create empty `WeddingDashboardPage.tsx` in `src/pages/` with route param extraction and basic structure

**Checkpoint**: Foundation ready - all hooks working, route accessible. User story component implementation can now begin.

---

## Phase 3: User Story 1 - View Wedding Overview Metrics (Priority: P1) 🎯 MVP

**Goal**: Display 4 metric cards showing days until wedding, guest count, event count, and budget summary

**Independent Test**: Navigate to `/weddings/:weddingId` and verify all metric cards display correct counts and calculations from the database.

### Implementation for User Story 1

- [x] T008 [P] [US1] Create `MetricCard` component in `src/components/dashboard/MetricCard.tsx` - reusable card with title, value, subtitle, icon, optional trend indicator, optional onClick (per contracts/api.md MetricCardProps)
- [x] T009 [US1] Create `MetricsGrid` component in `src/components/dashboard/MetricsGrid.tsx` - renders 4 MetricCards in responsive grid (4-col desktop, 2x2 tablet, 1-col mobile) using metrics, weddingDate, isLoading props (per contracts/api.md MetricsGridProps)
- [x] T010 [US1] Integrate MetricsGrid into WeddingDashboardPage with data from useDashboard hook
- [x] T011 [US1] Add edge case handling: wedding today shows "Wedding Day!", past wedding shows "X days ago", budget 0 shows "Not set"

**Checkpoint**: User Story 1 complete - metrics dashboard functional and independently testable

---

## Phase 4: User Story 2 - View Events Timeline Summary (Priority: P1)

**Goal**: Display chronological list of up to 5 events with name, date, time, location and navigation to event detail

**Independent Test**: View dashboard and verify events are listed chronologically with correct times, dates, and quick navigation links.

### Implementation for User Story 2

- [x] T012 [US2] Create `EventsSummary` component in `src/components/dashboard/EventsSummary.tsx` - renders up to 5 events in chronological order with event icon, name, formatted date/time, location, onClick navigation (per contracts/api.md EventsSummaryProps)
- [x] T013 [US2] Add empty state to EventsSummary: "No events yet" with "Add your first event" link to `/weddings/:id/events/new`
- [x] T014 [US2] Integrate EventsSummary into WeddingDashboardPage with events data from useDashboard hook
- [x] T015 [US2] Add event click navigation to `/weddings/:weddingId/events/:eventId/edit`

**Checkpoint**: User Stories 1 AND 2 complete - both metrics and events summary work independently

---

## Phase 5: User Story 3 - Quick Actions Panel (Priority: P2)

**Goal**: Provide 4 quick action buttons for common operations: Add Guest, Add Event, View Timeline, Manage Budget

**Independent Test**: Click each quick action button and verify it navigates to the correct page.

### Implementation for User Story 3

- [x] T016 [US3] Create `QuickActions` component in `src/components/dashboard/QuickActions.tsx` - renders 4 action buttons in responsive grid (row desktop, 2x2 tablet/mobile) with icons from Lucide (per contracts/api.md QuickActionsProps)
- [x] T017 [US3] Configure quick actions with navigation:
  - "Add Guest" -> `/weddings/:id/guests` (future feature, link to guests page for now)
  - "Add Event" -> `/weddings/:id/events/new`
  - "View Timeline" -> `/weddings/:id/events`
  - "Manage Budget" -> disabled with tooltip "Coming soon" (per research.md Decision 5)
- [x] T018 [US3] Integrate QuickActions into WeddingDashboardPage

**Checkpoint**: User Stories 1, 2, AND 3 complete - all P1 and one P2 story functional

---

## Phase 6: User Story 4 - RSVP Status Overview (Priority: P2)

**Goal**: Display RSVP progress bar with confirmed/declined/pending breakdown

**Independent Test**: View dashboard with guests in various RSVP states and verify the progress bar and counts are accurate.

### Implementation for User Story 4

- [x] T019 [US4] Verify Shadcn Progress component is installed, if not add via `npx shadcn@latest add progress`
- [x] T020 [US4] Create `RsvpProgress` component in `src/components/dashboard/RsvpProgress.tsx` - renders Progress bar showing response rate with text breakdown "X confirmed, Y declined, Z pending" (per contracts/api.md RsvpProgressProps, research.md Decision 6)
- [x] T021 [US4] Add empty state: "No guests yet" with "Add your first guest" link
- [x] T022 [US4] Integrate RsvpProgress into WeddingDashboardPage with guestStats from useDashboard hook

**Checkpoint**: All P1 and P2 stories complete

---

## Phase 7: User Story 5 - Recent Activity Feed (Priority: P3)

**Goal**: Display 5 most recent activity log entries with action type icons and relative timestamps

**Independent Test**: Make changes to wedding data and verify they appear in the activity feed with correct timestamps and descriptions.

### Implementation for User Story 5

- [x] T023 [US5] Create `ActivityFeed` component in `src/components/dashboard/ActivityFeed.tsx` - renders up to 5 activities with icon based on entity_type, description text, relative timestamp using date-fns formatDistanceToNow (per contracts/api.md ActivityFeedProps, research.md Decision 4)
- [x] T024 [US5] Add empty state: "No recent activity" message
- [x] T025 [US5] Integrate ActivityFeed into WeddingDashboardPage with recentActivity from useDashboard hook

**Checkpoint**: All user stories complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Loading states, navigation updates, responsive design, and accessibility

- [x] T026 [P] Create `DashboardSkeleton` component in `src/components/dashboard/DashboardSkeleton.tsx` - renders skeleton loaders matching dashboard layout using Tailwind animate-pulse (per research.md Decision 7)
- [x] T027 Add loading state to WeddingDashboardPage using DashboardSkeleton when useDashboard.isLoading is true
- [x] T028 Add error state to WeddingDashboardPage with user-friendly message and retry button when useDashboard.isError is true
- [x] T029 Update `WeddingCard` component in `src/components/weddings/WeddingCard.tsx` to link to `/weddings/:id` (dashboard) instead of `/weddings/:id/edit`
- [x] T030 Add data-testid attributes to all dashboard components for Playwright MCP testing (per quickstart.md)
- [x] T031 Verify responsive design: test at 320px, 768px, 1024px, 1920px viewports
- [x] T032 Verify keyboard accessibility: tab through all interactive elements, ensure focus indicators visible
- [x] T033 Run quickstart.md manual testing checklist via Playwright MCP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (P1) and US2 (P1) can proceed in parallel
  - US3 (P2) and US4 (P2) can proceed in parallel (after or with P1 stories)
  - US5 (P3) can proceed independently
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Metrics)**: Requires T005 (useDashboard hook) - No dependencies on other stories
- **User Story 2 (P1 - Events)**: Requires T005 (useDashboard hook) - No dependencies on other stories
- **User Story 3 (P2 - Quick Actions)**: Requires T007 (WeddingDashboardPage) - No dependencies on other stories
- **User Story 4 (P2 - RSVP)**: Requires T003 (useGuestStats), T005 (useDashboard) - No dependencies on other stories
- **User Story 5 (P3 - Activity)**: Requires T004 (useRecentActivity), T005 (useDashboard) - No dependencies on other stories

### Within Each User Story

- Components before page integration
- Core implementation before edge case handling
- Story complete before moving to next priority

### Parallel Opportunities

- T001, T002 can run in parallel (Setup phase)
- T003, T004 can run in parallel, then T005 depends on them (Foundational)
- T006, T007 can run in parallel with T003-T005
- US1 and US2 can run in parallel (both P1)
- US3 and US4 can run in parallel (both P2)
- T026 (skeleton) can run in parallel with any user story work

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T007)
3. Complete Phase 3: User Story 1 - Metrics (T008-T011)
4. **STOP and VALIDATE**: Test metrics display independently
5. Deploy/demo if ready - users can see key wedding metrics

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add User Story 1 (Metrics) -> Test -> Deploy (MVP!)
3. Add User Story 2 (Events) -> Test -> Deploy
4. Add User Story 3 (Quick Actions) -> Test -> Deploy
5. Add User Story 4 (RSVP) -> Test -> Deploy
6. Add User Story 5 (Activity) -> Test -> Deploy
7. Polish phase -> Final deployment

### Recommended Execution Order (Single Developer)

```
Phase 1: T001 || T002 (parallel)
Phase 2: T003 || T004 (parallel) -> T005 -> T006 || T007 (parallel)
Phase 3: T008 -> T009 -> T010 -> T011 (US1 complete)
Phase 4: T012 -> T013 -> T014 -> T015 (US2 complete)
Phase 5: T016 -> T017 -> T018 (US3 complete)
Phase 6: T019 -> T020 -> T021 -> T022 (US4 complete)
Phase 7: T023 -> T024 -> T025 (US5 complete)
Phase 8: T026 || T030 (parallel) -> T027 -> T028 -> T029 -> T031 -> T032 -> T033
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No automated tests - manual testing with Playwright MCP per constitution
- All components use existing Shadcn/ui primitives (Card, Button, Progress)
- All data from existing tables - no migrations needed
