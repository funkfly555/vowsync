# Tasks: Notifications System with Bell Icon

**Input**: Design documents from `/specs/018-notifications/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated tests specified. Manual testing via Playwright MCP per constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## User Story Summary

| Story | Priority | Title | Dependencies |
|-------|----------|-------|--------------|
| US1 | P1 | View Notification Bell with Unread Count | Foundational |
| US2 | P1 | View Recent Notifications in Dropdown | US1 (partial) |
| US3 | P1 | Mark Notifications as Read | US2 |
| US4 | P2 | View All Notifications on Full Page | US1, US2, US3 |
| US5 | P2 | Delete Notifications | US4 |
| US6 | P2 | Visual Distinction by Type and Priority | Foundational (applies to all cards) |
| US7 | P3 | Sample Notification Generation (Dev Only) | US4 |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and TypeScript types

- [x] T001 [P] Create TypeScript notification types in src/types/notification.ts
- [x] T002 [P] Create notification helper functions in src/lib/notificationHelpers.ts

**Checkpoint**: Types and helpers ready for hook and component implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create useUnreadCount hook in src/hooks/useUnreadCount.ts
- [x] T004 Create useNotifications hook in src/hooks/useNotifications.ts
- [x] T005 Create useNotificationMutations hook in src/hooks/useNotificationMutations.ts

**Checkpoint**: Foundation ready - all hooks available for components

---

## Phase 3: User Story 1 - View Notification Bell with Unread Count (Priority: P1) MVP

**Goal**: Display bell icon in header with unread count badge so users immediately know if there are items requiring attention.

**Independent Test**: Log in and verify bell icon appears in header. If unread notifications exist, badge shows count. If count > 99, shows "99+". If count = 0, badge is hidden.

### Implementation for User Story 1

- [x] T006 [US1] Create NotificationIcon component in src/components/notifications/NotificationIcon.tsx
- [x] T007 [US1] Create NotificationBell component in src/components/notifications/NotificationBell.tsx
- [x] T008 [US1] Integrate NotificationBell into NavigationShell header

**Checkpoint**: Bell icon visible in header with correct unread count badge. User Story 1 complete.

---

## Phase 4: User Story 2 - View Recent Notifications in Dropdown (Priority: P1)

**Goal**: Click bell icon to see dropdown panel with recent notifications for quick review.

**Independent Test**: Click bell icon, verify dropdown opens showing up to 10 notifications with icon, title, message, timestamp, and action button. Empty state shows "No notifications" message.

**Depends On**: US1 (bell component exists)

### Implementation for User Story 2

- [x] T009 [US2] Create NotificationCard component in src/components/notifications/NotificationCard.tsx
- [x] T010 [US2] Create NotificationDropdown component in src/components/notifications/NotificationDropdown.tsx
- [x] T011 [US2] Integrate NotificationDropdown into NotificationBell popover content

**Checkpoint**: Dropdown opens on bell click showing recent notifications. User Story 2 complete.

---

## Phase 5: User Story 3 - Mark Notifications as Read (Priority: P1)

**Goal**: Mark notifications as read individually or all at once to track reviewed items.

**Independent Test**: Click notification card, verify it becomes read (dimmed) and unread count decreases. Click "Mark All Read", verify all notifications become read and count becomes 0.

**Depends On**: US2 (dropdown and cards exist)

### Implementation for User Story 3

- [x] T012 [US3] Add markAsRead functionality to NotificationCard onClick handler
- [x] T013 [US3] Add "Mark All Read" button to NotificationDropdown header
- [x] T014 [US3] Add navigation to action_url on notification click in NotificationCard

**Checkpoint**: Click notification marks as read and navigates. "Mark All Read" clears all. User Story 3 complete.

---

## Phase 6: User Story 6 - Visual Distinction by Type and Priority (Priority: P2)

**Goal**: Display type-specific icons and priority-based colors for quick identification.

**Independent Test**: Create sample notifications of each type (payment, task, RSVP, vendor, budget) and each priority (urgent, high, normal, low). Verify correct icons and border colors display.

**Depends On**: Foundational (NotificationIcon already created in US1, but this story validates and completes the visual system)

### Implementation for User Story 6

- [x] T015 [US6] Ensure NotificationIcon renders all 8 notification types with correct icons and colors
- [x] T016 [US6] Add priority-based left border styling to NotificationCard (urgent=red, high=orange, normal=blue, low=gray)
- [x] T017 [US6] Add visual distinction for read vs unread state in NotificationCard (bold/dimmed)

**Checkpoint**: All notification types display correct icons. All priorities show correct border colors. Read/unread states visually distinct.

---

## Phase 7: User Story 4 - View All Notifications on Full Page (Priority: P2)

**Goal**: Access full-page view of all notifications with filtering options for comprehensive review.

**Independent Test**: Navigate to /notifications page. Verify all notifications display with pagination. Apply type filter, verify only matching notifications show. Apply priority filter, verify filtering works. Apply read/unread filter, verify correct filtering.

**Depends On**: US1, US2, US3 (core notification viewing complete)

### Implementation for User Story 4

- [x] T018 [US4] Create NotificationFilters component in src/components/notifications/NotificationFilters.tsx
- [x] T019 [US4] Create NotificationsPage in src/pages/NotificationsPage.tsx
- [x] T020 [US4] Add pagination controls to NotificationsPage
- [x] T021 [US4] Add route for /notifications in router configuration
- [x] T022 [US4] Add "View All Notifications" link in NotificationDropdown footer

**Checkpoint**: Full page view works with all filters and pagination. Navigation from dropdown works.

---

## Phase 8: User Story 5 - Delete Notifications (Priority: P2)

**Goal**: Delete individual notifications from full-page view to clean up irrelevant items.

**Independent Test**: On notifications page, click delete on a notification. Verify confirmation appears. Confirm deletion, verify notification removed. Cancel deletion, verify notification remains.

**Depends On**: US4 (full page view exists)

### Implementation for User Story 5

- [x] T023 [US5] Add delete button to NotificationCard (full page variant with showDelete prop)
- [x] T024 [US5] Add deleteNotification mutation call to NotificationCard onDelete handler
- [x] T025 [US5] Add confirmation dialog before deletion (optional - can use simple confirm())

**Checkpoint**: Delete button appears on full page cards. Deletion works with confirmation.

---

## Phase 9: User Story 7 - Sample Notification Generation (Priority: P3)

**Goal**: Development utility to generate sample notifications for testing without waiting for real triggers.

**Independent Test**: In dev environment, navigate to /notifications page. Click "Create Sample Notifications" button. Verify 5 sample notifications created (one of each type). In production, verify button does not appear.

**Depends On**: US4 (full page view exists)

### Implementation for User Story 7

- [x] T026 [US7] Create CreateSampleNotifications component in src/components/notifications/CreateSampleNotifications.tsx
- [x] T027 [US7] Add CreateSampleNotifications button to NotificationsPage (dev only via import.meta.env.DEV check)

**Checkpoint**: Dev utility creates sample notifications of each type for testing.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and refinements

- [x] T028 Verify responsive design on mobile viewports (dropdown width adapts)
- [x] T029 Verify keyboard navigation and accessibility (focus trap, escape to close)
- [x] T030 Verify polling interval (30s) refreshes unread count correctly
- [x] T031 Run manual testing per quickstart.md validation checklist
- [x] T032 Code review and cleanup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational - MVP entry point
- **US2 (Phase 4)**: Depends on US1 (bell component)
- **US3 (Phase 5)**: Depends on US2 (dropdown and cards)
- **US6 (Phase 6)**: Can run in parallel with US4 (after US3 complete)
- **US4 (Phase 7)**: Depends on US3 completion
- **US5 (Phase 8)**: Depends on US4 (full page)
- **US7 (Phase 9)**: Depends on US4 (full page)
- **Polish (Phase 10)**: Depends on all user stories complete

### Critical Path

```
Setup → Foundational → US1 → US2 → US3 → US4 → Polish
                                    ↓       ↓
                                   US6     US5
                                           ↓
                                          US7
