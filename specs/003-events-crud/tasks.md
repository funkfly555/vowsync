# Tasks: Events Management CRUD

**Input**: Design documents from `/specs/003-events-crud/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types, constants, and utilities needed by all user stories

- [ ] T001 [P] Create Event TypeScript types in src/types/event.ts
- [ ] T002 [P] Add event constants (EVENT_TYPE_OPTIONS, EVENT_ORDER_OPTIONS, EVENT_COLORS) to src/lib/constants.ts
- [ ] T003 [P] Add event utility functions (getEventColor, calculateDuration, formatDuration, formatTime, getEventGuestCount) to src/lib/utils.ts
- [ ] T004 [P] Create event validation schema with Zod in src/schemas/event.ts

**Checkpoint**: Foundation types and utilities ready - user story implementation can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data hooks that MUST be complete before ANY user story UI can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create useEvents hook with list query in src/hooks/useEvents.ts
- [ ] T006 Add create mutation to useEvents hook in src/hooks/useEvents.ts
- [ ] T007 Add update mutation to useEvents hook in src/hooks/useEvents.ts
- [ ] T008 Add delete mutation to useEvents hook in src/hooks/useEvents.ts
- [ ] T009 Add getNextAvailableOrder helper to useEvents hook in src/hooks/useEvents.ts
- [ ] T010 Add routes for event pages to src/App.tsx

**Checkpoint**: Data layer ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Events Timeline (Priority: P1)

**Goal**: Display all events for a wedding in chronological order with visual timeline

**Independent Test**: Navigate to `/weddings/:weddingId/events` and verify all events display in order with correct information, colors, and duration calculations

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create DurationDisplay component in src/components/events/DurationDisplay.tsx
- [ ] T012 [P] [US1] Create EmptyEventsState component with "No events yet" message in src/components/events/EmptyEventsState.tsx
- [ ] T013 [US1] Create EventCard component with color-coded border, time, location, duration in src/components/events/EventCard.tsx
- [ ] T014 [US1] Create EventTimeline component with vertical timeline and connecting lines in src/components/events/EventTimeline.tsx
- [ ] T015 [US1] Create EventTimelinePage with header, back button, and Add Event button in src/pages/EventTimelinePage.tsx
- [ ] T016 [US1] Add "View Events" navigation link to WeddingCard in src/components/weddings/WeddingCard.tsx

**Checkpoint**: User Story 1 complete - timeline displays events with colors, duration, guest counts. Independently testable.

---

## Phase 4: User Story 2 - Create New Event (Priority: P1)

**Goal**: Allow consultant to create a new event for a wedding with validation

**Independent Test**: Fill out create event form, submit, verify event appears in timeline with success toast

### Implementation for User Story 2

- [ ] T017 [US2] Create EventForm component with all fields (order, name, type, date, times, location, notes) in src/components/events/EventForm.tsx
- [ ] T018 [US2] Add real-time duration preview to EventForm in src/components/events/EventForm.tsx
- [ ] T019 [US2] Add order uniqueness validation with warning message to EventForm in src/components/events/EventForm.tsx
- [ ] T020 [US2] Add date warning when event_date differs from wedding_date by >7 days to EventForm in src/components/events/EventForm.tsx
- [ ] T021 [US2] Create CreateEventPage with form and navigation in src/pages/CreateEventPage.tsx

**Checkpoint**: User Story 2 complete - can create events with full validation. Independently testable.

---

## Phase 5: User Story 3 - Edit Existing Event (Priority: P2)

**Goal**: Allow consultant to edit existing event details with pre-populated form

**Independent Test**: Click event card, modify fields, save, verify changes persist with success toast

### Implementation for User Story 3

- [ ] T022 [US3] Create EditEventPage with pre-populated form in src/pages/EditEventPage.tsx
- [ ] T023 [US3] Add guest attendance warning when changing event_order in EditEventPage in src/pages/EditEventPage.tsx
- [ ] T024 [US3] Make EventCard clickable to navigate to edit page in src/components/events/EventCard.tsx

**Checkpoint**: User Story 3 complete - can edit events with all validations. Independently testable.

---

## Phase 6: User Story 4 - Delete Event (Priority: P3)

**Goal**: Allow consultant to delete events with confirmation dialog

**Independent Test**: Click delete on event, confirm in dialog, verify event removed with success toast

### Implementation for User Story 4

- [ ] T025 [US4] Create DeleteEventDialog component with confirmation in src/components/events/DeleteEventDialog.tsx
- [ ] T026 [US4] Add delete button to EventCard in src/components/events/EventCard.tsx
- [ ] T027 [US4] Add delete button (red, bottom left) to EditEventPage in src/pages/EditEventPage.tsx

**Checkpoint**: User Story 4 complete - can delete events with cascade warning. Independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T028 [P] Add mobile responsive styles to EventTimeline in src/components/events/EventTimeline.tsx
- [ ] T029 [P] Add mobile responsive styles to EventForm in src/components/events/EventForm.tsx
- [ ] T030 [P] Ensure all interactive elements are keyboard accessible
- [ ] T031 Verify all toast notifications for create, update, delete actions
- [ ] T032 Run quickstart.md validation (manual testing with Playwright MCP)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel (both P1 priority)
  - US3 depends on US2 (reuses EventForm component)
  - US4 can proceed after US1 (needs EventCard to add delete button)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Depends on US2 (reuses EventForm) - Can start after T017-T020 complete
- **User Story 4 (P3)**: Depends on US1 (needs EventCard) - Can start after T013 complete

### Within Each User Story

- Components before pages
- Base components before enhanced components
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1**: All Setup tasks (T001-T004) can run in parallel
**Phase 2**: T005-T009 are sequential (all modify same hook file), T010 can run in parallel
**Phase 3**: T011-T012 can run in parallel, then T013, T014, T015 (sequential deps)
**Phase 4**: T017 first, then T018-T020 can run in parallel, then T021
**Phase 5**: T022 first, then T023-T024 can run in parallel
**Phase 6**: T025 first, then T026-T027 can run in parallel
**Phase 7**: T028-T030 can run in parallel

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all Phase 1 tasks in parallel (different files):
Task: "T001 Create Event TypeScript types in src/types/event.ts"
Task: "T002 Add event constants to src/lib/constants.ts"
Task: "T003 Add event utility functions to src/lib/utils.ts"
Task: "T004 Create event validation schema in src/schemas/event.ts"
```

