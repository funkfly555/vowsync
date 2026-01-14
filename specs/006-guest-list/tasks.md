# Tasks: Guest List Page

**Feature**: 006-guest-list
**Branch**: `006-guest-list`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/guest-api.ts

**Tests**: Manual testing with Playwright MCP only (per Constitution VIII). No automated tests.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- All file paths are relative to repository root

## Path Conventions

This is a single React SPA project:
- **Types**: `src/types/`
- **Schemas**: `src/schemas/`
- **Hooks**: `src/hooks/`
- **Components**: `src/components/guests/`
- **UI Components**: `src/components/ui/`
- **Pages**: `src/pages/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add required Shadcn components and create foundational files

- [x] T001 Add Shadcn Table component via `npx shadcn@latest add table`
- [x] T002 [P] Add Shadcn Checkbox component via `npx shadcn@latest add checkbox`
- [x] T003 [P] Add Shadcn DropdownMenu component via `npx shadcn@latest add dropdown-menu`
- [x] T004 Create Guest TypeScript types in src/types/guest.ts (from contracts/guest-api.ts)
- [x] T005 [P] Create Guest Zod schemas in src/schemas/guest.ts

**Checkpoint**: Shadcn components available, types and schemas defined

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data hook and routing that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create useGuests TanStack Query hook in src/hooks/useGuests.ts with pagination support
- [x] T007 Create useDebounce utility hook in src/hooks/useDebounce.ts
- [x] T008 Create GuestListPage shell component in src/pages/GuestListPage.tsx
- [x] T009 Add guest list route to src/App.tsx: `/weddings/:weddingId/guests` → GuestListPage

**Checkpoint**: Foundation ready - can navigate to /weddings/:weddingId/guests, data fetching works

---

## Phase 3: User Story 1 - View Guest List (Priority: P1) 🎯 MVP

**Goal**: Display wedding guests in a table with Name, Type, RSVP status, Table, and Actions columns

**Independent Test**: Navigate to /weddings/:weddingId/guests, verify table displays with all columns, guests sorted A-Z by name

### Implementation for User Story 1

- [x] T010 [P] [US1] Create RsvpBadge component with color-coded status in src/components/guests/RsvpBadge.tsx
- [x] T011 [P] [US1] Create GuestTypeBadge component in src/components/guests/GuestTypeBadge.tsx
- [x] T012 [US1] Create GuestRow component with checkbox, name, type, RSVP, table, actions in src/components/guests/GuestRow.tsx
- [x] T013 [US1] Create GuestTable component with header (#F5F5F5) and hover effects (#FAFAFA) in src/components/guests/GuestTable.tsx
- [x] T014 [US1] Create page header with "Guests" title and "+ Add Guest" button (placeholder toast) in src/pages/GuestListPage.tsx
- [x] T015 [US1] Add Edit/Delete action icons with placeholder toasts in src/components/guests/GuestRow.tsx
- [x] T016 [US1] Style table with 1px solid #E8E8E8 borders, 16px cell padding per spec

**Checkpoint**: Table displays guests with all columns, RSVP badges show correct colors, placeholder actions work

---

## Phase 4: User Story 2 - Search and Filter Guests (Priority: P1)

**Goal**: Enable real-time search by name and filtering by Type, RSVP Status, and Event

**Independent Test**: Type in search box, verify list filters in real-time; select filter dropdowns, verify results update

### Implementation for User Story 2

- [x] T017 [P] [US2] Create SearchInput component with placeholder "Search guests by name..." in src/components/guests/SearchInput.tsx
- [x] T018 [P] [US2] Create TypeFilter dropdown component (All/Adult/Child/Vendor/Staff) in src/components/guests/TypeFilter.tsx
- [x] T019 [P] [US2] Create RsvpFilter dropdown component (All/Pending/Confirmed/Overdue) in src/components/guests/RsvpFilter.tsx
- [x] T020 [P] [US2] Create EventFilter dropdown component (All Events/specific events) in src/components/guests/EventFilter.tsx
- [x] T021 [US2] Create GuestFilters container component combining all filters in src/components/guests/GuestFilters.tsx
- [x] T022 [US2] Add Export CSV and Export Excel buttons with placeholder toasts in src/components/guests/GuestFilters.tsx
- [x] T023 [US2] Implement client-side search filtering with 300ms debounce in src/pages/GuestListPage.tsx
- [x] T024 [US2] Implement type and RSVP status filter logic in src/pages/GuestListPage.tsx
- [x] T025 [US2] Implement event filter with Supabase join query in src/hooks/useGuests.ts
- [x] T026 [US2] Add "Showing X-Y of Total" results count display in src/pages/GuestListPage.tsx

**Checkpoint**: Search filters in real-time (<300ms), all filter dropdowns work, results count updates

---

## Phase 5: User Story 3 - Mobile Guest View (Priority: P2)

**Goal**: Display guests as cards on mobile viewports (<768px) instead of table

**Independent Test**: View guest list on viewport <768px, verify cards display with Name, Type, RSVP, Table, Edit/Delete

### Implementation for User Story 3

- [x] T027 [P] [US3] Create GuestCard component with stacked layout in src/components/guests/GuestCard.tsx
- [x] T028 [US3] Create GuestCardList component to render multiple cards in src/components/guests/GuestCardList.tsx
- [x] T029 [US3] Add responsive breakpoint switching (table: lg:block, cards: block lg:hidden) in src/pages/GuestListPage.tsx
- [x] T030 [US3] Add Edit/Delete buttons to GuestCard with placeholder toasts in src/components/guests/GuestCard.tsx

**Checkpoint**: Desktop shows table, mobile shows cards, both layouts display all required info

---

## Phase 6: User Story 4 - Pagination (Priority: P2)

**Goal**: Paginate guests at 50 per page with navigation controls

**Independent Test**: With 100+ test guests, verify pagination shows, clicking page 2 shows guests 51-100, current page highlighted

### Implementation for User Story 4

- [x] T031 [P] [US4] Create GuestPagination component with page numbers and arrows in src/components/guests/GuestPagination.tsx
- [x] T032 [US4] Style current page with #D4A5A5 background (dusty rose) in src/components/guests/GuestPagination.tsx
- [x] T033 [US4] Implement server-side pagination with Supabase .range() in src/hooks/useGuests.ts
- [x] T034 [US4] Connect pagination state to GuestListPage and update query in src/pages/GuestListPage.tsx
- [x] T035 [US4] Update "Showing X-Y of Total" to reflect current page in src/pages/GuestListPage.tsx

**Checkpoint**: Pagination appears for >50 guests, navigation works, current page highlighted with dusty rose

---

## Phase 7: User Story 5 - Bulk Selection UI (Priority: P3)

**Goal**: Enable checkbox selection of multiple guests with bulk actions bar

**Independent Test**: Click guest checkboxes, verify "Selected: X" count updates, bulk action dropdowns show Phase 6B toast

### Implementation for User Story 5

- [x] T036 [P] [US5] Create BulkActionsBar component with selection count in src/components/guests/BulkActionsBar.tsx
- [x] T037 [US5] Add "Select All" checkbox in table header in src/components/guests/GuestTable.tsx
- [x] T038 [US5] Implement selection state management (Set<string>) in src/pages/GuestListPage.tsx
- [x] T039 [US5] Add bulk action dropdowns (Assign Table, Send Email) with placeholder toasts in src/components/guests/BulkActionsBar.tsx
- [x] T040 [US5] Show/hide BulkActionsBar based on selection count in src/pages/GuestListPage.tsx

**Checkpoint**: Checkboxes work, selection count updates, bulk actions show Phase 6B toast

---

## Phase 8: User Story 6 - Empty State (Priority: P3)

**Goal**: Display helpful message when no guests exist

**Independent Test**: View guest list for wedding with no guests, verify empty state message appears with Add Guest guidance

### Implementation for User Story 6

- [x] T041 [P] [US6] Create EmptyGuestState component with centered message in src/components/guests/EmptyGuestState.tsx
- [x] T042 [US6] Add "No guests yet. Click '+ Add Guest' to get started." message in src/components/guests/EmptyGuestState.tsx
- [x] T043 [US6] Create NoSearchResults component for empty filter results in src/components/guests/NoSearchResults.tsx
- [x] T044 [US6] Conditionally render empty states in GuestListPage in src/pages/GuestListPage.tsx

**Checkpoint**: Empty wedding shows empty state, empty search shows "No guests match" message

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and final integration

- [x] T045 Add loading skeleton state while fetching guests in src/pages/GuestListPage.tsx
- [x] T046 Handle invalid weddingId with "Wedding not found" error in src/pages/GuestListPage.tsx
- [x] T047 [P] Add keyboard navigation support for table rows in src/components/guests/GuestTable.tsx
- [x] T048 [P] Ensure focus indicators on all interactive elements per WCAG 2.1 AA
- [ ] T049 Manual testing: Verify all acceptance scenarios from spec.md
- [ ] T050 Manual testing: Test responsive layout at various viewport widths

**Checkpoint**: All edge cases handled, accessibility complete, feature ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────────────────────────────┐
    │                                                                             │
    ▼                                                                             │
Phase 2 (Foundational) ──────────────────────────────────────────────────────────┤
    │                                                                             │
    ├──────────────────────────────────────────────────────────────────────────┐  │
    │                                                                          │  │
    ▼                                                                          ▼  │
Phase 3 (US1: View List)     Phase 4 (US2: Search/Filter)                      │  │
    │                              │                                           │  │
    ├──────────────────────────────┼───────────────────────────────────────────┤  │
    │                              │                                           │  │
    ▼                              ▼                                           │  │
Phase 5 (US3: Mobile)     Phase 6 (US4: Pagination)                            │  │
    │                              │                                           │  │
    ├──────────────────────────────┼───────────────────────────────────────────┤  │
    │                              │                                           │  │
    ▼                              ▼                                           │  │
Phase 7 (US5: Bulk Select)  Phase 8 (US6: Empty State)                         │  │
    │                              │                                           │  │
    └──────────────────────────────┴───────────────────────────────────────────┘  │
                                   │                                              │
                                   ▼                                              │
                           Phase 9 (Polish)◄──────────────────────────────────────┘
```

