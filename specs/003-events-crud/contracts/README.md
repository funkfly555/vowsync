# API Contracts: Events Management CRUD

**Feature**: 003-events-crud
**Date**: 2026-01-13

## Overview

This feature uses Supabase client SDK for all database operations. No custom REST API endpoints are required.

## Supabase Query Patterns

### List Events for Wedding

```typescript
// GET /rest/v1/events?wedding_id=eq.{weddingId}&order=event_order.asc
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('wedding_id', weddingId)
  .order('event_order', { ascending: true });
```

**Response**: `Event[]`

### Get Single Event

```typescript
// GET /rest/v1/events?id=eq.{eventId}&select=*,wedding:weddings(id,bride_name,groom_name,wedding_date)
const { data, error } = await supabase
  .from('events')
  .select(`
    *,
    wedding:weddings(id, bride_name, groom_name, wedding_date)
  `)
  .eq('id', eventId)
  .single();
```

**Response**: `EventWithWedding`

### Create Event

```typescript
// POST /rest/v1/events
const { data, error } = await supabase
  .from('events')
  .insert({
    wedding_id: weddingId,
    event_order: formData.event_order,
    event_name: formData.event_name,
    event_type: formData.event_type,
    event_date: formData.event_date.toISOString().split('T')[0],
    event_start_time: formData.event_start_time,
    event_end_time: formData.event_end_time,
    event_location: formData.event_location,
    notes: formData.notes || null,
  })
  .select()
  .single();
```

**Response**: `Event`

**Possible Errors**:
- `23505`: Unique constraint violation (duplicate event_order)
- `23503`: Foreign key violation (invalid wedding_id)
- `23514`: Check constraint violation (invalid event_type or event_order out of range)

### Update Event

```typescript
// PATCH /rest/v1/events?id=eq.{eventId}
const { data, error } = await supabase
  .from('events')
  .update({
    event_order: formData.event_order,
    event_name: formData.event_name,
    event_type: formData.event_type,
    event_date: formData.event_date.toISOString().split('T')[0],
    event_start_time: formData.event_start_time,
    event_end_time: formData.event_end_time,
    event_location: formData.event_location,
    notes: formData.notes || null,
  })
  .eq('id', eventId)
  .select()
  .single();
```

**Response**: `Event`

### Delete Event

```typescript
// DELETE /rest/v1/events?id=eq.{eventId}
const { error } = await supabase
  .from('events')
  .delete()
  .eq('id', eventId);
```

**Response**: No content (success) or error

### Get Used Event Orders for Wedding

```typescript
// Used to find next available order number
const { data, error } = await supabase
  .from('events')
  .select('event_order')
  .eq('wedding_id', weddingId);

const usedOrders = data?.map(e => e.event_order) ?? [];
const nextOrder = Array.from({ length: 10 }, (_, i) => i + 1)
  .find(n => !usedOrders.includes(n)) ?? 1;
```

### Check Guest Attendance Exists (for edit warning)

```typescript
const { count, error } = await supabase
  .from('guest_event_attendance')
  .select('*', { count: 'exact', head: true })
  .eq('event_id', eventId);

const hasGuests = (count ?? 0) > 0;
```

## Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase.from('events')...;

  if (error) {
    // Handle specific constraint violations
    if (error.code === '23505') {
      toast.error('This event order is already used');
      return;
    }
    throw error;
  }

  return data;
} catch (error) {
  console.error('Error:', error);
  toast.error('An unexpected error occurred');
  throw error;
}
```

## Response Types

### Standard Success Response

```typescript
interface SupabaseResponse<T> {
  data: T;
  error: null;
}
```

### Standard Error Response

```typescript
interface SupabaseError {
  data: null;
  error: {
    code: string;
    message: string;
    details: string | null;
    hint: string | null;
  };
}
```

## RLS Policy Coverage

All queries automatically enforced by RLS:

| Operation | Policy | Effect |
|-----------|--------|--------|
| SELECT | Users can view events of their weddings | Only returns events for consultant's weddings |
| INSERT | Users can create events for their weddings | Only allows insert if wedding belongs to user |
| UPDATE | Users can update events of their weddings | Only allows update if wedding belongs to user |
| DELETE | Users can delete events of their weddings | Only allows delete if wedding belongs to user |

## Query Key Structure (React Query)

```typescript
// List events for a wedding
queryKey: ['events', weddingId]

// Single event
queryKey: ['event', eventId]

// Wedding with events (for timeline header)
queryKey: ['wedding', weddingId]
```

## Optimistic Updates

For better UX, implement optimistic updates:

```typescript
onMutate: async (newEvent) => {
  await queryClient.cancelQueries({ queryKey: ['events', weddingId] });
  const previousEvents = queryClient.getQueryData(['events', weddingId]);
  queryClient.setQueryData(['events', weddingId], (old) => [...old, newEvent]);
  return { previousEvents };
},
onError: (err, newEvent, context) => {
  queryClient.setQueryData(['events', weddingId], context.previousEvents);
  toast.error('Failed to create event');
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['events', weddingId] });
},
```
