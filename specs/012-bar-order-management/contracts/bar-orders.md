# API Contract: Bar Orders

**Feature Branch**: `012-bar-order-management`
**Created**: 2026-01-15
**Backend**: Supabase PostgreSQL (direct client queries)

## Overview

Bar orders API uses Supabase client for all operations. No custom backend endpoints are required.

## Query Contracts

### List Bar Orders

```typescript
// GET bar orders for a wedding
const { data, error } = await supabase
  .from('bar_orders')
  .select(`
    *,
    event:events(id, name, start_time, end_time),
    vendor:vendors(id, business_name),
    items:bar_order_items(*)
  `)
  .eq('wedding_id', weddingId)
  .order('created_at', { ascending: false });
```

**Response Shape**:
```typescript
interface BarOrderListResponse {
  id: string;
  wedding_id: string;
  event_id: string | null;
  vendor_id: string | null;
  name: string;
  guest_count_adults: number;
  event_duration_hours: number;
  first_hours: number;
  first_hours_drinks_per_hour: number;
  remaining_hours_drinks_per_hour: number;
  total_servings_per_person: number;
  status: BarOrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  event: {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
  } | null;
  vendor: {
    id: string;
    business_name: string;
  } | null;
  items: BarOrderItem[];
}
```

### Get Single Bar Order

```typescript
// GET single bar order with items
const { data, error } = await supabase
  .from('bar_orders')
  .select(`
    *,
    event:events(id, name, start_time, end_time),
    vendor:vendors(id, business_name),
    items:bar_order_items(*)
  `)
  .eq('id', orderId)
  .single();
```

## Mutation Contracts

### Create Bar Order

```typescript
// POST new bar order
const { data, error } = await supabase
  .from('bar_orders')
  .insert({
    wedding_id: weddingId,
    event_id: eventId || null,
    vendor_id: vendorId || null,
    name: 'Reception Bar',
    guest_count_adults: 150,
    event_duration_hours: 5,
    first_hours: 2,
    first_hours_drinks_per_hour: 2,
    remaining_hours_drinks_per_hour: 1,
    status: 'draft',
    notes: null
  })
  .select()
  .single();
```

**Request Validation** (Zod):
```typescript
const createBarOrderSchema = z.object({
  wedding_id: z.string().uuid(),
  event_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  guest_count_adults: z.number().int().min(0),
  event_duration_hours: z.number().min(0.5).max(24),
  first_hours: z.number().min(0).max(24),
  first_hours_drinks_per_hour: z.number().min(0),
  remaining_hours_drinks_per_hour: z.number().min(0),
  status: z.enum(['draft', 'confirmed', 'ordered', 'delivered']).default('draft'),
  notes: z.string().nullable().optional()
}).refine(
  data => data.first_hours <= data.event_duration_hours,
  { message: 'First hours cannot exceed event duration' }
);
```

### Update Bar Order

```typescript
// PATCH existing bar order
const { data, error } = await supabase
  .from('bar_orders')
  .update({
    name: 'Updated Reception Bar',
    guest_count_adults: 175,
    status: 'confirmed'
  })
  .eq('id', orderId)
  .select()
  .single();
```

### Delete Bar Order

```typescript
// DELETE bar order (cascades to items)
const { error } = await supabase
  .from('bar_orders')
  .delete()
  .eq('id', orderId);
```

## Bar Order Items Contracts

### Create Item

```typescript
// POST new item to order
const { data, error } = await supabase
  .from('bar_order_items')
  .insert({
    bar_order_id: orderId,
    item_name: 'Red Wine',
    percentage: 0.40,
    servings_per_unit: 4,
    cost_per_unit: 150.00,
    sort_order: 0
  })
  .select()
  .single();
```

**Request Validation** (Zod):
```typescript
const createItemSchema = z.object({
  bar_order_id: z.string().uuid(),
  item_name: z.string().min(1).max(100),
  percentage: z.number().min(0.01).max(1),
  servings_per_unit: z.number().int().min(1),
  cost_per_unit: z.number().min(0).nullable().optional(),
  sort_order: z.number().int().min(0).default(0)
});
```

### Update Item

```typescript
// PATCH existing item
const { data, error } = await supabase
  .from('bar_order_items')
  .update({
    item_name: 'White Wine',
    percentage: 0.35,
    cost_per_unit: 120.00
  })
  .eq('id', itemId)
  .select()
  .single();
```

### Delete Item

```typescript
// DELETE item
const { error } = await supabase
  .from('bar_order_items')
  .delete()
  .eq('id', itemId);
```

### Bulk Update Item Order

```typescript
// Update sort_order for multiple items
const updates = items.map((item, index) => ({
  id: item.id,
  sort_order: index
}));

for (const update of updates) {
  await supabase
    .from('bar_order_items')
    .update({ sort_order: update.sort_order })
    .eq('id', update.id);
}
```

## Related Entity Queries

### Get Events for Dropdown

```typescript
// GET events for event selector
const { data, error } = await supabase
  .from('events')
  .select('id, name, start_time, end_time')
  .eq('wedding_id', weddingId)
  .order('start_time', { ascending: true });
```

### Get Vendors for Dropdown

```typescript
// GET vendors for vendor selector
const { data, error } = await supabase
  .from('vendors')
  .select('id, business_name, category')
  .eq('wedding_id', weddingId)
  .order('business_name', { ascending: true });
```

### Get Event Guest Count

```typescript
// GET adult guest count from event
const { data, error } = await supabase
  .from('guest_event_attendance')
  .select('guest:guests(type)')
  .eq('event_id', eventId)
  .eq('attending', true);

// Filter for adults: guest.type !== 'child'
const adultCount = data.filter(
  attendance => attendance.guest?.type !== 'child'
).length;
```

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
| 23503 | Foreign key violation | "Referenced record not found" |
| 23505 | Unique violation | "Record already exists" |
| 23514 | Check constraint violation | "Invalid value for field" |
| 42501 | RLS policy violation | "Access denied" |
| PGRST116 | No rows returned | "Record not found" |

### Error Handling Pattern
```typescript
const { data, error } = await supabase.from('bar_orders').insert(values);

if (error) {
  if (error.code === '23514') {
    toast.error('Invalid value: ' + error.details);
  } else if (error.code === '42501') {
    toast.error('You do not have permission to perform this action');
  } else {
    toast.error('Failed to create bar order');
  }
  throw error;
}
```

## Query Key Conventions

```typescript
// React Query key patterns
const queryKeys = {
  barOrders: (weddingId: string) => ['bar-orders', weddingId] as const,
  barOrder: (orderId: string) => ['bar-order', orderId] as const,
  events: (weddingId: string) => ['events', weddingId] as const,
  vendors: (weddingId: string) => ['vendors', weddingId] as const,
};
```

## Invalidation Patterns

```typescript
// After creating/updating/deleting bar order
queryClient.invalidateQueries({ queryKey: ['bar-orders', weddingId] });

// After updating single order
queryClient.invalidateQueries({ queryKey: ['bar-order', orderId] });

// After item changes, invalidate parent order
queryClient.invalidateQueries({ queryKey: ['bar-order', orderId] });
queryClient.invalidateQueries({ queryKey: ['bar-orders', weddingId] });
```
