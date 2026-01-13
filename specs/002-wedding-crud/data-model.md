# Data Model: Wedding CRUD Interface

**Feature**: 002-wedding-crud
**Date**: 2026-01-13

---

## Entity Overview

This feature interacts with the **weddings** table created in Phase 1 (001-database-schema-foundation). No new tables are created.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              WEDDINGS                                    │
│                        (existing from Phase 1)                           │
│                                                                          │
│  This feature provides CRUD operations for this table                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Wedding Entity

### Database Table (existing)

**Table**: `public.weddings`
**Created**: Phase 1 (001-database-schema-foundation)

| Field | Type | Constraints | Used in Feature | Notes |
|-------|------|-------------|-----------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Read, Edit, Delete | Primary identifier |
| consultant_id | UUID | FK → users, NOT NULL | Create (hardcoded) | Hardcoded until Phase 14 |
| bride_name | TEXT | NOT NULL | CRUD | Required field |
| groom_name | TEXT | NOT NULL | CRUD | Required field |
| wedding_date | DATE | NOT NULL | CRUD | Must be future for create |
| venue_name | TEXT | NOT NULL | CRUD | Required field |
| venue_address | TEXT | | CRUD | Optional |
| venue_contact_name | TEXT | | CRUD | Optional |
| venue_contact_phone | TEXT | | CRUD | Optional |
| venue_contact_email | TEXT | | CRUD | Optional |
| number_of_events | INTEGER | DEFAULT 1, CHECK 1-10 | CRUD | Required, validated 1-10 |
| guest_count_adults | INTEGER | DEFAULT 0 | Read only | Display as 0 (Phase 6) |
| guest_count_children | INTEGER | DEFAULT 0 | Read only | Display as 0 (Phase 6) |
| status | TEXT | DEFAULT 'planning', CHECK | CRUD | Enum validation |
| budget_total | DECIMAL(12,2) | DEFAULT 0 | Not used | Budget feature (later) |
| budget_actual | DECIMAL(12,2) | DEFAULT 0 | Not used | Budget feature (later) |
| notes | TEXT | | CRUD | Optional textarea |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Read only | Auto-set |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Read only | Auto-updated by trigger |

### Status Enum

```typescript
type WeddingStatus = 'planning' | 'confirmed' | 'completed' | 'cancelled';

const WEDDING_STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', color: 'blue' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;
```

---

## TypeScript Interfaces

### Wedding Type

```typescript
// src/types/wedding.ts

export interface Wedding {
  id: string;
  consultant_id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string; // ISO date string
  venue_name: string;
  venue_address: string | null;
  venue_contact_name: string | null;
  venue_contact_phone: string | null;
  venue_contact_email: string | null;
  number_of_events: number;
  guest_count_adults: number;
  guest_count_children: number;
  status: WeddingStatus;
  budget_total: number;
  budget_actual: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type WeddingStatus = 'planning' | 'confirmed' | 'completed' | 'cancelled';

export interface WeddingFormData {
  bride_name: string;
  groom_name: string;
  wedding_date: Date;
  venue_name: string;
  venue_address?: string;
  venue_contact_name?: string;
  venue_contact_phone?: string;
  venue_contact_email?: string;
  number_of_events: number;
  status: WeddingStatus;
  notes?: string;
}

export interface WeddingListFilters {
  search: string;
  status: WeddingStatus | 'all';
  sortBy: 'wedding_date';
  sortOrder: 'asc' | 'desc';
}
```

---

## Zod Validation Schemas

### Wedding Form Schema

```typescript
// src/schemas/wedding.ts

import { z } from 'zod';

export const weddingFormSchema = z.object({
  bride_name: z.string()
    .min(1, 'Bride name is required')
    .max(100, 'Bride name must be 100 characters or less'),

  groom_name: z.string()
    .min(1, 'Groom name is required')
    .max(100, 'Groom name must be 100 characters or less'),

  wedding_date: z.date({
    required_error: 'Wedding date is required',
    invalid_type_error: 'Invalid date',
  }).refine(
    (date) => date > new Date(),
    { message: 'Wedding date must be in the future' }
  ),

  venue_name: z.string()
    .min(1, 'Venue name is required')
    .max(200, 'Venue name must be 200 characters or less'),

  venue_address: z.string()
    .max(500, 'Address must be 500 characters or less')
    .optional()
    .or(z.literal('')),

  venue_contact_name: z.string()
    .max(100, 'Contact name must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  venue_contact_phone: z.string()
    .max(20, 'Phone must be 20 characters or less')
    .optional()
    .or(z.literal('')),

  venue_contact_email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),

  number_of_events: z.number()
    .int('Must be a whole number')
    .min(1, 'Minimum 1 event')
    .max(10, 'Maximum 10 events'),

  status: z.enum(['planning', 'confirmed', 'completed', 'cancelled'], {
    required_error: 'Status is required',
  }),

  notes: z.string()
    .max(2000, 'Notes must be 2000 characters or less')
    .optional()
    .or(z.literal('')),
});

// Edit schema - allows past dates for existing weddings
export const weddingEditSchema = weddingFormSchema.omit({ wedding_date: true }).extend({
  wedding_date: z.date({
    required_error: 'Wedding date is required',
  }),
});

export type WeddingFormValues = z.infer<typeof weddingFormSchema>;
export type WeddingEditValues = z.infer<typeof weddingEditSchema>;
```

