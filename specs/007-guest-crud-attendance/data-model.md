# Data Model: Guest CRUD & Event Attendance

**Feature**: 007-guest-crud-attendance
**Date**: 2026-01-14

## Entity Definitions

### Guest (existing table - no changes)

The `guests` table was created in Phase 1 and contains all necessary fields.

```typescript
interface Guest {
  // Identity
  id: string;                    // UUID, primary key
  wedding_id: string;            // UUID, foreign key to weddings

  // Basic Info
  name: string;                  // Required, guest full name
  guest_type: GuestType;         // 'adult' | 'child' | 'vendor' | 'staff'
  email: string | null;          // Optional, validated format
  phone: string | null;          // Optional

  // Invitation & RSVP
  invitation_status: InvitationStatus;  // 'pending' | 'invited' | 'confirmed' | 'declined'
  attendance_confirmed: boolean;         // Direct confirmation flag
  rsvp_deadline: string | null;          // ISO date string
  rsvp_received_date: string | null;     // ISO date string
  rsvp_method: RsvpMethod | null;        // 'email' | 'phone' | 'in_person' | 'online'
  rsvp_notes: string | null;
  last_reminder_sent_date: string | null;

  // Plus One
  has_plus_one: boolean;
  plus_one_name: string | null;
  plus_one_confirmed: boolean;

  // Seating
  table_number: string | null;   // e.g., "1", "2", ... "20"
  table_position: number | null; // Position at table (future use)

  // Dietary
  dietary_restrictions: string | null;
  allergies: string | null;
  dietary_notes: string | null;

  // Meal Choices
  starter_choice: number | null;  // 1-5
  main_choice: number | null;     // 1-5
  dessert_choice: number | null;  // 1-5

  // Meta
  email_valid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

type GuestType = 'adult' | 'child' | 'vendor' | 'staff';
type InvitationStatus = 'pending' | 'invited' | 'confirmed' | 'declined';
type RsvpMethod = 'email' | 'phone' | 'in_person' | 'online';
```

### GuestEventAttendance (existing table - no changes)

Junction table linking guests to events with attendance details.

```typescript
interface GuestEventAttendance {
  id: string;           // UUID, primary key
  guest_id: string;     // UUID, foreign key to guests
  event_id: string;     // UUID, foreign key to events
  attending: boolean;   // Whether guest is attending this event
  shuttle_to: string | null;    // Shuttle pickup location
  shuttle_from: string | null;  // Shuttle dropoff location
  created_at: string;
  updated_at: string;
}
```

**Constraints**:
- Unique constraint on (guest_id, event_id)
- Cascade delete when guest is deleted
- Foreign key to events table

### Event (existing - reference only)

```typescript
interface Event {
  id: string;
  wedding_id: string;
  event_name: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_order: number;
  // ... other fields
}
```

## Form Data Types

### GuestFormData (new)

Form submission type for create/update operations:

```typescript
interface GuestFormData {
  // Basic Info Tab
  name: string;                           // Required
  guest_type: GuestType;                  // Required, default 'adult'
  email: string;                          // Optional, validated if present
  phone: string;                          // Optional
  invitation_status: InvitationStatus;    // Default 'pending'
  attendance_confirmed: boolean;          // Default false

  // RSVP Tab
  rsvp_deadline: Date | null;
  rsvp_received_date: Date | null;
  rsvp_method: RsvpMethod | null;
  rsvp_notes: string;
  has_plus_one: boolean;
  plus_one_name: string;
  plus_one_confirmed: boolean;

  // Dietary Tab
  dietary_restrictions: string;
  allergies: string;
  dietary_notes: string;

  // Meal Tab
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;

  // Events Tab (handled separately)
  event_attendance: EventAttendanceFormData[];
}

interface EventAttendanceFormData {
  event_id: string;
  attending: boolean;
  shuttle_to: string;
  shuttle_from: string;
}
```

### AttendanceMatrixData (new)

Data structure for the attendance matrix view:

```typescript
interface AttendanceMatrixData {
  guests: AttendanceMatrixGuest[];
  events: AttendanceMatrixEvent[];
}

interface AttendanceMatrixGuest {
  id: string;
  name: string;
  guest_type: GuestType;
  attendance: Record<string, AttendanceRecord>; // eventId -> record
}

interface AttendanceMatrixEvent {
  id: string;
  event_name: string;
  event_order: number;
}

interface AttendanceRecord {
  attending: boolean;
  shuttle_to: string;
  shuttle_from: string;
}

// For batch save operation
interface AttendanceUpdatePayload {
  guest_id: string;
  event_id: string;
  attending: boolean;
  shuttle_to: string | null;
  shuttle_from: string | null;
}
```

## Calculated Fields

### RsvpStatus (calculated, not stored)

