# Data Model: Guest Page Ad-Hoc Fixes

**Feature Branch**: `025-guest-page-fixes`
**Date**: 2026-01-21

## Entity Changes

### guests Table (Existing - Add 3 Columns)

The `guests` table already exists. This feature adds 3 new columns for wedding party information.

#### New Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `gender` | TEXT | CHECK (gender IN ('male', 'female')) | Guest's gender for seating/invitations |
| `wedding_party_side` | TEXT | CHECK (wedding_party_side IN ('bride', 'groom')) | Which side of wedding party |
| `wedding_party_role` | TEXT | CHECK (wedding_party_role IN ('best_man', 'groomsmen', 'maid_of_honor', 'bridesmaids', 'parent', 'close_relative', 'relative', 'other')) | Role in wedding party |

#### Full Schema Reference

```sql
-- Existing guests table structure (relevant fields)
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    guest_type TEXT NOT NULL CHECK (guest_type IN ('adult', 'child', 'vendor', 'staff')),
    invitation_status TEXT NOT NULL DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'invited', 'confirmed', 'declined')),

    -- RSVP fields
    rsvp_deadline DATE,
    rsvp_received_date DATE,
    rsvp_method TEXT CHECK (rsvp_method IN ('email', 'phone', 'in_person', 'online')),
    rsvp_notes TEXT,
    last_reminder_sent_date DATE,

    -- Plus One
    has_plus_one BOOLEAN DEFAULT false,
    plus_one_name TEXT,
    plus_one_confirmed BOOLEAN DEFAULT false,

    -- Contact
    email TEXT,
    phone TEXT,
    email_valid BOOLEAN DEFAULT true,

    -- Seating
    table_number TEXT,
    table_position INTEGER,

    -- Dietary
    dietary_restrictions TEXT,
    allergies TEXT,
    dietary_notes TEXT,

    -- Meal choices (1-5 maps to meal_options.option_number)
    starter_choice INTEGER CHECK (starter_choice BETWEEN 1 AND 5),
    main_choice INTEGER CHECK (main_choice BETWEEN 1 AND 5),
    dessert_choice INTEGER CHECK (dessert_choice BETWEEN 1 AND 5),
    plus_one_starter_choice INTEGER CHECK (plus_one_starter_choice BETWEEN 1 AND 5),
    plus_one_main_choice INTEGER CHECK (plus_one_main_choice BETWEEN 1 AND 5),
    plus_one_dessert_choice INTEGER CHECK (plus_one_dessert_choice BETWEEN 1 AND 5),

    -- Notes
    notes TEXT,

    -- NEW COLUMNS (025-guest-page-fixes)
    gender TEXT CHECK (gender IN ('male', 'female')),
    wedding_party_side TEXT CHECK (wedding_party_side IN ('bride', 'groom')),
    wedding_party_role TEXT CHECK (wedding_party_role IN ('best_man', 'groomsmen', 'maid_of_honor', 'bridesmaids', 'parent', 'close_relative', 'relative', 'other')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## TypeScript Types

### New Types

```typescript
// src/types/guest.ts

/**
 * Guest gender options
 */
export type Gender = 'male' | 'female';

/**
 * Wedding party side (Bride or Groom)
 */
export type WeddingPartySide = 'bride' | 'groom';

/**
 * Wedding party roles - some are side-specific
 */
export type WeddingPartyRole =
  | 'best_man'        // Groom side only
  | 'groomsmen'       // Groom side only
  | 'maid_of_honor'   // Bride side only
  | 'bridesmaids'     // Bride side only
  | 'parent'          // Both sides
  | 'close_relative'  // Both sides
  | 'relative'        // Both sides
  | 'other';          // Both sides
```

### Updated Guest Interface

```typescript
export interface Guest {
  // ... existing fields ...

  // Wedding Party (025-guest-page-fixes)
  gender: Gender | null;
  wedding_party_side: WeddingPartySide | null;
  wedding_party_role: WeddingPartyRole | null;
}
```

### Updated GuestEditFormData

```typescript
export interface GuestEditFormData {
  // ... existing fields ...

  // Wedding Party (025-guest-page-fixes)
  gender: Gender | null;
  wedding_party_side: WeddingPartySide | null;
  wedding_party_role: WeddingPartyRole | null;
}
```

---

## Configuration Constants

```typescript
// src/types/guest.ts

import { User, UserCheck, LucideIcon } from 'lucide-react';

/**
 * Gender display configuration
 */
