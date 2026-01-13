# Implementation Plan: Wedding CRUD Interface

**Branch**: `002-wedding-crud` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-wedding-crud/spec.md`

## Summary

Build a complete wedding management interface with list view (card grid with search, filter, sort), create form, edit form, and delete functionality with confirmation modal. Uses React 18+, Supabase for data persistence, and follows VowSync design system. Authentication is deferred - uses hardcoded consultant ID.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+
**Primary Dependencies**: React Router v6, Tailwind CSS v3, Shadcn/ui, React Hook Form, Zod, TanStack Query v5, Zustand, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (weddings table exists from Phase 1)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Chrome, Firefox, Safari) + Mobile responsive (320px+)
**Project Type**: Web application (frontend only - uses existing Supabase backend)
**Performance Goals**: List load < 2s, search response < 300ms, FCP < 1.2s
**Constraints**: No authentication (hardcoded user ID), no events/guests management
**Scale/Scope**: Single consultant view, ~100 weddings typical, 10 fields per wedding

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [X] |
| II. Design System | Follows color palette, typography, spacing specs | [X] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [X] (existing table) |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [X] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [X] |
| VI. Business Logic | Accurate calculations, proper validations | [X] |
| VII. Security | RLS, no API key exposure, input validation | [X] |
| VIII. Testing | Manual testing with Playwright MCP only | [X] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [X] |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [X] |
| XI. API Handling | Standard response format, error pattern | [X] |
| XII. Git Workflow | Feature branches, descriptive commits | [X] |
| XIII. Documentation | JSDoc for complex functions, README complete | [X] |
| XIV. Environment | Uses .env, no secrets in git | [X] |
| XV. Prohibited | No violations of prohibited practices | [X] |

**All gates PASS** - No constitution violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-wedding-crud/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   └── README.md        # Supabase auto-generated APIs
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/                          # Shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   └── toast.tsx
│   ├── weddings/                    # Feature components
│   │   ├── WeddingCard.tsx
│   │   ├── WeddingForm.tsx
│   │   ├── WeddingList.tsx
│   │   └── DeleteWeddingDialog.tsx
│   └── layout/
│       └── AppLayout.tsx
├── pages/
│   ├── WeddingListPage.tsx
│   ├── CreateWeddingPage.tsx
│   └── EditWeddingPage.tsx
├── hooks/
│   └── useWeddings.ts               # React Query hooks
├── lib/
│   ├── supabase.ts                  # Supabase client
│   ├── utils.ts                     # cn(), formatDate()
│   └── constants.ts                 # TEMP_USER_ID, STATUS_OPTIONS
├── schemas/
│   └── wedding.ts                   # Zod schemas
├── types/
│   └── wedding.ts                   # TypeScript interfaces
├── App.tsx                          # Routes
├── main.tsx                         # Entry point
└── index.css                        # Tailwind imports

public/
└── (static assets)

.env.example                         # Environment template
vite.config.ts
tailwind.config.js
tsconfig.json
package.json
```

**Structure Decision**: Single frontend application using Vite + React. No backend code needed - uses existing Supabase tables from Phase 1.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Phases

### Phase 0: Research (Complete)
- Technology decisions documented in research.md
- All NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts (Complete)
- data-model.md: Wedding entity mapping to existing table
- contracts/: Supabase auto-generated REST APIs
- quickstart.md: Setup and run instructions

### Phase 2: Tasks (Next - /speckit.tasks)
- Implementation tasks organized by user story
- Dependencies and parallel opportunities identified
