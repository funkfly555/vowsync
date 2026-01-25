# Implementation Plan: Items Card Table View

**Branch**: `031-items-card-table-view` | **Date**: 2026-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/031-items-card-table-view/spec.md`

## Summary

Implement dual Card/Table view for the Wedding Items (Furniture & Equipment) page, following the established pattern from the Guests page. This feature enables wedding consultants to toggle between a visual card-based layout for quick browsing and a data-dense table view for bulk analysis and filtering. Key capabilities include view persistence, expandable details with EventBreakdown, column sorting/filtering, multi-select with bulk delete, and inline event quantity editing with real-time aggregation recalculation.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, Lucide React, date-fns
**Storage**: Supabase PostgreSQL (existing tables: wedding_items, wedding_item_event_quantities, events)
**Testing**: Manual testing with Playwright MCP only (no automated tests)
**Target Platform**: Web (Chrome, Firefox, Safari; Mobile: iOS Safari, Android Chrome)
**Project Type**: Web application (Vite + React SPA)
**Performance Goals**: View toggle < 1s, sort/filter < 500ms for 100+ items, FCP < 1.2s
**Constraints**: Must preserve all existing components and hooks, reuse Guests page patterns
**Scale/Scope**: Typical wedding has 20-100 items across 3-7 events

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
specs/031-items-card-table-view/
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
├── types/
│   ├── weddingItem.ts              # EXISTING - preserve (types + utils)
│   └── item-table.ts               # NEW - table-specific types
│
├── lib/
│   ├── utils.ts                    # EXISTING
│   └── item-table-utils.ts         # NEW - table utils (copy from guest-table-utils)
│
├── hooks/
│   ├── useWeddingItems.ts          # EXISTING - preserve
│   ├── useWeddingItemMutations.ts  # EXISTING - preserve
│   └── useItemTableData.ts         # NEW - table view data transformation
│
├── components/
│   └── wedding-items/
│       ├── AggregationMethodBadge.tsx    # EXISTING - preserve
│       ├── AvailabilityStatusBadge.tsx   # EXISTING - preserve
│       ├── EventBreakdown.tsx            # EXISTING - preserve
│       ├── EventQuantitiesTable.tsx      # EXISTING - preserve
│       ├── WeddingItemsSummary.tsx       # EXISTING - preserve
│       ├── WeddingItemModal.tsx          # EXISTING - preserve
│       ├── DeleteWeddingItemDialog.tsx   # EXISTING - preserve
│       ├── WeddingItemsFilters.tsx       # MODIFY - add search input
│       ├── WeddingItemsList.tsx          # MODIFY - support both views
│       ├── WeddingItemCard.tsx           # EXISTING - will be split
│       │
│       ├── ViewToggle.tsx                # NEW - card/table toggle
│       ├── ItemCard.tsx                  # NEW - wrapper component
│       ├── ItemCardCollapsed.tsx         # NEW - collapsed card state
│       ├── ItemCardExpanded.tsx          # NEW - expanded card state
│       ├── BulkActionsBar.tsx            # NEW - bulk delete bar
│       │
│       └── table/                        # NEW FOLDER
│           ├── index.ts                  # Barrel export
│           ├── ItemTableView.tsx         # Main table container
│           ├── ItemTableHeader.tsx       # Header with sort/filter
│           ├── ItemTableBody.tsx         # Body container
│           ├── ItemTableRow.tsx          # Table row
│           ├── ItemTableExpandedRow.tsx  # Expanded row content
│           ├── ItemTableCell.tsx         # Cell renderer
│           ├── itemTableColumns.ts       # Column definitions
│           ├── ColumnFilterDropdown.tsx  # Excel-style filter (copy from guests)
│           └── ActiveFiltersBar.tsx      # Filter badges (copy from guests)
│
└── pages/
    └── wedding-items/
        └── WeddingItemsPage.tsx          # MODIFY - add view toggle, dual rendering
```

**Structure Decision**: Follows established Guests page pattern with table components in a subdirectory. Preserves all existing components per spec requirements.

## Complexity Tracking

> No constitution violations requiring justification. All patterns follow existing Guests page implementation.

---

## Phase 0: Research Summary

### R1: View Toggle Pattern (from Guests Page)