### User Story Dependencies

| User Story | Depends On | Can Parallel With |
|------------|------------|-------------------|
| US1 (View List) | Phase 2 Foundation | US2 (after T013 GuestTable created) |
| US2 (Search/Filter) | Phase 2 Foundation | US1 |
| US3 (Mobile) | US1 (needs GuestRow pattern) | US4, US5, US6 |
| US4 (Pagination) | US1, US2 (needs data flow) | US3, US5, US6 |
| US5 (Bulk Select) | US1 (needs table) | US3, US4, US6 |
| US6 (Empty State) | Phase 2 Foundation | US3, US4, US5 |

### Within Each User Story

1. Components marked [P] can run in parallel
2. Container components depend on their child components
3. Page integration tasks depend on components being ready

### Parallel Opportunities

**Phase 1**: T002, T003 can run parallel with T001
**Phase 2**: T007 can run parallel with T006
**Phase 3**: T010, T011 can run parallel
**Phase 4**: T017, T018, T019, T020 can ALL run parallel
**Phase 5**: T027 standalone
**Phase 6**: T031 standalone
**Phase 7**: T036 standalone
**Phase 8**: T041, T043 can run parallel
**Phase 9**: T047, T048 can run parallel

---

## Parallel Example: User Story 2 (Search/Filter)

