# Data Model: Guest Management Enhancement & Menu Configuration

**Feature**: 024-guest-menu-management
**Date**: 2026-01-20
**Status**: Final

---

## Entity Overview

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    weddings     │       │     events      │       │     guests      │
│─────────────────│       │─────────────────│       │─────────────────│
│ id (PK)         │◄──────│ wedding_id (FK) │       │ id (PK)         │
│ consultant_id   │       │ id (PK)         │◄──┐   │ wedding_id (FK) │
│ ...             │       │ event_name      │   │   │ name            │
└────────┬────────┘       │ event_date      │   │   │ starter_choice  │
         │                │ ...             │   │   │ main_choice     │
         │                └─────────────────┘   │   │ dessert_choice  │
         │                                      │   │ plus_one_*      │
         ▼                                      │   └────────┬────────┘
┌─────────────────┐                             │            │
│  meal_options   │                             │            │
│─────────────────│                             │            ▼
│ id (PK)         │                             │   ┌─────────────────────────┐
│ wedding_id (FK) │                             │   │ guest_event_attendance  │
│ course_type     │                             │   │─────────────────────────│
│ option_number   │                             └───│ event_id (FK)           │
│ meal_name       │                                 │ guest_id (FK)           │
│ description     │                                 │ attending               │
│ dietary_info    │                                 │ plus_one_attending      │
│ is_active       │                                 │ shuttle_*               │
└─────────────────┘                                 └─────────────────────────┘
```

---

## New Table: meal_options

**Purpose**: Store configurable meal options for each wedding (5 options per course)

### Schema

```sql
CREATE TABLE meal_options (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,

  -- Core Fields
  course_type TEXT NOT NULL CHECK (course_type IN ('starter', 'main', 'dessert')),
  option_number INTEGER NOT NULL CHECK (option_number BETWEEN 1 AND 5),
  meal_name TEXT NOT NULL,
  description TEXT,
  dietary_info TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(wedding_id, course_type, option_number)
);

-- Indexes
CREATE INDEX idx_meal_options_wedding ON meal_options(wedding_id);
CREATE INDEX idx_meal_options_course ON meal_options(course_type);
```

### Field Details

| Field | Type | Nullable | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| id | UUID | No | gen_random_uuid() | PK | Unique identifier |
| wedding_id | UUID | No | - | FK → weddings | Parent wedding |
| course_type | TEXT | No | - | CHECK IN ('starter', 'main', 'dessert') | Course category |
| option_number | INTEGER | No | - | CHECK 1-5 | Option slot (1-5) |
| meal_name | TEXT | No | - | - | Display name for meal |
| description | TEXT | Yes | NULL | - | Detailed description |
| dietary_info | TEXT | Yes | NULL | - | Dietary tags (e.g., "Vegetarian", "Contains nuts") |
| is_active | BOOLEAN | No | true | - | Soft delete flag |
| created_at | TIMESTAMPTZ | No | NOW() | - | Creation timestamp |
| updated_at | TIMESTAMPTZ | No | NOW() | - | Last update timestamp |

### Relationships

- **Parent**: weddings (1:N) - ON DELETE CASCADE
- **Referenced by**: guests table via option_number lookup

### RLS Policies

```sql
-- SELECT: View meal options for own weddings
CREATE POLICY "Users can view meal options for their weddings"
  ON meal_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = meal_options.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

-- INSERT: Create meal options for own weddings
CREATE POLICY "Users can create meal options for their weddings"
  ON meal_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = meal_options.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

-- UPDATE: Update meal options for own weddings
CREATE POLICY "Users can update meal options for their weddings"
  ON meal_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = meal_options.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

-- DELETE: Delete meal options for own weddings
CREATE POLICY "Users can delete meal options for their weddings"
  ON meal_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = meal_options.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );
```

---

## Modified Table: guests

**Changes**: Add plus one meal selection columns

### New Columns

```sql
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS plus_one_starter_choice INTEGER
    CHECK (plus_one_starter_choice IS NULL OR plus_one_starter_choice BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS plus_one_main_choice INTEGER
    CHECK (plus_one_main_choice IS NULL OR plus_one_main_choice BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS plus_one_dessert_choice INTEGER
    CHECK (plus_one_dessert_choice IS NULL OR plus_one_dessert_choice BETWEEN 1 AND 5);
```

### Updated Field Catalog

| Field | Type | Nullable | Constraints | Description |
|-------|------|----------|-------------|-------------|
| plus_one_starter_choice | INTEGER | Yes | CHECK 1-5 | Plus one's starter selection |
| plus_one_main_choice | INTEGER | Yes | CHECK 1-5 | Plus one's main course selection |
| plus_one_dessert_choice | INTEGER | Yes | CHECK 1-5 | Plus one's dessert selection |

### Business Rules

- Plus one meal fields should only be populated when `has_plus_one = true`
- Values 1-5 correspond to `meal_options.option_number` for the same wedding
- NULL indicates no selection made

---

## Modified Table: guest_event_attendance

**Changes**: Add plus one attendance and shuttle booking fields

### New Columns

```sql
ALTER TABLE guest_event_attendance
  -- Plus one attendance
  ADD COLUMN IF NOT EXISTS plus_one_attending BOOLEAN DEFAULT false,

  -- Primary guest shuttle details
  ADD COLUMN IF NOT EXISTS shuttle_to_event_time TIME,
  ADD COLUMN IF NOT EXISTS shuttle_to_event_pickup_location TEXT,
  ADD COLUMN IF NOT EXISTS shuttle_from_event_time TIME,
  ADD COLUMN IF NOT EXISTS shuttle_from_event_pickup_location TEXT,

  -- Plus one shuttle details
  ADD COLUMN IF NOT EXISTS plus_one_shuttle_to_event_time TIME,
  ADD COLUMN IF NOT EXISTS plus_one_shuttle_to_event_pickup_location TEXT,
  ADD COLUMN IF NOT EXISTS plus_one_shuttle_from_event_time TIME,
  ADD COLUMN IF NOT EXISTS plus_one_shuttle_from_event_pickup_location TEXT;
```

### Updated Field Catalog

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| plus_one_attending | BOOLEAN | No | false | Plus one attending this event |
| shuttle_to_event_time | TIME | Yes | NULL | Pickup time for shuttle to event |
| shuttle_to_event_pickup_location | TEXT | Yes | NULL | Pickup location for shuttle to event |
| shuttle_from_event_time | TIME | Yes | NULL | Departure time for shuttle from event |
| shuttle_from_event_pickup_location | TEXT | Yes | NULL | Pickup location for shuttle from event |
| plus_one_shuttle_to_event_time | TIME | Yes | NULL | Plus one pickup time to event |
| plus_one_shuttle_to_event_pickup_location | TEXT | Yes | NULL | Plus one pickup location to event |
| plus_one_shuttle_from_event_time | TIME | Yes | NULL | Plus one departure time from event |
| plus_one_shuttle_from_event_pickup_location | TEXT | Yes | NULL | Plus one pickup location from event |

### Business Rules

- `plus_one_attending` should only be true when parent guest's `has_plus_one = true`
- Plus one shuttle fields should only be populated when `plus_one_attending = true`
- Shuttle times should be logical (pickup before event start, departure after event)

---

## TypeScript Interfaces

### MealOption

```typescript
export interface MealOption {
  id: string;
  wedding_id: string;
  course_type: 'starter' | 'main' | 'dessert';
  option_number: number; // 1-5
  meal_name: string;
  description: string | null;
  dietary_info: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CourseType = 'starter' | 'main' | 'dessert';

export interface MealOptionInput {
  wedding_id: string;
  course_type: CourseType;
  option_number: number;
  meal_name: string;
  description?: string | null;
  dietary_info?: string | null;
}

export interface MealOptionsByWedding {
  starters: MealOption[];
  mains: MealOption[];
  desserts: MealOption[];
}
```

### Guest (Extended)

```typescript
export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  guest_type: 'adult' | 'child' | 'vendor' | 'staff';
  invitation_status: 'pending' | 'invited' | 'confirmed' | 'declined';
  email: string | null;
  phone: string | null;

  // Plus one
  has_plus_one: boolean;
  plus_one_name: string | null;
  plus_one_confirmed: boolean;

  // Seating
  table_number: string | null;

  // Dietary
  dietary_restrictions: string | null;
  allergies: string | null;

  // Primary guest meals
  starter_choice: number | null; // 1-5
  main_choice: number | null; // 1-5
  dessert_choice: number | null; // 1-5

  // Plus one meals (NEW)
  plus_one_starter_choice: number | null; // 1-5
  plus_one_main_choice: number | null; // 1-5
  plus_one_dessert_choice: number | null; // 1-5

  // Metadata
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestMealSelections {
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;
  plus_one_starter_choice: number | null;
  plus_one_main_choice: number | null;
  plus_one_dessert_choice: number | null;
}
```

### GuestEventAttendance (Extended)

```typescript
export interface GuestEventAttendance {
  id: string;
  guest_id: string;
  event_id: string;

  // Primary guest
  attending: boolean;

  // Plus one (NEW)
  plus_one_attending: boolean;

  // Primary guest shuttle (NEW)
  shuttle_to_event_time: string | null; // TIME as string "HH:MM:SS"
  shuttle_to_event_pickup_location: string | null;
  shuttle_from_event_time: string | null;
  shuttle_from_event_pickup_location: string | null;

  // Plus one shuttle (NEW)
  plus_one_shuttle_to_event_time: string | null;
  plus_one_shuttle_to_event_pickup_location: string | null;
  plus_one_shuttle_from_event_time: string | null;
  plus_one_shuttle_from_event_pickup_location: string | null;

  // Legacy fields (kept for backward compatibility)
  shuttle_to_event: string | null;
  shuttle_from_event: string | null;

  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestEventAttendanceWithEvent extends GuestEventAttendance {
  event: {
    id: string;
    event_name: string;
    event_date: string;
    event_start_time: string;
    event_end_time: string;
    event_location: string;
  };
}

export interface ShuttleBooking {
  shuttle_to_event_time: string | null;
  shuttle_to_event_pickup_location: string | null;
  shuttle_from_event_time: string | null;
  shuttle_from_event_pickup_location: string | null;
}

export interface PlusOneShuttleBooking {
  plus_one_shuttle_to_event_time: string | null;
  plus_one_shuttle_to_event_pickup_location: string | null;
  plus_one_shuttle_from_event_time: string | null;
  plus_one_shuttle_from_event_pickup_location: string | null;
}
```

---

## Validation Rules (Zod Schemas)

### MealOption Schema

```typescript
import { z } from 'zod';

export const courseTypeSchema = z.enum(['starter', 'main', 'dessert']);

export const mealOptionSchema = z.object({
  wedding_id: z.string().uuid(),
  course_type: courseTypeSchema,
  option_number: z.number().int().min(1).max(5),
  meal_name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  dietary_info: z.string().max(100).nullable().optional(),
});

export type MealOptionFormData = z.infer<typeof mealOptionSchema>;
```

### Guest Meal Selection Schema

```typescript
export const guestMealSelectionSchema = z.object({
  starter_choice: z.number().int().min(1).max(5).nullable(),
  main_choice: z.number().int().min(1).max(5).nullable(),
  dessert_choice: z.number().int().min(1).max(5).nullable(),
  plus_one_starter_choice: z.number().int().min(1).max(5).nullable(),
  plus_one_main_choice: z.number().int().min(1).max(5).nullable(),
  plus_one_dessert_choice: z.number().int().min(1).max(5).nullable(),
});
```

### Shuttle Booking Schema

```typescript
export const shuttleBookingSchema = z.object({
  shuttle_to_event_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
  shuttle_to_event_pickup_location: z.string().max(200).nullable(),
  shuttle_from_event_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
  shuttle_from_event_pickup_location: z.string().max(200).nullable(),
  plus_one_shuttle_to_event_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
  plus_one_shuttle_to_event_pickup_location: z.string().max(200).nullable(),
  plus_one_shuttle_from_event_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
  plus_one_shuttle_from_event_pickup_location: z.string().max(200).nullable(),
});
```

---

## State Transitions

### Meal Selection States

```
No Selection → Selected (1-5) → Changed (different 1-5) → Cleared (null)
                    ↓
            Option Removed (meal_options deleted)
                    ↓
            Display "Option Removed" in UI
```

### Guest Event Attendance States

```
Not Invited → Invited → Attending → Not Attending
                ↓
         Plus One Invited → Plus One Attending → Plus One Not Attending
```

### Shuttle Booking States

```
No Booking → Partial (time only) → Complete (time + location)
                                          ↓
                                    Updated → Cleared
```

---

## Query Patterns

### Fetch Meal Options for Wedding

```typescript
const { data: mealOptions } = await supabase
  .from('meal_options')
  .select('*')
  .eq('wedding_id', weddingId)
  .eq('is_active', true)
  .order('course_type')
  .order('option_number');
```

### Upsert Meal Option

```typescript
const { data, error } = await supabase
  .from('meal_options')
  .upsert({
    wedding_id: weddingId,
    course_type: 'main',
    option_number: 1,
    meal_name: 'Herb-Crusted Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce',
    dietary_info: 'Contains fish'
  }, {
    onConflict: 'wedding_id,course_type,option_number'
  });
```

### Fetch Guest with Event Attendance

```typescript
const { data: guest } = await supabase
  .from('guests')
  .select(`
    *,
    guest_event_attendance (
      *,
      event:events (
        id,
        event_name,
        event_date,
        event_start_time,
        event_location
      )
    )
  `)
  .eq('id', guestId)
  .single();
```

### Update Guest Meal Selections

```typescript
const { error } = await supabase
  .from('guests')
  .update({
    starter_choice: 2,
    main_choice: 1,
    dessert_choice: 3,
    plus_one_starter_choice: 1,
    plus_one_main_choice: 2,
    plus_one_dessert_choice: 3
  })
  .eq('id', guestId);
```

### Upsert Event Attendance with Shuttle

```typescript
const { error } = await supabase
  .from('guest_event_attendance')
  .upsert({
    guest_id: guestId,
    event_id: eventId,
    attending: true,
    plus_one_attending: true,
    shuttle_to_event_time: '17:00:00',
    shuttle_to_event_pickup_location: 'Hotel Lobby',
    shuttle_from_event_time: '23:00:00',
    shuttle_from_event_pickup_location: 'Venue Entrance'
  }, {
    onConflict: 'guest_id,event_id'
  });
```

### Aggregate Meal Counts

```typescript
const { data: mealCounts } = await supabase
  .rpc('get_meal_counts', { p_wedding_id: weddingId });

// Or with client-side aggregation:
const { data: guests } = await supabase
  .from('guests')
  .select('starter_choice, main_choice, dessert_choice, plus_one_starter_choice, plus_one_main_choice, plus_one_dessert_choice, has_plus_one')
  .eq('wedding_id', weddingId)
  .eq('invitation_status', 'confirmed');
```

---

## Migration Script

See `/specs/024-guest-menu-management/contracts/migration.sql` for the complete migration script.
