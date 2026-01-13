# Implementation Plan: Events Management CRUD

**Branch**: `003-events-crud` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-events-crud/spec.md`

## Summary

Implement complete events management for weddings with timeline view, CRUD operations, and auto-calculated durations. Events belong to weddings (1-10 per wedding) with color-coded cards, real-time duration calculation, and cascade delete behavior.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+
**Primary Dependencies**: React Router v6, Tailwind CSS v3, Shadcn/ui, React Hook Form, Zod, TanStack Query v5, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (`events` table exists from Phase 1)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Single web application (React SPA)
**Performance Goals**: Timeline page load < 1s, duration calculation < 100ms
**Constraints**: Max 10 events per wedding, RLS enforced data isolation
**Scale/Scope**: Per-wedding scope, typically 3-5 events per wedding

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette (event colors), typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints (events table exists) | [x] |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate duration calculations, proper validations | [x] |
| VII. Security | RLS via wedding ownership, input validation | [x] |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] |
| X. Performance | Lazy loading routes, memoized calculations | [x] |
| XI. API Handling | Standard Supabase response format, error pattern | [x] |
| XII. Git Workflow | Feature branch 003-events-crud | [x] |
| XIII. Documentation | JSDoc for complex functions | [x] |
| XIV. Environment | Uses existing .env Supabase config | [x] |
| XV. Prohibited | No violations planned | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/003-events-crud/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/              # Existing Shadcn components
│   ├── weddings/        # Existing wedding components
│   └── events/          # NEW: Event components
│       ├── EventCard.tsx
│       ├── EventForm.tsx
│       ├── EventTimeline.tsx
│       ├── DeleteEventDialog.tsx
│       ├── DurationDisplay.tsx
│       └── EmptyEventsState.tsx
├── hooks/
│   ├── useWeddings.ts   # Existing
│   └── useEvents.ts     # NEW: Event hooks
├── lib/
│   ├── supabase.ts      # Existing
│   ├── constants.ts     # Existing + event colors
│   └── utils.ts         # Existing + duration formatting
├── pages/
│   ├── WeddingListPage.tsx      # Existing
│   ├── CreateWeddingPage.tsx    # Existing
│   ├── EditWeddingPage.tsx      # Existing
│   ├── EventTimelinePage.tsx    # NEW
│   ├── CreateEventPage.tsx      # NEW
│   └── EditEventPage.tsx        # NEW
├── schemas/
│   ├── wedding.ts       # Existing
│   └── event.ts         # NEW: Event validation
└── types/
    ├── wedding.ts       # Existing
    └── event.ts         # NEW: Event types
```

**Structure Decision**: Extends existing single web application structure. New event components follow the same pattern as wedding components. Shared utilities and constants are extended rather than duplicated.

## Complexity Tracking

> No violations requiring justification. All implementation follows established patterns from Phase 2 wedding CRUD.
