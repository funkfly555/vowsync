# Tasks: Final Polish Integration

**Input**: Design documents from `/specs/019-final-polish-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create utility functions and shared components needed by user stories

- [x] T001 [P] Create event overlap utility functions in src/lib/eventUtils.ts
- [x] T002 [P] Create EventOverlapBadge component in src/components/events/EventOverlapBadge.tsx

**Checkpoint**: Overlap detection utilities and badge component ready for integration

---

## Phase 2: User Story 1 - Event Overlap Detection (Priority: P1) 🎯 MVP

**Goal**: Wedding consultants see warnings when scheduling events with overlapping time ranges

**Independent Test**: Create two events with overlapping times on the same date and verify the warning badge appears with "Overlaps with [Event Name]"

### Implementation for User Story 1

- [x] T003 [US1] Add allEvents prop to EventForm interface in src/components/events/EventForm.tsx
- [x] T004 [US1] Add overlap detection state and useEffect in src/components/events/EventForm.tsx
- [x] T005 [US1] Render EventOverlapBadge in EventForm after time fields in src/components/events/EventForm.tsx
- [x] T006 [P] [US1] Pass allEvents from useEvents to EventForm in src/pages/CreateEventPage.tsx
- [x] T007 [P] [US1] Pass allEvents from useEvents to EventForm in src/pages/EditEventPage.tsx

**Checkpoint**: User Story 1 complete - overlap warnings appear when creating/editing events with time conflicts

---

## Phase 3: User Story 2 - Enhanced Dashboard Header (Priority: P2)

**Goal**: Dashboard header displays venue name alongside wedding date for quick reference

**Independent Test**: View wedding dashboard and verify header displays "Bride & Groom / Venue Name • Wedding Date" format

### Implementation for User Story 2

- [x] T008 [US2] Add venue_name display with bullet separator in src/pages/WeddingDashboardPage.tsx
- [x] T009 [US2] Add mobile truncation CSS for venue name in src/pages/WeddingDashboardPage.tsx
- [x] T010 [US2] Add graceful fallback when venue_name is null/empty in src/pages/WeddingDashboardPage.tsx

**Checkpoint**: User Story 2 complete - venue name displays in dashboard header with mobile truncation

---

## Phase 4: User Story 3 - Error-Free Console Experience (Priority: P2)

**Goal**: All pages load without JavaScript errors in browser console

**Independent Test**: Navigate through all application pages while monitoring browser console for errors

### Implementation for User Story 3

- [x] T011 [US3] Audit and fix console errors on WeddingsPage in src/pages/WeddingsPage.tsx
- [x] T012 [US3] Audit and fix console errors on WeddingDashboardPage in src/pages/WeddingDashboardPage.tsx
- [x] T013 [US3] Audit and fix console errors on EventsPage in src/pages/EventsPage.tsx
- [x] T014 [US3] Audit and fix console errors on GuestsPage in src/pages/GuestsPage.tsx
- [x] T015 [US3] Audit and fix console errors on VendorsPage in src/pages/VendorsPage.tsx
- [x] T016 [US3] Remove any console.log statements from production code across src/

**Checkpoint**: User Story 3 complete - no console errors on any page

---

## Phase 5: User Story 4 - Smooth Loading Experience (Priority: P3)

**Goal**: All pages load smoothly with appropriate loading indicators

**Independent Test**: Observe page transitions and data loading throughout the application

### Implementation for User Story 4

- [x] T017 [US4] Verify skeleton loaders on WeddingsPage in src/pages/WeddingsPage.tsx
- [x] T018 [US4] Verify skeleton loaders on WeddingDashboardPage in src/pages/WeddingDashboardPage.tsx
- [x] T019 [US4] Verify button disabled states during form submissions across src/components/
- [x] T020 [US4] Fix any layout shifts during data loading transitions

**Checkpoint**: User Story 4 complete - smooth loading experience throughout application

---

## Phase 6: User Story 5 - Validated Form Submissions (Priority: P3)

**Goal**: Clear, helpful error messages when users make form mistakes

**Independent Test**: Intentionally submit invalid data in forms and verify specific error messages appear

### Implementation for User Story 5

- [x] T021 [US5] Review Zod schema error messages in WeddingForm in src/components/weddings/WeddingForm.tsx
- [x] T022 [US5] Review Zod schema error messages in EventForm in src/components/events/EventForm.tsx
- [x] T023 [US5] Review Zod schema error messages in GuestForm in src/components/guests/GuestForm.tsx
- [x] T024 [US5] Review Zod schema error messages in VendorForm in src/components/vendors/VendorForm.tsx
- [x] T025 [US5] Update generic "Invalid" messages to specific guidance across all forms

**Checkpoint**: User Story 5 complete - all form validation errors are user-friendly

---

## Phase 7: User Story 6 - Responsive Design Across Devices (Priority: P3)

**Goal**: Application works correctly on mobile, tablet, and desktop viewports

**Independent Test**: Access application at 320px, 768px, 1024px viewports and verify usability

### Implementation for User Story 6

- [x] T026 [US6] Test and fix responsive issues at 320px viewport across all pages
- [x] T027 [US6] Verify 44px minimum touch targets on mobile across src/components/
- [x] T028 [US6] Verify no horizontal scroll at any viewport size
- [x] T029 [US6] Test navigation drawer functionality on mobile viewports

**Checkpoint**: User Story 6 complete - responsive design works at all viewport sizes

---

## Phase 8: Polish & Final Validation

**Purpose**: Cross-cutting validation and final cleanup

- [x] T030 Run TypeScript typecheck (npm run typecheck)
- [x] T031 Run build validation (npm run build)
- [x] T032 [P] Run quickstart.md validation scenarios for overlap detection
- [x] T033 [P] Run quickstart.md validation scenarios for dashboard header
- [x] T034 Final console error audit across all pages
- [x] T035 Final responsive design audit at 320px, 768px, 1024px
- [x] T036 Performance check - all pages load within 2 seconds
- [x] T037 Generate comprehensive audit report

**Checkpoint**: Feature complete and validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion (T001, T002)
- **User Story 2 (Phase 3)**: No dependencies on other user stories
- **User Story 3 (Phase 4)**: No dependencies on other user stories
- **User Story 4 (Phase 5)**: No dependencies on other user stories
- **User Story 5 (Phase 6)**: No dependencies on other user stories
- **User Story 6 (Phase 7)**: No dependencies on other user stories
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Independence

| User Story | Can Start After | Dependencies |
|------------|-----------------|--------------|
| US1 - Overlap Detection | Phase 1 Setup | T001, T002 |
| US2 - Dashboard Header | Immediately | None |
| US3 - Console Errors | Immediately | None |
| US4 - Loading States | Immediately | None |
| US5 - Form Validation | Immediately | None |
| US6 - Responsive Design | Immediately | None |

### Within User Story 1 (Has Sequential Dependencies)

```
T001 (eventUtils.ts) ─┬─→ T003 → T004 → T005 (EventForm changes are sequential)
T002 (Badge) ─────────┘
                        ↓
              T006, T007 (parallel - different files)
