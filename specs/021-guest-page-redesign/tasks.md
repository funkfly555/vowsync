# Tasks: Guest Page Redesign

**Input**: Design documents from `/specs/021-guest-page-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/guest-api.md, quickstart.md

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Components: `src/components/guests/`
- Hooks: `src/hooks/`
- Pages: `src/pages/`
- Types: `src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure and shared utilities for the redesign

- [x] T001 Create tabs subdirectory structure at src/components/guests/tabs/
- [x] T002 [P] Add UI state types (ExpandedCardsState, SelectedGuestsState, ActiveTabsState, GuestFiltersState) to src/types/guest.ts
- [x] T003 [P] Add GuestCardDisplayItem and GuestCountSummary types to src/types/guest.ts
- [x] T004 [P] Add TableSeatingDisplay and TableSeat types to src/types/guest.ts
- [x] T005 [P] Add GuestEditFormData type to src/types/guest.ts
- [x] T006 Add Zod validation schema (guestEditSchema with plus one refinement) to src/schemas/guest.ts

**Checkpoint**: Type system ready - component implementation can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components and hooks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create GuestCard.tsx container component in src/components/guests/GuestCard.tsx with expand/collapse state management
- [x] T008 Create GuestCardCollapsed.tsx with name, badges, table, events count in src/components/guests/GuestCardCollapsed.tsx
- [x] T009 Create GuestTabs.tsx tab navigation component in src/components/guests/GuestTabs.tsx
- [x] T010 Create GuestCardExpanded.tsx wrapper with CSS transition animation in src/components/guests/GuestCardExpanded.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View and Expand Guest Cards (Priority: P1) 🎯 MVP

**Goal**: Replace table UI with collapsible cards showing guest summary, expand inline to reveal 5-tab interface

**Independent Test**: Load guest list, verify collapsed cards show key info, click to expand, verify tabs appear inline

### Implementation for User Story 1

- [x] T011 [US1] Implement collapsed card header with name, GuestTypeBadge, InvitationStatusBadge in src/components/guests/GuestCardCollapsed.tsx
- [x] T012 [US1] Add table number display to collapsed card in src/components/guests/GuestCardCollapsed.tsx
- [x] T013 [US1] Add events attending count to collapsed card in src/components/guests/GuestCardCollapsed.tsx
- [x] T014 [US1] Implement expand/collapse toggle with chevron icon in src/components/guests/GuestCard.tsx
- [x] T015 [US1] Add CSS transition animation (max-height, opacity) for smooth expand/collapse in src/components/guests/GuestCardExpanded.tsx
- [x] T016 [US1] Implement 5-tab navigation (Basic, RSVP, Seating, Dietary, Meals) in src/components/guests/GuestTabs.tsx
- [x] T017 [US1] Add keyboard navigation support (Enter to expand, Tab between cards) in src/components/guests/GuestCard.tsx
- [x] T018 [US1] Update GuestListPage.tsx to use GuestCard instead of table in src/pages/GuestListPage.tsx

**Checkpoint**: User Story 1 complete - cards expand/collapse with tab interface visible

---

## Phase 4: User Story 2 - Edit Guest Information via Tabs (Priority: P1)

**Goal**: Enable editing guest data directly within expanded card tabs with manual save

**Independent Test**: Expand card, edit fields in each tab, save changes, verify data persists after collapse/re-expand

### Implementation for User Story 2

- [x] T019 [P] [US2] Create BasicInfoTab.tsx with name, email, phone, type, status fields in src/components/guests/tabs/BasicInfoTab.tsx
- [x] T020 [P] [US2] Create RsvpTab.tsx with deadline, received date, method, notes fields in src/components/guests/tabs/RsvpTab.tsx
- [x] T021 [P] [US2] Create SeatingTab.tsx with table number and position fields in src/components/guests/tabs/SeatingTab.tsx
- [x] T022 [P] [US2] Create DietaryTab.tsx with restrictions, allergies, notes fields in src/components/guests/tabs/DietaryTab.tsx
- [x] T023 [P] [US2] Create MealsTab.tsx with starter, main, dessert choice fields in src/components/guests/tabs/MealsTab.tsx
- [x] T024 [US2] Integrate React Hook Form with Zod validation in each tab component
- [x] T025 [US2] Add Save button with isDirty state tracking in src/components/guests/GuestCardExpanded.tsx
- [x] T026 [US2] Connect form submission to useGuestMutations.update() with TanStack Query cache invalidation
- [x] T027 [US2] Add loading and error states during save operation
- [x] T028 [US2] Add toast notifications for save success/failure

**Checkpoint**: User Story 2 complete - all tabs editable with manual save working

---

## Phase 5: User Story 3 - Plus One Management Within Tabs (Priority: P2)

**Goal**: Display Plus One details in two-column layout alongside primary guest in each tab

**Independent Test**: Enable has_plus_one, verify two-column layout appears, enter plus one details, save and verify

### Implementation for User Story 3

