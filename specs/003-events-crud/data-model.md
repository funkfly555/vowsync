# Data Model: Events Management CRUD

**Feature**: 003-events-crud
**Date**: 2026-01-13

## Entity Definitions

### Event

Represents a scheduled activity within a wedding (ceremony, reception, etc.).

#### Database Table: `events` (Existing)

| Column | Type | Nullable | Constraints | Description |
|--------|------|----------|-------------|-------------|
| id | UUID | NO | PK, DEFAULT gen_random_uuid() | Unique identifier |
| wedding_id | UUID | NO | FK → weddings(id) ON DELETE CASCADE | Parent wedding |
| event_order | INTEGER | NO | CHECK (1-10), UNIQUE with wedding_id | Display order |
| event_name | TEXT | NO | - | Event name (e.g., "Ceremony") |
| event_type | TEXT | YES | CHECK (ceremony/reception/rehearsal_dinner/welcome_party/brunch/other) | Event category |
| event_date | DATE | NO | - | Date of event |
| event_start_time | TIME | NO | - | Start time |
| event_end_time | TIME | NO | - | End time |
| event_location | TEXT | NO | - | Venue/location name |
| expected_guests_adults | INTEGER | YES | DEFAULT 0 | Adult guest count |
| expected_guests_children | INTEGER | YES | DEFAULT 0 | Child guest count |
| duration_hours | NUMERIC | YES | GENERATED | Auto-calculated duration |
| notes | TEXT | YES | - | Additional notes |
| created_at | TIMESTAMPTZ | YES | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | YES | DEFAULT now() | Update timestamp |

#### TypeScript Interface

```typescript
// src/types/event.ts

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
  event_date: string; // ISO date string
  event_start_time: string; // HH:mm format
  event_end_time: string; // HH:mm format
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
  event_start_time: string; // HH:mm
  event_end_time: string; // HH:mm
  event_location: string;
  notes?: string;
}

export interface EventWithWedding extends Event {
  wedding: {
    id: string;
    bride_name: string;
    groom_name: string;
    wedding_date: string;
  };
}
```

## Validation Schema

```typescript
// src/schemas/event.ts
import { z } from 'zod';

export const EVENT_TYPES = [
  'ceremony',
  'reception',
  'rehearsal_dinner',
  'welcome_party',
  'brunch',
  'other',
] as const;

export const eventFormSchema = z.object({
  event_order: z
    .number({ required_error: 'Event order is required' })
    .min(1, 'Event order must be at least 1')
    .max(10, 'Event order cannot exceed 10'),
  event_name: z
    .string({ required_error: 'Event name is required' })
    .min(1, 'Event name is required')
    .max(100, 'Event name cannot exceed 100 characters'),
  event_type: z.enum(EVENT_TYPES, {
    required_error: 'Event type is required',
  }),
  event_date: z.date({
    required_error: 'Event date is required',
  }),
  event_start_time: z
    .string({ required_error: 'Start time is required' })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  event_end_time: z
    .string({ required_error: 'End time is required' })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  event_location: z
    .string({ required_error: 'Location is required' })
    .min(1, 'Location is required')
    .max(200, 'Location cannot exceed 200 characters'),
  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
}).refine(
  (data) => {
    const [startH, startM] = data.event_start_time.split(':').map(Number);
    const [endH, endM] = data.event_end_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return endMinutes > startMinutes;
  },
  {
    message: 'End time must be after start time',
    path: ['event_end_time'],
  }
);

export type EventFormValues = z.infer<typeof eventFormSchema>;
```

## Constants

```typescript
// src/lib/constants.ts (additions)

export const EVENT_TYPE_OPTIONS = [
  { value: 'ceremony', label: 'Ceremony' },
  { value: 'reception', label: 'Reception' },
  { value: 'rehearsal_dinner', label: 'Rehearsal Dinner' },
  { value: 'welcome_party', label: 'Welcome Party' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'other', label: 'Other' },
] as const;

export const EVENT_ORDER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `Event ${i + 1}`,
}));

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

## Utility Functions

```typescript
// src/lib/utils.ts (additions)

/**
 * Get the color for an event based on its order number
 * @param order Event order (1-10)
 * @returns Hex color code
 */
export function getEventColor(order: number): string {
  const colors = [
    '#E8B4B8', '#F5E6D3', '#C9D4C5', '#E5D4EF',
    '#FFE5CC', '#D4E5F7', '#F7D4E5',
  ];
  return colors[(order - 1) % colors.length];
}

/**
 * Calculate duration in hours from start and end time strings
 * @param startTime Start time in HH:mm format
 * @param endTime End time in HH:mm format
 * @returns Duration in hours (decimal)
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return (endMinutes - startMinutes) / 60;
}

/**
 * Format duration hours for display
 * @param hours Duration in hours (can be decimal)
 * @returns Formatted string like "3h 30m" or "2 hours"
 */
export function formatDuration(hours: number | null): string {
  if (hours === null || hours <= 0) return '0h';

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  if (wholeHours === 0) {
    return `${minutes}m`;
  }
  return `${wholeHours}h ${minutes}m`;
}

/**
 * Format time string for display
 * @param time Time in HH:mm format
 * @returns Formatted time like "2:00 PM"
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get total guest count for an event
 * @param event Event object
 * @returns Combined adult + children count
 */
export function getEventGuestCount(event: {
  expected_guests_adults: number;
  expected_guests_children: number;
}): number {
  return (event.expected_guests_adults || 0) + (event.expected_guests_children || 0);
}
```

## Relationships

```
Wedding (1) ──────< Event (many)
   │
   └── consultant_id links to auth.users

Event (1) ──────< GuestEventAttendance (many) [Future Phase 6]
```

## State Transitions

Events don't have explicit status tracking. The parent wedding's status affects the context of events:

| Wedding Status | Event Behavior |
|----------------|----------------|
| planning | Events fully editable |
| confirmed | Events editable with confirmation |
| completed | Events read-only (historical) |
| cancelled | Events read-only |

## Business Rules

1. **Order Uniqueness**: Each event_order (1-10) can only be used once per wedding
2. **Time Validation**: end_time must be after start_time
3. **Duration Calculation**: Automatically computed from time difference
4. **Date Warning**: Warning (non-blocking) if event_date differs from wedding_date by >7 days
5. **Cascade Delete**: Deleting an event removes associated guest attendance records
6. **Max Events**: A wedding can have maximum 10 events