```bash
# Launch all filter components in parallel:
Task: "Create SearchInput component in src/components/guests/SearchInput.tsx"
Task: "Create TypeFilter dropdown in src/components/guests/TypeFilter.tsx"
Task: "Create RsvpFilter dropdown in src/components/guests/RsvpFilter.tsx"
Task: "Create EventFilter dropdown in src/components/guests/EventFilter.tsx"

# Then sequentially: Container → Integration
Task: "Create GuestFilters container in src/components/guests/GuestFilters.tsx"
Task: "Implement filter logic in src/pages/GuestListPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (Shadcn components, types)
2. Complete Phase 2: Foundational (hook, routing)
3. Complete Phase 3: User Story 1 (table view)
4. Complete Phase 4: User Story 2 (search/filter)
5. **STOP and VALIDATE**: Test table view and filtering independently
6. Deploy/demo if ready - this is functional MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (View List) → Basic table display works → MVP core
3. US2 (Search/Filter) → Real-time filtering works → Enhanced MVP
4. US3 (Mobile) → Responsive layout works → Mobile-ready
5. US4 (Pagination) → Large lists supported → Scalable
6. US5 (Bulk Select) → Selection UI ready → Phase 6B prep
7. US6 (Empty State) → Edge cases handled → Polished
8. Polish → Production ready → Deploy

### Suggested Stopping Points

| After Phase | Feature State | Can Deploy? |
|-------------|---------------|-------------|
| Phase 4 | Table + Filters work | ✅ Yes (MVP) |
| Phase 6 | + Mobile + Pagination | ✅ Yes (Full P1+P2) |
| Phase 8 | + Bulk + Empty | ✅ Yes (Complete) |
| Phase 9 | + Polish | ✅ Yes (Production) |

---

## Task Summary

| Phase | User Story | Task Count | Priority |
|-------|------------|------------|----------|
| 1 | Setup | 5 | - |
| 2 | Foundational | 4 | - |
| 3 | US1: View List | 7 | P1 |
| 4 | US2: Search/Filter | 10 | P1 |
| 5 | US3: Mobile View | 4 | P2 |
| 6 | US4: Pagination | 5 | P2 |
| 7 | US5: Bulk Selection | 5 | P3 |
| 8 | US6: Empty State | 4 | P3 |
| 9 | Polish | 6 | - |
| **Total** | | **50** | |

### Files to Create

```
src/
├── types/
│   └── guest.ts                    # T004
├── schemas/
│   └── guest.ts                    # T005
├── hooks/
│   ├── useGuests.ts                # T006, T025, T033
│   └── useDebounce.ts              # T007
├── components/
│   ├── ui/
│   │   ├── table.tsx               # T001 (Shadcn)
│   │   ├── checkbox.tsx            # T002 (Shadcn)
│   │   └── dropdown-menu.tsx       # T003 (Shadcn)
│   └── guests/
│       ├── RsvpBadge.tsx           # T010
│       ├── GuestTypeBadge.tsx      # T011
│       ├── GuestRow.tsx            # T012, T015
│       ├── GuestTable.tsx          # T013, T016, T037, T047
│       ├── SearchInput.tsx         # T017
│       ├── TypeFilter.tsx          # T018
│       ├── RsvpFilter.tsx          # T019
│       ├── EventFilter.tsx         # T020
│       ├── GuestFilters.tsx        # T021, T022
│       ├── GuestCard.tsx           # T027, T030
│       ├── GuestCardList.tsx       # T028
│       ├── GuestPagination.tsx     # T031, T032
│       ├── BulkActionsBar.tsx      # T036, T039
│       ├── EmptyGuestState.tsx     # T041, T042
│       └── NoSearchResults.tsx     # T043
└── pages/
    └── GuestListPage.tsx           # T008, T014, T023-26, T029, T034-35, T038, T040, T044-46
```

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after its phase completes
- Manual testing with Playwright MCP per Constitution VIII
- Commit after each task or logical group
- Stop at any checkpoint to validate feature increment