**Decision**: Copy `ViewToggle.tsx` from `src/components/guests/ViewToggle.tsx`
**Rationale**: Proven pattern, consistent UX, brand colors already implemented
**Modifications**: Update type from `GuestViewMode` to `ItemViewMode`

### R2: Table Component Architecture (from Guests Page)

**Decision**: Copy table folder structure from `src/components/guests/table/`
**Rationale**: 9 reusable components with established patterns
**Files to copy and adapt**:
- `ColumnFilterDropdown.tsx` - Update types only
- `ActiveFiltersBar.tsx` - Update types only
- `tableColumns.ts` → `itemTableColumns.ts` - Complete rewrite for item columns
- Other components - Adapt patterns for ItemTableRow structure

### R3: localStorage View Preference

**Decision**: Use pattern from `lib/guest-table-utils.ts`
**Key**: `itemsViewPreference`
**Functions**:
```typescript
export function getItemViewPreference(): 'card' | 'table' {
  try {
    const stored = localStorage.getItem('itemsViewPreference');
    return stored === 'table' ? 'table' : 'card';
  } catch {
    return 'card';
  }
}

export function setItemViewPreference(mode: 'card' | 'table'): void {
  try {
    localStorage.setItem('itemsViewPreference', mode);
  } catch {
    // Silent fail if localStorage unavailable
  }
}
```

### R4: Selection State Management

**Decision**: Use `Set<string>` for O(1) selection operations
**Rationale**: Proven efficient pattern from Guests page
**Shared State**: Selection persists across view switches

### R5: Debounce Timing

**Decision**: 300ms for search, 300ms for inline quantity edits
**Rationale**: User-specified in acceptance criteria; matches existing debounce in EventBreakdown

### R6: Business Rules (Already Implemented)

**Location**: `src/types/weddingItem.ts`
**Functions**:
- `calculateTotalRequired()` - ADD/MAX aggregation
- `checkAvailability()` - Sufficient/Shortage/Unknown status
- `calculateTotalCost()` - Unit cost × total required
- `formatCurrency()` - South African Rand (R X,XXX.XX)

### R7: Existing Components to Preserve

| Component | Location | Reuse Strategy |
|-----------|----------|----------------|
| AggregationMethodBadge | wedding-items/ | Use directly in both views |
| AvailabilityStatusBadge | wedding-items/ | Use directly in both views |
| EventBreakdown | wedding-items/ | Use in expanded card/row |
| EventQuantitiesTable | wedding-items/ | Use in table expanded row |
| WeddingItemsSummary | wedding-items/ | Keep at top of page |
| WeddingItemModal | wedding-items/ | Use for Edit action |
| DeleteWeddingItemDialog | wedding-items/ | Use for Delete action |

---

## Phase 1: Data Model & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Key Types**:

```typescript
// View mode type
export type ItemViewMode = 'card' | 'table';

// Table row type with computed fields
export interface ItemTableRow {
  id: string;
  wedding_id: string;
  description: string;
  category: string;
  aggregation_method: 'ADD' | 'MAX';
  total_required: number;
  number_available: number | null;
  availability_status: 'sufficient' | 'shortage' | 'unknown';
  shortage_amount?: number;
  cost_per_unit: number | null;
  total_cost: number | null;
  supplier_name: string | null;
  notes: string | null;
  cost_details: string | null;
  eventQuantities: Array<{
    event_id: string;
    event_name: string;
    quantity_required: number;
    is_max: boolean; // For MAX row highlighting
  }>;
}

// Column filter type
export interface ItemColumnFilter {
  column: string;
  operator: 'in' | 'equals' | 'contains';
  value: string | string[];
}

// Sort configuration
export interface ItemSortConfig {
  column: string | null;
  direction: 'asc' | 'desc';
}

// Filters state
export interface ItemFiltersState {
  search: string;
  category: string;
  supplier: string;
  aggregationMethod: string;
  availabilityStatus: string;
}
```

### Table Column Definitions

