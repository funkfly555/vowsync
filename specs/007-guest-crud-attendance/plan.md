# Implementation Plan: Guest CRUD & Event Attendance

**Branch**: `007-guest-crud-attendance` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-guest-crud-attendance/spec.md`

## Summary

Complete guest management functionality including Add/Edit/Delete operations via tabbed modal, functional search and filtering, bulk table assignment, CSV export, and an Event Attendance Matrix. Builds on existing Phase 6A guest list UI foundation with existing types, hooks, and components.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+
**Primary Dependencies**: React Hook Form, Zod, TanStack Query v5, Shadcn/ui, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (guests, guest_event_attendance tables exist)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Desktop & Mobile responsive)
**Project Type**: Web application (Vite + React SPA)
**Performance Goals**: FCP < 1.2s, TTI < 3.5s, debounced search, pagination at 50 items
**Constraints**: WCAG 2.1 AA compliance, offline-tolerant error states
**Scale/Scope**: 200+ guests per wedding, 7 events per wedding, bulk operations for 20+ guests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate calculations, proper validations | [x] |
| VII. Security | RLS, no API key exposure, input validation | [x] |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [x] |
| XI. API Handling | Standard response format, error pattern | [x] |
| XII. Git Workflow | Feature branches, descriptive commits | [x] |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] |
| XIV. Environment | Uses .env, no secrets in git | [x] |
| XV. Prohibited | No violations of prohibited practices | [x] |

**Gate Status: PASSED** - All constitutional requirements satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/007-guest-crud-attendance/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── guest-api.ts     # TypeScript API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/                    # Shadcn components (existing)
│   │   ├── dialog.tsx         # Modal dialogs (existing)
│   │   ├── tabs.tsx           # Tabbed interface (NEW - add via shadcn)
│   │   ├── calendar.tsx       # Date picker (NEW - add via shadcn)
│   │   └── popover.tsx        # Date picker popover (NEW - add via shadcn)
│   └── guests/                # Guest-specific components
│       ├── GuestModal.tsx     # Add/Edit modal with tabs (NEW)
│       ├── GuestBasicInfoTab.tsx    # Tab 1: Basic Info (NEW)
│       ├── GuestRsvpTab.tsx         # Tab 2: RSVP (NEW)
│       ├── GuestDietaryTab.tsx      # Tab 3: Dietary (NEW)
│       ├── GuestMealTab.tsx         # Tab 4: Meal (NEW)
│       ├── GuestEventsTab.tsx       # Tab 5: Events (NEW)
│       ├── DeleteGuestDialog.tsx    # Delete confirmation (NEW)
│       ├── AttendanceMatrix.tsx     # Matrix modal (NEW)
│       ├── AttendanceMatrixRow.tsx  # Matrix row component (NEW)
│       ├── AttendanceMatrixMobile.tsx # Mobile matrix view (NEW)
│       ├── BulkActionsBar.tsx       # MODIFY - add table assignment
│       ├── GuestTable.tsx           # MODIFY - functional edit/delete
│       ├── GuestCard.tsx            # MODIFY - functional edit/delete
│       ├── GuestFilters.tsx         # MODIFY - functional export
│       └── ExportRow.tsx            # MODIFY - CSV export logic
├── hooks/
│   ├── useGuests.ts           # MODIFY - add mutations
│   ├── useGuestMutations.ts   # Guest CRUD mutations (NEW)
│   └── useAttendanceMatrix.ts # Matrix data hook (NEW)
├── schemas/
│   └── guest.ts               # MODIFY - add form validation schemas
├── types/
│   └── guest.ts               # MODIFY - add form types
└── pages/
    └── GuestListPage.tsx      # MODIFY - integrate modals
```

**Structure Decision**: Web application following existing VowSync patterns. All new components placed in `src/components/guests/`. New hooks for mutations and matrix. Extends existing guest module from Phase 6A.

## Complexity Tracking

> No constitutional violations - standard feature implementation within established patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
