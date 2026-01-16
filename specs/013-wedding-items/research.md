# Research: Wedding Items Management

**Feature Branch**: `013-wedding-items`
**Created**: 2026-01-16
**Status**: Complete

## Research Summary

This document consolidates all technical decisions and research findings for the Wedding Items Management feature.

---

## 1. Database Schema Verification

### Decision: Use Existing Tables

**Tables confirmed in 03-DATABASE-SCHEMA.md (lines 479-525):**

```sql
-- wedding_items table
CREATE TABLE wedding_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  aggregation_method TEXT DEFAULT 'MAX' CHECK (aggregation_method IN ('ADD', 'MAX')),
  number_available INTEGER,
  total_required INTEGER DEFAULT 0,
  cost_per_unit DECIMAL(10,2),
  cost_details TEXT,
  total_cost DECIMAL(12,2),
  supplier_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- wedding_item_event_quantities table
CREATE TABLE wedding_item_event_quantities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_item_id UUID NOT NULL REFERENCES wedding_items(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  quantity_required INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wedding_item_id, event_id)
);
```

**Rationale**: Tables already exist with RLS enabled. No schema changes required.

**Alternatives Considered**: None - must use existing schema.

---

## 2. Field Naming Convention

### Decision: Use Exact Database Field Names (snake_case)

**Critical Field Mapping:**

| Database Field (snake_case) | TypeScript Property | Notes |
|----------------------------|---------------------|-------|
| `wedding_id` | `wedding_id` | FK to weddings |
| `aggregation_method` | `aggregation_method` | NOT `method` |
| `number_available` | `number_available` | NOT `available` |
| `total_required` | `total_required` | NOT `required` |
| `cost_per_unit` | `cost_per_unit` | Decimal |
| `total_cost` | `total_cost` | Calculated |
| `supplier_name` | `supplier_name` | NOT `supplier` |
| `wedding_item_id` | `wedding_item_id` | FK, NOT `item_id` |
| `quantity_required` | `quantity_required` | NOT `quantity` |

**Rationale**: Consistency with existing codebase (see `src/types/barOrder.ts`).

**Alternatives Considered**: camelCase in TypeScript with mapping - rejected for consistency.

---

## 3. Aggregation Logic Implementation

### Decision: Client-Side Calculation with Database Update

**ADD Method (Consumables):**
```typescript
function calculateADD(quantities: number[]): number {
  return quantities.reduce((sum, qty) => sum + qty, 0);
}
// Example: Napkins - [200, 150, 180] = 530 total
```

**MAX Method (Reusables):**
```typescript
function calculateMAX(quantities: number[]): number {
  return Math.max(...quantities, 0);
}
// Example: Tables - [14, 20, 10] = 20 total (reuse across events)
```

**Recalculation Triggers:**
1. Event quantity created/updated/deleted
2. Aggregation method changed
3. Event deleted (cascade removes quantities)

**Rationale**: Client calculates for immediate UI feedback, then persists to `total_required` column for consistency with other features.

**Alternatives Considered**:
- Database trigger - rejected (adds complexity, harder to debug)
- Real-time subscription - rejected (overkill for this feature)

---

## 4. Availability Status Logic

### Decision: Three-State Status System

| State | Condition | Display |
|-------|-----------|---------|
| `sufficient` | `number_available >= total_required` | Green badge: "✅ X available" |
| `shortage` | `number_available < total_required` | Orange badge: "⚠️ Short by X" |
| `unknown` | `number_available === null` | Gray badge: "❓ Not set" |

**Rationale**: Matches spec requirements (FR-006, FR-007). Clear visual hierarchy.

**Alternatives Considered**: Binary sufficient/insufficient - rejected (null state is important).

---

## 5. Cost Calculation Logic

### Decision: Auto-Calculate total_cost

```typescript
function calculateTotalCost(totalRequired: number, costPerUnit: number | null): number | null {
  if (costPerUnit === null || costPerUnit === undefined) {
    return null;
  }
  return totalRequired * costPerUnit;
}
```

**Rationale**: Matches spec (FR-009). Simple multiplication.

**Alternatives Considered**: None - straightforward calculation.

---

## 6. Filter Implementation

### Decision: Client-Side Filtering with Dropdown Filters

**Filter Options:**
- Category filter: Dropdown with unique categories from existing items
- Supplier filter: Dropdown with unique supplier names from existing items
- Clear filters: Reset to show all items

**Implementation:**
```typescript
function filterItems(items: WeddingItem[], filters: { category?: string; supplier?: string }) {
  return items.filter(item => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.supplier && item.supplier_name !== filters.supplier) return false;
    return true;
  });
}
```

**Rationale**: Dataset is small (typically <100 items). Server-side filtering adds unnecessary complexity.

**Alternatives Considered**: Server-side filtering - rejected for simplicity.

---

## 7. Event Quantities Table Design

### Decision: Inline Editable Table with Auto-Save

**Behavior:**
1. Display all events for the wedding in a table
2. Each row has: Event name, Date, Quantity input
3. Quantity changes trigger immediate recalculation
4. For MAX aggregation: highlight row with highest quantity
5. Footer shows calculated total with aggregation method label

**Rationale**: Matches spec (FR-012, FR-013, FR-014). Familiar spreadsheet-like interaction.

**Alternatives Considered**: Modal per event - rejected (too many clicks).

---

## 8. Component Architecture

### Decision: Follow Existing Patterns

**File Structure:**
```
src/
├── types/
│   └── weddingItem.ts           # TypeScript interfaces
├── schemas/
│   └── weddingItem.ts           # Zod validation
├── hooks/
│   ├── useWeddingItems.ts       # List query
│   ├── useWeddingItem.ts        # Single item query
│   └── useWeddingItemMutations.ts # CRUD mutations
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
└── pages/
    └── wedding-items/
        └── WeddingItemsPage.tsx
```

**Rationale**: Mirrors existing patterns (see `src/hooks/useBarOrders.ts`, `src/types/barOrder.ts`).

**Alternatives Considered**: None - must follow established patterns.

---

## 9. Design System Compliance

### Decision: Use Specified Colors and Components

**Aggregation Method Badges:**
- ADD: `bg-orange-100 text-orange-800` with ⬆️ icon
- MAX: `bg-blue-100 text-blue-800` with ↕️ icon

**Availability Status Badges:**
- Sufficient: `bg-green-100 text-green-800`
- Shortage: `bg-orange-100 text-orange-800`
- Unknown: `bg-gray-100 text-gray-800`

**Calculation Highlight:**
- `bg-blue-50 border-l-4 border-blue-500 p-4`

**Rationale**: Matches constitution (II. Design System) and user-provided specifications.

**Alternatives Considered**: None - must follow design system.

---

## 10. Navigation Activation

### Decision: Enable Items Nav Item

The "Items" navigation item exists in `src/lib/navigation.ts` as a placeholder (Phase 7):
```typescript
{
  id: 'items',
  label: 'Items',
  icon: 'Armchair',
  path: '/weddings/:id/items',
  isPlaceholder: true,
  placeholderPhase: 'Phase 7',
}
```

**Action Required**: Set `isPlaceholder: false` to activate.

**Rationale**: Navigation structure already exists, just needs activation.

---

## Conclusion

All technical decisions are resolved. No clarifications needed. Ready for Phase 1: Design & Contracts.

**Key Implementation Points:**
1. Use existing database tables (no migrations)
2. Use exact snake_case field names in Supabase queries
3. Calculate totals client-side, persist to database
4. Follow existing hook/type/component patterns
5. Enable navigation item by setting `isPlaceholder: false`
