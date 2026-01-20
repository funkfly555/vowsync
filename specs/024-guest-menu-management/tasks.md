# Tasks: Guest Management Enhancement & Menu Configuration

**Feature**: 024-guest-menu-management
**Input**: Design documents from `/specs/024-guest-menu-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Manual testing with Playwright MCP only (per VowSync Constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Database & Types)

**Purpose**: Apply database migrations and create TypeScript types

- [ ] T001 Apply database migration from specs/024-guest-menu-management/contracts/migration.sql via Supabase
- [ ] T002 [P] Generate updated Supabase TypeScript types with `supabase gen types typescript`
- [ ] T003 [P] Create MealOption type definitions in src/types/meal-option.ts
- [ ] T004 [P] Create Zod validation schemas for meal options in src/types/meal-option.ts

---

## Phase 2: Foundational (Guest Modal Structure)

**Purpose**: Create 7-tab modal structure that ALL user stories depend on

**⚠️ CRITICAL**: No tab implementation can begin until the modal structure is complete

- [ ] T005 Create tabs directory structure at src/components/guests/tabs/
- [ ] T006 Expand GuestModal.tsx width to max-w-3xl (768px) in src/components/guests/GuestModal.tsx
- [ ] T007 Implement 7-tab structure with Shadcn Tabs component in src/components/guests/GuestModal.tsx
- [ ] T008 [P] Create tab icon imports (User, Mail, Armchair, Utensils, UtensilsCrossed, Calendar, Bus) in src/components/guests/GuestModal.tsx
- [ ] T009 Create placeholder tab components for all 7 tabs in src/components/guests/tabs/

**Checkpoint**: Modal structure ready - tab content implementation can now begin

---

## Phase 3: User Story 1 - Configure Wedding Menu Options (Priority: P1) 🎯 MVP

**Goal**: Wedding consultants can configure 5 meal options per course (starter, main, dessert) for each wedding

**Independent Test**: Navigate to Menu page, create/edit/delete meal options for all 3 courses, verify save success

### Implementation for User Story 1

- [ ] T010 [P] [US1] Create useMealOptions hook with TanStack Query in src/hooks/useMealOptions.ts
- [ ] T011 [P] [US1] Create useMealOptionMutations hook for CRUD operations in src/hooks/useMealOptions.ts
- [ ] T012 [P] [US1] Create CourseSection component in src/components/menu/CourseSection.tsx
- [ ] T013 [P] [US1] Create MealOptionCard component with edit/delete in src/components/menu/MealOptionCard.tsx
- [ ] T014 [US1] Create MenuPage with 3 course sections in src/pages/MenuPage.tsx
- [ ] T015 [US1] Add menu route /weddings/:weddingId/menu in src/App.tsx
- [ ] T016 [US1] Add Menu navigation link to wedding sidebar in src/components/layout/WeddingSidebar.tsx
- [ ] T017 [US1] Add meal count aggregation display on MenuPage in src/pages/MenuPage.tsx
- [ ] T018 [US1] Add loading and error states to MenuPage in src/pages/MenuPage.tsx

**Checkpoint**: Menu configuration is fully functional and independently testable

---

## Phase 4: User Story 2 - Manage Guest Basic Information (Priority: P1)

**Goal**: Wedding consultants can manage guest basic information including all required fields

**Independent Test**: Open guest modal Basic Info tab, edit all fields, verify save success

### Implementation for User Story 2

- [ ] T019 [US2] Create BasicInfoTab component in src/components/guests/tabs/BasicInfoTab.tsx
- [ ] T020 [US2] Implement form fields: first_name, last_name, email, phone, address in src/components/guests/tabs/BasicInfoTab.tsx
- [ ] T021 [US2] Add guest group dropdown with predefined options in src/components/guests/tabs/BasicInfoTab.tsx
- [ ] T022 [US2] Add plus one status display and name field in src/components/guests/tabs/BasicInfoTab.tsx
- [ ] T023 [US2] Add notes textarea field in src/components/guests/tabs/BasicInfoTab.tsx
- [ ] T024 [US2] Wire BasicInfoTab to GuestModal form state in src/components/guests/GuestModal.tsx

**Checkpoint**: Basic Info tab is fully functional and independently testable

---

## Phase 5: User Story 3 - Track Guest RSVP Status (Priority: P1)

**Goal**: Wedding consultants can track RSVP status and see response history

**Independent Test**: Open guest modal RSVP tab, change status, verify timestamp recorded

### Implementation for User Story 3

- [ ] T025 [US3] Create RsvpTab component in src/components/guests/tabs/RsvpTab.tsx
- [ ] T026 [US3] Implement RSVP status select (Attending, Not Attending, Pending, No Response) in src/components/guests/tabs/RsvpTab.tsx
- [ ] T027 [US3] Add invitation_status field (moved from Basic Info) in src/components/guests/tabs/RsvpTab.tsx
- [ ] T028 [US3] Add response timestamp display in src/components/guests/tabs/RsvpTab.tsx
- [ ] T029 [US3] Wire RsvpTab to GuestModal form state in src/components/guests/GuestModal.tsx

**Checkpoint**: RSVP tab is fully functional and independently testable

---

## Phase 6: User Story 5 - Record Guest Dietary Requirements (Priority: P1)

**Goal**: Wedding consultants can record dietary restrictions and allergies with severity

**Independent Test**: Open guest modal Dietary tab, add restrictions and allergies, verify save

### Implementation for User Story 5

- [ ] T030 [US5] Create DietaryTab component in src/components/guests/tabs/DietaryTab.tsx
- [ ] T031 [US5] Implement standard dietary checkboxes (Vegetarian, Vegan, Gluten-Free, Kosher, Halal, Dairy-Free, Nut-Free) in src/components/guests/tabs/DietaryTab.tsx
- [ ] T032 [US5] Add dietary notes free-text field in src/components/guests/tabs/DietaryTab.tsx
- [ ] T033 [US5] Add allergy information field with severity indicator in src/components/guests/tabs/DietaryTab.tsx
- [ ] T034 [US5] Wire DietaryTab to GuestModal form state in src/components/guests/GuestModal.tsx

**Checkpoint**: Dietary tab is fully functional and independently testable

---

## Phase 7: User Story 6 - Track Guest Meal Selections (Priority: P1)

**Goal**: Wedding consultants can track meal selections for guests and plus ones using configured menu options

**Independent Test**: Open guest modal Meals tab, select meals from configured options, verify counts update on Menu page

**Dependency**: Requires US1 (Menu Configuration) to be complete for dropdowns to populate

### Implementation for User Story 6

- [ ] T035 [US6] Create MealsTab component in src/components/guests/tabs/MealsTab.tsx
- [ ] T036 [US6] Fetch meal options using useMealOptions hook in MealsTab in src/components/guests/tabs/MealsTab.tsx
- [ ] T037 [US6] Implement course dropdowns (Starter, Main, Dessert) populated from meal_options in src/components/guests/tabs/MealsTab.tsx
- [ ] T038 [US6] Add "No Selection" option to all dropdowns in src/components/guests/tabs/MealsTab.tsx
- [ ] T039 [US6] Add plus one meal selection section (conditionally shown when has_plus_one) in src/components/guests/tabs/MealsTab.tsx
- [ ] T040 [US6] Implement disabled state when RSVP is "Not Attending" in src/components/guests/tabs/MealsTab.tsx
- [ ] T041 [US6] Handle "Option Removed" display for deleted meal options in src/components/guests/tabs/MealsTab.tsx
- [ ] T042 [US6] Wire MealsTab to GuestModal form state in src/components/guests/GuestModal.tsx

**Checkpoint**: Meals tab is fully functional and independently testable

---

## Phase 8: User Story 4 - Manage Guest Seating Assignments (Priority: P2)

**Goal**: Wedding consultants can assign guests and plus ones to tables

**Independent Test**: Open guest modal Seating tab, assign to table, verify assignment

### Implementation for User Story 4

- [ ] T043 [US4] Create SeatingTab component in src/components/guests/tabs/SeatingTab.tsx
- [ ] T044 [US4] Implement table assignment dropdown in src/components/guests/tabs/SeatingTab.tsx
- [ ] T045 [US4] Add plus one seating assignment (optional separate table) in src/components/guests/tabs/SeatingTab.tsx
- [ ] T046 [US4] Add table capacity warning display in src/components/guests/tabs/SeatingTab.tsx
- [ ] T047 [US4] Wire SeatingTab to GuestModal form state in src/components/guests/GuestModal.tsx

**Checkpoint**: Seating tab is fully functional and independently testable

---

## Phase 9: User Story 7 - Manage Event Attendance (Priority: P2)

**Goal**: Wedding consultants can track which events guests and plus ones are attending

**Independent Test**: Open guest modal Events tab, toggle attendance, verify headcount updates

### Implementation for User Story 7

- [ ] T048 [US7] Create EventsTab component in src/components/guests/tabs/EventsTab.tsx
- [ ] T049 [US7] Fetch wedding events using useEvents hook in src/components/guests/tabs/EventsTab.tsx
- [ ] T050 [US7] Implement event list with date/time display in src/components/guests/tabs/EventsTab.tsx
- [ ] T051 [US7] Add invited/attending checkboxes per event in src/components/guests/tabs/EventsTab.tsx
- [ ] T052 [US7] Add plus one attendance checkbox per event in src/components/guests/tabs/EventsTab.tsx
- [ ] T053 [US7] Implement useGuestEventAttendance hook updates in src/hooks/useGuestEventAttendance.ts
- [ ] T054 [US7] Wire EventsTab to GuestModal with separate save logic in src/components/guests/GuestModal.tsx

**Checkpoint**: Events tab is fully functional and independently testable

---

## Phase 10: User Story 8 - Book Guest Shuttle Services (Priority: P3)

**Goal**: Wedding consultants can book shuttle services for guests and plus ones

**Independent Test**: Open guest modal Shuttle tab, book shuttle with time/location, verify save

### Implementation for User Story 8

- [ ] T055 [US8] Create ShuttleTab component in src/components/guests/tabs/ShuttleTab.tsx
- [ ] T056 [US8] Display events where guest is attending in src/components/guests/tabs/ShuttleTab.tsx
- [ ] T057 [US8] Add shuttle to/from event time pickers in src/components/guests/tabs/ShuttleTab.tsx
- [ ] T058 [US8] Add pickup location text fields in src/components/guests/tabs/ShuttleTab.tsx
- [ ] T059 [US8] Add plus one shuttle booking section (when plus_one_attending) in src/components/guests/tabs/ShuttleTab.tsx
- [ ] T060 [US8] Wire ShuttleTab to guest_event_attendance update in src/components/guests/GuestModal.tsx

**Checkpoint**: Shuttle tab is fully functional and independently testable

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Mobile responsiveness, edge cases, and final validation

- [ ] T061 [P] Add mobile responsive styling to all tabs at 375px width in src/components/guests/tabs/*.tsx
- [ ] T062 [P] Add mobile responsive styling to MenuPage at 375px width in src/pages/MenuPage.tsx
- [ ] T063 Add tab scroll/overflow handling for mobile in src/components/guests/GuestModal.tsx
- [ ] T064 Implement "Not Attending" visual state across all tabs in src/components/guests/GuestModal.tsx
- [ ] T065 Add loading states for async operations in all tabs in src/components/guests/tabs/*.tsx
- [ ] T066 Add toast notifications for save success/error in src/components/guests/GuestModal.tsx
- [ ] T067 Run quickstart.md validation checklist
- [ ] T068 Verify all edge cases from spec.md are handled

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all tabs
- **US1 Menu Config (Phase 3)**: Depends on Phase 2 - BLOCKS US6 (Meals)
- **US2-US5 (Phases 4-6)**: Depend on Phase 2, can run in parallel
- **US6 Meals (Phase 7)**: Depends on Phase 3 (US1) for dropdown options
- **US4, US7 (Phases 8-9)**: Depend on Phase 2, can run in parallel
- **US8 Shuttle (Phase 10)**: Depends on Phase 2
- **Polish (Phase 11)**: Depends on all user story phases

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ─────────────────────────────────────┐
    │                                                        │
    ├──► Phase 3: US1 Menu Config (P1) 🎯 MVP               │
    │         │                                              │
    │         ▼                                              │
    │    Phase 7: US6 Meals (P1) ◄─── depends on US1        │
    │                                                        │
    ├──► Phase 4: US2 Basic Info (P1) ──┐                   │
    │                                    │                   │
    ├──► Phase 5: US3 RSVP (P1) ────────┼── can run        │
    │                                    │   in parallel    │
    ├──► Phase 6: US5 Dietary (P1) ─────┘                   │
    │                                                        │
    ├──► Phase 8: US4 Seating (P2) ─────┐                   │
    │                                    │   can run        │
    ├──► Phase 9: US7 Events (P2) ──────┼── in parallel    │
    │                                    │                   │
    └──► Phase 10: US8 Shuttle (P3) ────┘                   │
                                                             │
    Phase 11 (Polish) ◄──────────────────────────────────────┘
```

