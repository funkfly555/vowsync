# Tasks: Wedding CRUD Interface

**Input**: Design documents from `/specs/002-wedding-crud/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/ (complete), quickstart.md (complete)

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated tests in this phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and core configuration

- [X] T001 Initialize Vite project with React 18 + TypeScript template
- [X] T002 Install dependencies (react-router-dom, @supabase/supabase-js, @tanstack/react-query, react-hook-form, @hookform/resolvers, zod, zustand, date-fns, lucide-react, sonner, clsx, tailwind-merge, class-variance-authority)
- [X] T003 Install dev dependencies (tailwindcss, postcss, autoprefixer, @types/react, @types/react-dom)
- [X] T004 [P] Initialize Tailwind CSS with `npx tailwindcss init -p`
- [X] T005 [P] Create `.env` and `.env.example` with Supabase environment variables
- [X] T006 Initialize Shadcn/ui with `npx shadcn@latest init` (Default style, Slate color, CSS variables: Yes)
- [X] T007 Add Shadcn components: button, card, input, select, badge, dialog, textarea, label

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Configure tailwind.config.js with brand colors and typography per `specs/002-wedding-crud/quickstart.md`
- [X] T009 [P] Configure tsconfig.json with path aliases (`@/*` → `./src/*`) per `specs/002-wedding-crud/quickstart.md`
- [X] T010 [P] Configure vite.config.ts with path resolution per `specs/002-wedding-crud/quickstart.md`
- [X] T011 Setup Tailwind directives in `src/index.css` (@tailwind base, components, utilities)
- [X] T012 Create Supabase client in `src/lib/supabase.ts` per `specs/002-wedding-crud/quickstart.md`
- [X] T013 [P] Create constants in `src/lib/constants.ts` (TEMP_USER_ID, WEDDING_STATUS_OPTIONS, EVENTS_OPTIONS)
- [X] T014 [P] Create utility functions in `src/lib/utils.ts` (cn(), formatDate())
- [X] T015 Create TypeScript interfaces in `src/types/wedding.ts` (Wedding, WeddingStatus, WeddingFormData, WeddingListFilters) per `specs/002-wedding-crud/data-model.md`
- [X] T016 Create Zod validation schemas in `src/schemas/wedding.ts` (weddingFormSchema, weddingEditSchema) per `specs/002-wedding-crud/data-model.md`
- [X] T017 Create React Query hooks in `src/hooks/useWeddings.ts` (useWeddings, useWedding, useCreateWedding, useUpdateWedding, useDeleteWedding) per `specs/002-wedding-crud/data-model.md`
- [X] T018 Setup App.tsx with QueryClientProvider, BrowserRouter, Routes, and Toaster per `specs/002-wedding-crud/quickstart.md`
- [X] T019 Create test user in Supabase database (SQL: INSERT INTO public.users with TEMP_USER_ID)
- [X] T020 Verify database connection by running dev server and checking console for errors

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Wedding List (Priority: P1)

**Goal**: Display all consultant weddings in a searchable, filterable, sortable card grid

**Independent Test**: Load wedding list page, verify weddings display with correct information, test search/filter/sort

### Implementation for User Story 1

- [X] T021 [US1] Create status badge component in `src/components/weddings/StatusBadge.tsx` with color variants (blue/green/gray/red) per FR-028
- [X] T022 [US1] Create WeddingCard component in `src/components/weddings/WeddingCard.tsx` showing bride/groom names, date, venue, status badge, guest count per FR-002
- [X] T023 [US1] Create search input component in `src/components/weddings/SearchInput.tsx` with real-time filtering per FR-003
- [X] T024 [US1] Create status filter select in `src/components/weddings/StatusFilter.tsx` with options: All, Planning, Confirmed, Completed, Cancelled per FR-004
- [X] T025 [US1] Create sort toggle in `src/components/weddings/SortToggle.tsx` for date ascending/descending per FR-005
- [X] T026 [US1] Create WeddingList container in `src/components/weddings/WeddingList.tsx` with responsive grid (3/2/1 columns) per FR-001
- [X] T027 [US1] Create empty state component in `src/components/weddings/EmptyState.tsx` for when no weddings exist
- [X] T028 [US1] Create no results component in `src/components/weddings/NoResults.tsx` for when search/filter returns nothing
- [X] T029 [US1] Create loading skeleton in `src/components/weddings/WeddingListSkeleton.tsx` for loading state per FR-036
- [X] T030 [US1] Create WeddingListPage in `src/pages/WeddingListPage.tsx` composing all list components with "Create Wedding" button per FR-006
- [X] T031 [US1] Add hover effect to WeddingCard (elevation + enhanced shadow) per acceptance scenario 5
- [X] T032 [US1] Add error toast handling for failed data fetches per FR-034
- [X] T033 [US1] Verify keyboard navigation works for all interactive elements per FR-029

**Checkpoint**: User Story 1 complete - consultant can view, search, filter, and sort wedding list

---

## Phase 4: User Story 2 - Create New Wedding (Priority: P1)

**Goal**: Enable consultants to add new weddings via a validated form

**Independent Test**: Navigate to create form, fill required fields, submit, verify wedding appears in list

### Implementation for User Story 2

- [X] T034 [US2] Create form field components in `src/components/weddings/form/` (TextInput, DatePicker, NumberSelect, StatusSelect, TextArea) with label + error display per FR-031
- [X] T035 [US2] Create WeddingForm component in `src/components/weddings/WeddingForm.tsx` with react-hook-form + zod integration per FR-010, FR-011
- [X] T036 [US2] Add future date validation to wedding date field per FR-012
- [X] T037 [US2] Add number of events validation (1-10) per FR-013
- [X] T038 [US2] Create CreateWeddingPage in `src/pages/CreateWeddingPage.tsx` at route `/weddings/new` per FR-009
- [X] T039 [US2] Implement form submission with success toast and redirect to list per FR-014, FR-015
- [X] T040 [US2] Add Cancel button that returns to list without saving per FR-016
- [X] T041 [US2] Add loading state during form submission per FR-036
- [X] T042 [US2] Preserve form data on submission failure per FR-035
- [X] T043 [US2] Ensure validation errors are announced to screen readers per FR-032
- [X] T044 [US2] Verify form is fully functional on 320px mobile screens per FR-033

**Checkpoint**: User Story 2 complete - consultant can create new weddings with validation

---

## Phase 5: User Story 3 - Edit Existing Wedding (Priority: P2)

**Goal**: Enable consultants to modify existing wedding details

**Independent Test**: Click wedding card, modify fields, save, verify changes persist

### Implementation for User Story 3

- [X] T045 [US3] Create EditWeddingPage in `src/pages/EditWeddingPage.tsx` at route `/weddings/:id/edit` per FR-017
- [X] T046 [US3] Pre-populate WeddingForm with existing wedding data per FR-018
- [X] T047 [US3] Apply weddingEditSchema (allows past dates for existing weddings) per FR-019
- [X] T048 [US3] Implement update submission with success toast and redirect per FR-020, FR-021
- [X] T049 [US3] Add Cancel button that returns to list without saving
- [X] T050 [US3] Make WeddingCard clickable to navigate to edit page per FR-007
- [X] T051 [US3] Handle 404 when wedding not found (redirect to list with error toast)
- [X] T052 [US3] Add loading state while fetching wedding data per FR-036
- [X] T053 [US3] Verify status badge updates in list after status change per acceptance scenario 4

**Checkpoint**: User Story 3 complete - consultant can edit existing weddings

---

## Phase 6: User Story 4 - Delete Wedding (Priority: P3)

**Goal**: Enable consultants to remove weddings with confirmation

**Independent Test**: Click delete on wedding, confirm in modal, verify wedding removed from list

### Implementation for User Story 4

- [X] T054 [US4] Create DeleteWeddingDialog component in `src/components/weddings/DeleteWeddingDialog.tsx` per FR-023
- [X] T055 [US4] Display couple names and data loss warning in modal per FR-024
- [X] T056 [US4] Add Cancel (secondary) and Delete (danger) buttons per FR-025
- [X] T057 [US4] Add delete button to WeddingCard per FR-008
- [X] T058 [US4] Add Delete button (danger styled) to EditWeddingPage per FR-022
- [X] T059 [US4] Implement delete mutation with cascade removal per FR-026
- [X] T060 [US4] Show success toast after deletion per FR-027
- [X] T061 [US4] Refresh wedding list after deletion
- [X] T062 [US4] Handle concurrent edit/delete conflict with error message

**Checkpoint**: User Story 4 complete - consultant can delete weddings with confirmation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T063 [P] Add visible focus indicators to all interactive elements per FR-030
- [X] T064 [P] Ensure text truncation with ellipsis for long names (full text on hover) per edge case
- [X] T065 [P] Test responsive layout on 320px, 768px, and 1024px breakpoints per FR-033
- [X] T066 Add error boundary wrapper for graceful error handling
- [X] T067 Optimize React Query cache settings for performance
- [X] T068 Run quickstart.md validation (verify all setup steps work)
- [X] T069 Manual testing with Playwright MCP (all user stories)
- [X] T070 Code cleanup - remove any console.logs and TODO comments

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Can proceed after Phase 2
- **User Story 2 (Phase 4)**: Depends on Foundational - Can proceed after Phase 2 (parallel with US1 if desired)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (needs WeddingCard to click) and User Story 2 (shares WeddingForm)
- **User Story 4 (Phase 6)**: Depends on User Story 1 (needs WeddingCard) and User Story 3 (needs EditWeddingPage for delete button)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational
- **User Story 2 (P1)**: Can start after Foundational - Shares some form components with US3
- **User Story 3 (P2)**: Needs WeddingCard from US1, reuses WeddingForm from US2
- **User Story 4 (P3)**: Needs WeddingCard from US1, needs EditWeddingPage from US3

### Parallel Opportunities

**Within Phase 1 Setup**:
- T004 and T005 can run in parallel

**Within Phase 2 Foundational**:
- T009 and T010 can run in parallel (config files)
- T013 and T014 can run in parallel (lib files)

**Within User Story 1**:
- T021-T025 (individual components) can run in parallel
- T027 and T028 can run in parallel (empty/no-results states)

**Within User Story 2**:
- T034 (form field components) can be parallelized internally

**Within Phase 7 Polish**:
- T063, T064, T065 can run in parallel

---

## Implementation Strategy

### Recommended Order (Single Developer)

1. **Phase 1**: Setup (T001-T007) - ~15 minutes
2. **Phase 2**: Foundational (T008-T020) - ~45 minutes
3. **Phase 3**: User Story 1 - View List (T021-T033) - ~2 hours
4. **VALIDATE**: Test list page with Playwright MCP
5. **Phase 4**: User Story 2 - Create (T034-T044) - ~1.5 hours
6. **VALIDATE**: Test create flow with Playwright MCP
7. **Phase 5**: User Story 3 - Edit (T045-T053) - ~1 hour
8. **VALIDATE**: Test edit flow with Playwright MCP
9. **Phase 6**: User Story 4 - Delete (T054-T062) - ~45 minutes
10. **VALIDATE**: Test delete flow with Playwright MCP
11. **Phase 7**: Polish (T063-T070) - ~30 minutes
12. **FINAL VALIDATION**: Complete user journey test

### MVP Delivery

For fastest initial demo:
1. Complete Phases 1-3 (Setup + Foundational + User Story 1)
2. Consultant can view their wedding portfolio
3. Add remaining stories incrementally

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Use Playwright MCP for manual testing at each checkpoint
- Hardcoded TEMP_USER_ID will be replaced in Phase 14 (authentication)