```typescript
export const ITEM_TABLE_COLUMNS: ItemTableColumnDef[] = [
  { id: 'select', header: '', field: 'id', type: 'checkbox', width: 40, filterable: false },
  { id: 'description', header: 'Description', field: 'description', type: 'text', width: 200 },
  { id: 'category', header: 'Category', field: 'category', type: 'badge', width: 120, filterable: true },
  { id: 'aggregation_method', header: 'Method', field: 'aggregation_method', type: 'badge', width: 80, filterable: true },
  { id: 'total_required', header: 'Need', field: 'total_required', type: 'number', width: 80 },
  { id: 'number_available', header: 'Have', field: 'number_available', type: 'number', width: 80 },
  { id: 'availability_status', header: 'Status', field: 'availability_status', type: 'badge', width: 120, filterable: true },
  { id: 'cost_per_unit', header: 'Unit Cost', field: 'cost_per_unit', type: 'currency', width: 100 },
  { id: 'total_cost', header: 'Total Cost', field: 'total_cost', type: 'currency', width: 100 },
  { id: 'supplier_name', header: 'Supplier', field: 'supplier_name', type: 'text', width: 150, filterable: true },
  { id: 'actions', header: 'Actions', field: 'id', type: 'actions', width: 80 },
];
```

### API Contracts

See [contracts/](./contracts/) folder for full specifications.

**Existing Hooks (Preserve)**:
- `useWeddingItems(weddingId)` - Fetches items with event quantities
- `useWeddingItemMutations(weddingId)` - CRUD operations

**New Hook**:
- `useItemTableData(weddingId, filters, columnFilters)` - Transforms data for table view

### Quickstart

See [quickstart.md](./quickstart.md) for implementation guide.

---

## Implementation Phases (for /speckit.tasks)

### Phase 1: Foundation (Types & Utils)
1. Create `src/types/item-table.ts` with ItemViewMode, ItemTableRow, etc.
2. Create `src/lib/item-table-utils.ts` with localStorage helpers, sort/filter utils
3. Add `markMaxRows()` utility function for MAX row highlighting

### Phase 2: View Toggle & Page Structure
4. Create `ViewToggle.tsx` (copy from guests, update types)
5. Update `WeddingItemsPage.tsx` with view state, toggle, conditional rendering
6. Update `WeddingItemsFilters.tsx` to add search input with debounce

### Phase 3: Card View Components
7. Create `ItemCardCollapsed.tsx` with checkbox, badges, summary
8. Create `ItemCardExpanded.tsx` with EventBreakdown, actions
9. Create `ItemCard.tsx` wrapper with expand/collapse state
10. Update `WeddingItemsList.tsx` to use new card components

### Phase 4: Table View Infrastructure
11. Create `useItemTableData.ts` hook for data transformation
12. Copy/adapt `ColumnFilterDropdown.tsx` from guests
13. Copy/adapt `ActiveFiltersBar.tsx` from guests
14. Create `itemTableColumns.ts` with column definitions

### Phase 5: Table View Components
15. Create `ItemTableView.tsx` main container
16. Create `ItemTableHeader.tsx` with sticky header, sort, filter
17. Create `ItemTableBody.tsx` body container
18. Create `ItemTableRow.tsx` with cells, expand trigger
19. Create `ItemTableExpandedRow.tsx` with EventBreakdown, details
20. Create `ItemTableCell.tsx` cell renderer

### Phase 6: Selection & Bulk Actions
21. Create `BulkActionsBar.tsx` with selection count, delete button
22. Add selection state to page (Set<string>)
23. Add select-all logic for table view
24. Create bulk delete confirmation dialog

### Phase 7: Integration & Polish
25. Wire up all state management in WeddingItemsPage
26. Add loading states and error handling
27. Ensure real-time updates across both views
28. Update summary statistics to reflect filtered data

### Phase 8: E2E Testing
29. Manual E2E testing with Playwright MCP
30. Test all 51 acceptance criteria
31. Fix any discovered issues
32. Document test results

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Performance with 100+ items | Virtual scrolling if needed, memoization |
| State sync between views | Single source of truth via TanStack Query |
| Complex filter combinations | AND logic, clear filter state management |
| MAX row calculation accuracy | Comprehensive testing with edge cases |

---

## Success Metrics

- [ ] All 39 functional requirements implemented
- [ ] All 10 success criteria measurable and passing
- [ ] All 51 acceptance criteria verified via E2E testing
- [ ] View preference persists correctly
- [ ] Selection state preserved across view switches
- [ ] Inline quantity edits auto-save correctly
- [ ] Summary statistics update in real-time
