# Tasks: Dashboard Data Settings Fix

**Input**: Design documents from `/specs/020-dashboard-settings-fix/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Foundation Types & Utilities)

**Purpose**: Create shared types and utilities needed by multiple user stories

- [ ] T001 [P] Create settings types in src/types/settings.ts (CurrencyCode, UserPreferences, UserSettings)
- [ ] T002 [P] Create currency configuration and formatting utilities in src/lib/currency.ts (CURRENCIES, TIMEZONES, formatCurrency)
- [ ] T003 Extend dashboard types in src/types/dashboard.ts (VendorStats, TaskStats, TaskSummary interfaces)

---

## Phase 2: Foundational (Data Layer Hooks)

**Purpose**: Core hooks that MUST be complete before UI work can begin

**⚠️ CRITICAL**: No UI components can use real data until this phase is complete

- [ ] T004 [P] Create useVendorStats hook in src/hooks/useVendorStats.ts (vendor count, pending payments)
- [ ] T005 [P] Create useTaskStats hook in src/hooks/useTaskStats.ts (upcoming tasks count and list)
- [ ] T006 [P] Create useUserPreferences hook in src/hooks/useUserPreferences.ts (fetch and update preferences)
- [ ] T007 Enhance useGuestStats hook in src/hooks/useGuestStats.ts (add adults/children counts)
- [ ] T008 Enhance useDashboard hook in src/hooks/useDashboard.ts (integrate vendorStats, taskStats, update calculateMetrics)

**Checkpoint**: Data layer ready - all stats hooks return real database values

---

## Phase 3: User Story 1 - Accurate Guest Count Display (Priority: P1) 🎯 MVP

**Goal**: Display accurate guest counts (adults + children) from database on dashboard

**Independent Test**: Navigate to wedding dashboard, verify Guest Count card shows actual counts matching Guests page

### Implementation for User Story 1

- [ ] T009 [US1] Update DashboardStatsGrid guest card in src/components/dashboard/DashboardStatsGrid.tsx (use metrics.adultsCount, metrics.childrenCount instead of hardcoded 0)
- [ ] T010 [US1] Update WeddingDashboardPage in src/pages/WeddingDashboardPage.tsx (ensure guestStats data flows correctly)

**Checkpoint**: Guest Count card displays real adults/children counts from database

---

## Phase 4: User Story 2 - Accurate Vendor Count Display (Priority: P1) 🎯 MVP

**Goal**: Display accurate vendor count and pending payments from database on dashboard

**Independent Test**: Navigate to wedding dashboard, verify Vendors card shows actual counts matching Vendors page

### Implementation for User Story 2

- [ ] T011 [US2] Update DashboardStatsGrid props interface in src/components/dashboard/DashboardStatsGrid.tsx (add vendorStats prop)
- [ ] T012 [US2] Update DashboardStatsGrid vendor card in src/components/dashboard/DashboardStatsGrid.tsx (use vendorStats.total, vendorStats.pendingPayments)
- [ ] T013 [US2] Update WeddingDashboardPage in src/pages/WeddingDashboardPage.tsx (pass vendorStats to DashboardStatsGrid)

**Checkpoint**: Vendors card displays real vendor count and pending payments from database

---

## Phase 5: User Story 3 - Accurate Task Summary Display (Priority: P2)

**Goal**: Display upcoming tasks (next 7 days) on dashboard

**Independent Test**: Navigate to wedding dashboard, verify Upcoming Tasks section shows real task data

### Implementation for User Story 3

- [ ] T014 [US3] Update DashboardStatsGrid props in src/components/dashboard/DashboardStatsGrid.tsx (add taskStats prop)
- [ ] T015 [US3] Replace Upcoming Tasks PlaceholderSection in src/pages/WeddingDashboardPage.tsx (show real tasks or empty state)
- [ ] T016 [US3] Pass taskStats to dashboard components in src/pages/WeddingDashboardPage.tsx

**Checkpoint**: Upcoming Tasks section shows real task data from database

---

## Phase 6: User Story 6 - Settings Page Navigation (Priority: P2)

**Goal**: Create Settings page accessible from navigation drawer

**Independent Test**: Click Settings in navigation, verify page loads at /settings

**Note**: This phase comes before US4/US5 because Settings page is infrastructure needed for currency/timezone settings

### Implementation for User Story 6

- [ ] T017 [P] [US6] Create CurrencyContext and CurrencyProvider in src/contexts/CurrencyContext.tsx
- [ ] T018 [US6] Integrate CurrencyProvider in src/App.tsx (wrap inside AuthProvider)
- [ ] T019 [US6] Create SettingsPage component in src/pages/SettingsPage.tsx (form with currency/timezone selects)
- [ ] T020 [US6] Add /settings route in src/App.tsx (inside AppLayout)
- [ ] T021 [US6] Update navigation.ts in src/lib/navigation.ts (set Settings isPlaceholder: false)

**Checkpoint**: Settings page accessible at /settings, shows currency and timezone form

---

## Phase 7: User Story 4 - Currency Settings (Priority: P2)

**Goal**: Allow user to set currency preference, apply to all monetary displays

**Independent Test**: Change currency in Settings, verify dashboard budget shows correct currency symbol

### Implementation for User Story 4

- [ ] T022 [US4] Update DashboardStatsGrid budget card in src/components/dashboard/DashboardStatsGrid.tsx (use useCurrency().formatCurrency)
- [ ] T023 [US4] Audit BudgetPage for hardcoded currency in src/pages/budget/BudgetPage.tsx (replace with useCurrency)
- [ ] T024 [P] [US4] Audit VendorDetailPage for hardcoded currency in src/pages/vendors/VendorDetailPage.tsx (replace with useCurrency)
- [ ] T025 [P] [US4] Audit BarOrdersPage for hardcoded currency in src/pages/bar-orders/BarOrdersPage.tsx (replace with useCurrency)

**Checkpoint**: All monetary values display with user-selected currency symbol

---

## Phase 8: User Story 5 - Timezone Settings (Priority: P3)

**Goal**: Allow user to set timezone preference

**Independent Test**: Change timezone in Settings, verify preference persists

### Implementation for User Story 5

- [ ] T026 [US5] Verify timezone select works in SettingsPage (should be implemented in T019)
- [ ] T027 [US5] Verify timezone persists in useUserPreferences hook (should work from T006)

**Checkpoint**: Timezone preference saves and persists across sessions

---

## Phase 9: Dashboard Quick Actions (Cross-Cutting)

**Goal**: Make Quick Actions functional with real navigation

**Independent Test**: Click each quick action, verify navigation to correct page

### Implementation

- [ ] T028 Update DashboardQuickActions in src/components/dashboard/DashboardQuickActions.tsx (replace toast placeholders with navigate())

**Checkpoint**: All quick action buttons navigate to their target pages

---

## Phase 10: Polish & Final Validation

**Purpose**: Final checks, cleanup, and build validation

- [ ] T029 Run TypeScript strict mode check (npm run typecheck)
- [ ] T030 Run production build (npm run build)
- [ ] T031 Manual test: Dashboard guest counts accuracy
- [ ] T032 Manual test: Dashboard vendor counts accuracy
- [ ] T033 Manual test: Dashboard task summary display
- [ ] T034 Manual test: Settings page functionality
- [ ] T035 Manual test: Currency formatting consistency
- [ ] T036 Manual test: Quick actions navigation
- [ ] T037 Update checklist.md with completed items

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all UI work
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
- **Quick Actions (Phase 9)**: Can run in parallel with later user stories
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1: Setup (T001-T003)
    ↓
Phase 2: Foundational Hooks (T004-T008) ← BLOCKS ALL UI WORK
    ↓
    ├── Phase 3: US1 Guest Counts (T009-T010) ← P1 MVP
    ├── Phase 4: US2 Vendor Counts (T011-T013) ← P1 MVP
    ├── Phase 5: US3 Task Summary (T014-T016) ← P2
    │
    └── Phase 6: US6 Settings Infrastructure (T017-T021) ← P2
            ↓
        Phase 7: US4 Currency Settings (T022-T025) ← P2
            ↓
        Phase 8: US5 Timezone Settings (T026-T027) ← P3

Phase 9: Quick Actions (T028) ← Can run after Phase 2
    ↓
Phase 10: Polish (T029-T037)
```

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T001 (settings types) and T002 (currency utils) can run in parallel
- T003 (dashboard types) can run after T001/T002 are started

