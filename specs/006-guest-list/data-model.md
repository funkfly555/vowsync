# Data Model: Guest List Page

**Feature**: 006-guest-list
**Date**: 2026-01-14

## Entity Overview

This feature uses two existing database tables with no schema modifications required.

| Entity | Table | Purpose |
|--------|-------|---------|
| Guest | `guests` | Wedding guest records |
| Guest Event Attendance | `guest_event_attendance` | Junction table linking guests to events |

---

## Entity: Guest

### Database Schema (Existing)

```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  guest_type TEXT DEFAULT 'adult' CHECK (guest_type IN ('adult', 'child', 'vendor', 'staff')),

  -- Invitation
  invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'invited', 'confirmed', 'declined')),
  attendance_confirmed BOOLEAN DEFAULT FALSE,

  -- RSVP Tracking
  rsvp_deadline DATE,
  rsvp_received_date DATE,
  rsvp_method TEXT CHECK (rsvp_method IN ('email', 'phone', 'in_person', 'online', null)),
  rsvp_notes TEXT,
  last_reminder_sent_date DATE,

  -- Plus One
  has_plus_one BOOLEAN DEFAULT FALSE,
  plus_one_name TEXT,
  plus_one_confirmed BOOLEAN DEFAULT FALSE,

  -- Seating
  table_number TEXT,
  table_position INTEGER,

  -- Dietary
  dietary_restrictions TEXT,
  allergies TEXT,
  dietary_notes TEXT,

  -- Meal Selection
  starter_choice INTEGER CHECK (starter_choice BETWEEN 1 AND 5),
  main_choice INTEGER CHECK (main_choice BETWEEN 1 AND 5),
  dessert_choice INTEGER CHECK (dessert_choice BETWEEN 1 AND 5),

  -- Contact
  email TEXT,
  phone TEXT,
  email_valid BOOLEAN DEFAULT TRUE,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fields Used by Guest List Page

| Field | Type | Display | Notes |
|-------|------|---------|-------|
| `id` | UUID | - | Row identification, selection tracking |
| `wedding_id` | UUID | - | Filter key |
| `name` | TEXT | Name column | Primary display, sortable A-Z |
| `guest_type` | TEXT | Type column | Badge display |
| `rsvp_deadline` | DATE | - | Used for status calculation |
| `rsvp_received_date` | DATE | - | Used for status calculation |
| `table_number` | TEXT | Table column | Display or "-" if null |

### Calculated Field: RSVP Status

```typescript
// Not stored in database - calculated at display time
type RsvpStatus = 'yes' | 'overdue' | 'pending';

function calculateRsvpStatus(guest: Guest): RsvpStatus {
  if (guest.rsvp_received_date) return 'yes';
  if (guest.rsvp_deadline && new Date(guest.rsvp_deadline) < new Date()) return 'overdue';
  return 'pending';
}
```

### Validation Rules

| Rule | Implementation |
|------|----------------|
| Name required | Zod: `z.string().min(1)` |
| Guest type valid | Zod: `z.enum(['adult', 'child', 'vendor', 'staff'])` |
| Dates valid format | Zod: `z.string().date().nullable()` |

---

## Entity: Guest Event Attendance

### Database Schema (Existing)

```sql
CREATE TABLE guest_event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  attending BOOLEAN DEFAULT FALSE,
  shuttle_to_event TEXT,
  shuttle_from_event TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(guest_id, event_id)
);
```

### Fields Used by Guest List Page

| Field | Type | Purpose |
|-------|------|---------|
| `guest_id` | UUID | Join key |
| `event_id` | UUID | Filter by event |
| `attending` | BOOLEAN | Filter condition |

### Query Pattern for Event Filter

```typescript
// Fetching guests attending a specific event
const { data } = await supabase
  .from('guests')
  .select(`
    *,
    guest_event_attendance!inner(event_id, attending)
  `)
  .eq('wedding_id', weddingId)
  .eq('guest_event_attendance.event_id', eventId)
  .eq('guest_event_attendance.attending', true);
