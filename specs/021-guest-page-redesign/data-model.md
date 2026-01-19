# Data Model: Guest Page Redesign

**Feature**: 021-guest-page-redesign
**Date**: 2026-01-18
**Status**: Complete

## Overview

This feature is a **UI redesign only** - no database schema changes required. All entities already exist in the database. This document describes the data structures used by the new UI components.

---

## Existing Database Entities

### Guest Entity (guests table)

**Source**: 03-DATABASE-SCHEMA.md lines 149-195

```typescript
interface Guest {
  // Identity
  id: string;                           // UUID primary key
  wedding_id: string;                   // FK to weddings

  // Basic Info
  name: string;                         // Required
  email: string | null;
  phone: string | null;
  email_valid: boolean;
  guest_type: 'adult' | 'child' | 'vendor' | 'staff';
  notes: string | null;

  // Invitation & RSVP
  invitation_status: 'pending' | 'invited' | 'confirmed' | 'declined';
  rsvp_deadline: string | null;         // ISO date
  rsvp_received_date: string | null;    // ISO date
  rsvp_method: 'email' | 'phone' | 'in_person' | 'online' | null;
  rsvp_notes: string | null;
  last_reminder_sent_date: string | null;

  // Plus One
  has_plus_one: boolean;
  plus_one_name: string | null;
  plus_one_confirmed: boolean;

  // Seating
  table_number: string | null;
  table_position: number | null;        // 1-10 seat position

  // Dietary
  dietary_restrictions: string | null;
  allergies: string | null;
  dietary_notes: string | null;

  // Meals
  starter_choice: number | null;        // 1-5
  main_choice: number | null;           // 1-5
  dessert_choice: number | null;        // 1-5

  // Timestamps
  created_at: string;
  updated_at: string;

  // Legacy (Phase 17 - redundant)
  attendance_confirmed: boolean;        // Use invitation_status instead
}
```

### Guest Event Attendance Entity (guest_event_attendance table)

**Source**: 03-DATABASE-SCHEMA.md lines 207-221

```typescript
interface GuestEventAttendance {
  id: string;                           // UUID primary key
  guest_id: string;                     // FK to guests
  event_id: string;                     // FK to events
  attending: boolean;
  shuttle_to_event: string | null;
  shuttle_from_event: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## UI State Models (New)

### Expanded Cards State

```typescript
// Track which cards are expanded
type ExpandedCardsState = Set<string>;  // Set of guest IDs

// Usage
const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
```

### Selected Guests State

```typescript
// Track which guests are selected for bulk actions
type SelectedGuestsState = Set<string>; // Set of guest IDs

// Usage
const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
```

### Active Tab State

```typescript
// Track active tab per expanded card
type ActiveTabsState = Record<string, TabName>;

type TabName = 'basic' | 'rsvp' | 'seating' | 'dietary' | 'meals';

// Usage
const [activeTabs, setActiveTabs] = useState<Record<string, TabName>>({});
```

### Filter State

```typescript
interface GuestFiltersState {
  search: string;                       // Name search query
  type: GuestType | 'all';              // Guest type filter
  invitationStatus: InvitationStatus | 'all';
  tableNumber: string | 'all' | 'none'; // 'none' = unassigned
  eventId: string | null;               // Filter by event attendance
}
```

---

## Display Models

### Guest Card Display Item

Extends Guest with computed/joined data for display:

```typescript
interface GuestCardDisplayItem extends Guest {
  // Joined data
  eventAttendance: GuestEventAttendance[];

  // Computed for display
  attendingEventsCount: number;
  totalEventsCount: number;
}
```

### Guest Count Summary

```typescript
interface GuestCountSummary {
  primaryGuests: number;
  plusOnes: number;
  total: number;
}

// Example: "6 guests + 2 plus ones = 8 total"
```

### Table Seating Display

```typescript
interface TableSeatingDisplay {
  tableNumber: string;
  seats: (TableSeat | null)[];          // Array of 10 positions (0-9)
}