export const GENDER_CONFIG: Record<Gender, { label: string; icon: LucideIcon }> = {
  male: { label: 'Male', icon: User },
  female: { label: 'Female', icon: UserCheck },
};

/**
 * Wedding party side labels
 */
export const WEDDING_PARTY_SIDE_CONFIG: Record<WeddingPartySide, { label: string }> = {
  bride: { label: "Bride's Side" },
  groom: { label: "Groom's Side" },
};

/**
 * Wedding party roles available per side
 */
export const WEDDING_PARTY_ROLES_BY_SIDE: Record<WeddingPartySide, WeddingPartyRole[]> = {
  bride: ['maid_of_honor', 'bridesmaids', 'parent', 'close_relative', 'relative', 'other'],
  groom: ['best_man', 'groomsmen', 'parent', 'close_relative', 'relative', 'other'],
};

/**
 * Wedding party role display labels
 */
export const WEDDING_PARTY_ROLE_CONFIG: Record<WeddingPartyRole, { label: string }> = {
  best_man: { label: 'Best Man' },
  groomsmen: { label: 'Groomsmen' },
  maid_of_honor: { label: 'Maid of Honor' },
  bridesmaids: { label: 'Bridesmaids' },
  parent: { label: 'Parent' },
  close_relative: { label: 'Close Relative' },
  relative: { label: 'Relative' },
  other: { label: 'Other' },
};
```

---

## Zod Validation Schema

```typescript
// src/schemas/guest.ts

import { z } from 'zod';

// New field schemas
export const genderSchema = z.enum(['male', 'female']).nullable();

export const weddingPartySideSchema = z.enum(['bride', 'groom']).nullable();

export const weddingPartyRoleSchema = z.enum([
  'best_man',
  'groomsmen',
  'maid_of_honor',
  'bridesmaids',
  'parent',
  'close_relative',
  'relative',
  'other',
]).nullable();

// Add to guestEditSchema
export const guestEditSchema = z.object({
  // ... existing fields ...

  // Wedding Party (025-guest-page-fixes)
  gender: genderSchema,
  wedding_party_side: weddingPartySideSchema,
  wedding_party_role: weddingPartyRoleSchema,
}).refine(
  // Validate role matches side
  (data) => {
    if (!data.wedding_party_side || !data.wedding_party_role) return true;

    const brideRoles = ['maid_of_honor', 'bridesmaids', 'parent', 'close_relative', 'relative', 'other'];
    const groomRoles = ['best_man', 'groomsmen', 'parent', 'close_relative', 'relative', 'other'];

    if (data.wedding_party_side === 'bride') {
      return brideRoles.includes(data.wedding_party_role);
    }
    if (data.wedding_party_side === 'groom') {
      return groomRoles.includes(data.wedding_party_role);
    }
    return true;
  },
  {
    message: 'Wedding party role must match the selected side',
    path: ['wedding_party_role'],
  }
);
```

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                         weddings                             │
│  id (PK)                                                     │
│  consultant_id (FK → users)                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ 1:N
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                          guests                              │
│  id (PK)                                                     │
│  wedding_id (FK → weddings)                                  │
│  ─────────────────────────────────────────                   │
│  NEW: gender                                                 │
│  NEW: wedding_party_side                                     │
│  NEW: wedding_party_role                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ 1:N
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   guest_event_attendance                     │
│  guest_id (PK, FK → guests)                                  │
│  event_id (PK, FK → events)                                  │
│  attending, shuttle_to_event, shuttle_from_event             │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Strategy

### Pre-Migration Checklist
- [ ] All new columns are nullable (no NOT NULL without defaults)
- [ ] CHECK constraints use valid enum values
- [ ] No foreign key references to new tables
- [ ] RLS policies don't need updates (same wedding_id pattern)

### Rollback Strategy
```sql
-- Rollback if needed
ALTER TABLE guests DROP COLUMN IF EXISTS gender;
ALTER TABLE guests DROP COLUMN IF EXISTS wedding_party_side;
ALTER TABLE guests DROP COLUMN IF EXISTS wedding_party_role;
```

---

## meal_options Table (Reference Only)

The `meal_options` table already exists and is used by the MealsTab. No changes needed.

```sql
-- Existing table for reference
CREATE TABLE meal_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    course_type TEXT NOT NULL CHECK (course_type IN ('starter', 'main', 'dessert')),
    option_number INTEGER NOT NULL CHECK (option_number BETWEEN 1 AND 5),
    meal_name TEXT NOT NULL,
    description TEXT,
    dietary_info TEXT[],
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wedding_id, course_type, option_number)
);
```
