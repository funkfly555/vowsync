# Tasks: Guest Page Ad-Hoc Fixes

**Input**: Design documents from `/specs/025-guest-page-fixes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing with Playwright MCP only (per project constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Branch creation and dependency verification

- [x] T001 Verify feature branch `025-guest-page-fixes` is checked out
- [x] T002 [P] Verify all dependencies are installed (`npm install`)
- [x] T003 [P] Run initial build to confirm baseline (`npm run build`)

---

## Phase 2: Foundational (Database & Types)

**Purpose**: Database migration and TypeScript type updates that ALL user stories depend on

**CRITICAL**: User stories 2, 3 require these type definitions before implementation

### Database Migration

- [x] T004 Apply database migration via Supabase MCP: add `gender`, `wedding_party_side`, `wedding_party_role` columns to `guests` table per `contracts/migration.sql`
- [x] T005 Verify migration success by querying table schema

### TypeScript Types

- [x] T006 [P] Add `Gender` type to `src/types/guest.ts`: `'male' | 'female'`
- [x] T007 [P] Add `WeddingPartySide` type to `src/types/guest.ts`: `'bride' | 'groom'`
- [x] T008 [P] Add `WeddingPartyRole` type to `src/types/guest.ts`: `'best_man' | 'groomsmen' | 'maid_of_honor' | 'bridesmaids' | 'parent' | 'close_relative' | 'relative' | 'other'`
- [x] T009 Update `Guest` interface in `src/types/guest.ts` to include `gender`, `wedding_party_side`, `wedding_party_role` fields (nullable)
- [x] T010 Update `GuestEditFormData` interface in `src/types/guest.ts` to include new fields
- [x] T011 [P] Add `GENDER_CONFIG` constant with labels and icons (User, UserCheck) to `src/types/guest.ts`
- [x] T012 [P] Add `WEDDING_PARTY_SIDE_CONFIG` constant with labels to `src/types/guest.ts`
- [x] T013 [P] Add `WEDDING_PARTY_ROLES_BY_SIDE` constant mapping side to available roles to `src/types/guest.ts`
- [x] T014 [P] Add `WEDDING_PARTY_ROLE_CONFIG` constant with display labels to `src/types/guest.ts`

### Zod Schema Updates

- [x] T015 Add `genderSchema` to `src/schemas/guest.ts`: `z.enum(['male', 'female']).nullable()`
- [x] T016 [P] Add `weddingPartySideSchema` to `src/schemas/guest.ts`
- [x] T017 [P] Add `weddingPartyRoleSchema` to `src/schemas/guest.ts`
- [x] T018 Update `guestEditSchema` in `src/schemas/guest.ts` to include new fields with role-side validation refinement

**Checkpoint**: Foundation ready - types regenerated, database updated, user story implementation can begin

---

## Phase 3: User Story 1 - Auto-Save Guest Edits (Priority: P1) MVP

**Goal**: Changes to guest information save automatically with 500ms debounce, visual feedback provided

**Independent Test**: Edit any guest field, wait 500ms, navigate away - changes persist without clicking save

### Implementation for User Story 1

- [x] T019 [US1] Reduce debounce timer from 1000ms to 500ms in `src/components/guests/GuestCard.tsx` (around line 121)
- [x] T020 [US1] Verify save status indicator displays "Saving..." during auto-save in `GuestCard.tsx`
- [x] T021 [US1] Verify save status indicator displays "Saved" after successful save
- [x] T022 [US1] Verify error notification appears on auto-save failure

**Checkpoint**: User Story 1 complete - auto-save works with 500ms debounce and visual feedback

---

## Phase 4: User Story 2 - Wedding Party Details (Priority: P1) MVP

**Goal**: Capture Bride/Groom side and conditional role for wedding party members

**Independent Test**: Select Bride side, verify role dropdown shows bride-specific roles; select Groom, verify groom-specific roles

### Implementation for User Story 2

- [x] T023 [US2] Add gender dropdown (Male/Female) to `src/components/guests/tabs/BasicInfoTab.tsx` in Primary Guest column
- [x] T024 [US2] Add "Wedding Party Side" RadioGroup (Bride/Groom/None) to `src/components/guests/tabs/BasicInfoTab.tsx`
- [x] T025 [US2] Add "Wedding Party Role" Select dropdown to `src/components/guests/tabs/BasicInfoTab.tsx`
- [x] T026 [US2] Implement conditional logic: role dropdown hidden/disabled when no side selected
- [x] T027 [US2] Implement role filtering: show only bride roles for bride side, groom roles for groom side
- [x] T028 [US2] Implement role reset: clear role when side changes
- [x] T029 [US2] Wire up form fields to React Hook Form with proper field registration

**Checkpoint**: User Story 2 complete - wedding party side and conditional role dropdown functional

---

## Phase 5: User Story 3 - Gender Field with Icon Display (Priority: P2)

**Goal**: Display gender icon on collapsed guest cards between TYPE and RSVP badges

**Independent Test**: Set gender on a guest, collapse card, verify icon appears in correct position

### Implementation for User Story 3

- [x] T030 [P] [US3] Import `User` and `UserCheck` icons from lucide-react in `src/components/guests/GuestCardCollapsed.tsx`
- [x] T031 [US3] Add gender icon display logic to `GuestCardCollapsed.tsx`: show User icon for male, UserCheck for female
- [x] T032 [US3] Position gender icon between TYPE badge and RSVP badge in the card layout
- [x] T033 [US3] Style icon with `h-4 w-4 text-gray-600` for consistency

**Checkpoint**: User Story 3 complete - gender icon displays on guest cards

---

## Phase 6: User Story 4 - Field Organization in RSVP Tab (Priority: P2)

**Goal**: Move invitation_status and plus_one_confirmed from Basic Info to RSVP tab

**Independent Test**: Navigate to RSVP tab, verify both fields present; navigate to Basic Info, verify fields NOT present

### Implementation for User Story 4

- [x] T034 [US4] Remove `invitation_status` Select component from `src/components/guests/tabs/BasicInfoTab.tsx` (lines ~119-137)
- [x] T035 [US4] Remove `plus_one_confirmed` Checkbox from `src/components/guests/tabs/BasicInfoTab.tsx` (lines ~185-199)
- [x] T036 [US4] Add `invitation_status` Select component to `src/components/guests/tabs/RsvpTab.tsx` in appropriate section
- [x] T037 [US4] Add `plus_one_confirmed` Checkbox to `src/components/guests/tabs/RsvpTab.tsx` in Plus One section
- [x] T038 [US4] Wire up moved fields to existing form context in RsvpTab

**Checkpoint**: User Story 4 complete - RSVP fields logically grouped in RSVP tab

---

## Phase 7: User Story 5 - Guest Deletion (Priority: P2)

**Goal**: Enable single and bulk guest deletion with confirmation dialogs

**Independent Test**: Click delete on single guest card, confirm, verify removed; select multiple guests, bulk delete, verify all removed

### Implementation for User Story 5

- [x] T039 [P] [US5] Add `bulkDeleteGuests` mutation to `src/hooks/useGuestMutations.ts` accepting array of guest IDs
- [x] T040 [US5] Add delete button (Trash2 icon) to `src/components/guests/GuestCardCollapsed.tsx`
- [x] T041 [US5] Wire delete button to existing `DeleteGuestDialog` component with confirmation flow
- [x] T042 [US5] Add "Delete Selected" option to `src/components/guests/BulkActionsBar.tsx`
- [x] T043 [US5] Implement bulk delete confirmation dialog showing count of guests to be deleted
- [x] T044 [US5] Wire bulk delete action to `bulkDeleteGuests` mutation

**Checkpoint**: User Story 5 complete - single and bulk delete functional with confirmations

---

## Phase 8: User Story 6 - Meal Options from Database (Priority: P3)

**Goal**: Verify meal dropdowns pull options from meal_options table (already implemented)

**Independent Test**: Add meal options to database, open guest Meals tab, verify options appear in dropdowns

### Verification for User Story 6

- [x] T045 [US6] Verify `useMealOptions` hook in `src/hooks/useMealOptions.ts` correctly fetches from meal_options table
- [x] T046 [US6] Verify `MealsTab` uses `useMealOptionsByCourse` for course-specific dropdowns
- [x] T047 [US6] Verify dropdown shows placeholder when no meal options exist for a course

**Checkpoint**: User Story 6 verified - meal options integration confirmed working

---

## Phase 9: Polish & Validation

**Purpose**: Final testing, cleanup, and validation

- [x] T048 [P] Run TypeScript type check (`npm run typecheck` or `tsc --noEmit`)
- [x] T049 [P] Run ESLint (`npm run lint`)
- [x] T050 Run full build (`npm run build`)
- [ ] T051 Manual testing: Execute all acceptance scenarios from spec.md
- [ ] T052 [P] Run quickstart.md validation checklist
- [x] T053 Code cleanup: remove any debug console.log statements
- [ ] T054 Verify no regression in existing guest functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS user stories 2, 3
- **User Story 1 (Phase 3)**: Can start after Setup (no type dependencies)
- **User Story 2 (Phase 4)**: Depends on Foundational (needs new types)
- **User Story 3 (Phase 5)**: Depends on Foundational (needs gender type) and US2 (gender field added)
- **User Story 4 (Phase 6)**: Can start after Setup (UI reorganization only)
- **User Story 5 (Phase 7)**: Can start after Setup (uses existing types)
- **User Story 6 (Phase 8)**: Can start after Setup (verification only)
- **Polish (Phase 9)**: Depends on all user stories being complete

### Parallel Opportunities

**After Setup (Phase 1) completes:**
- US1 (auto-save) can start in parallel with Foundational
- US4 (field reorganization) can start in parallel with Foundational
- US5 (deletion) can start in parallel with Foundational
- US6 (verification) can start in parallel with Foundational

**After Foundational (Phase 2) completes:**
- US2 (wedding party) can start
- US3 (gender icon) can start after US2 adds gender field

### Within Each Phase

- Tasks marked [P] can run in parallel
- Type definitions (T006-T014) can all run in parallel
- Schema updates (T015-T018) can mostly run in parallel

---

## Implementation Strategy

### Recommended Order (Solo Developer)

1. **Phase 1**: Setup (T001-T003)
2. **Phase 2**: Foundational - migration and types (T004-T018)
3. **Phase 3**: US1 - Auto-Save (T019-T022) - Quick win, P1 priority
4. **Phase 4**: US2 - Wedding Party (T023-T029) - Uses new types, P1 priority
5. **Phase 5**: US3 - Gender Icon (T030-T033) - Depends on US2
6. **Phase 6**: US4 - Field Reorganization (T034-T038) - UI only
7. **Phase 7**: US5 - Deletion (T039-T044) - Independent feature
8. **Phase 8**: US6 - Meal Options (T045-T047) - Verification only
9. **Phase 9**: Polish (T048-T054)

### MVP Delivery Point

After completing **Phase 4 (US2)**, you have:
- Auto-save working (US1)
- Wedding party details captured (US2)
- Core P1 functionality complete

Can deploy MVP and continue with P2/P3 features incrementally.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US6 (Meal Options) is already implemented - only verification needed
- Auto-save is already implemented - only debounce adjustment needed
- DeleteGuestDialog already exists - reuse for single delete
- Commit after each task or logical group
