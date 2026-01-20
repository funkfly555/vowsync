# Implementation Plan: Dashboard Bug Fixes

**Branch**: `023-dashboard-bug-fixes` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-dashboard-bug-fixes/spec.md`

## Summary

This plan addresses three UI bugs in the dashboard and vendors pages:
1. **P1 - Vendors Page Error**: `TypeError: Cannot read properties of undefined (reading 'label')` in `ContractStatusBadge.tsx` when `status` prop is undefined
2. **P2 - Event Timeline Scroll**: Horizontal scrollbar appearing on dashboard at standard desktop widths due to card sizing
3. **P3 - Budget Chart Labels**: Legend items overlapping when 12+ categories are displayed in pie chart

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, Recharts, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (no schema changes required)
**Testing**: Manual testing with Playwright MCP only
**Target Platform**: Web (Desktop: 1366px-1920px+, Tablet: 768px-1023px, Mobile: 320px-767px)
**Project Type**: Web application (Vite + React)
**Performance Goals**: Page load <2 seconds, no layout shifts
**Constraints**: No new dependencies, Tailwind only (no custom CSS)
**Scale/Scope**: 3 bug fixes across 3-4 component files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] N/A - No DB changes |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate calculations, proper validations | [x] N/A - Bug fixes only |
| VII. Security | RLS, no API key exposure, input validation | [x] N/A - No security changes |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [x] |
| XI. API Handling | Standard response format, error pattern | [x] N/A - No API changes |
| XII. Git Workflow | Feature branches, descriptive commits | [x] |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] |
| XIV. Environment | Uses .env, no secrets in git | [x] N/A |
| XV. Prohibited | No violations of prohibited practices | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/023-dashboard-bug-fixes/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output - Bug investigation findings
├── data-model.md        # Phase 1 output - N/A (no data model changes)
├── quickstart.md        # Phase 1 output - Implementation guide
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (files to modify)

```text
src/
├── components/
│   ├── dashboard/
│   │   └── EventTimelineCard.tsx    # BUG 2: Reduce card widths, fix overflow
│   ├── budget/
│   │   └── BudgetPieChart.tsx       # BUG 3: Fix legend overlap with grid layout
│   └── vendors/
│       └── ContractStatusBadge.tsx  # BUG 1: Add null check for status prop
└── types/
    └── vendor.ts                     # Type reference (no changes needed)
```

**Structure Decision**: Single web application - modifying existing component files only. No new files required.

## Bug Analysis

### BUG 1: Vendors Page Error (P1 - Critical)

**Root Cause**: `ContractStatusBadge.tsx` line 19 accesses `status.label` without null check:
```tsx
const config = CONTRACT_STATUS_CONFIG[status.label]; // Crashes if status is undefined
```

**Evidence**: The component expects a `ContractStatusBadge` object with `{ label, color }` but receives `undefined` when vendor data is incomplete.

**Fix**: Add defensive null check before property access.

### BUG 2: Event Timeline Horizontal Scroll (P2 - Medium)

**Root Cause**: `EventTimelineCard.tsx` uses `min-w-[280px] max-w-[320px]` which, combined with `gap-4` (16px), causes overflow on 1366px screens with 4+ events.

**Calculation**:
- 4 cards × 280px min = 1120px
- 3 gaps × 16px = 48px
- Container padding (p-6 = 24px × 2) = 48px
- Total: 1216px minimum (fits 1366px)
- But max-w-[320px] allows cards to grow: 4 × 320 + 48 + 48 = 1376px (overflows 1366px)

**Fix**: Reduce card sizes per design system (p-4 instead of p-4, min-w-[200px] max-w-[280px]).

### BUG 3: Budget Chart Legend Overlap (P3 - Low)

**Root Cause**: `BudgetPieChart.tsx` uses `flex flex-wrap` layout for legend which doesn't provide enough spacing between items when there are 12+ categories.

**Fix**: Change legend to 2-column grid layout with proper spacing.

## Complexity Tracking

> No Constitution violations - all fixes use existing patterns and tools.

| Change | Justification |
|--------|---------------|
| Defensive null checks | Required for production stability |
| Reduced card sizing | Aligns with design system spacing (16px padding) |
| Grid legend layout | Better handles variable category counts |