```

### Parallel Opportunities

**Phase 1 - All tasks parallel:**
- T001 and T002 can run simultaneously (different files)

**Phase 2 - Within User Story 1:**
- T006 and T007 can run in parallel (different page files)

**User Stories 2-6 - All independent:**
- After Phase 1, US2 through US6 can be worked on in any order
- Different developers could work on different user stories simultaneously

---

## Parallel Example: Setup Phase

```bash
# Launch both setup tasks together:
Task: "Create event overlap utility functions in src/lib/eventUtils.ts"
Task: "Create EventOverlapBadge component in src/components/events/EventOverlapBadge.tsx"
```

## Parallel Example: User Story 1 Integration

```bash
# After EventForm modifications complete, run page updates in parallel:
Task: "Pass allEvents from useEvents to EventForm in src/pages/CreateEventPage.tsx"
Task: "Pass allEvents from useEvents to EventForm in src/pages/EditEventPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: User Story 1 (T003-T007)
3. **STOP and VALIDATE**: Test overlap detection independently
4. Deploy/demo if ready - core value delivered

### Incremental Delivery

1. Setup → US1 (Overlap Detection) → **MVP Complete**
2. Add US2 (Dashboard Header) → Enhanced header
3. Add US3 (Console Errors) → Production polish
4. Add US4-US6 (Loading, Validation, Responsive) → Full polish
5. Each story adds value without breaking previous stories

### Priority-Based Execution (Recommended)

1. **P1 Critical**: US1 - Event Overlap Detection
2. **P2 Important**: US2 - Dashboard Header, US3 - Console Errors
3. **P3 Polish**: US4, US5, US6 - Loading, Validation, Responsive

---

## Task Summary

| Phase | Tasks | Parallel Tasks | User Story |
|-------|-------|----------------|------------|
| 1 - Setup | 2 | 2 | - |
| 2 - US1 | 5 | 2 | Event Overlap Detection (P1) |
| 3 - US2 | 3 | 0 | Dashboard Header (P2) |
| 4 - US3 | 6 | 0 | Console Errors (P2) |
| 5 - US4 | 4 | 0 | Loading States (P3) |
| 6 - US5 | 5 | 0 | Form Validation (P3) |
| 7 - US6 | 4 | 0 | Responsive Design (P3) |
| 8 - Polish | 8 | 2 | - |
| **Total** | **37** | **6** | - |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- US2-US6 have no dependencies on each other - can be done in any order
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