## Parallel Example: User Story 1 Components

```bash
# Launch independent components in parallel:
Task: "T011 Create DurationDisplay component in src/components/events/DurationDisplay.tsx"
Task: "T012 Create EmptyEventsState component in src/components/events/EmptyEventsState.tsx"

# Then create dependent components (sequential):
Task: "T013 Create EventCard component (uses DurationDisplay)"
Task: "T014 Create EventTimeline component (uses EventCard, EmptyEventsState)"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T004) - ~30 min
2. Complete Phase 2: Foundational (T005-T010) - ~45 min
3. Complete Phase 3: User Story 1 (T011-T016) - ~1 hr
4. Complete Phase 4: User Story 2 (T017-T021) - ~1 hr
5. **STOP and VALIDATE**: Test timeline view and event creation
6. Deploy/demo if ready - MVP complete!

### Incremental Delivery

1. Complete Setup + Foundational + US1 + US2 → MVP ready (view timeline + create events)
2. Add User Story 3 → Can edit events
3. Add User Story 4 → Can delete events
4. Polish phase → Mobile responsive, accessibility

### File Summary

| File Path | Tasks |
|-----------|-------|
| src/types/event.ts | T001 |
| src/lib/constants.ts | T002 |
| src/lib/utils.ts | T003 |
| src/schemas/event.ts | T004 |
| src/hooks/useEvents.ts | T005, T006, T007, T008, T009 |
| src/App.tsx | T010 |
| src/components/events/DurationDisplay.tsx | T011 |
| src/components/events/EmptyEventsState.tsx | T012 |
| src/components/events/EventCard.tsx | T013, T024, T026 |
| src/components/events/EventTimeline.tsx | T014, T028 |
| src/pages/EventTimelinePage.tsx | T015 |
| src/components/weddings/WeddingCard.tsx | T016 |
| src/components/events/EventForm.tsx | T017, T018, T019, T020, T029 |
| src/pages/CreateEventPage.tsx | T021 |
| src/pages/EditEventPage.tsx | T022, T023, T027 |
| src/components/events/DeleteEventDialog.tsx | T025 |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing with Playwright MCP per constitution (no automated tests)
