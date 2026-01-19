# Implementation Plan: Guest Page Redesign

**Branch**: `021-guest-page-redesign` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-guest-page-redesign/spec.md`

## Summary

Redesign the Guest List page from table/modal UI to inline expandable cards with a 5-tab interface (Basic Info, RSVP, Seating, Dietary, Meals). Implement two-column Plus One management within each tab, bulk guest selection with actions (assign table, export), visual circular seating arrangement modal, and Expand All/Collapse All functionality. All styling uses existing Vowsync design system with Tailwind CSS and Shadcn/ui components.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (`guests` and `guest_event_attendance` tables exist)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Chrome, Firefox, Safari, mobile responsive)
**Project Type**: Web application (frontend only, existing Supabase backend)
**Performance Goals**: Card expansion <1s, search debounce 300ms, page responsive with 200+ guests
**Constraints**: Virtual scrolling for lists >100 items, lazy load expanded content
**Scale/Scope**: 200+ guests per wedding, multiple cards expanded simultaneously

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] (existing tables) |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate calculations, proper validations | [x] |
| VII. Security | RLS, no API key exposure, input validation | [x] (existing RLS) |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [x] |
| XI. API Handling | Standard response format, error pattern | [x] |
| XII. Git Workflow | Feature branches, descriptive commits | [x] |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] |
| XIV. Environment | Uses .env, no secrets in git | [x] |
| XV. Prohibited | No violations of prohibited practices | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/021-guest-page-redesign/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/                          # Shadcn components (existing)
│   └── guests/
│       ├── GuestCard.tsx            # NEW: Main collapsible card container
│       ├── GuestCardCollapsed.tsx   # NEW: Collapsed summary view
│       ├── GuestCardExpanded.tsx    # NEW: Expanded view with tabs
│       ├── GuestTabs.tsx            # NEW: Tab navigation component
│       ├── tabs/
│       │   ├── BasicInfoTab.tsx     # NEW: Two-column basic info
│       │   ├── RsvpTab.tsx          # NEW: Two-column RSVP
│       │   ├── SeatingTab.tsx       # NEW: Two-column seating
│       │   ├── DietaryTab.tsx       # NEW: Two-column dietary
│       │   └── MealsTab.tsx         # NEW: Two-column meals
│       ├── BulkActionsBar.tsx       # EXISTING: Enhance for new design
│       ├── TableAssignModal.tsx     # NEW: Quick table assignment modal
│       ├── SeatingArrangeModal.tsx  # NEW: Visual circular seating
│       ├── GuestFilters.tsx         # EXISTING: Enhance search/filters
│       ├── GuestCountDisplay.tsx    # NEW: "X guests + Y plus ones = Z total"
│       ├── InvitationStatusBadge.tsx # EXISTING: Reuse
│       └── GuestTypeBadge.tsx       # EXISTING: Reuse
├── hooks/
│   ├── useGuests.ts                 # EXISTING: Fetch guests
│   ├── useGuestMutations.ts         # EXISTING: CRUD operations
│   └── useBulkGuestActions.ts       # NEW: Bulk operations hook
├── types/
│   └── guest.ts                     # EXISTING: Guest types (extend if needed)
├── schemas/
│   └── guest.ts                     # EXISTING: Zod validation schemas
└── pages/
    └── GuestListPage.tsx            # MODIFY: Redesigned layout with cards
```

**Structure Decision**: This is a UI redesign using existing data layer. All hooks, types, and schemas exist. New components follow established patterns in `src/components/guests/`. Tab content components are grouped under `tabs/` subdirectory for organization.

## Complexity Tracking

> No constitutional violations requiring justification. All gates pass.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