```

---

## TypeScript Types

### Guest Type

```typescript
export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  guest_type: GuestType;
  invitation_status: InvitationStatus;
  attendance_confirmed: boolean;
  rsvp_deadline: string | null;
  rsvp_received_date: string | null;
  rsvp_method: RsvpMethod | null;
  rsvp_notes: string | null;
  last_reminder_sent_date: string | null;
  has_plus_one: boolean;
  plus_one_name: string | null;
  plus_one_confirmed: boolean;
  table_number: string | null;
  table_position: number | null;
  dietary_restrictions: string | null;
  allergies: string | null;
  dietary_notes: string | null;
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;
  email: string | null;
  phone: string | null;
  email_valid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type GuestType = 'adult' | 'child' | 'vendor' | 'staff';

export type InvitationStatus = 'pending' | 'invited' | 'confirmed' | 'declined';

export type RsvpMethod = 'email' | 'phone' | 'in_person' | 'online';

export type RsvpStatus = 'yes' | 'overdue' | 'pending';
```

### Display Types

```typescript
// Simplified type for list display
export interface GuestListItem {
  id: string;
  name: string;
  guest_type: GuestType;
  rsvp_deadline: string | null;
  rsvp_received_date: string | null;
  table_number: string | null;
}

// Pagination response
export interface GuestListResponse {
  guests: GuestListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// Filter state
export interface GuestFilters {
  search: string;
  type: GuestType | 'all';
  rsvpStatus: RsvpStatus | 'all';
  eventId: string | null;
}
```

---

## Relationships

```
weddings
    |
    |-- 1:N --> guests
    |              |
    |              |-- N:M --> events (via guest_event_attendance)
    |
    |-- 1:N --> events
```

### Relationship Notes

1. **Wedding to Guests**: One wedding has many guests (1:N)
2. **Guest to Events**: Many guests can attend many events (N:M via junction table)
3. **Cascade Delete**: Deleting a wedding cascades to delete all guests
4. **Cascade Delete**: Deleting a guest cascades to delete attendance records

---

## Indexes (Existing)

```sql
CREATE INDEX idx_guests_wedding ON guests(wedding_id);
CREATE INDEX idx_guests_type ON guests(guest_type);
CREATE INDEX idx_guests_rsvp_deadline ON guests(rsvp_deadline);
CREATE INDEX idx_guests_name ON guests(name);
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guest_event_guest ON guest_event_attendance(guest_id);
CREATE INDEX idx_guest_event_event ON guest_event_attendance(event_id);
CREATE INDEX idx_guest_event_attending ON guest_event_attendance(attending);
```

---

## RLS Policies (Existing)

```sql
-- Guests viewable by wedding owner
CREATE POLICY "Users can view guests of their weddings"
  ON guests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = guests.wedding_id
      AND (weddings.consultant_id = auth.uid() OR
           EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
    )
  );
```

---

## State Transitions

### RSVP Status State Machine

```
                    ┌─────────────────────┐
                    │      PENDING        │
                    │  (default state)    │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   │
┌──────────────────┐ ┌──────────────────┐         │
│      YES         │ │     OVERDUE      │         │
│ (rsvp_received   │ │ (deadline passed │         │
│   date set)      │ │  no response)    │─────────┘
└──────────────────┘ └──────────────────┘   (can still
                              │              receive RSVP)
                              │
                              ▼
                    ┌──────────────────┐
                    │       YES        │
                    │  (late response) │
                    └──────────────────┘
```

### Status Calculation Logic

```typescript
function calculateRsvpStatus(
  rsvpReceivedDate: string | null,
  rsvpDeadline: string | null
): RsvpStatus {
  // Yes takes priority - they responded
  if (rsvpReceivedDate) return 'yes';

  // Check if deadline has passed
  if (rsvpDeadline) {
    const deadline = new Date(rsvpDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadline < today) return 'overdue';
  }

  // Default: waiting for response
  return 'pending';
}
```

---

## No Schema Changes Required

This feature is read-only and uses existing database tables. No migrations are needed.

| Requirement | Database Support |
|-------------|------------------|
| List guests | `guests` table exists |
| Filter by type | `guest_type` column indexed |
| Filter by event | `guest_event_attendance` table exists |
| Sort by name | `name` column indexed |
| Pagination | Supabase `.range()` supported |
| RSVP status | `rsvp_deadline`, `rsvp_received_date` columns exist |
| Table assignment | `table_number` column exists |
