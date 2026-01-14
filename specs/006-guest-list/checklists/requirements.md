# Requirements Checklist: Guest List Page

**Feature**: 006-guest-list
**Spec**: [spec.md](../spec.md)
**Generated**: 2026-01-14

## Specification Quality Validation

### Structure Completeness
- [x] User scenarios with acceptance criteria defined
- [x] Functional requirements with FR-XXX identifiers
- [x] Success criteria with measurable outcomes
- [x] Edge cases documented
- [x] Assumptions listed

### User Story Quality
- [x] Each story has clear priority (P1-P3)
- [x] Each story explains "why this priority"
- [x] Each story has independent test description
- [x] Acceptance scenarios use Given/When/Then format
- [x] Stories cover core functionality and edge cases

### Requirements Traceability
| Requirement | User Story | Testable | Priority |
|-------------|------------|----------|----------|
| FR-001 | US1 | Yes | P1 |
| FR-002 | US1 | Yes | P1 |
| FR-003 | US6 | Yes | P3 |
| FR-004 | US2 | Yes | P1 |
| FR-005 | US2 | Yes | P1 |
| FR-006 | US1 | Yes | P1 |
| FR-007 | US4 | Yes | P2 |
| FR-008 | US1 | Yes | P1 |
| FR-009 | US3 | Yes | P2 |
| FR-010 | US1 | Yes | P1 |
| FR-011 | US1 | Yes | P1 |
| FR-012 | US1 | Yes | P1 |
| FR-013 | US1 | Yes | P1 |
| FR-014 | US1 | Yes | P1 |
| FR-015 | US1 | Yes | P1 |
| FR-016 | US4 | Yes | P2 |
| FR-017 | US4 | Yes | P2 |
| FR-018 | US5 | Yes | P3 |
| FR-019 | US5 | Yes | P3 |
| FR-020 | US6 | Yes | P3 |
| FR-021 | US1 | Yes | P1 |
| FR-022 | US2 | Yes | P1 |
| FR-023 | US2 | Yes | P1 |
| FR-024 | US2 | Yes | P1 |

### Technical Feasibility
- [x] Database tables exist (guests, guest_event_attendance)
- [x] Routes follow existing pattern (/weddings/:weddingId/guests)
- [x] UI components leverage existing Shadcn/ui library
- [x] State management aligns with TanStack Query patterns
- [x] Navigation shell (Phase 5) provides layout wrapper

### Design System Alignment
- [x] Colors reference design tokens (Dusty Rose #D4A5A5, Surface #F5F5F5)
- [x] Responsive breakpoints defined (Desktop ≥1024px, Mobile <768px)
- [x] Typography follows existing patterns
- [x] Component styling consistent with existing pages

### Scope Boundaries
- [x] Clear distinction between Phase 6A (this spec) and Phase 6B
- [x] Placeholder actions defined for deferred functionality
- [x] No scope creep into add/edit/delete/export features
- [x] Read-only view focus maintained

## Functional Requirements Checklist

### Page Structure (FR-001 to FR-003)
- [ ] FR-001: Route /weddings/:weddingId/guests renders guest list page
- [ ] FR-002: Page header displays "Guests" title with "+ Add Guest" button
- [ ] FR-003: "+ Add Guest" button shows toast "Coming in Phase 6B"

### Search and Filter (FR-004 to FR-007)
- [ ] FR-004: Search input filters guests by name in real-time
- [ ] FR-005: Three filter dropdowns (Type, RSVP Status, Event)
- [ ] FR-006: Export buttons show toast "Coming in Phase 6B"
- [ ] FR-007: "Showing X-Y of Total" count updates with filters

### Table Display - Desktop (FR-008 to FR-015)
- [ ] FR-008: Table displays on desktop (≥1024px) with correct columns
- [ ] FR-009: Cards display on mobile (<768px) with correct info
- [ ] FR-010: Table header styled with #F5F5F5 background
- [ ] FR-011: Table rows have hover effect (#FAFAFA)
- [ ] FR-012: Cell borders and padding match spec (1px #E8E8E8, 16px)
- [ ] FR-013: RSVP status calculated correctly (Yes/Overdue/Pending)
- [ ] FR-014: Table number displays or "-" if null
- [ ] FR-015: Edit/Delete icons show toast "Coming in Phase 6B"

### Pagination (FR-016 to FR-017)
- [ ] FR-016: Pagination at 50 guests per page with navigation
- [ ] FR-017: Current page highlighted with #D4A5A5 background

### Bulk Selection (FR-018 to FR-019)
- [ ] FR-018: Bulk actions bar shows when guests selected
- [ ] FR-019: Bulk action dropdowns show toast "Coming in Phase 6B"

### Empty State (FR-020)
- [ ] FR-020: Empty state message when no guests exist

### Data Layer (FR-021 to FR-024)
- [ ] FR-021: Fetch guests filtered by wedding_id, sorted by name ASC
- [ ] FR-022: Search filter uses case-insensitive name matching
- [ ] FR-023: Type filter matches guest_type field
- [ ] FR-024: Event filter joins with guest_event_attendance

## Success Criteria Checklist

- [ ] SC-001: Guest list loads within 2 seconds
- [ ] SC-002: Search results update within 300ms
- [ ] SC-003: Filtering completes within 500ms
- [ ] SC-004: Pagination works correctly at 50 per page
- [ ] SC-005: Mobile card view renders under 768px
- [ ] SC-006: RSVP badges display correct colors
- [ ] SC-007: All placeholder actions show appropriate toasts

## Edge Cases Verified

- [ ] Invalid weddingId shows "Wedding not found" error
- [ ] Empty search results show "No guests match" message
- [ ] Null table_number displays "-"
- [ ] Null rsvp_deadline treats guest as "Pending"
- [ ] Responsive layout switches correctly on resize

## Ready for Implementation

**Spec Status**: Complete
**Quality Score**: 24/24 requirements traceable
**Next Step**: `/speckit.plan` to generate implementation plan
