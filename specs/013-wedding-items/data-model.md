# Data Model: Wedding Items Management

**Feature Branch**: `013-wedding-items`
**Created**: 2026-01-16
**Status**: Complete

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────────┐       ┌─────────────────────────────────┐
│  weddings   │       │   wedding_items     │       │ wedding_item_event_quantities   │
├─────────────┤       ├─────────────────────┤       ├─────────────────────────────────┤
│ id (PK)     │◄──────┤ wedding_id (FK)     │◄──────┤ wedding_item_id (FK)            │
│ ...         │       │ id (PK)             │       │ id (PK)                         │
└─────────────┘       │ category            │       │ event_id (FK)                   │──────►┌──────────┐
                      │ description         │       │ quantity_required               │       │  events  │
                      │ aggregation_method  │       │ notes                           │       ├──────────┤
                      │ number_available    │       │ created_at                      │       │ id (PK)  │
                      │ total_required      │       │ updated_at                      │       │ ...      │
                      │ cost_per_unit       │       └─────────────────────────────────┘       └──────────┘
                      │ cost_details        │
                      │ total_cost          │       UNIQUE(wedding_item_id, event_id)
                      │ supplier_name       │
                      │ notes               │
                      │ created_at          │
                      │ updated_at          │
                      └─────────────────────┘
```

---

## Entity: wedding_items

**Purpose**: Represents a piece of furniture, equipment, or supply needed for a wedding.

**Source**: `03-DATABASE-SCHEMA.md` lines 479-504

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `wedding_id` | UUID | NOT NULL, FK → weddings(id) ON DELETE CASCADE | Parent wedding |
| `category` | TEXT | NOT NULL | Item category (e.g., "Tables", "Chairs", "Linens") |
| `description` | TEXT | NOT NULL | Item description (e.g., "Trestle Tables 6ft") |
| `aggregation_method` | TEXT | DEFAULT 'MAX', CHECK IN ('ADD', 'MAX') | How to calculate total_required |
| `number_available` | INTEGER | NULLABLE | How many we own/have access to |
| `total_required` | INTEGER | DEFAULT 0 | Auto-calculated from event quantities |
| `cost_per_unit` | DECIMAL(10,2) | NULLABLE | Cost per item |
| `cost_details` | TEXT | NULLABLE | Notes about pricing |
| `total_cost` | DECIMAL(12,2) | NULLABLE | total_required × cost_per_unit |
| `supplier_name` | TEXT | NULLABLE | Who provides this item |
| `notes` | TEXT | NULLABLE | Additional notes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes

```sql
CREATE INDEX idx_wedding_items_wedding ON wedding_items(wedding_id);
CREATE INDEX idx_wedding_items_category ON wedding_items(category);
CREATE INDEX idx_wedding_items_supplier ON wedding_items(supplier_name);
```

### RLS Policies

```sql
-- Users can view items of their weddings
CREATE POLICY "Users can view wedding items of their weddings"
  ON wedding_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = wedding_items.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

-- Users can create items for their weddings
CREATE POLICY "Users can create wedding items for their weddings"
  ON wedding_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = wedding_items.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

-- Users can update items of their weddings
CREATE POLICY "Users can update wedding items of their weddings"
  ON wedding_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = wedding_items.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

-- Users can delete items of their weddings
CREATE POLICY "Users can delete wedding items of their weddings"
  ON wedding_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = wedding_items.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );
```

---

## Entity: wedding_item_event_quantities

**Purpose**: Represents the quantity of a specific wedding item needed for a specific event.

**Source**: `03-DATABASE-SCHEMA.md` lines 506-525

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `wedding_item_id` | UUID | NOT NULL, FK → wedding_items(id) ON DELETE CASCADE | Parent wedding item |
| `event_id` | UUID | NOT NULL, FK → events(id) ON DELETE CASCADE | Associated event |
| `quantity_required` | INTEGER | DEFAULT 0 | Quantity needed for this event |
| `notes` | TEXT | NULLABLE | Event-specific notes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Constraints

```sql
UNIQUE(wedding_item_id, event_id)  -- Prevent duplicate event quantities
```

### Indexes

```sql
CREATE INDEX idx_item_quantities_item ON wedding_item_event_quantities(wedding_item_id);
CREATE INDEX idx_item_quantities_event ON wedding_item_event_quantities(event_id);
```

### RLS Policies

```sql
-- Users can view quantities for items of their weddings
CREATE POLICY "Users can view event quantities of their wedding items"
  ON wedding_item_event_quantities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wedding_items wi
      JOIN weddings w ON w.id = wi.wedding_id
      WHERE wi.id = wedding_item_event_quantities.wedding_item_id
      AND w.consultant_id = auth.uid()
    )
  );

