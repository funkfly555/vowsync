# Guest API Contracts

**Feature**: 021-guest-page-redesign
**Date**: 2026-01-18
**Status**: Complete

## Overview

This feature is a **UI redesign only** - no new API endpoints required. All data operations use existing Supabase client methods. This document describes the data contracts and query patterns for the new UI components.

---

## Existing Supabase Operations

### Fetch Guests with Event Attendance

**Query Pattern**:
```typescript
const { data, error } = await supabase
  .from('guests')
  .select(`
    *,
    guest_event_attendance (
      id,
      event_id,
      attending,
      shuttle_to_event,
      shuttle_from_event,
      notes
    )
  `)
  .eq('wedding_id', weddingId)
  .order('name', { ascending: true });
```

**Response Contract**:
```typescript
interface GuestWithAttendance {
  // All Guest fields from guests table
  id: string;
  wedding_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  email_valid: boolean;
  guest_type: 'adult' | 'child' | 'vendor' | 'staff';
  notes: string | null;
  invitation_status: 'pending' | 'invited' | 'confirmed' | 'declined';
  rsvp_deadline: string | null;
  rsvp_received_date: string | null;
  rsvp_method: 'email' | 'phone' | 'in_person' | 'online' | null;
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
  created_at: string;
  updated_at: string;
  attendance_confirmed: boolean; // Legacy field

  // Nested relation
  guest_event_attendance: GuestEventAttendance[];
}
```

---

### Update Guest (Single Field or Full Record)

**Mutation Pattern**:
```typescript
const { data, error } = await supabase
  .from('guests')
  .update({
    name: formData.name,
    email: formData.email || null,
    phone: formData.phone || null,
    guest_type: formData.guest_type,
    invitation_status: formData.invitation_status,
    has_plus_one: formData.has_plus_one,
    plus_one_name: formData.plus_one_name || null,
    plus_one_confirmed: formData.plus_one_confirmed || false,
    rsvp_deadline: formData.rsvp_deadline?.toISOString() || null,
    rsvp_received_date: formData.rsvp_received_date?.toISOString() || null,
    rsvp_method: formData.rsvp_method || null,
    rsvp_notes: formData.rsvp_notes || null,
    table_number: formData.table_number || null,
    table_position: formData.table_position || null,
    dietary_restrictions: formData.dietary_restrictions || null,
    allergies: formData.allergies || null,
    dietary_notes: formData.dietary_notes || null,
    starter_choice: formData.starter_choice || null,
    main_choice: formData.main_choice || null,
    dessert_choice: formData.dessert_choice || null,
  })
  .eq('id', guestId)
  .select()
  .single();
```

**Request Contract** (GuestEditFormData):
```typescript
interface GuestUpdateRequest {
  name: string;                              // Required
  email?: string | null;
  phone?: string | null;
  guest_type: 'adult' | 'child' | 'vendor' | 'staff';
  invitation_status: 'pending' | 'invited' | 'confirmed' | 'declined';
  has_plus_one: boolean;
  plus_one_name?: string | null;
  plus_one_confirmed?: boolean;
  rsvp_deadline?: string | null;             // ISO date string
  rsvp_received_date?: string | null;        // ISO date string
  rsvp_method?: 'email' | 'phone' | 'in_person' | 'online' | null;
  rsvp_notes?: string | null;
  table_number?: string | null;
  table_position?: number | null;            // 1-10
  dietary_restrictions?: string | null;
  allergies?: string | null;
  dietary_notes?: string | null;
  starter_choice?: number | null;            // 1-5
  main_choice?: number | null;               // 1-5
  dessert_choice?: number | null;            // 1-5
}
```

---

### Bulk Table Assignment

**Mutation Pattern**:
```typescript
const { data, error } = await supabase
  .from('guests')
  .update({ table_number: tableNumber })
  .in('id', guestIds);
```

**Request Contract**:
```typescript
interface BulkTableAssignmentRequest {
  guestIds: string[];      // Array of guest UUIDs
  tableNumber: string;     // Table number to assign
}
```

**Response Contract**:
```typescript
interface BulkTableAssignmentResponse {
  success: boolean;
  updatedCount: number;
  errors?: string[];
}
```

---

### Fetch Guests at Table (for Seating Modal)

**Query Pattern**:
```typescript
const { data, error } = await supabase
  .from('guests')
  .select('id, name, table_position, has_plus_one, plus_one_name')
  .eq('wedding_id', weddingId)
  .eq('table_number', tableNumber)
  .order('table_position', { ascending: true });
```

**Response Contract**:
```typescript
interface TableGuest {
  id: string;
  name: string;
  table_position: number | null;
  has_plus_one: boolean;
  plus_one_name: string | null;
}
```

---

### Update Seat Position

**Mutation Pattern**:
```typescript
const { data, error } = await supabase
  .from('guests')
  .update({
    table_number: tableNumber,
    table_position: position
  })
  .eq('id', guestId)
  .select()
  .single();
```

---

## TanStack Query Hooks Interface

### useGuests Hook

**Existing hook** - no changes needed:
```typescript
function useGuests(weddingId: string): {
  guests: GuestWithAttendance[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### useGuestMutations Hook

**Existing hook** - no changes needed:
```typescript
function useGuestMutations(): {
  updateGuest: UseMutation<Guest, Error, { id: string; data: GuestUpdateRequest }>;
  deleteGuest: UseMutation<void, Error, string>;
  createGuest: UseMutation<Guest, Error, GuestCreateRequest>;
}
```

### useBulkGuestActions Hook (NEW)

**New hook to create**:
```typescript
function useBulkGuestActions(): {
  assignTable: UseMutation<BulkTableAssignmentResponse, Error, BulkTableAssignmentRequest>;
  exportSelected: (guestIds: string[]) => void;
}
```

---

## Error Handling Contracts

### Standard Error Response
```typescript
interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}
```

### Validation Error Response
```typescript
interface ValidationError {
  field: string;
  message: string;
}

interface ValidationErrorResponse {
  errors: ValidationError[];
}
```

---

## CSV Export Contract

### Export Selected Guests

**Output Format**:
```csv
Name,Email,Phone,Type,Status,Table,Plus One,Dietary,Allergies,Starter,Main,Dessert
"John Doe","john@email.com","555-1234","adult","confirmed","1","Jane Doe","Vegetarian","Nuts","2","1","3"
```

**Field Mapping**:
| CSV Header | Guest Field | Transform |
|------------|-------------|-----------|
| Name | name | none |
| Email | email | null → "" |
| Phone | phone | null → "" |
| Type | guest_type | none |
| Status | invitation_status | none |
| Table | table_number | null → "" |
| Plus One | plus_one_name | null → "" |
| Dietary | dietary_restrictions | null → "" |
| Allergies | allergies | null → "" |
| Starter | starter_choice | null → "" |
| Main | main_choice | null → "" |
| Dessert | dessert_choice | null → "" |

---

## Notes

1. **No New Endpoints**: This feature uses existing Supabase client operations.
2. **RLS Enforcement**: All queries are filtered by `wedding_id` with RLS enabled.
3. **Optimistic Updates**: TanStack Query handles cache invalidation on mutations.
4. **Date Handling**: Form uses `Date` objects; convert to ISO strings for Supabase.