interface TableSeat {
  position: number;                     // 1-10
  guestId: string;
  guestName: string;
  isPlusOne: boolean;
}
```

---

## Form Data Models

### Guest Edit Form Data

Used by React Hook Form in expanded card tabs:

```typescript
interface GuestEditFormData {
  // Basic Info Tab
  name: string;
  email: string;
  phone: string;
  guest_type: GuestType;
  invitation_status: InvitationStatus;

  // Plus One (Basic Info Tab)
  has_plus_one: boolean;
  plus_one_name: string;
  plus_one_confirmed: boolean;

  // RSVP Tab
  rsvp_deadline: Date | null;
  rsvp_received_date: Date | null;
  rsvp_method: RsvpMethod | null;
  rsvp_notes: string;

  // Seating Tab
  table_number: string;
  table_position: number | null;

  // Dietary Tab
  dietary_restrictions: string;
  allergies: string;
  dietary_notes: string;

  // Meals Tab
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;
}
```

### Bulk Table Assignment

```typescript
interface BulkTableAssignmentData {
  guestIds: string[];
  tableNumber: string;
}
```

---

## Validation Rules

### Guest Edit Validation (Zod)

```typescript
const guestEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  guest_type: z.enum(['adult', 'child', 'vendor', 'staff']),
  invitation_status: z.enum(['pending', 'invited', 'confirmed', 'declined']),
  has_plus_one: z.boolean(),
  plus_one_name: z.string().optional(),
  plus_one_confirmed: z.boolean().optional(),
  rsvp_deadline: z.date().nullable(),
  rsvp_received_date: z.date().nullable(),
  rsvp_method: z.enum(['email', 'phone', 'in_person', 'online']).nullable(),
  rsvp_notes: z.string().optional(),
  table_number: z.string().optional(),
  table_position: z.number().min(1).max(10).nullable(),
  dietary_restrictions: z.string().optional(),
  allergies: z.string().optional(),
  dietary_notes: z.string().optional(),
  starter_choice: z.number().min(1).max(5).nullable(),
  main_choice: z.number().min(1).max(5).nullable(),
  dessert_choice: z.number().min(1).max(5).nullable(),
});
```

### Plus One Conditional Validation

```typescript
// Plus one name required when has_plus_one is true
const guestEditSchemaWithPlusOne = guestEditSchema.refine(
  (data) => !data.has_plus_one || (data.plus_one_name && data.plus_one_name.length > 0),
  {
    message: 'Plus one name is required when plus one is enabled',
    path: ['plus_one_name'],
  }
);
```

---

## Data Flow

### Load Guests

```
1. Page mount
2. useGuests(weddingId) fetches guests with event_attendance
3. Transform to GuestCardDisplayItem[]
4. Render GuestCard for each item
```

### Edit Guest (Tab Form)

```
1. User expands card → form populated with guest data
2. User edits fields in any tab
3. User clicks Save
4. useGuestMutations.update(guestId, formData)
5. TanStack Query invalidates cache
6. Card collapses or form resets with new data
```

### Bulk Table Assignment

```
1. User selects multiple guests via checkboxes
2. User clicks "Assign Table" in BulkActionsBar
3. TableAssignModal opens with selected count
4. User enters table number
5. useBulkGuestActions.assignTable(guestIds, tableNumber)
6. Update all guests in single Supabase query
7. Close modal, clear selection, invalidate cache
```

---

## Entity Relationships

```
┌─────────────┐      ┌─────────────────────────┐      ┌────────┐
│   Wedding   │──1:N─│         Guest           │──N:M─│ Event  │
└─────────────┘      └─────────────────────────┘      └────────┘
                              │
                              │ (via guest_event_attendance)
                              │
                     ┌────────┴────────┐
                     │ GuestEventAtten │
                     │    dance        │
                     └─────────────────┘
```

---

## Notes

1. **No Schema Changes**: All data models exist. This is a UI-only redesign.
2. **Plus One Limitation**: Plus One data is stored in guest record fields, not as separate entity. This limits Plus One to basic info only (name, confirmed status). Full Plus One seating/dietary/meals would require schema migration (out of scope).
3. **Existing Types**: Use existing `Guest` and `GuestEventAttendance` types from `src/types/guest.ts`.
4. **Form Dates**: React Hook Form uses `Date` objects; convert to ISO strings for Supabase.
