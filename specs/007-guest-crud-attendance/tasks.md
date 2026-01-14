# Tasks: Guest CRUD & Event Attendance

**Input**: Design documents from `/specs/007-guest-crud-attendance/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/guest-api.ts, quickstart.md

**Tests**: Manual testing with Playwright MCP per constitution (no automated test tasks)

**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add required Shadcn components and verify existing foundation

- [x] T001 Add Shadcn Tabs component via `npx shadcn@latest add tabs`
- [x] T002 [P] Add Shadcn Calendar component via `npx shadcn@latest add calendar`
- [x] T003 [P] Add Shadcn Popover component via `npx shadcn@latest add popover`
- [x] T004 Verify existing Phase 6A components exist (GuestTable, GuestCard, GuestFilters, BulkActionsBar)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, schemas, and hooks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Extend guest types with GuestFormData and form-related interfaces in `src/types/guest.ts`
- [x] T006 Create Zod validation schemas (guestFormSchema) in `src/schemas/guest.ts`
- [x] T007 Create useGuestMutations hook with create/update/delete/bulkAssign mutations in `src/hooks/useGuestMutations.ts`
- [x] T008 Create useGuest hook for fetching single guest with attendance in `src/hooks/useGuests.ts` (add to existing file)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Add New Guest (Priority: P1) 🎯 MVP

**Goal**: Enable adding new guests with 5-tab modal (Basic Info, RSVP, Dietary, Meal, Events)

**Independent Test**: Open Add Guest modal, fill details across all tabs, save. Verify toast, list refresh, data persisted.

### Implementation for User Story 1

- [x] T009 [P] [US1] Create GuestBasicInfoTab component with Name, Email, Phone, Type, Invitation Status, Attendance Confirmed fields in `src/components/guests/GuestBasicInfoTab.tsx`
- [x] T010 [P] [US1] Create GuestRsvpTab component with Deadline, Received Date, Method (conditional), Plus One section in `src/components/guests/GuestRsvpTab.tsx`
- [x] T011 [P] [US1] Create GuestDietaryTab component with Restrictions, Allergies, Notes fields in `src/components/guests/GuestDietaryTab.tsx`
- [x] T012 [P] [US1] Create GuestMealTab component with Starter, Main, Dessert dropdowns (options 1-5) in `src/components/guests/GuestMealTab.tsx`
- [x] T013 [P] [US1] Create GuestEventsTab component listing wedding events with attendance checkbox and shuttle fields in `src/components/guests/GuestEventsTab.tsx`
- [x] T014 [US1] Create GuestModal container wrapping all 5 tabs with React Hook Form in `src/components/guests/GuestModal.tsx`
- [x] T015 [US1] Integrate GuestModal into GuestListPage with "Add Guest" button trigger in `src/pages/GuestListPage.tsx`
- [x] T016 [US1] Implement conditional field visibility (RSVP Method when date set, Plus One fields when checkbox checked) in `src/components/guests/GuestRsvpTab.tsx`
- [x] T017 [US1] Add form validation error display per tab with visual error indicators in `src/components/guests/GuestModal.tsx`

**Checkpoint**: User Story 1 complete - guests can be created via modal

---

## Phase 4: User Story 2 - Edit Existing Guest (Priority: P1)

**Goal**: Enable editing existing guests with pre-populated modal

**Independent Test**: Click Edit on any guest row, modify fields, save. Verify changes reflected in table.

### Implementation for User Story 2

- [x] T018 [US2] Add Edit icon button to GuestTable Actions column in `src/components/guests/GuestTable.tsx`
- [x] T019 [P] [US2] Add Edit button to GuestCard for mobile in `src/components/guests/GuestCard.tsx`
- [x] T020 [US2] Implement edit mode in GuestModal (fetch guest data, pre-populate form) in `src/components/guests/GuestModal.tsx`
- [x] T021 [US2] Load existing event attendance records for Events tab when editing in `src/components/guests/GuestEventsTab.tsx`
- [x] T022 [US2] Wire Edit button clicks to open GuestModal with guestId in `src/pages/GuestListPage.tsx`

**Checkpoint**: User Stories 1 AND 2 complete - guests can be created and edited

---

## Phase 5: User Story 3 - Delete Guest (Priority: P1)

**Goal**: Enable deleting guests with confirmation dialog

**Independent Test**: Click Delete, confirm in dialog, verify guest removed and toast shown.

### Implementation for User Story 3

- [x] T023 [US3] Create DeleteGuestDialog confirmation component with guest name display in `src/components/guests/DeleteGuestDialog.tsx`
- [x] T024 [US3] Add Delete icon button to GuestTable Actions column in `src/components/guests/GuestTable.tsx`
- [x] T025 [P] [US3] Add Delete button to GuestCard for mobile in `src/components/guests/GuestCard.tsx`
- [x] T026 [US3] Wire Delete button clicks to open DeleteGuestDialog in `src/pages/GuestListPage.tsx`
- [x] T027 [US3] Connect delete confirmation to deleteGuest mutation with toast feedback in `src/pages/GuestListPage.tsx`

**Checkpoint**: Core CRUD (US1-3) complete - Add, Edit, Delete all functional

---

## Phase 6: User Story 4 - Search and Filter Guests (Priority: P2)

**Goal**: Functional search and filter dropdowns with AND logic

**Independent Test**: Type in search, select filters, verify results match criteria. Apply multiple filters, verify AND logic.

### Implementation for User Story 4

- [x] T028 [US4] Add 300ms debounce to search input in `src/components/guests/SearchInput.tsx`
- [x] T029 [US4] Verify Type filter functionality (Adult, Child, Vendor, Staff) in `src/components/guests/TypeFilter.tsx`
- [x] T030 [US4] Verify RSVP Status filter functionality (Pending, Yes, Overdue) in `src/components/guests/RsvpFilter.tsx`
- [x] T031 [US4] Verify Event filter functionality (guests attending specific event) in `src/components/guests/EventFilter.tsx`
- [x] T032 [US4] Update "Showing X of Y" count to reflect filtered results in `src/components/guests/ExportRow.tsx`

**Checkpoint**: User Story 4 complete - search and filters functional

---

## Phase 7: User Story 5 - Bulk Table Assignment (Priority: P2)

**Goal**: Assign multiple selected guests to tables via bulk action

**Independent Test**: Select 5+ guests, choose table from dropdown, verify all assigned. Clear table assignment works.

### Implementation for User Story 5

- [x] T033 [US5] Add table assignment dropdown (Tables 1-20, Clear Table) to BulkActionsBar in `src/components/guests/BulkActionsBar.tsx`
- [x] T034 [US5] Connect table dropdown to bulkAssignTable mutation in `src/pages/GuestListPage.tsx`
- [x] T035 [US5] Show loading state on bulk action button during mutation in `src/components/guests/BulkActionsBar.tsx`
- [x] T036 [US5] Clear selection and show success toast after bulk assignment in `src/pages/GuestListPage.tsx`

**Checkpoint**: User Story 5 complete - bulk table assignment functional

---

## Phase 8: User Story 6 - Export Guest List (Priority: P2)

**Goal**: CSV export with timestamp filename, exporting filtered/visible guests

**Independent Test**: Apply filters, click Export > CSV, verify file downloads with correct columns and filtered data.

### Implementation for User Story 6

- [x] T037 [US6] Create exportToCsv utility function with proper CSV escaping in `src/lib/export.ts`
- [x] T038 [US6] Implement CSV export handler using Blob API in `src/components/guests/GuestFilters.tsx`
- [x] T039 [US6] Pass filtered guest data to export function (not raw data) in `src/pages/GuestListPage.tsx`
- [x] T040 [US6] Add Excel export placeholder toast "Coming in future phase" in `src/components/guests/GuestFilters.tsx`

**Checkpoint**: User Story 6 complete - CSV export functional

---

## Phase 9: User Story 7 - Event Attendance Matrix (Priority: P3)

**Goal**: Matrix view showing guests as rows, events as columns with attendance checkboxes

**Independent Test**: Open matrix, toggle attendance, enter shuttle info, save. Verify changes persisted. Test mobile single-event view.

### Implementation for User Story 7

- [x] T041 [US7] Create useAttendanceMatrix hook fetching guests, events, and attendance records in `src/hooks/useAttendanceMatrix.ts`
- [x] T042 [US7] Create AttendanceMatrixRow component with checkboxes and conditional shuttle fields in `src/components/guests/AttendanceMatrixRow.tsx`
- [x] T043 [US7] Create AttendanceMatrixMobile component showing single event with selector in `src/components/guests/AttendanceMatrixMobile.tsx`
- [x] T044 [US7] Create AttendanceMatrix modal container with desktop table and mobile view in `src/components/guests/AttendanceMatrix.tsx`
- [x] T045 [US7] Implement batch UPSERT save for attendance changes in `src/hooks/useAttendanceMatrix.ts`
- [x] T046 [US7] Add "Attendance Matrix" button to page header in `src/pages/GuestListPage.tsx`
- [x] T047 [US7] Add event totals (attending count) to matrix footer in `src/components/guests/AttendanceMatrix.tsx`
- [x] T048 [US7] Add guest name search/filter within matrix in `src/components/guests/AttendanceMatrix.tsx`

**Checkpoint**: User Story 7 complete - attendance matrix functional

---

## Phase 10: User Story 8 - RSVP Status Display (Priority: P2)

**Goal**: Visual RSVP status badges with correct colors (green=Yes, yellow=Pending, red=Overdue)

**Independent Test**: View guests with different deadline/response states, verify badge colors match logic.

### Implementation for User Story 8

- [x] T049 [US8] Verify RSVP badge rendering in GuestTable with correct colors in `src/components/guests/GuestTable.tsx`
- [x] T050 [P] [US8] Verify RSVP badge rendering in GuestCard with correct colors in `src/components/guests/GuestCard.tsx`
- [x] T051 [US8] Verify calculateRsvpStatus function handles null deadline correctly in `src/types/guest.ts`

**Checkpoint**: User Story 8 complete - RSVP status badges display correctly

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Mobile responsiveness, accessibility, and final validation

- [x] T052 [P] Ensure GuestModal is full-screen on mobile (<768px) in `src/components/guests/GuestModal.tsx`
- [x] T053 [P] Ensure DeleteGuestDialog is properly sized on mobile in `src/components/guests/DeleteGuestDialog.tsx`
- [x] T054 [P] Ensure AttendanceMatrix switches to mobile view at <768px in `src/components/guests/AttendanceMatrix.tsx`
- [x] T055 Add keyboard navigation support (Escape to close) to all modals
- [x] T056 Verify all form inputs have accessible labels (aria-label or associated label element)
- [x] T057 Add JSDoc comments to complex functions (exportToCsv, batch UPSERT logic)
- [x] T058 Run quickstart.md manual testing checklist with Playwright MCP
- [x] T059 Verify success criteria SC-001 through SC-008 per spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Add Guest)**: Foundation only - MVP starting point
- **US2 (Edit Guest)**: Foundation + US1 modal components
- **US3 (Delete Guest)**: Foundation only - can parallel with US1/US2
- **US4 (Search/Filter)**: Foundation only - existing components, mostly verification
- **US5 (Bulk Table)**: Foundation only - extends existing BulkActionsBar
- **US6 (Export)**: Foundation + US4 (needs filtered data)
- **US7 (Matrix)**: Foundation only - completely independent
- **US8 (RSVP Status)**: Foundation only - verification of existing logic

### Within Each User Story

- Tab components before modal container
- Modal container before page integration
- Page integration before testing

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002 (Calendar) and T003 (Popover) can run in parallel

**Phase 2 (Foundational)**:
- T005-T008 must be sequential (dependencies)

**Phase 3 (US1 - Add Guest)**:
- T009-T013 (all 5 tab components) can run in parallel
- T014-T017 must be sequential

**Multiple User Stories**:
- US3, US4, US5, US7, US8 can all start after Foundational is complete (no dependencies on each other)
- US2 depends on US1 modal being complete
- US6 depends on US4 filter data

---

## Parallel Example: User Story 1 Tab Components

```bash
# Launch all 5 tab components together:
Task: "Create GuestBasicInfoTab in src/components/guests/GuestBasicInfoTab.tsx"
Task: "Create GuestRsvpTab in src/components/guests/GuestRsvpTab.tsx"
Task: "Create GuestDietaryTab in src/components/guests/GuestDietaryTab.tsx"
Task: "Create GuestMealTab in src/components/guests/GuestMealTab.tsx"
Task: "Create GuestEventsTab in src/components/guests/GuestEventsTab.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (Shadcn components)
2. Complete Phase 2: Foundational (types, schemas, hooks)
3. Complete Phase 3: User Story 1 - Add Guest
4. **STOP and VALIDATE**: Test adding guests works end-to-end
5. Complete Phase 4: User Story 2 - Edit Guest
6. Complete Phase 5: User Story 3 - Delete Guest
7. **MVP COMPLETE**: Full CRUD functional

### Incremental Delivery

1. **After US1-3**: Core CRUD - can add/edit/delete guests
2. **After US4-6**: Enhanced UX - search, bulk actions, export
3. **After US7**: Matrix - efficient multi-event attendance management
4. **After US8**: Visual - RSVP status badges for quick identification
5. **After Polish**: Production-ready with accessibility and mobile support

### Suggested Priority Order

1. US1 → US2 → US3 (Core CRUD - must be sequential due to shared modal)
2. US8 (Quick win - mostly verification)
3. US4 (Search/Filter - enhances usability)
4. US5 + US6 (Bulk + Export - productivity features)
5. US7 (Matrix - advanced feature)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Per constitution: Manual testing with Playwright MCP only (no automated test tasks)
- All modals should use existing Shadcn Dialog patterns
- Form state persists across tab switches (single form wrapper)
- UPSERT pattern for attendance batch save on (guest_id, event_id)