-- Similar policies for INSERT, UPDATE, DELETE
```

---

## TypeScript Interfaces

### WeddingItem

```typescript
/**
 * Database entity - mirrors Supabase wedding_items table
 * @feature 013-wedding-items
 */
export interface WeddingItem {
  id: string;
  wedding_id: string;
  category: string;
  description: string;
  aggregation_method: 'ADD' | 'MAX';
  number_available: number | null;
  total_required: number;
  cost_per_unit: number | null;
  cost_details: string | null;
  total_cost: number | null;
  supplier_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### WeddingItemEventQuantity

```typescript
/**
 * Database entity - mirrors Supabase wedding_item_event_quantities table
 * @feature 013-wedding-items
 */
export interface WeddingItemEventQuantity {
  id: string;
  wedding_item_id: string;
  event_id: string;
  quantity_required: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### WeddingItemWithQuantities

```typescript
/**
 * Wedding item with related event quantities for detail views
 */
export interface WeddingItemWithQuantities extends WeddingItem {
  event_quantities: Array<WeddingItemEventQuantity & {
    event: {
      id: string;
      event_name: string;
      event_date: string;
    };
  }>;
}
```

### WeddingItemFormData

```typescript
/**
 * Form data for create/edit wedding item modal
 */
export interface WeddingItemFormData {
  category: string;
  description: string;
  aggregation_method: 'ADD' | 'MAX';
  number_available: number | null;
  cost_per_unit: number | null;
  cost_details: string | null;
  supplier_name: string | null;
  notes: string | null;
  event_quantities: Record<string, number>; // eventId -> quantity
}
```

### AvailabilityStatus

```typescript
/**
 * Availability status for display
 */
export type AvailabilityStatusType = 'sufficient' | 'shortage' | 'unknown';

export interface AvailabilityStatus {
  status: AvailabilityStatusType;
  shortage?: number;
  message: string;
}
```

### WeddingItemsSummary

```typescript
/**
 * Summary statistics for wedding items list
 */
export interface WeddingItemsSummary {
  totalItems: number;
  totalCost: number;
  itemsWithCost: number;
  itemsWithoutCost: number;
  shortageCount: number;
  sufficientCount: number;
  unknownAvailabilityCount: number;
}
```

---

## Validation Rules (Zod Schema)

```typescript
import { z } from 'zod';

export const weddingItemSchema = z.object({
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must be 100 characters or less'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be 200 characters or less'),
  aggregation_method: z.enum(['ADD', 'MAX']),
  number_available: z.number().int().min(0).nullable(),
  cost_per_unit: z.number().min(0).nullable(),
  cost_details: z.string().max(500).nullable(),
  supplier_name: z.string().max(100).nullable(),
  notes: z.string().max(1000).nullable(),
});

export const eventQuantitySchema = z.object({
  wedding_item_id: z.string().uuid(),
  event_id: z.string().uuid(),
  quantity_required: z.number().int().min(0, 'Quantity must be 0 or greater'),
  notes: z.string().max(500).nullable(),
});
```

---

## Business Rules

### BR-001: Aggregation Calculation

```typescript
/**
 * Calculate total_required based on aggregation method
 */
function calculateTotalRequired(
  aggregationMethod: 'ADD' | 'MAX',
  eventQuantities: number[]
): number {
  if (eventQuantities.length === 0) return 0;

  if (aggregationMethod === 'ADD') {
    return eventQuantities.reduce((sum, qty) => sum + qty, 0);
  } else {
    return Math.max(...eventQuantities);
  }
}
```

### BR-002: Availability Check

```typescript
/**
 * Determine availability status
 */
function checkAvailability(
  totalRequired: number,
  numberAvailable: number | null
): AvailabilityStatus {
  if (numberAvailable === null) {
    return { status: 'unknown', message: '❓ Availability not set' };
  }

  if (numberAvailable >= totalRequired) {
    return { status: 'sufficient', message: `✅ ${numberAvailable} available` };
  }

  const shortage = totalRequired - numberAvailable;
  return {
    status: 'shortage',
    shortage,
    message: `⚠️ Short by ${shortage}`,
  };
}
```

### BR-003: Cost Calculation

```typescript
/**
 * Calculate total cost
 */