---

## Database Operations

### Queries

**List Weddings**:
```sql
SELECT *
FROM weddings
WHERE consultant_id = 'a3fb1821-52bb-4f2a-9e7e-b09148ad44ce'
  AND (bride_name ILIKE '%search%' OR groom_name ILIKE '%search%')
  AND (status = 'planning' OR 'all' = 'all')
ORDER BY wedding_date ASC;
```

**Get Single Wedding**:
```sql
SELECT *
FROM weddings
WHERE id = $1
  AND consultant_id = 'a3fb1821-52bb-4f2a-9e7e-b09148ad44ce';
```

### Mutations

**Create Wedding**:
```sql
INSERT INTO weddings (
  consultant_id, bride_name, groom_name, wedding_date,
  venue_name, venue_address, venue_contact_name,
  venue_contact_phone, venue_contact_email,
  number_of_events, status, notes
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING *;
```

**Update Wedding**:
```sql
UPDATE weddings
SET
  bride_name = $2,
  groom_name = $3,
  wedding_date = $4,
  venue_name = $5,
  venue_address = $6,
  venue_contact_name = $7,
  venue_contact_phone = $8,
  venue_contact_email = $9,
  number_of_events = $10,
  status = $11,
  notes = $12
WHERE id = $1
  AND consultant_id = 'a3fb1821-52bb-4f2a-9e7e-b09148ad44ce'
RETURNING *;
```

**Delete Wedding**:
```sql
DELETE FROM weddings
WHERE id = $1
  AND consultant_id = 'a3fb1821-52bb-4f2a-9e7e-b09148ad44ce';
```

---

## Supabase Client Operations

### React Query Hooks

```typescript
// src/hooks/useWeddings.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TEMP_USER_ID } from '@/lib/constants';
import type { Wedding, WeddingFormData, WeddingListFilters } from '@/types/wedding';

// List weddings with filters
export function useWeddings(filters: WeddingListFilters) {
  return useQuery({
    queryKey: ['weddings', filters],
    queryFn: async () => {
      let query = supabase
        .from('weddings')
        .select('*')
        .eq('consultant_id', TEMP_USER_ID);

      // Search filter
      if (filters.search) {
        query = query.or(
          `bride_name.ilike.%${filters.search}%,groom_name.ilike.%${filters.search}%`
        );
      }

      // Status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Sorting
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

      const { data, error } = await query;
      if (error) throw error;
      return data as Wedding[];
    },
  });
}

// Get single wedding
export function useWedding(id: string) {
  return useQuery({
    queryKey: ['wedding', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .eq('id', id)
        .eq('consultant_id', TEMP_USER_ID)
        .single();

      if (error) throw error;
      return data as Wedding;
    },
    enabled: !!id,
  });
}

// Create wedding
export function useCreateWedding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WeddingFormData) => {
      const { data: wedding, error } = await supabase
        .from('weddings')
        .insert({
          ...data,
          consultant_id: TEMP_USER_ID,
          wedding_date: data.wedding_date.toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return wedding as Wedding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
    },
  });
}

// Update wedding
export function useUpdateWedding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WeddingFormData }) => {
      const { data: wedding, error } = await supabase
        .from('weddings')
        .update({
          ...data,
          wedding_date: data.wedding_date.toISOString().split('T')[0],
        })
        .eq('id', id)
        .eq('consultant_id', TEMP_USER_ID)
        .select()
        .single();

      if (error) throw error;
      return wedding as Wedding;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
      queryClient.invalidateQueries({ queryKey: ['wedding', variables.id] });
    },
  });
}

// Delete wedding
export function useDeleteWedding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('weddings')
        .delete()
        .eq('id', id)
        .eq('consultant_id', TEMP_USER_ID);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
    },
  });
}
```

---

## Display Transformations

### Card Display

```typescript
interface WeddingCardProps {
  wedding: Wedding;
}

// Computed display values
const displayData = {
  title: `${wedding.bride_name} & ${wedding.groom_name}`,
  date: format(parseISO(wedding.wedding_date), 'MMMM d, yyyy'),
  venue: wedding.venue_name,
  guestCount: wedding.guest_count_adults + wedding.guest_count_children, // 0 until Phase 6
  status: wedding.status,
};
```

### Status Badge Colors

| Status | Badge Color | Tailwind Class |
|--------|-------------|----------------|
| planning | Blue | `bg-blue-100 text-blue-800` |
| confirmed | Green | `bg-green-100 text-green-800` |
| completed | Gray | `bg-gray-100 text-gray-800` |
| cancelled | Red | `bg-red-100 text-red-800` |

---

## Relationships

### Current Feature

```
Wedding (this feature)
    ↓ CASCADE DELETE (future features)
    ├── Events (Phase 3)
    ├── Guests (Phase 6)
    ├── Vendors (later)
    └── Budget Items (later)
```

### Future Considerations

- When events/guests are implemented, guest_count fields will be populated
- Delete cascade is already configured in database
- budget_total/budget_actual fields exist but are not used in this feature
