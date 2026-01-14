# Implementation Plan: Navigation Shell

**Branch**: `005-navigation-shell` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-navigation-shell/spec.md`

## Summary

Create a responsive navigation shell with fixed header, sidebar (desktop), and mobile drawer for wedding management pages. The navigation wraps existing dashboard and events pages, providing consistent navigation with active state highlighting. Placeholder items show toast notifications for unimplemented features.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+
**Primary Dependencies**: React Router v6, Tailwind CSS v3, Shadcn/ui, Lucide React, Zustand (drawer state)
**Storage**: N/A (no new database tables)
**Testing**: Manual testing with Playwright MCP
**Target Platform**: Web (Desktop ≥1024px, Mobile <768px)
**Project Type**: Web SPA (Vite + React)
**Performance Goals**: Drawer animation <300ms, navigation <1s
**Constraints**: Must wrap existing pages without modifying their content
**Scale/Scope**: 10 menu items, 2 functional routes, 8 placeholder routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [N/A] |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate calculations, proper validations | [N/A] |
| VII. Security | RLS, no API key exposure, input validation | [N/A] |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [x] |
| XI. API Handling | Standard response format, error pattern | [N/A] |
| XII. Git Workflow | Feature branches, descriptive commits | [x] |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] |
| XIV. Environment | Uses .env, no secrets in git | [x] |
| XV. Prohibited | No violations of prohibited practices | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/005-navigation-shell/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for this feature)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── layout/              # NEW - Navigation shell components
│   │   ├── AppLayout.tsx    # Main layout wrapper with header + sidebar
│   │   ├── AppHeader.tsx    # Fixed top header
│   │   ├── AppSidebar.tsx   # Desktop sidebar navigation
│   │   ├── MobileDrawer.tsx # Mobile navigation drawer
│   │   └── NavItem.tsx      # Reusable navigation item component
│   ├── ui/                  # Existing Shadcn components
│   ├── dashboard/           # Existing dashboard components
│   ├── events/              # Existing event components
│   └── weddings/            # Existing wedding components
├── hooks/
│   └── useNavigation.ts     # NEW - Navigation state hook (drawer open/close)
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── navigation.ts        # NEW - Navigation item definitions
├── pages/                   # Existing pages (unchanged)
└── types/
    └── navigation.ts        # NEW - Navigation TypeScript types
```

**Structure Decision**: Extends existing single project structure with new `components/layout/` directory for navigation shell components. No changes to existing page components.

## Complexity Tracking

> No constitution violations. Simple UI feature with no database changes.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