function calculateTotalCost(
  totalRequired: number,
  costPerUnit: number | null
): number | null {
  if (costPerUnit === null) return null;
  return totalRequired * costPerUnit;
}
```

---

## State Transitions

### Aggregation Method Change

```
┌──────────────────────────────────────────────────────────────┐
│                  aggregation_method changed                   │
├──────────────────────────────────────────────────────────────┤
│  1. Get all event quantities for this item                   │
│  2. Recalculate total_required using new method              │
│  3. Update wedding_items.total_required                      │
│  4. Recalculate total_cost (if cost_per_unit set)           │
│  5. Update wedding_items.total_cost                          │
│  6. Invalidate query cache                                   │
└──────────────────────────────────────────────────────────────┘
```

### Event Quantity Change

```
┌──────────────────────────────────────────────────────────────┐
│                   event quantity changed                      │
├──────────────────────────────────────────────────────────────┤
│  1. Upsert wedding_item_event_quantities                     │
│  2. Get all event quantities for this item                   │
│  3. Get item's aggregation_method                            │
│  4. Recalculate total_required                               │
│  5. Recalculate total_cost (if cost_per_unit set)           │
│  6. Update wedding_items                                     │
│  7. Invalidate query cache                                   │
└──────────────────────────────────────────────────────────────┘
```

### Event Deletion (Cascade)

```
┌──────────────────────────────────────────────────────────────┐
│                      event deleted                            │
├──────────────────────────────────────────────────────────────┤
│  1. CASCADE deletes wedding_item_event_quantities rows       │
│  2. For each affected wedding_item:                          │
│     a. Recalculate total_required from remaining quantities  │
│     b. Update wedding_items.total_required                   │
│     c. Recalculate total_cost                                │
│  NOTE: This requires a database trigger OR application logic │
└──────────────────────────────────────────────────────────────┘
```

---

## Query Patterns

### Fetch All Items with Quantities

```typescript
const { data } = await supabase
  .from('wedding_items')
  .select(`
    *,
    wedding_item_event_quantities(
      *,
      event:events(id, event_name, event_date)
    )
  `)
  .eq('wedding_id', weddingId)
  .order('category', { ascending: true });
```

### Create Item with Initial Quantities

```typescript
// 1. Create item
const { data: item } = await supabase
  .from('wedding_items')
  .insert({
    wedding_id: weddingId,
    category,
    description,
    aggregation_method,
    number_available,
    total_required: 0,
    cost_per_unit,
    cost_details,
    total_cost: null,
    supplier_name,
    notes,
  })
  .select()
  .single();

// 2. Create event quantities
const quantities = Object.entries(eventQuantities)
  .filter(([_, qty]) => qty > 0)
  .map(([eventId, qty]) => ({
    wedding_item_id: item.id,
    event_id: eventId,
    quantity_required: qty,
  }));

if (quantities.length > 0) {
  await supabase
    .from('wedding_item_event_quantities')
    .insert(quantities);
}

// 3. Recalculate and update total_required
const totalRequired = calculateTotalRequired(
  aggregation_method,
  Object.values(eventQuantities)
);

await supabase
  .from('wedding_items')
  .update({
    total_required: totalRequired,
    total_cost: calculateTotalCost(totalRequired, cost_per_unit),
  })
  .eq('id', item.id);
```

### Update Event Quantity

```typescript
// 1. Upsert quantity
await supabase
  .from('wedding_item_event_quantities')
  .upsert({
    wedding_item_id: itemId,
    event_id: eventId,
    quantity_required: quantity,
  });

// 2. Fetch all quantities for recalculation
const { data: allQuantities } = await supabase
  .from('wedding_item_event_quantities')
  .select('quantity_required')
  .eq('wedding_item_id', itemId);

// 3. Get aggregation method
const { data: item } = await supabase
  .from('wedding_items')
  .select('aggregation_method, cost_per_unit')
  .eq('id', itemId)
  .single();

// 4. Recalculate and update
const qtys = allQuantities?.map(q => q.quantity_required) || [];
const totalRequired = calculateTotalRequired(item.aggregation_method, qtys);

await supabase
  .from('wedding_items')
  .update({
    total_required: totalRequired,
    total_cost: calculateTotalCost(totalRequired, item.cost_per_unit),
  })
  .eq('id', itemId);
```

---

## Default Values

```typescript
export const DEFAULT_WEDDING_ITEM_FORM: WeddingItemFormData = {
  category: '',
  description: '',
  aggregation_method: 'MAX',
  number_available: null,
  cost_per_unit: null,
  cost_details: null,
  supplier_name: null,
  notes: null,
  event_quantities: {},
};
```

---

## Common Categories (Suggested)

```typescript
export const SUGGESTED_CATEGORIES = [
  'Tables',
  'Chairs',
  'Linens',
  'Decorations',
  'Lighting',
  'Audio/Visual',
  'Tableware',
  'Glassware',
  'Serveware',
  'Furniture',
  'Signage',
  'Other',
] as const;
```
