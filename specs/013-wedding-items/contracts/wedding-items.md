# API Contract: Wedding Items

**Feature Branch**: `013-wedding-items`
**Created**: 2026-01-16
**Backend**: Supabase PostgreSQL (direct client queries)

## Overview

Wedding items API uses Supabase client for all operations. No custom backend endpoints are required.

---

## Query Contracts

### List Wedding Items

```typescript
// GET wedding items for a wedding with event quantities
const { data, error } = await supabase
  .from('wedding_items')
  .select(`
    *,
    event_quantities:wedding_item_event_quantities(
      *,
      event:events(id, event_name, event_date)
    )
  `)
  .eq('wedding_id', weddingId)
  .order('category', { ascending: true });
```

**Response Shape**:
```typescript
interface WeddingItemListResponse {
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
  event_quantities: Array<{
    id: string;
    wedding_item_id: string;
    event_id: string;
    quantity_required: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    event: {
      id: string;
      event_name: string;
      event_date: string;
    };
  }>;
}
```

### Get Single Wedding Item

```typescript
// GET single wedding item with event quantities
const { data, error } = await supabase
  .from('wedding_items')
  .select(`
    *,
    event_quantities:wedding_item_event_quantities(
      *,
      event:events(id, event_name, event_date)
    )
  `)
  .eq('id', itemId)
  .single();
```

---

## Mutation Contracts

### Create Wedding Item

```typescript
// POST new wedding item
const { data, error } = await supabase
  .from('wedding_items')
  .insert({
    wedding_id: weddingId,
    category: 'Tables',
    description: 'Trestle Tables 6ft',
    aggregation_method: 'MAX',
    number_available: 25,
    total_required: 0,  // Will be calculated after event quantities added
    cost_per_unit: 50.00,
    cost_details: 'Per table rental fee',
    total_cost: null,  // Will be calculated
    supplier_name: 'ABC Rentals',
    notes: null
  })
  .select()
  .single();
```

**Request Validation** (Zod):
```typescript
const createWeddingItemSchema = z.object({
  wedding_id: z.string().uuid(),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().min(1, 'Description is required').max(200),
  aggregation_method: z.enum(['ADD', 'MAX']).default('MAX'),
  number_available: z.number().int().min(0).nullable().optional(),
  cost_per_unit: z.number().min(0).nullable().optional(),
  cost_details: z.string().max(500).nullable().optional(),
  supplier_name: z.string().max(100).nullable().optional(),
  notes: z.string().max(1000).nullable().optional()
});
```

### Update Wedding Item

```typescript
// PATCH existing wedding item
const { data, error } = await supabase
  .from('wedding_items')
  .update({
    description: 'Updated description',
    number_available: 30,
    cost_per_unit: 55.00
  })
  .eq('id', itemId)
  .select()
  .single();
```

### Delete Wedding Item

```typescript
// DELETE wedding item (cascades to event quantities)
const { error } = await supabase
  .from('wedding_items')
  .delete()
  .eq('id', itemId);
```

---

## Event Quantities Contracts

### Create Event Quantity

```typescript
// POST new event quantity (upsert pattern)
const { data, error } = await supabase
  .from('wedding_item_event_quantities')
  .upsert({
    wedding_item_id: itemId,
    event_id: eventId,
    quantity_required: 20,
    notes: null
  })
  .select()
  .single();
```

**Request Validation** (Zod):
```typescript
const eventQuantitySchema = z.object({
  wedding_item_id: z.string().uuid(),
  event_id: z.string().uuid(),
  quantity_required: z.number().int().min(0, 'Quantity must be 0 or greater'),
  notes: z.string().max(500).nullable().optional()
});
```

### Update Event Quantity

```typescript
// PATCH existing event quantity
const { data, error } = await supabase
  .from('wedding_item_event_quantities')
  .update({
    quantity_required: 25,
    notes: 'Updated for larger venue'
  })
  .eq('id', quantityId)
  .select()
  .single();
```

### Delete Event Quantity

```typescript
// DELETE event quantity
const { error } = await supabase
  .from('wedding_item_event_quantities')
  .delete()
  .eq('id', quantityId);
```

### Bulk Upsert Event Quantities

```typescript
// Upsert multiple event quantities at once
const quantities = Object.entries(eventQuantities)
  .filter(([_, qty]) => qty > 0)
  .map(([eventId, qty]) => ({
    wedding_item_id: itemId,
    event_id: eventId,
    quantity_required: qty
  }));

if (quantities.length > 0) {
  const { error } = await supabase
    .from('wedding_item_event_quantities')
    .upsert(quantities, { onConflict: 'wedding_item_id,event_id' });
}
```

---

## Calculated Fields Update

After any event quantity change, recalculate and update the parent item:

```typescript
// 1. Fetch all quantities for recalculation
const { data: allQuantities } = await supabase
  .from('wedding_item_event_quantities')
  .select('quantity_required')
  .eq('wedding_item_id', itemId);

// 2. Get item's aggregation method and cost_per_unit
const { data: item } = await supabase
  .from('wedding_items')
  .select('aggregation_method, cost_per_unit')
  .eq('id', itemId)
  .single();

// 3. Calculate total_required based on aggregation method
const quantities = allQuantities?.map(q => q.quantity_required) || [];
const totalRequired = item.aggregation_method === 'ADD'
  ? quantities.reduce((sum, qty) => sum + qty, 0)
  : Math.max(...quantities, 0);

// 4. Calculate total_cost
const totalCost = item.cost_per_unit !== null
  ? totalRequired * item.cost_per_unit
  : null;

// 5. Update the wedding item
const { error } = await supabase
  .from('wedding_items')
  .update({
    total_required: totalRequired,
    total_cost: totalCost,
    updated_at: new Date().toISOString()
  })
  .eq('id', itemId);
```

---

## Related Entity Queries

### Get Events for Quantities Table

```typescript
// GET events for the wedding
const { data, error } = await supabase
  .from('events')
  .select('id, event_name, event_date')
  .eq('wedding_id', weddingId)
  .order('event_date', { ascending: true });
```

### Get Unique Categories

```typescript
// GET unique categories from existing items
const { data, error } = await supabase
  .from('wedding_items')
  .select('category')
  .eq('wedding_id', weddingId);

const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
```

### Get Unique Suppliers

```typescript
// GET unique supplier names for filtering
const { data, error } = await supabase
  .from('wedding_items')
  .select('supplier_name')
  .eq('wedding_id', weddingId)
  .not('supplier_name', 'is', null);

const uniqueSuppliers = [...new Set(data?.map(item => item.supplier_name).filter(Boolean) || [])];
```

---

## Error Handling

### Standard Error Response
```typescript
interface SupabaseError {
  message: string;
  details: string | null;
  hint: string | null;
  code: string;
}
```

### Common Error Codes
| Code | Description | User Message |
|------|-------------|--------------|
| 23503 | Foreign key violation | "Referenced event or wedding not found" |
| 23505 | Unique violation | "Quantity already exists for this event" |
| 23514 | Check constraint violation | "Invalid aggregation method" |
| 42501 | RLS policy violation | "Access denied" |
| PGRST116 | No rows returned | "Item not found" |

### Error Handling Pattern
```typescript
const { data, error } = await supabase.from('wedding_items').insert(values);

if (error) {
  if (error.code === '23505') {
    toast.error('Quantity already exists for this event');
  } else if (error.code === '42501') {
    toast.error('You do not have permission to perform this action');
  } else {
    toast.error('Failed to create wedding item');
  }
  throw error;
}

toast.success('Item created successfully');
```

---

## Query Key Conventions

```typescript
// React Query key patterns
const queryKeys = {
  weddingItems: (weddingId: string) => ['wedding-items', weddingId] as const,
  weddingItem: (itemId: string) => ['wedding-item', itemId] as const,
  events: (weddingId: string) => ['events', weddingId] as const,
};
```

---

## Invalidation Patterns

```typescript
// After creating/updating/deleting wedding item
queryClient.invalidateQueries({ queryKey: ['wedding-items', weddingId] });

// After updating single item
queryClient.invalidateQueries({ queryKey: ['wedding-item', itemId] });

// After event quantity changes, invalidate parent item
queryClient.invalidateQueries({ queryKey: ['wedding-item', itemId] });
queryClient.invalidateQueries({ queryKey: ['wedding-items', weddingId] });
```

---

## Business Logic Functions

### Calculate Total Required

```typescript
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

### Check Availability Status

```typescript
type AvailabilityStatusType = 'sufficient' | 'shortage' | 'unknown';

interface AvailabilityStatus {
  status: AvailabilityStatusType;
  shortage?: number;
  message: string;
}

function checkAvailability(
  totalRequired: number,
  numberAvailable: number | null
): AvailabilityStatus {
  if (numberAvailable === null) {
    return { status: 'unknown', message: 'Availability not set' };
  }

  if (numberAvailable >= totalRequired) {
    return { status: 'sufficient', message: `${numberAvailable} available` };
  }

  const shortage = totalRequired - numberAvailable;
  return {
    status: 'shortage',
    shortage,
    message: `Short by ${shortage}`,
  };
}
```

### Calculate Total Cost

```typescript
function calculateTotalCost(
  totalRequired: number,
  costPerUnit: number | null
): number | null {
  if (costPerUnit === null) return null;
  return totalRequired * costPerUnit;
}
```
