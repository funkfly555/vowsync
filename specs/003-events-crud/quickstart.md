# Quickstart: Events Management CRUD

**Feature**: 003-events-crud
**Date**: 2026-01-13

## Prerequisites

1. Completed Phase 2 (002-wedding-crud) - Wedding CRUD interface working
2. Database has `events` table from Phase 1 with RLS policies
3. At least one wedding exists in the database for testing

## Setup Steps

### 1. Add Event Constants

Add to `src/lib/constants.ts`:

```typescript
// Event type options for dropdown
export const EVENT_TYPE_OPTIONS = [
  { value: 'ceremony', label: 'Ceremony' },
  { value: 'reception', label: 'Reception' },
  { value: 'rehearsal_dinner', label: 'Rehearsal Dinner' },
  { value: 'welcome_party', label: 'Welcome Party' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'other', label: 'Other' },
] as const;

// Event order options (1-10)
export const EVENT_ORDER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `Event ${i + 1}`,
}));

// Event colors by order (from design system)
export const EVENT_COLORS = [
  '#E8B4B8', // Order 1 - pink
  '#F5E6D3', // Order 2 - cream
  '#C9D4C5', // Order 3 - sage
  '#E5D4EF', // Order 4 - lavender
  '#FFE5CC', // Order 5 - peach
  '#D4E5F7', // Order 6 - blue
  '#F7D4E5', // Order 7 - rose
] as const;
```

### 2. Add Utility Functions

Add to `src/lib/utils.ts`:

```typescript
import { EVENT_COLORS } from './constants';

export function getEventColor(order: number): string {
  return EVENT_COLORS[(order - 1) % EVENT_COLORS.length];
}

export function calculateDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  return (endH * 60 + endM - startH * 60 - startM) / 60;
}

export function formatDuration(hours: number | null): string {
  if (hours === null || hours <= 0) return '0h';
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) return `${wholeHours}h`;
  if (wholeHours === 0) return `${minutes}m`;
  return `${wholeHours}h ${minutes}m`;
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
```

### 3. Create Event Types

Create `src/types/event.ts`:

```typescript
export type EventType =
  | 'ceremony'
  | 'reception'
  | 'rehearsal_dinner'
  | 'welcome_party'
  | 'brunch'
  | 'other';

export interface Event {
  id: string;
  wedding_id: string;
  event_order: number;
  event_name: string;
  event_type: EventType | null;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  event_location: string;
  expected_guests_adults: number;
  expected_guests_children: number;
  duration_hours: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  event_order: number;
  event_name: string;
  event_type: EventType;
  event_date: Date;
  event_start_time: string;
  event_end_time: string;
  event_location: string;
  notes?: string;
}
```

### 4. Create Event Validation Schema

Create `src/schemas/event.ts`:

```typescript
import { z } from 'zod';

export const EVENT_TYPES = [
  'ceremony', 'reception', 'rehearsal_dinner',
  'welcome_party', 'brunch', 'other',
] as const;

export const eventFormSchema = z.object({
  event_order: z.number().min(1).max(10),
  event_name: z.string().min(1, 'Event name is required'),
  event_type: z.enum(EVENT_TYPES),
  event_date: z.date(),
  event_start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  event_end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  event_location: z.string().min(1, 'Location is required'),
  notes: z.string().optional(),
}).refine(
  (data) => {
    const [startH, startM] = data.event_start_time.split(':').map(Number);
    const [endH, endM] = data.event_end_time.split(':').map(Number);
    return endH * 60 + endM > startH * 60 + startM;
  },
  { message: 'End time must be after start time', path: ['event_end_time'] }
);
```

### 5. Add Routes

Update `src/App.tsx` to add event routes:

```tsx
<Routes>
  {/* Existing routes */}
  <Route path="/" element={<WeddingListPage />} />
  <Route path="/weddings/new" element={<CreateWeddingPage />} />
  <Route path="/weddings/:id/edit" element={<EditWeddingPage />} />

  {/* New event routes */}
  <Route path="/weddings/:weddingId/events" element={<EventTimelinePage />} />
  <Route path="/weddings/:weddingId/events/new" element={<CreateEventPage />} />
  <Route path="/weddings/:weddingId/events/:eventId/edit" element={<EditEventPage />} />
</Routes>
```

## Verification Steps

### Step 1: Verify Database Table

Run in Supabase SQL Editor:
```sql
SELECT * FROM events LIMIT 5;
```

Should return empty or existing test data.

### Step 2: Verify RLS Policies

```sql
SELECT * FROM pg_policies WHERE tablename = 'events';
```

Should show SELECT, INSERT, UPDATE, DELETE policies.

### Step 3: Test Event Creation

After implementing:
1. Navigate to a wedding's events page
2. Click "Add Event"
3. Fill required fields:
   - Event Order: 1
   - Event Name: "Ceremony"
   - Event Type: ceremony
   - Date: (wedding date)
   - Start Time: 14:00
   - End Time: 15:00
   - Location: "Main Chapel"
4. Submit form
5. Verify event appears in timeline

### Step 4: Verify Duration Calculation

Create event with:
- Start Time: 14:00
- End Time: 17:30

Expected duration: 3.5 hours (displayed as "3h 30m")

### Step 5: Verify Color Coding

Create events with orders 1-7, verify each has unique color:
1. Pink (#E8B4B8)
2. Cream (#F5E6D3)
3. Sage (#C9D4C5)
4. Lavender (#E5D4EF)
5. Peach (#FFE5CC)
6. Blue (#D4E5F7)
7. Rose (#F7D4E5)

### Step 6: Verify Unique Order Constraint

1. Create event with order 1
2. Try to create another event with order 1
3. Should see error: "Event order 1 is already used"

### Step 7: Verify Time Validation

1. Set start time: 15:00
2. Set end time: 14:00
3. Should see error: "End time must be after start time"

## File Checklist

After implementation, verify these files exist:

```
src/
├── components/events/
│   ├── EventCard.tsx         ✓
│   ├── EventForm.tsx         ✓
│   ├── EventTimeline.tsx     ✓
│   ├── DeleteEventDialog.tsx ✓
│   ├── DurationDisplay.tsx   ✓
│   └── EmptyEventsState.tsx  ✓
├── hooks/
│   └── useEvents.ts          ✓
├── pages/
│   ├── EventTimelinePage.tsx ✓
│   ├── CreateEventPage.tsx   ✓
│   └── EditEventPage.tsx     ✓
├── schemas/
│   └── event.ts              ✓
└── types/
    └── event.ts              ✓
```

## Common Issues & Solutions

### Issue: "Permission denied for table events"

**Cause**: RLS policy not applied or user not authenticated
**Solution**: Verify RLS policies exist and TEMP_USER_ID matches a user in public.users

### Issue: Duration shows as null

**Cause**: Generated column not calculating
**Solution**: Verify the trigger exists:
```sql
SELECT * FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'duration_hours';
```

### Issue: Duplicate key violation on event_order

**Cause**: Race condition or validation bypass
**Solution**: This is expected - show user-friendly error and suggest different order

### Issue: Timeline not showing events

**Cause**: Query not filtering by wedding_id correctly
**Solution**: Verify useEvents hook passes correct weddingId from route params
