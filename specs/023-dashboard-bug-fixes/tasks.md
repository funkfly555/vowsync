# Tasks: Dashboard Bug Fixes

**Input**: Design documents from `/specs/023-dashboard-bug-fixes/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated test tasks.

**Organization**: Tasks grouped by user story (bug fix) to enable independent implementation and verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story/bug this task belongs to (US1=Vendors Error, US2=Timeline Scroll, US3=Budget Legend)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Branch setup and verification

- [x] T001 Verify on branch `023-dashboard-bug-fixes` and pull latest changes
- [x] T002 Run `pnpm install` to ensure dependencies are current
- [x] T003 Run `pnpm dev` to verify dev server starts without errors

---

## Phase 2: Foundational

**Purpose**: Understand current state before making changes

- [x] T004 [P] Review ContractStatusBadge.tsx to confirm bug location at line 19
- [x] T005 [P] Review EventTimelineCard.tsx to confirm card sizing at lines 44-50
- [x] T006 [P] Review BudgetPieChart.tsx to confirm legend layout at lines 55-72

**Checkpoint**: All bug locations confirmed - implementation can begin

---

## Phase 3: User Story 1 - Vendors Page Error (Priority: P1) 🎯 MVP

**Goal**: Fix TypeError when accessing undefined `.label` property on ContractStatusBadge

**Independent Test**: Navigate to `/weddings/{id}/vendors` - page loads without console errors, all vendor cards display

### Implementation for User Story 1

- [x] T007 [US1] Add null check guard clause at start of ContractStatusBadge component in `src/components/vendors/ContractStatusBadge.tsx`
- [x] T008 [US1] Return fallback "Unknown" badge when status is undefined in `src/components/vendors/ContractStatusBadge.tsx`
- [x] T009 [US1] Verify PaymentStatusBadge.tsx already has fallback (line 88) - added optional chaining in `src/components/vendors/PaymentStatusBadge.tsx`

**Checkpoint**: Vendors page loads without errors for all vendor data states

---

## Phase 4: User Story 2 - Event Timeline Scroll (Priority: P2)

**Goal**: Remove horizontal scrollbar on dashboard at standard desktop widths (1366px, 1440px, 1920px)

**Independent Test**: Navigate to dashboard at 1366px width - no horizontal page scrollbar, all event cards visible within timeline container

### Implementation for User Story 2

- [x] T010 [US2] Reduce EventCard min-width from 280px to 200px in `src/components/dashboard/EventTimelineCard.tsx`
- [x] T011 [US2] Reduce EventCard max-width from 320px to 260px in `src/components/dashboard/EventTimelineCard.tsx`
- [x] T012 [US2] Reduce container gap from gap-4 to gap-3 in `src/components/dashboard/EventTimelineCard.tsx`

**Checkpoint**: Dashboard displays without horizontal page scroll at 1366px, 1440px, and 1920px viewports

---

## Phase 5: User Story 3 - Budget Chart Labels (Priority: P3)

**Goal**: Fix legend label overlap when 12+ budget categories exist

**Independent Test**: Navigate to budget page with 12+ categories - all legend labels readable without overlap

### Implementation for User Story 3

- [x] T013 [US3] Change legend container from `ul` flex-wrap to `div` grid cols-2 in `src/components/budget/BudgetPieChart.tsx`
- [x] T014 [US3] Change legend items from `li` to `div` elements in `src/components/budget/BudgetPieChart.tsx`
- [x] T015 [US3] Reduce legend font size from text-sm to text-xs in `src/components/budget/BudgetPieChart.tsx`
- [x] T016 [US3] Add truncate class for long category names in `src/components/budget/BudgetPieChart.tsx`
- [x] T017 [US3] Add max-h-[180px] overflow-y-auto for 15+ categories in `src/components/budget/BudgetPieChart.tsx`

**Checkpoint**: Budget chart legend displays all categories without overlap

---

## Phase 6: Polish & Final Validation

**Purpose**: Cross-cutting verification and cleanup

- [x] T018 Run TypeScript compilation check with `pnpm build` to verify no type errors
- [x] T019 Test vendors page with incomplete vendor data (missing contract info)
- [x] T020 Test event timeline at 1366px viewport width
- [x] T021 Test event timeline at 1440px viewport width
- [x] T022 Test event timeline at 1920px viewport width
- [x] T023 Test budget chart with 12+ categories (code verified - grid layout applied)
- [x] T024 Test budget chart with 15+ categories (code verified - scroll enabled)
- [x] T025 Verify mobile responsive layouts still work (375px, 768px)
- [x] T026 Check browser console for any remaining errors
- [x] T027 Update feature documentation if needed (no updates required)

**Checkpoint**: All bugs fixed, no regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - code review before changes
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1, US2, US3 can proceed in parallel (different files)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - ContractStatusBadge.tsx only
- **User Story 2 (P2)**: Independent - EventTimelineCard.tsx only
- **User Story 3 (P3)**: Independent - BudgetPieChart.tsx only

All three user stories modify different files and have no cross-dependencies.

### Parallel Opportunities

**Phase 2 - All tasks can run in parallel:**
```
T004 || T005 || T006
```

**Phase 3-5 - All user stories can run in parallel:**
```
US1 (T007-T009) || US2 (T010-T012) || US3 (T013-T017)
```

---

## Parallel Example: All Bug Fixes

Since each bug fix targets a different file, all three can be implemented simultaneously:

```bash
# Launch all bug fixes in parallel:
Task: "Add null check in src/components/vendors/ContractStatusBadge.tsx"
Task: "Reduce card widths in src/components/dashboard/EventTimelineCard.tsx"
Task: "Grid legend layout in src/components/budget/BudgetPieChart.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (review)
3. Complete Phase 3: User Story 1 (P1 - Vendors Error)
4. **STOP and VALIDATE**: Vendors page loads without errors
5. Commit and can deploy if critical fix needed

### Full Implementation

1. Complete Setup + Foundational → Ready to fix
2. Fix US1 (Vendors Error) → Verify → Commit
3. Fix US2 (Timeline Scroll) → Verify → Commit
4. Fix US3 (Budget Legend) → Verify → Commit
5. Complete Polish → Final verification → Ready for PR

### Recommended Approach (All Parallel)

Since all fixes are independent:

1. Complete Setup + Foundational
2. Implement all three fixes in parallel (different files)
3. Run full verification suite
4. Single commit with all fixes
5. Create PR

---

## Notes

- [P] tasks = different files, no dependencies
- All three bug fixes target different component files
- No database changes required
- No API changes required
- Manual testing with Playwright MCP per constitution
- Commit after each story or as single batch after all fixes

---

## Summary

| Phase | Tasks | Files Modified |
|-------|-------|----------------|
| Setup | T001-T003 | None |
| Foundational | T004-T006 | None (review only) |
| US1 (P1) | T007-T009 | ContractStatusBadge.tsx |
| US2 (P2) | T010-T012 | EventTimelineCard.tsx |
| US3 (P3) | T013-T017 | BudgetPieChart.tsx |
| Polish | T018-T027 | None (verification) |

**Total Tasks**: 27
**Implementation Tasks**: 11 (T007-T017)
**Verification Tasks**: 16
