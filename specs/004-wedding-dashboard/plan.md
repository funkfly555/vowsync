# Implementation Plan: Wedding Dashboard

**Branch**: `004-wedding-dashboard` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-wedding-dashboard/spec.md`

## Summary

Build a comprehensive wedding dashboard as the main landing page when viewing a specific wedding. The dashboard provides at-a-glance metrics (days until wedding, guest count, events, budget), an events timeline summary, quick action buttons, RSVP progress tracking, and a recent activity feed. Implementation uses TanStack Query for data fetching with multiple parallel queries to aggregate data from existing tables (weddings, events, guests, activity_log).

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+
**Primary Dependencies**: React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React, Zod
**Storage**: Supabase PostgreSQL (existing tables: weddings, events, guests, activity_log, budget_categories)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Desktop + Mobile responsive, 320px - 1920px)
**Project Type**: Web application (React SPA with Supabase backend)
**Performance Goals**: Dashboard loads < 2 seconds, FCP < 1.2s, TTI < 3.5s
**Constraints**: Must work with existing RLS policies, offline-capable via React Query caching
**Scale/Scope**: Single page with 5 dashboard sections, ~8-10 new components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] Using existing tables |
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

## Project Structure

### Documentation (this feature)

```text
specs/004-wedding-dashboard/
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
│   ├── ui/                    # Shadcn components (existing)
│   ├── dashboard/             # NEW: Dashboard-specific components
│   │   ├── MetricCard.tsx     # Reusable metric card with icon
│   │   ├── MetricsGrid.tsx    # Grid of 4 metric cards
│   │   ├── EventsSummary.tsx  # Compact events list
│   │   ├── QuickActions.tsx   # Action buttons panel
│   │   ├── RsvpProgress.tsx   # RSVP progress bar and counts
│   │   ├── ActivityFeed.tsx   # Recent activity list
│   │   └── DashboardSkeleton.tsx # Loading skeleton
│   ├── events/                # Existing event components
│   └── weddings/              # Existing wedding components
├── hooks/
│   ├── useWeddings.ts         # Existing
│   ├── useEvents.ts           # Existing
│   └── useDashboard.ts        # NEW: Dashboard aggregation queries
├── pages/
│   ├── WeddingListPage.tsx    # Existing
│   ├── WeddingDashboardPage.tsx # NEW: Main dashboard page
│   └── ...
├── lib/
│   ├── supabase.ts            # Existing
│   ├── utils.ts               # Existing + new dashboard helpers
│   └── constants.ts           # Existing
├── types/
│   ├── wedding.ts             # Existing
│   ├── event.ts               # Existing
│   └── dashboard.ts           # NEW: Dashboard-specific types
└── schemas/                   # Existing schemas
```

**Structure Decision**: Single React SPA following existing patterns. New dashboard components go in `src/components/dashboard/`, with a new hook `useDashboard.ts` for aggregated queries and a new page `WeddingDashboardPage.tsx`.

## Complexity Tracking

> No constitutional violations. Feature uses existing patterns and data structures.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