### Parallel Opportunities

**Within Phase 1 (Setup)**:
- T002, T003, T004 can run in parallel

**Within Phase 3 (US1 Menu)**:
- T010, T011, T012, T013 can run in parallel (different files)

**After Phase 2 completes**:
- Phases 4, 5, 6 (US2, US3, US5) can run in parallel
- Phases 8, 9, 10 (US4, US7, US8) can run in parallel
- US6 must wait for US1 to complete

---

## Parallel Example: Phase 3 (US1 Menu Configuration)

```bash
# Launch all parallelizable US1 tasks together:
Task: "T010 [P] [US1] Create useMealOptions hook in src/hooks/useMealOptions.ts"
Task: "T011 [P] [US1] Create useMealOptionMutations hook in src/hooks/useMealOptions.ts"
Task: "T012 [P] [US1] Create CourseSection component in src/components/menu/CourseSection.tsx"
Task: "T013 [P] [US1] Create MealOptionCard component in src/components/menu/MealOptionCard.tsx"

# Then sequentially:
Task: "T014 [US1] Create MenuPage with 3 course sections"
Task: "T015 [US1] Add menu route /weddings/:weddingId/menu"
Task: "T016 [US1] Add Menu navigation link to wedding sidebar"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009)
3. Complete Phase 3: US1 Menu Config (T010-T018)
4. **STOP and VALIDATE**: Menu page works independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Modal structure ready
2. Add US1 (Menu) → Test independently → **MVP!**
3. Add US2, US3, US5 (Basic Info, RSVP, Dietary) → Test tabs
4. Add US6 (Meals) → Test meal selection flow
5. Add US4 (Seating) → Test seating assignment
6. Add US7 (Events) → Test event attendance
7. Add US8 (Shuttle) → Test shuttle booking
8. Polish → Mobile responsive, edge cases

### Suggested MVP Scope

- **Phase 1**: Setup (4 tasks)
- **Phase 2**: Foundational (5 tasks)
- **Phase 3**: US1 Menu Configuration (9 tasks)

**Total MVP Tasks**: 18 tasks

---

## Summary

| Phase | User Story | Priority | Tasks | Parallelizable |
|-------|------------|----------|-------|----------------|
| 1 | Setup | - | 4 | 3 |
| 2 | Foundational | - | 5 | 1 |
| 3 | US1 Menu Config | P1 | 9 | 4 |
| 4 | US2 Basic Info | P1 | 6 | 0 |
| 5 | US3 RSVP | P1 | 5 | 0 |
| 6 | US5 Dietary | P1 | 5 | 0 |
| 7 | US6 Meals | P1 | 8 | 0 |
| 8 | US4 Seating | P2 | 5 | 0 |
| 9 | US7 Events | P2 | 7 | 0 |
| 10 | US8 Shuttle | P3 | 6 | 0 |
| 11 | Polish | - | 8 | 2 |

**Total Tasks**: 68
**Parallelizable Tasks**: 10

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US6 (Meals) depends on US1 (Menu Config) - cannot start until options configured