```

### User Story Dependencies

| Story | Can Start After | Notes |
|-------|-----------------|-------|
| US1 | Foundational | MVP entry point |
| US2 | US1 | Needs bell component |
| US3 | US2 | Needs dropdown and cards |
| US6 | US3 | Visual polish, can parallel with US4 |
| US4 | US3 | Full page requires working notifications |
| US5 | US4 | Delete is full-page only |
| US7 | US4 | Dev utility on full page |

### Within Each User Story

- Create components in dependency order (child → parent)
- Integration tasks last
- Test at checkpoint before proceeding

### Parallel Opportunities

- **Phase 1**: T001, T002 can run in parallel
- **Phase 2**: T003, T004, T005 must be sequential (T004 may depend on T003 patterns)
- **Phase 3**: T006, T007 can run in parallel, T008 depends on T007
- **Phase 4**: T009, T010 sequential (dropdown needs card), T011 depends on T010
- **Phase 6-8**: US6 can parallel with US4 → US5
- **Phase 10**: T028, T029 can run in parallel

---

## Parallel Example: Phase 1 Setup

```bash
# Launch both setup tasks together:
Task: "Create TypeScript notification types in src/types/notification.ts"
Task: "Create notification helper functions in src/lib/notificationHelpers.ts"
```

## Parallel Example: Phase 6 + Phase 7

```bash
# After US3 complete, these can run in parallel:
# Team A: User Story 6 (visual polish)
Task: "Ensure NotificationIcon renders all 8 types with correct icons and colors"
Task: "Add priority-based left border styling to NotificationCard"

# Team B: User Story 4 (full page)
Task: "Create NotificationFilters component"
Task: "Create NotificationsPage"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup (types, helpers)
2. Complete Phase 2: Foundational (hooks)
3. Complete Phase 3: US1 - Bell with badge
4. Complete Phase 4: US2 - Dropdown with cards
5. Complete Phase 5: US3 - Mark as read
6. **STOP and VALIDATE**: Test notification system independently
7. Deploy/demo if ready - users have functional notification awareness

### Incremental Delivery

1. Setup + Foundational + US1-US3 → MVP Ready!
2. Add US6 (visual polish) → Better UX
3. Add US4 (full page) → Comprehensive review capability
4. Add US5 (delete) → Cleanup capability
5. Add US7 (dev utility) → Testing capability
6. Polish → Production ready

### Estimated Task Distribution

| Phase | Tasks | Parallel Tasks |
|-------|-------|----------------|
| Setup | 2 | 2 |
| Foundational | 3 | 0 |
| US1 | 3 | 2 |
| US2 | 3 | 1 |
| US3 | 3 | 0 |
| US6 | 3 | 2 |
| US4 | 5 | 2 |
| US5 | 3 | 1 |
| US7 | 2 | 1 |
| Polish | 5 | 2 |
| **Total** | **32** | **13** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Critical: Use snake_case field names in ALL Supabase queries (user_id, is_read, notification_type)
