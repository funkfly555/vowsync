# Implementation Plan: Budget Tracking System

**Branch**: `011-budget-tracking` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-budget-tracking/spec.md`

## Summary

Implement a comprehensive budget tracking system for wedding consultants to manage financial planning across categories. The feature includes a budget overview page with stat cards, progress bar, categories table, pie chart visualization, and full CRUD operations for budget categories. The system auto-updates wedding totals and displays status badges indicating budget health (On Track, 90% Spent, Over Budget).

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React, recharts (to be installed)
**Storage**: Supabase PostgreSQL (`budget_categories` table exists, `weddings` table has budget fields)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web application (desktop and mobile responsive)
**Project Type**: Single web application
**Performance Goals**: Page load < 2s, CRUD operations < 1s, real-time total recalculation
**Constraints**: WCAG 2.1 AA compliance, mobile-first responsive design
**Scale/Scope**: Per-wedding budget tracking, typically 5-20 categories per wedding

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

**Note**: All gates pass. recharts library needs to be installed as a new dependency (allowed per constitution - it's a standard charting library commonly used with React).

## Project Structure

### Documentation (this feature)

```text
specs/011-budget-tracking/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── budget.ts                    # TypeScript interfaces for budget entities
│
├── schemas/
│   └── budgetCategory.ts            # Zod validation schema
│
├── lib/
│   └── budgetStatus.ts              # Status calculation helpers
│
├── hooks/
│   ├── useBudgetCategories.ts       # TanStack Query hook for fetching categories
│   └── useBudgetCategoryMutations.ts # Create/update/delete mutations
│
├── components/
│   └── budget/
│       ├── BudgetStatCards.tsx          # 4 summary stat cards
│       ├── BudgetProgressBar.tsx        # Visual spending progress bar
│       ├── BudgetCategoriesTable.tsx    # Categories data table
│       ├── BudgetCategoryModal.tsx      # Add/edit category modal form
│       ├── BudgetPieChart.tsx           # Recharts pie chart
│       ├── DeleteBudgetCategoryDialog.tsx # Deletion confirmation
│       └── BudgetStatusBadge.tsx        # Status indicator badge
│
└── pages/
    └── budget/
        └── BudgetPage.tsx           # Main budget overview page