- [x] T029 [US3] Add two-column CSS Grid layout (lg:grid-cols-2) to BasicInfoTab.tsx
- [x] T030 [US3] Add Plus One column with name and confirmed fields to BasicInfoTab.tsx
- [x] T031 [US3] Add Plus One conditional rendering based on has_plus_one toggle in all tabs
- [x] T032 [US3] Update RsvpTab.tsx with two-column layout for Plus One (read-only, no separate RSVP for plus one)
- [x] T033 [US3] Update SeatingTab.tsx with Plus One seating info (same table as primary guest)
- [x] T034 [US3] Update DietaryTab.tsx with Plus One dietary section (placeholder - future enhancement)
- [x] T035 [US3] Update MealsTab.tsx with Plus One meal section (placeholder - future enhancement)
- [x] T036 [US3] Add validation: plus_one_name required when has_plus_one is true

**Checkpoint**: User Story 3 complete - Plus One management working in two-column layout

---

## Phase 6: User Story 4 - Bulk Guest Selection and Actions (Priority: P2)

**Goal**: Select multiple guests with checkboxes and perform bulk operations (assign table, export)

**Independent Test**: Select multiple guests via checkboxes, click bulk action, verify action applies to all selected

### Implementation for User Story 4

- [x] T037 [P] [US4] Create useBulkGuestActions.ts hook with assignTable and exportSelected methods in src/hooks/useBulkGuestActions.ts
- [x] T038 [US4] Add checkbox to GuestCardCollapsed.tsx with stopPropagation to prevent expand
- [x] T039 [US4] Add selectedGuests Set state management to GuestListPage.tsx
- [x] T040 [US4] Enhance BulkActionsBar.tsx with selected count display in src/components/guests/BulkActionsBar.tsx
- [x] T041 [US4] Add "Assign Table" button to BulkActionsBar.tsx
- [x] T042 [US4] Create TableAssignModal.tsx for bulk table assignment in src/components/guests/TableAssignModal.tsx (implemented as inline dropdown in BulkActionsBar)
- [x] T043 [US4] Implement bulk table assignment with Supabase .in() query
- [x] T044 [US4] Add "Export" button to BulkActionsBar.tsx with CSV generation
- [x] T045 [US4] Add "Clear Selection" button to BulkActionsBar.tsx
- [x] T046 [US4] Add select all / deselect all functionality

**Checkpoint**: User Story 4 complete - bulk selection and actions working

---

## Phase 7: User Story 5 - Visual Seating Arrangement (Priority: P3)

**Goal**: Show circular table visualization with numbered positions for seat assignment

**Independent Test**: Click "Arrange Seats" on a guest, view circular table, click position to assign, verify position saves

### Implementation for User Story 5

- [x] T047 [P] [US5] Create SeatingArrangeModal.tsx with modal structure in src/components/guests/SeatingArrangeModal.tsx
- [x] T048 [US5] Implement circular table visualization with CSS absolute positioning (10 seats)
- [x] T049 [US5] Add getSeatPosition() helper function for trigonometric seat placement
- [x] T050 [US5] Display existing guests at their positions on the circular table
- [x] T051 [US5] Implement click-to-assign position functionality
- [x] T052 [US5] Add visual feedback for occupied vs available positions
- [x] T053 [US5] Add "Arrange Seats" button to SeatingTab.tsx that opens modal
- [x] T054 [US5] Save table_position on position selection and close modal

**Checkpoint**: User Story 5 complete - visual seating arrangement working

---

## Phase 8: User Story 6 - Search and Filter Guests (Priority: P2)

**Goal**: Real-time search and filter by type, status, table, and event attendance

**Independent Test**: Type in search box, verify instant filtering; apply type/status filters, verify correct guests shown

### Implementation for User Story 6

- [x] T055 [US6] Add GuestFiltersState to GuestListPage.tsx with search, type, status, table filters
- [x] T056 [US6] Enhance GuestFilters.tsx with search input (300ms debounce) in src/components/guests/GuestFilters.tsx
- [x] T057 [US6] Add guest type dropdown filter to GuestFilters.tsx
- [x] T058 [US6] Add invitation status dropdown filter to GuestFilters.tsx
- [x] T059 [US6] Add table number dropdown filter to GuestFilters.tsx
- [x] T060 [US6] Add event attendance filter to GuestFilters.tsx
- [x] T061 [US6] Implement client-side filtering logic in GuestListPage.tsx (in useGuestCards hook)
- [x] T062 [US6] Add "Clear Filters" button to reset all filters
- [x] T063 [US6] Display "No guests match your filters" empty state when filters return zero results

**Checkpoint**: User Story 6 complete - search and filtering working

---

## Phase 9: User Story 7 - Expand/Collapse All Cards (Priority: P3)

**Goal**: Toggle all visible cards expanded or collapsed with a single click

**Independent Test**: Click "Expand All", verify all cards expand; click "Collapse All", verify all collapse

### Implementation for User Story 7

- [x] T064 [US7] Add "Expand All" button to GuestListPage.tsx header
- [x] T065 [US7] Add "Collapse All" button to GuestListPage.tsx header
- [x] T066 [US7] Implement expandAll() function that adds all visible guest IDs to expandedCards Set
- [x] T067 [US7] Implement collapseAll() function that clears expandedCards Set
- [x] T068 [US7] Ensure expand/collapse respects current filter state (only affects visible cards)