**Within Foundational (Phase 2)**:
- T004 (useVendorStats), T005 (useTaskStats), T006 (useUserPreferences) can all run in parallel
- T007 (useGuestStats) and T008 (useDashboard) depend on earlier hooks

**After Foundational Complete**:
- US1, US2, US3 can all start in parallel (different cards in DashboardStatsGrid)
- US6 can start in parallel with US1-US3

**Within User Story 4 (Currency)**:
- T024 and T025 can run in parallel (different pages)

---

## Parallel Example: Foundational Phase

```bash
# Launch all independent hooks in parallel:
Task: "Create useVendorStats hook in src/hooks/useVendorStats.ts"
Task: "Create useTaskStats hook in src/hooks/useTaskStats.ts"
Task: "Create useUserPreferences hook in src/hooks/useUserPreferences.ts"

# Then run dependent tasks:
Task: "Enhance useGuestStats hook in src/hooks/useGuestStats.ts"
Task: "Enhance useDashboard hook in src/hooks/useDashboard.ts"
```

## Parallel Example: After Foundational

```bash
# Launch MVP user stories in parallel:
Task: "[US1] Update DashboardStatsGrid guest card"
Task: "[US2] Update DashboardStatsGrid vendor card"
Task: "[US3] Update Upcoming Tasks section"
Task: "[US6] Create SettingsPage component"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational Hooks
3. Complete Phase 3: US1 Guest Counts
4. Complete Phase 4: US2 Vendor Counts
5. **STOP and VALIDATE**: Test dashboard shows real guest/vendor data
6. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Data layer ready
2. Add US1 + US2 → Test independently → Deploy (Core MVP!)
3. Add US3 (Task Summary) → Test → Deploy
4. Add US6 (Settings Page) → Test → Deploy
5. Add US4 (Currency) → Test → Deploy
6. Add US5 (Timezone) → Test → Deploy
7. Add Quick Actions → Test → Deploy
8. Polish and final validation

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Manual testing with Playwright MCP per constitution (no automated tests)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Settings infrastructure (US6) must complete before currency/timezone settings (US4/US5)
