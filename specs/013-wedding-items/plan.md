# Implementation Plan: Wedding Items Management

**Branch**: `013-wedding-items` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-wedding-items/spec.md`

## Summary

Wedding Items Management enables tracking of furniture, equipment, linens, and decorations needed for weddings with multi-event quantities and intelligent aggregation logic. The feature supports two aggregation methods (ADD for consumables, MAX for reusables), availability tracking with shortage warnings, cost calculations, and filtering by category/supplier.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (`wedding_items`, `wedding_item_event_quantities` tables exist with RLS enabled)
**Testing**: Manual testing with Playwright MCP only (no unit tests per constitution)
**Target Platform**: Web application (modern browsers)
**Project Type**: web
**Performance Goals**: Real-time aggregation calculations within 500ms, page load < 1.2s FCP
**Constraints**: Must use existing database tables without schema changes
**Scale/Scope**: Typically <100 items per wedding, 3-5 events per wedding

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
specs/013-wedding-items/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output - technical decisions
├── data-model.md        # Phase 1 output - entity model and interfaces
├── quickstart.md        # Phase 1 output - test scenarios
├── contracts/           # Phase 1 output - API contracts
│   └── wedding-items.md
├── checklists/
│   └── requirements.md  # Quality validation
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── weddingItem.ts           # TypeScript interfaces
├── schemas/
│   └── weddingItem.ts           # Zod validation schemas
├── hooks/
│   ├── useWeddingItems.ts       # List query hook
│   ├── useWeddingItem.ts        # Single item query hook
│   └── useWeddingItemMutations.ts # CRUD mutation hooks
├── components/
│   └── wedding-items/
│       ├── WeddingItemsList.tsx
│       ├── WeddingItemModal.tsx
│       ├── WeddingItemForm.tsx
│       ├── EventQuantitiesTable.tsx
│       ├── AggregationMethodBadge.tsx
│       ├── AvailabilityStatus.tsx
│       ├── WeddingItemsSummary.tsx
│       └── DeleteWeddingItemDialog.tsx
├── pages/
│   └── wedding-items/
│       └── WeddingItemsPage.tsx
└── lib/
    └── navigation.ts            # Enable Items nav item (set isPlaceholder: false)
```

**Structure Decision**: Standard VowSync web application structure with feature-based component organization under `src/components/wedding-items/`. Follows existing patterns established by Bar Orders (`src/components/bar-orders/`).

## Key Implementation Details

### Critical Field Names (snake_case)

All TypeScript interfaces and Supabase queries must use exact snake_case field names:

| Database Field | Notes |
|----------------|-------|
| `wedding_id` | FK to weddings |
| `aggregation_method` | NOT `method` |
| `number_available` | NOT `available` |
| `total_required` | NOT `required` |
| `cost_per_unit` | Decimal |
| `total_cost` | Calculated |
| `supplier_name` | NOT `supplier` |
| `wedding_item_id` | FK, NOT `item_id` |
| `quantity_required` | NOT `quantity` |

### Aggregation Methods

- **ADD**: Sum all event quantities (consumables like napkins)
- **MAX**: Take maximum event quantity (reusables like tables)

### Design System

- ADD Badge: `bg-orange-100 text-orange-800` with ⬆️ icon
- MAX Badge: `bg-blue-100 text-blue-800` with ↕️ icon
- Sufficient Status: `bg-green-100 text-green-800`
- Shortage Status: `bg-orange-100 text-orange-800`
- Unknown Status: `bg-gray-100 text-gray-800`

## Complexity Tracking

> No constitution violations. Feature uses existing tables and follows established patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 1 Deliverables

- [x] research.md - All technical decisions documented
- [x] data-model.md - Entity relationships, TypeScript interfaces, validation rules
- [x] contracts/wedding-items.md - Supabase query contracts
- [x] quickstart.md - 24 test scenarios with expected results
- [x] Constitution check passed

## Next Steps

Run `/speckit.tasks` to generate tasks.md for implementation.
