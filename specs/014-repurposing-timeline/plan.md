# Implementation Plan: Repurposing Timeline Management

**Branch**: `014-repurposing-timeline` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-repurposing-timeline/spec.md`

## Summary

Implement a repurposing timeline management system that enables wedding consultants to track item movements between events. The feature includes a Gantt chart visualization, comprehensive time validation (pickup before dropoff, event timing warnings), overnight storage detection, status tracking workflow (pending → in_progress → completed → issue), and filtering capabilities. The system uses the existing `repurposing_instructions` table with joins to `wedding_items`, `events`, and `vendors`.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (`repurposing_instructions` table exists with RLS enabled)
**Testing**: Manual testing with Playwright MCP only (no unit tests per constitution)
**Target Platform**: Web (Desktop & Mobile responsive)
**Project Type**: Web application (frontend only, Supabase backend)
**Performance Goals**: FCP < 1.2s, TTI < 3.5s, form submission < 2s
**Constraints**: WCAG 2.1 AA compliance, 44px touch targets, keyboard navigation
**Scale/Scope**: Typical wedding has 5-20 items with 2-10 events, resulting in 5-50 repurposing instructions max

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

## Project Structure

### Documentation (this feature)

```text
specs/014-repurposing-timeline/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── repurposing-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── repurposing.ts            # TypeScript interfaces
├── schemas/
│   └── repurposing.ts            # Zod validation schemas
├── hooks/
│   ├── useRepurposingInstructions.ts  # Fetch list with joins
│   ├── useRepurposingInstruction.ts   # Fetch single instruction
│   └── useRepurposingMutations.ts     # CRUD operations
├── lib/
│   └── repurposingValidation.ts  # Time validation utilities
├── components/
│   └── repurposing/
│       ├── RepurposingList.tsx        # Card list view
│       ├── RepurposingCard.tsx        # Individual instruction card
│       ├── RepurposingForm.tsx        # Form with tabs
│       ├── RepurposingModal.tsx       # Add/edit modal wrapper
│       ├── RepurposingGantt.tsx       # Gantt chart visualization
│       ├── RepurposingFilters.tsx     # Filter controls
│       ├── RepurposingStatusBadge.tsx # Status badge component
│       ├── RepurposingEmptyState.tsx  # Empty state component
│       ├── OvernightStorageDialog.tsx # Storage location prompt
│       └── DeleteRepurposingDialog.tsx
└── pages/
    └── RepurposingPage.tsx        # /weddings/:id/repurposing
```

**Structure Decision**: Follows existing VowSync patterns from 013-wedding-items with feature-specific components in `src/components/repurposing/`, shared types/schemas/hooks at root level, and page component for routing.

## Complexity Tracking

> No constitution violations to justify - all requirements met within standard patterns.

N/A - Design follows existing patterns without violations.
