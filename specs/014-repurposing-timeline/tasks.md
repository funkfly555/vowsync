# Tasks: Repurposing Timeline Management

**Input**: Design documents from `/specs/014-repurposing-timeline/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/repurposing-api.md

**Tests**: Manual testing with Playwright MCP only (per constitution - no unit tests)

**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational types, schemas, and utilities that all user stories depend on

- [x] T001 [P] Create TypeScript interfaces in `src/types/repurposing.ts` per data-model.md (RepurposingStatus, RepurposingInstruction, RepurposingInstructionWithRelations, RepurposingFormData, RepurposingFilters, GanttBarData, GanttRowData)
- [x] T002 [P] Create Zod validation schemas in `src/schemas/repurposing.ts` (repurposingFormSchema with time format handling HH:MM → HH:MM:SS)
- [x] T003 [P] Create time validation utilities in `src/lib/repurposingValidation.ts` (parseTimeToMinutes, validatePickupBeforeDropoff, validatePickupAfterEventEnd, validateDropoffBeforeEventStart, detectOvernightStorage)
- [x] T004 Create barrel export in `src/components/repurposing/index.ts`

**Checkpoint**: Foundation types and utilities ready - hooks can now be implemented

---

## Phase 2: Data Layer (Hooks)

**Purpose**: TanStack Query hooks for Supabase operations - required before any UI components

**⚠️ CRITICAL**: Use snake_case field names in all Supabase queries (wedding_item_id NOT weddingItemId)

- [x] T005 Create `src/hooks/useRepurposingInstructions.ts` - list query with aliased joins per contracts/repurposing-api.md (wedding_items, from_event:events, to_event:events, vendors)
- [x] T006 [P] Create `src/hooks/useRepurposingInstruction.ts` - single item query with same aliased joins
- [x] T007 Create `src/hooks/useRepurposingMutations.ts` - CRUD mutations (createRepurposingInstruction, updateRepurposingInstruction, deleteRepurposingInstruction) with query key factory pattern and cache invalidation

**Checkpoint**: Data layer complete - UI components can now be implemented

---

## Phase 3: User Story 1 - Create Repurposing Instructions (Priority: P1) 🎯 MVP

**Goal**: Enable consultants to create repurposing instructions linking items to events with full logistics details

**Independent Test**: Create instruction with all fields, verify data persists and displays correctly

### Implementation for User Story 1

- [x] T008 [P] [US1] Create `src/components/repurposing/RepurposingStatusBadge.tsx` - status badge with colors: pending (blue-100/blue-800), in_progress (orange-100/orange-800), completed (green-100/green-800), issue (red-100/red-800)
- [x] T009 [P] [US1] Create `src/components/repurposing/RepurposingEmptyState.tsx` - empty state display with add instruction CTA
- [x] T010 [US1] Create `src/components/repurposing/RepurposingForm.tsx` - 4-tab form (Movement, Responsibility, Handling, Status) using React Hook Form + Zod:
  - Movement tab: item select, from_event select, pickup_location, pickup_time (HH:MM input), pickup_time_relative, to_event select, dropoff_location, dropoff_time, dropoff_time_relative
  - Responsibility tab: responsible_party text, responsible_vendor_id select (optional), setup_required checkbox, breakdown_required checkbox, is_critical checkbox
  - Handling tab: handling_notes textarea
  - Status tab: status select, completed_by text, issue_description textarea (edit only - hide on create)
- [x] T011 [US1] Create `src/components/repurposing/OvernightStorageDialog.tsx` - modal dialog that appears when from_event.event_date !== to_event.event_date, prompts for storage location, appends to handling_notes
- [x] T012 [US1] Create `src/components/repurposing/RepurposingModal.tsx` - modal wrapper using Dialog from Shadcn/ui, manages create vs edit mode, handles form submission with time conversion (HH:MM → HH:MM:SS)
- [x] T013 [US1] Add supporting dropdown hooks in mutation hook or separate file: useWeddingItemsForDropdown, useEventsForDropdown, useVendorsForDropdown (if not already available from existing features)

**Checkpoint**: Users can create repurposing instructions with all required fields - US1 complete

---

## Phase 4: User Story 2 - Time Validation and Warnings (Priority: P1) 🎯 MVP

**Goal**: Validate timing and display errors/warnings for scheduling conflicts

**Independent Test**: Create instructions with invalid times, verify errors block save; create with warning conditions, verify warnings display but allow save

### Implementation for User Story 2

- [x] T014 [US2] Integrate time validation into RepurposingForm.tsx:
  - ERROR (blocks save): pickup_time >= dropoff_time → "Pickup time must be before dropoff time"
  - WARNING (allows save): pickup_time < from_event.event_end_time → "Pickup scheduled before event ends. Confirm intentional."
  - WARNING (allows save): dropoff_time > to_event.event_start_time → "Delivery after event starts. May cause delays."
  - ERROR (blocks save): from_event_id === to_event_id → "Source and destination events must be different"
- [x] T015 [US2] Add validation state display in RepurposingForm.tsx showing error/warning messages with appropriate styling (red for errors, yellow/amber for warnings)
- [x] T016 [US2] Integrate OvernightStorageDialog trigger into form submission flow - detect when event dates differ, show dialog, append storage location to handling_notes before final save

**Checkpoint**: All time validations working - errors block, warnings inform - US2 complete

---

## Phase 5: User Story 3 - View and Filter Instructions List (Priority: P2)

**Goal**: Display all instructions with filtering capabilities

**Independent Test**: View list with multiple instructions, apply filters, verify correct filtering

### Implementation for User Story 3

- [x] T017 [P] [US3] Create `src/components/repurposing/RepurposingCard.tsx` - card component displaying:
  - Item description and category
  - From event → To event with arrow
  - Pickup time/location and Dropoff time/location
  - Responsible party (and vendor if linked)
  - Status badge
  - Handling notes preview
  - Setup/breakdown/critical flags as icons
  - Critical items: `border-l-2 border-l-red-500`
  - Edit and delete action buttons
- [x] T018 [P] [US3] Create `src/components/repurposing/RepurposingFilters.tsx` - filter controls:
  - Status dropdown: All, Pending, In Progress, Completed, Issue
  - Responsible Party dropdown: All + dynamic list from data
  - Event dropdown: All + events (matches from_event OR to_event)
  - Item dropdown: All + items with instructions
  - URL state sync for shareable filter links
- [x] T019 [US3] Create `src/components/repurposing/RepurposingList.tsx` - list container:
  - Renders RepurposingFilters
  - Renders RepurposingCard for each instruction
  - Handles loading and error states
  - Shows RepurposingEmptyState when no instructions
  - Client-side filtering based on filter state
- [x] T020 [US3] Create `src/pages/RepurposingPage.tsx` - main page component:
  - Extracts weddingId from route params
  - Renders view toggle (List / Gantt)
  - Renders "Add Instruction" button
  - Renders RepurposingList or RepurposingGantt based on view
  - Renders RepurposingModal for create/edit
- [x] T021 [US3] Add route to router configuration: `/weddings/:weddingId/repurposing`
- [x] T022 [US3] Add navigation link to wedding detail page sidebar/navigation (following existing navigation patterns)

**Checkpoint**: List view with filtering fully functional - US3 complete

---

## Phase 6: User Story 4 - Gantt Chart Timeline Visualization (Priority: P2)

**Goal**: Visual timeline showing all item movements across the wedding day

**Independent Test**: View Gantt chart with multiple instructions, verify bars positioned correctly, colors match status

### Implementation for User Story 4

- [x] T023 [US4] Create `src/components/repurposing/RepurposingGantt.tsx` - custom HTML/CSS Gantt chart (no external library):
  - Header row with time markers: 00:00, 06:00, 12:00, 18:00, 24:00
  - Item rows (one per item with instructions)
  - Row label showing item description and category
  - Bar positioning: left = (pickup_minutes / 1440) * 100%, width = ((dropoff_minutes - pickup_minutes) / 1440) * 100%
  - Bar colors by status: pending (#2196F3), in_progress (#FF9800), completed (#4CAF50), issue (#F44336)
  - Critical items: 2px red border on bar
  - Tooltip on hover showing from_event → to_event, times, responsible party
  - Click handler to open edit modal
  - ARIA attributes for accessibility: role="grid", role="row", role="gridcell" with descriptive labels
- [x] T024 [US4] Add Gantt/List view toggle to RepurposingPage.tsx with state management
- [x] T025 [US4] Add legend component below Gantt chart showing status colors

**Checkpoint**: Gantt chart visualization complete - US4 complete

---

## Phase 7: User Story 5 - Update Instruction Status (Priority: P2)

**Goal**: Enable status workflow tracking during wedding execution

**Independent Test**: Update status from pending → in_progress → completed, verify timestamps recorded

### Implementation for User Story 5

- [x] T026 [US5] Add status action buttons to RepurposingCard.tsx:
  - "Start" button (pending → in_progress): calls updateRepurposingInstruction with status='in_progress', started_at=now
  - "Complete" button (in_progress → completed): opens small dialog for completed_by input, then updates with status='completed', completed_at=now, completed_by
  - "Report Issue" button (any status → issue): opens small dialog for issue_description input, then updates with status='issue', issue_description
  - "Resume" button (issue → in_progress): clears issue_description, sets status='in_progress'
- [x] T027 [US5] Create status update dialogs (can be inline in RepurposingCard or separate small components):
  - CompleteInstructionDialog: text input for completed_by (required)
  - ReportIssueDialog: textarea for issue_description (required)
- [x] T028 [US5] Add status update mutations to useRepurposingMutations.ts if not already included (startInstruction, completeInstruction, reportIssue, resumeInstruction per contracts/repurposing-api.md)

**Checkpoint**: Status workflow fully functional - US5 complete

---

## Phase 8: User Story 6 - Edit and Delete Instructions (Priority: P3)

**Goal**: Enable modification and removal of instructions

**Independent Test**: Edit instruction fields and save, delete instruction and verify removed

### Implementation for User Story 6

- [x] T029 [US6] Create `src/components/repurposing/DeleteRepurposingDialog.tsx` - delete confirmation dialog with warning about permanent removal
- [x] T030 [US6] Wire edit functionality in RepurposingCard.tsx - click edit opens RepurposingModal in edit mode with existing data populated
- [x] T031 [US6] Wire delete functionality in RepurposingCard.tsx - click delete opens DeleteRepurposingDialog, confirmation triggers deleteRepurposingInstruction mutation
- [x] T032 [US6] Ensure RepurposingForm.tsx handles edit mode: populate form with existing data, show Status tab, re-validate times on save

**Checkpoint**: Edit and delete fully functional - US6 complete

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, integration, and final refinements

- [x] T033 [P] Add keyboard navigation support to RepurposingGantt.tsx (arrow keys for bar selection, Enter to open edit)
- [x] T034 [P] Add screen reader announcements for status changes using ARIA live regions
- [x] T035 [P] Ensure all touch targets are 44px minimum per constitution
- [x] T036 [P] Ensure color contrast meets WCAG 2.1 AA (4.5:1 minimum)
- [ ] T037 Add repurposing indicator to wedding items list (show icon/badge on items that have repurposing instructions) - DEFERRED: Requires data layer changes to join repurposing_instructions
- [x] T038 Update barrel export `src/components/repurposing/index.ts` with all components
- [ ] T039 Run quickstart.md validation checklist with Playwright MCP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Data Layer)**: Depends on Phase 1 types/schemas
- **Phase 3 (US1)**: Depends on Phase 2 hooks
- **Phase 4 (US2)**: Depends on Phase 3 form component
- **Phase 5 (US3)**: Depends on Phase 2 hooks, Phase 3 modal
- **Phase 6 (US4)**: Depends on Phase 2 hooks
- **Phase 7 (US5)**: Depends on Phase 5 card component
- **Phase 8 (US6)**: Depends on Phase 3 form, Phase 5 card
- **Phase 9 (Polish)**: Depends on all previous phases

### Parallel Opportunities

Within Phase 1:
- T001, T002, T003 can run in parallel (different files)

Within Phase 3 (US1):
- T008, T009 can run in parallel (no dependencies)

Within Phase 5 (US3):
- T017, T018 can run in parallel (different components)

Across Phases (after Phase 2):
- US3 (Phase 5) and US4 (Phase 6) can be worked in parallel
- US5 depends on US3 card component
- US6 depends on US3 card and US1 form

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (types, schemas, utilities)
2. Complete Phase 2: Data Layer (hooks)
3. Complete Phase 3: US1 - Create Instructions
4. Complete Phase 4: US2 - Time Validation
5. **STOP and VALIDATE**: Create instructions, verify validation works
6. Minimal page with just create/list basic view

### Full Feature Delivery

1. MVP (US1 + US2) → Core functionality
2. Add US3 (List + Filters) → Management interface
3. Add US4 (Gantt) → Visual planning
4. Add US5 (Status) → Day-of tracking
5. Add US6 (Edit/Delete) → Maintenance
6. Polish phase → Accessibility and refinements

---

## Notes

- **Database fields use snake_case**: wedding_item_id, from_event_id, to_event_id, etc.
- **Time format conversion**: Form inputs use HH:MM, database stores HH:MM:SS - convert on submit
- **Multiple FK joins require aliases**: from_event:events!from_event_id, to_event:events!to_event_id
- **Status colors defined in research.md**: Match exactly for consistency
- **No unit tests**: Per constitution, use Playwright MCP for manual testing only
- **Critical item styling**: border-l-2 border-l-red-500 on cards, 2px red border on Gantt bars
