# API Contracts: Wedding CRUD Interface

**Feature**: 002-wedding-crud
**Status**: Supabase Auto-Generated

---

## Overview

This feature uses **Supabase's auto-generated REST API** (PostgREST). No custom API endpoints are needed since all operations are performed directly through the Supabase client library.

---

## Supabase REST Endpoints

### Base URL
```
{VITE_SUPABASE_URL}/rest/v1/weddings
```

### Authentication
All requests include the `apikey` header (anon key) and optionally `Authorization` header (JWT token).

---

## Operations

### List Weddings

**Endpoint**: `GET /rest/v1/weddings`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| select | string | Fields to return (default: *) |
| consultant_id | uuid | Filter by consultant |
| status | string | Filter by status |
| bride_name | string | ILIKE filter |
| groom_name | string | ILIKE filter |
| order | string | Sort field and direction |

**Example Request**:
```http
GET /rest/v1/weddings?consultant_id=eq.a3fb1821-52bb-4f2a-9e7e-b09148ad44ce&order=wedding_date.asc
Authorization: Bearer <anon_key>
```

**Response**: `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "consultant_id": "a3fb1821-52bb-4f2a-9e7e-b09148ad44ce",
    "bride_name": "Jane",
    "groom_name": "John",
    "wedding_date": "2026-06-15",
    "venue_name": "Grand Ballroom",
    "venue_address": "123 Wedding Lane",
    "venue_contact_name": "Event Manager",
    "venue_contact_phone": "+1-555-0100",
    "venue_contact_email": "events@grandballroom.com",
    "number_of_events": 3,
    "guest_count_adults": 0,
    "guest_count_children": 0,
    "status": "planning",
    "budget_total": 0,
    "budget_actual": 0,
    "notes": "Outdoor ceremony, indoor reception",
    "created_at": "2026-01-13T10:00:00Z",
    "updated_at": "2026-01-13T10:00:00Z"
  }
]
```

---

### Get Single Wedding

**Endpoint**: `GET /rest/v1/weddings?id=eq.{id}&select=*`

**Example Request**:
```http
GET /rest/v1/weddings?id=eq.550e8400-e29b-41d4-a716-446655440000&select=*
Authorization: Bearer <anon_key>
```

**Response**: `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  ...
}
```

**Error Response**: `404 Not Found` (no rows returned)

---

### Create Wedding

**Endpoint**: `POST /rest/v1/weddings`

**Headers**:
```http
Content-Type: application/json
Prefer: return=representation
```

**Request Body**:
```json
{
  "consultant_id": "a3fb1821-52bb-4f2a-9e7e-b09148ad44ce",
  "bride_name": "Jane",
  "groom_name": "John",
  "wedding_date": "2026-06-15",
  "venue_name": "Grand Ballroom",
  "venue_address": "123 Wedding Lane",
  "venue_contact_name": "Event Manager",
  "venue_contact_phone": "+1-555-0100",
  "venue_contact_email": "events@grandballroom.com",
  "number_of_events": 3,
  "status": "planning",
  "notes": "Outdoor ceremony, indoor reception"
}
```

**Response**: `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "consultant_id": "a3fb1821-52bb-4f2a-9e7e-b09148ad44ce",
  ...
  "created_at": "2026-01-13T10:00:00Z",
  "updated_at": "2026-01-13T10:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request` - Validation error (check constraint violation)
- `403 Forbidden` - RLS policy violation

---

### Update Wedding

**Endpoint**: `PATCH /rest/v1/weddings?id=eq.{id}`

**Headers**:
```http
Content-Type: application/json
Prefer: return=representation
```

**Request Body** (partial update allowed):
```json
{
  "bride_name": "Jane Marie",
  "status": "confirmed"
}
```

**Response**: `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "bride_name": "Jane Marie",
  "status": "confirmed",
  ...
  "updated_at": "2026-01-13T11:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request` - Validation error
- `403 Forbidden` - RLS policy violation
- `404 Not Found` - Wedding not found

---

### Delete Wedding

**Endpoint**: `DELETE /rest/v1/weddings?id=eq.{id}`

**Example Request**:
```http
DELETE /rest/v1/weddings?id=eq.550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <anon_key>
```

**Response**: `204 No Content`

**Error Responses**:
- `403 Forbidden` - RLS policy violation
- `404 Not Found` - Wedding not found

**Side Effects**: CASCADE deletes all child records (events, guests, etc.)

---

## Supabase Client Usage

The frontend uses `@supabase/supabase-js` client library which wraps these REST endpoints:

```typescript
// List
const { data, error } = await supabase
  .from('weddings')
  .select('*')
  .eq('consultant_id', TEMP_USER_ID)
  .order('wedding_date', { ascending: true });

// Get one
const { data, error } = await supabase
  .from('weddings')
  .select('*')
  .eq('id', id)
  .single();

// Create
const { data, error } = await supabase
  .from('weddings')
  .insert(wedding)
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('weddings')
  .update(changes)
  .eq('id', id)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('weddings')
  .delete()
  .eq('id', id);
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
| 23503 | Foreign key violation | "Invalid reference" |
| 23505 | Unique violation | "Record already exists" |
| 23514 | Check constraint violation | "Invalid value for field" |
| 42501 | RLS violation | "Access denied" |
| PGRST116 | No rows returned | "Record not found" |

---

## RLS Policies (Applied)

The weddings table has RLS enabled with these policies (from Phase 1):

```sql
-- Users can view own weddings
CREATE POLICY "weddings_select_own" ON weddings
  FOR SELECT USING (auth.uid() = consultant_id);

-- Users can insert own weddings
CREATE POLICY "weddings_insert_own" ON weddings
  FOR INSERT WITH CHECK (auth.uid() = consultant_id);

-- Users can update own weddings
CREATE POLICY "weddings_update_own" ON weddings
  FOR UPDATE USING (auth.uid() = consultant_id);

-- Users can delete own weddings
CREATE POLICY "weddings_delete_own" ON weddings
  FOR DELETE USING (auth.uid() = consultant_id);
```

**Note**: Until Phase 14 (authentication), we filter by hardcoded consultant_id to work within RLS constraints.

---

## TypeScript Types

Generated types match the database schema:

```typescript
// From supabase gen types typescript
export interface Database {
  public: {
    Tables: {
      weddings: {
        Row: Wedding;
        Insert: Omit<Wedding, 'id' | 'created_at' | 'updated_at' | 'guest_count_adults' | 'guest_count_children' | 'budget_total' | 'budget_actual'>;
        Update: Partial<Wedding>;
      };
    };
  };
}
```

Run `npx supabase gen types typescript --project-id <project-id> > src/types/database.ts` to generate types.