```

**Structure Decision**: Single web application following established VowSync patterns from Phases 6-10. Components organized in feature-specific folder (`budget/`) matching conventions from `vendors/`, `guests/`, etc.

## Complexity Tracking

> No constitutional violations requiring justification. All implementation follows established patterns.

---

## Phase 0: Research Findings

### Research Task 1: recharts Library Integration

**Question**: Best approach for integrating recharts with the existing VowSync tech stack?

**Decision**: Install recharts as a production dependency and use the `PieChart`, `Pie`, `Cell`, `Legend`, `Tooltip`, and `ResponsiveContainer` components.

**Rationale**:
- recharts is already mentioned in the constitution as an allowed library
- Tree-shakeable, only imports needed components
- Works well with TypeScript and React 18+
- Supports responsive containers for mobile

**Alternatives Considered**:
- Chart.js: Requires canvas, less React-native
- Victory: Larger bundle size
- Native SVG: Too much custom code needed

### Research Task 2: Currency Formatting Pattern

**Question**: Consistent approach for South African Rand formatting across the feature?

**Decision**: Create a reusable `formatCurrency` function in `src/lib/budgetStatus.ts`:

```typescript
export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
```

**Rationale**:
- Consistent with existing patterns (see `src/lib/vendorInvoiceStatus.ts`)
- Uses browser's native Intl for locale-aware formatting
- Handles thousands separators and decimal places correctly

### Research Task 3: Wedding Totals Update Pattern

**Question**: How to ensure wedding totals stay synchronized with category changes?

**Decision**: After each category mutation (create/update/delete), recalculate totals from all categories and update the wedding record in a single mutation operation.

**Rationale**:
- Ensures consistency even if a mutation fails mid-operation
- Follows existing pattern from vendor payment totals (Phase 010)
- Client-side calculation is fast for typical category counts (5-20)

**Implementation Pattern**:
```typescript
async function updateWeddingBudgetTotals(weddingId: string) {
  const { data: categories } = await supabase
    .from('budget_categories')
    .select('projected_amount, actual_amount')
    .eq('wedding_id', weddingId);

  const budget_total = categories?.reduce((sum, c) => sum + (c.projected_amount || 0), 0) ?? 0;
  const budget_actual = categories?.reduce((sum, c) => sum + (c.actual_amount || 0), 0) ?? 0;

  await supabase
    .from('weddings')
    .update({ budget_total, budget_actual })
    .eq('id', weddingId);
}
```

### Research Task 4: Status Badge Logic

**Question**: Exact thresholds and display logic for budget status badges?

**Decision**: Three status levels with specific thresholds:

| Status | Condition | Badge Text | Color Classes |
|--------|-----------|------------|---------------|
| On Track | actual < 90% of projected | "On Track" | bg-green-100 text-green-800 |
| Warning | actual >= 90% AND actual <= projected | "90% Spent" | bg-orange-100 text-orange-800 |
| Over Budget | actual > projected | "Over by R X" | bg-red-100 text-red-800 |

**Edge Case**: When projected = 0, always show "On Track" (avoid division by zero)

### Research Task 5: Pie Chart Color Palette

**Question**: How to generate distinct colors for pie chart slices?

**Decision**: Use a predefined palette of 12 colors that cycle for additional categories:

```typescript
const CHART_COLORS = [
  '#D4A5A5', // Brand primary (dusty rose)
  '#A8B8A6', // Brand secondary (sage green)
  '#C9A961', // Accent gold
  '#E8B4B8', // Event 1
  '#C9D4C5', // Event 3
  '#E5D4EF', // Event 4
  '#FFE5CC', // Event 5
  '#D4E5F7', // Event 6
  '#F7D4E5', // Event 7
  '#B8D4E8', // Light blue
  '#E8D4B8', // Light tan
  '#D4E8D4', // Light green
];
```

**Rationale**: Uses design system colors where possible, provides visual distinction

---

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Key Entities**:

1. **BudgetCategory** - Individual budget category with projected/actual amounts
2. **Wedding** (existing) - Contains aggregated budget_total and budget_actual

### API Contracts

See [contracts/](./contracts/) folder for OpenAPI specifications.

**Key Operations**:
- `GET /budget-categories?wedding_id={id}` - List all categories for a wedding
- `POST /budget-categories` - Create a new category
- `PATCH /budget-categories/{id}` - Update a category
- `DELETE /budget-categories/{id}` - Delete a category

### Quickstart

See [quickstart.md](./quickstart.md) for testing checklist.

---

## Dependencies Summary

### New Dependencies to Install

```bash
npm install recharts
```

### Existing Dependencies Used
- @tanstack/react-query (v5)
- react-hook-form
- @hookform/resolvers
- zod
- date-fns
- lucide-react
- All Shadcn/ui components (Dialog, Button, Input, Table, Badge, etc.)

---

## Implementation Notes

### Component Hierarchy

```
BudgetPage
├── BudgetStatCards (4 cards: Total Budget, Total Spent, Remaining, % Spent)
├── BudgetProgressBar (visual spending indicator)
├── BudgetCategoriesTable
│   ├── BudgetStatusBadge (per row)
│   └── Actions (Edit, Delete buttons)
├── BudgetPieChart (projected amount breakdown)
├── BudgetCategoryModal (add/edit form)
└── DeleteBudgetCategoryDialog (confirmation)
```

### Query Keys

```typescript
const QUERY_KEYS = {
  budgetCategories: (weddingId: string) => ['budget-categories', weddingId],
  wedding: (weddingId: string) => ['wedding', weddingId],
};
```

### Mutation Invalidation Pattern

After any category mutation:
1. Invalidate `budget-categories` query
2. Invalidate `wedding` query (for updated totals)
3. Show toast notification

---

## Next Steps

Run `/speckit.tasks` to generate the detailed task breakdown for implementation.