**Checkpoint**: User Story 7 complete - expand/collapse all working

---

## Phase 10: User Story 8 - Guest Count Including Plus Ones (Priority: P2)

**Goal**: Display accurate guest counts showing primary guests, plus ones, and total

**Independent Test**: View guest count display, verify format "X guests + Y plus ones = Z total", apply filters, verify count updates

### Implementation for User Story 8

- [x] T069 [P] [US8] Create GuestCountDisplay.tsx component in src/components/guests/GuestCountDisplay.tsx (implemented inline in GuestListPage.tsx)
- [x] T070 [US8] Implement count calculation: primaryGuests, plusOnes, total
- [x] T071 [US8] Display format: "X guests + Y plus ones = Z total"
- [x] T072 [US8] Update count when filters are applied (show filtered count)
- [x] T073 [US8] Add GuestCountDisplay to GuestListPage.tsx header

**Checkpoint**: User Story 8 complete - guest count with plus ones working

---

## Phase 11: Polish & Final Validation

**Purpose**: Cross-cutting improvements and final testing

- [x] T074 [P] Add ARIA attributes for accessibility (aria-expanded, role="button") - Done in GuestCardCollapsed
- [x] T075 [P] Add keyboard support: Space to toggle selection, Enter to expand - Done in GuestCardCollapsed
- [x] T076 Ensure responsive design: single column on mobile, two columns on desktop - Done with lg:grid-cols-2 in tabs
- [x] T077 Add loading skeleton while guests are fetching - Done in GuestListPage
- [x] T078 Verify all edge cases from spec.md (rapid clicks, save failures, empty state, full table warning) - Implemented
- [ ] T079 Manual Playwright testing of all 8 user stories - Manual testing required
- [x] T080 Code cleanup: remove console.logs, unused imports, add JSDoc where needed - No console.logs in guest components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 - MVP deliverable
- **User Story 2 (Phase 4)**: Depends on Phase 3 (tabs must exist to edit in them)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (needs tab content to add plus one columns)
- **User Story 4 (Phase 6)**: Can start after Phase 2 (independent of US2/US3)
- **User Story 5 (Phase 7)**: Can start after Phase 4 (needs SeatingTab to add button)
- **User Story 6 (Phase 8)**: Can start after Phase 2 (independent, operates on card list)
- **User Story 7 (Phase 9)**: Can start after Phase 3 (needs cards to expand/collapse)
- **User Story 8 (Phase 10)**: Can start after Phase 2 (independent count calculation)
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational
    ↓
Phase 3: US1 (View/Expand) ← MVP
    ↓
Phase 4: US2 (Edit via Tabs)
    ↓
Phase 5: US3 (Plus One)
    ↓
Phase 7: US5 (Visual Seating) ← Needs SeatingTab from US2

Phase 2 →→→ Phase 6: US4 (Bulk Actions) ← Independent
Phase 2 →→→ Phase 8: US6 (Search/Filter) ← Independent
Phase 2 →→→ Phase 10: US8 (Guest Count) ← Independent
Phase 3 →→→ Phase 9: US7 (Expand/Collapse All) ← Needs cards from US1
```

### Parallel Opportunities

**Phase 1 (all parallel)**:
- T002, T003, T004, T005 can all run in parallel (different type additions)

**Phase 4 (tab components parallel)**:
- T019, T020, T021, T022, T023 can all run in parallel (different files)

**After Phase 2 (independent stories parallel)**:
- US4 (Bulk Actions), US6 (Search/Filter), US8 (Guest Count) can all start in parallel

---

## Parallel Example: Phase 4 Tab Components

```bash
# Launch all tab implementations together:
Task: "Create BasicInfoTab.tsx in src/components/guests/tabs/BasicInfoTab.tsx"
Task: "Create RsvpTab.tsx in src/components/guests/tabs/RsvpTab.tsx"
Task: "Create SeatingTab.tsx in src/components/guests/tabs/SeatingTab.tsx"
Task: "Create DietaryTab.tsx in src/components/guests/tabs/DietaryTab.tsx"
Task: "Create MealsTab.tsx in src/components/guests/tabs/MealsTab.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - View and Expand Cards
4. Complete Phase 4: User Story 2 - Edit Guest Information
5. **STOP and VALIDATE**: Cards expand with editable tabs
6. Deploy/demo if ready - this is functional MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Cards visible and expandable (demo!)
3. Add US2 → Tabs editable with save (MVP!)
4. Add US3 → Plus One management (enhanced!)
5. Add US4, US6, US8 in parallel → Bulk actions, filtering, counts (feature complete!)
6. Add US5, US7 → Visual seating, expand all (polish!)

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 + Phase 4**
- Setup complete
- Foundation complete
- User Story 1: View and Expand Guest Cards
- User Story 2: Edit Guest Information via Tabs

This delivers the core value proposition: inline expandable cards with editable tabs.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- This is a UI-only redesign - no database schema changes required
- Existing hooks (useGuests, useGuestMutations) are reused
- Manual testing with Playwright MCP per VowSync constitution