```typescript
type RsvpStatus = 'yes' | 'overdue' | 'pending';

function calculateRsvpStatus(
  rsvpReceivedDate: string | null,
  rsvpDeadline: string | null
): RsvpStatus {
  // If RSVP received, status is "yes" (confirmed)
  if (rsvpReceivedDate) {
    return 'yes';
  }

  // If deadline exists and is past, status is "overdue"
  if (rsvpDeadline) {
    const deadline = new Date(rsvpDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadline < today) {
      return 'overdue';
    }
  }

  // Otherwise, status is "pending"
  return 'pending';
}
```

## Data Transformations

### Guest to GuestFormData

```typescript
function guestToFormData(guest: Guest): GuestFormData {
  return {
    name: guest.name,
    guest_type: guest.guest_type,
    email: guest.email ?? '',
    phone: guest.phone ?? '',
    invitation_status: guest.invitation_status,
    attendance_confirmed: guest.attendance_confirmed,
    rsvp_deadline: guest.rsvp_deadline ? new Date(guest.rsvp_deadline) : null,
    rsvp_received_date: guest.rsvp_received_date ? new Date(guest.rsvp_received_date) : null,
    rsvp_method: guest.rsvp_method,
    rsvp_notes: guest.rsvp_notes ?? '',
    has_plus_one: guest.has_plus_one,
    plus_one_name: guest.plus_one_name ?? '',
    plus_one_confirmed: guest.plus_one_confirmed,
    dietary_restrictions: guest.dietary_restrictions ?? '',
    allergies: guest.allergies ?? '',
    dietary_notes: guest.dietary_notes ?? '',
    starter_choice: guest.starter_choice,
    main_choice: guest.main_choice,
    dessert_choice: guest.dessert_choice,
    event_attendance: [], // Loaded separately
  };
}
```

### GuestFormData to Database Payload

```typescript
function formDataToPayload(
  formData: GuestFormData,
  weddingId: string
): Omit<Guest, 'id' | 'created_at' | 'updated_at'> {
  return {
    wedding_id: weddingId,
    name: formData.name.trim(),
    guest_type: formData.guest_type,
    email: formData.email.trim() || null,
    phone: formData.phone.trim() || null,
    invitation_status: formData.invitation_status,
    attendance_confirmed: formData.attendance_confirmed,
    rsvp_deadline: formData.rsvp_deadline?.toISOString().split('T')[0] ?? null,
    rsvp_received_date: formData.rsvp_received_date?.toISOString().split('T')[0] ?? null,
    rsvp_method: formData.rsvp_received_date ? formData.rsvp_method : null,
    rsvp_notes: formData.rsvp_notes.trim() || null,
    last_reminder_sent_date: null, // Not editable in form
    has_plus_one: formData.has_plus_one,
    plus_one_name: formData.has_plus_one ? formData.plus_one_name.trim() || null : null,
    plus_one_confirmed: formData.has_plus_one ? formData.plus_one_confirmed : false,
    table_number: null, // Set via bulk action, not form
    table_position: null,
    dietary_restrictions: formData.dietary_restrictions.trim() || null,
    allergies: formData.allergies.trim() || null,
    dietary_notes: formData.dietary_notes.trim() || null,
    starter_choice: formData.starter_choice,
    main_choice: formData.main_choice,
    dessert_choice: formData.dessert_choice,
    email_valid: formData.email ? isValidEmail(formData.email) : true,
    notes: null, // Not included in form
  };
}
```

## Validation Rules

### Guest Form Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| name | Required, min 1 char | "Name is required" |
| email | Valid email format if present | "Invalid email format" |
| guest_type | Must be valid enum | "Type is required" |
| rsvp_method | Required if rsvp_received_date set | "Method required when RSVP received" |
| plus_one_name | Required if has_plus_one | "Plus one name required" |
| starter_choice | 1-5 if present | "Invalid option" |
| main_choice | 1-5 if present | "Invalid option" |
| dessert_choice | 1-5 if present | "Invalid option" |

### Business Rules

1. **RSVP Method Conditional**: `rsvp_method` can only be set when `rsvp_received_date` has a value
2. **Plus One Conditional**: `plus_one_name` and `plus_one_confirmed` only relevant when `has_plus_one` is true
3. **Duplicate Names Allowed**: Multiple guests can have the same name (families)
4. **Cascade Delete**: Deleting a guest removes all their event attendance records

## Export Format

### CSV Column Mapping

| CSV Column | Source | Format |
|------------|--------|--------|
| Name | guest.name | String |
| Email | guest.email | String or empty |
| Phone | guest.phone | String or empty |
| Type | guest.guest_type | Capitalized (Adult, Child, etc.) |
| RSVP Status | calculateRsvpStatus() | Yes, Pending, Overdue |
| Table | guest.table_number | String or empty |
| Dietary | guest.dietary_restrictions | String or empty |
| Allergies | guest.allergies | String or empty |

### Filename Format

```
guests_export_YYYY-MM-DD_HH-mm-ss.csv
```

Example: `guests_export_2026-01-14_14-30-45.csv`
