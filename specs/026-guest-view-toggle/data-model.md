# Data Model: Guest View Toggle - Card and Table Views

**Feature Branch**: `026-guest-view-toggle`
**Created**: 2026-01-21

## Database Schema Reference

### guests Table (Existing - 30 fields)

```sql
CREATE TABLE guests (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id),

  -- Basic Info (8 fields)
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  email_valid BOOLEAN DEFAULT true,
  guest_type TEXT DEFAULT 'adult' CHECK (guest_type IN ('adult', 'child', 'vendor', 'staff')),
  gender TEXT CHECK (gender IN ('male', 'female')),
  wedding_party_side TEXT CHECK (wedding_party_side IN ('bride', 'groom')),
  wedding_party_role TEXT CHECK (wedding_party_role IN ('best_man', 'groomsmen', 'maid_of_honor', 'bridesmaids', 'parent', 'close_relative', 'relative', 'other')),

  -- RSVP (8 fields)
  invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'invited', 'confirmed', 'declined')),
  rsvp_deadline DATE,
  rsvp_received_date DATE,
  rsvp_method TEXT CHECK (rsvp_method IN ('email', 'phone', 'in_person', 'online')),
  has_plus_one BOOLEAN DEFAULT false,
  plus_one_name TEXT,
  plus_one_confirmed BOOLEAN DEFAULT false,
  notes TEXT,

  -- Seating (2 fields)
  table_number TEXT,
  table_position INTEGER,

  -- Dietary (3 fields)
  dietary_restrictions TEXT,
  allergies TEXT,
  dietary_notes TEXT,

  -- Meals (6 fields)
  starter_choice INTEGER CHECK (starter_choice BETWEEN 1 AND 5),
  main_choice INTEGER CHECK (main_choice BETWEEN 1 AND 5),
  dessert_choice INTEGER CHECK (dessert_choice BETWEEN 1 AND 5),
  plus_one_starter_choice INTEGER CHECK (plus_one_starter_choice BETWEEN 1 AND 5),
  plus_one_main_choice INTEGER CHECK (plus_one_main_choice BETWEEN 1 AND 5),
  plus_one_dessert_choice INTEGER CHECK (plus_one_dessert_choice BETWEEN 1 AND 5),

  -- Other (2 fields)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### guest_event_attendance Table (Existing)

```sql
CREATE TABLE guest_event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attending BOOLEAN DEFAULT false,
  shuttle_to TEXT,
  shuttle_from TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guest_id, event_id)
);
```

### events Table (Existing - Referenced)

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id),
  event_name TEXT NOT NULL,
  event_order INTEGER DEFAULT 0,
  event_date DATE,
  start_time TIME,
  end_time TIME,
  -- ... other fields
);
```

### meal_options Table (Existing - Referenced)

```sql
CREATE TABLE meal_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id),
  course_type TEXT NOT NULL CHECK (course_type IN ('starter', 'main', 'dessert')),
  option_number INTEGER NOT NULL CHECK (option_number BETWEEN 1 AND 5),
  meal_name TEXT NOT NULL,
  description TEXT,
  dietary_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wedding_id, course_type, option_number)
);
```

## TypeScript Interfaces

### New Types (src/types/guest-table.ts)

```typescript
/**
 * View mode for the Guests page
 */
export type GuestViewMode = 'card' | 'table';

/**
 * Column category for grouping in table header
 */
export type ColumnCategory =
  | 'basic'
  | 'rsvp'
  | 'seating'
  | 'dietary'
  | 'meals'
  | 'other'
  | 'event';

/**
 * Cell data type for rendering and editing
 */
export type CellType =
  | 'text'
  | 'boolean'
  | 'enum'
  | 'date'
  | 'number'
  | 'datetime'
  | 'meal';

/**
 * Column definition for the guest table
 */
export interface TableColumnDef {
  /** Unique column identifier */
  id: string;
  /** Display header text */
  header: string;
  /** Database field name or computed field */
  field: string;
  /** Column category for grouping */
  category: ColumnCategory;
  /** Data type for rendering */
  type: CellType;
  /** Whether the cell is editable */
  editable: boolean;
  /** Default width in pixels */
  width: number;
  /** Minimum width when resizing */
  minWidth: number;
  /** Options for enum fields */
  enumOptions?: string[];
  /** Event ID for event attendance columns */
  eventId?: string;
  /** Event name for header display */
  eventName?: string;
  /** Course type for meal columns */
  courseType?: 'starter' | 'main' | 'dessert';
  /** Whether this is a plus one meal column */
  isPlusOneMeal?: boolean;
}

/**
 * Event attendance data for a single event
 */
export interface EventAttendanceData {
  attending: boolean;
  shuttle_to: string | null;
  shuttle_from: string | null;
}

/**
 * Guest data row with pivoted event attendance
 */
export interface GuestTableRowData {
  // All base guest fields
  id: string;
  wedding_id: string;

  // Basic Info
  name: string;
  email: string | null;
  phone: string | null;
  email_valid: boolean;
  guest_type: 'adult' | 'child' | 'vendor' | 'staff';
  gender: 'male' | 'female' | null;
  wedding_party_side: 'bride' | 'groom' | null;
  wedding_party_role: string | null;

  // RSVP
  invitation_status: 'pending' | 'invited' | 'confirmed' | 'declined';
  rsvp_deadline: string | null; // ISO date
  rsvp_received_date: string | null; // ISO date
  rsvp_method: 'email' | 'phone' | 'in_person' | 'online' | null;
  has_plus_one: boolean;
  plus_one_name: string | null;
  plus_one_confirmed: boolean;
  notes: string | null;

  // Seating
  table_number: string | null;
  table_position: number | null;

  // Dietary
  dietary_restrictions: string | null;
  allergies: string | null;
  dietary_notes: string | null;

  // Meals (stored as numbers 1-5)
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;
  plus_one_starter_choice: number | null;
  plus_one_main_choice: number | null;
  plus_one_dessert_choice: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Pivoted event attendance (keyed by event_id)
  eventAttendance: Record<string, EventAttendanceData>;
}

/**
 * Event metadata for column generation
 */
export interface EventColumnMeta {
  id: string;
  name: string;
  order: number;
  color: string; // HSL color for header background
}

/**
 * Sort configuration for table
 */
export interface SortConfig {
  column: string | null;
  direction: 'asc' | 'desc';
}

/**
 * Filter operator type
 */
export type FilterOperator = 'equals' | 'contains' | 'in' | 'gte' | 'lte' | 'isEmpty' | 'isNotEmpty';

/**
 * Column filter configuration
 */
export interface ColumnFilter {
  column: string;
  operator: FilterOperator;
  value: string | boolean | number | string[] | null;
}

/**
 * Table state for managing view
 */
export interface GuestTableState {
  sortConfig: SortConfig;
  columnFilters: ColumnFilter[];
  columnWidths: Record<string, number>;
  visibleColumns: string[];
}

/**
 * Meal option lookup for displaying names
 */
export interface MealOptionLookup {
  starter: Record<number, string>; // option_number -> meal_name
  main: Record<number, string>;
  dessert: Record<number, string>;
}

/**
 * Cell edit event payload
 */
export interface CellEditPayload {
  guestId: string;
  field: string;
  value: string | boolean | number | null;
  // For event attendance fields
  eventId?: string;
  attendanceField?: 'attending' | 'shuttle_to' | 'shuttle_from';
}

/**
 * Table data hook return type
 */
export interface UseGuestTableDataReturn {
  /** Guest rows with pivoted event data */
  rows: GuestTableRowData[];
  /** Column definitions including dynamic event columns */
  columns: TableColumnDef[];
  /** Event metadata for column rendering */
  events: EventColumnMeta[];
  /** Meal option lookup for name display */
  mealOptions: MealOptionLookup;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  isError: boolean;
  /** Refetch function */
  refetch: () => void;
}
```

### Extended Existing Types (src/types/guest.ts)

```typescript
// Add to existing guest.ts file

import type { GuestViewMode } from './guest-table';

export type { GuestViewMode };

// Existing types remain unchanged
```

## Data Transformation

### Pivot Function (src/lib/guest-table-utils.ts)

```typescript
/**
 * Transform raw database results into table rows with pivoted event attendance
 */
export function transformToTableRows(
  guests: Guest[],
  events: Event[],
  attendance: GuestEventAttendance[],
  mealOptions: MealOption[]
): {
  rows: GuestTableRowData[];
  eventMeta: EventColumnMeta[];
  mealLookup: MealOptionLookup;
} {
  // Create attendance lookup: guest_id -> event_id -> attendance data
  const attendanceMap = new Map<string, Map<string, EventAttendanceData>>();
  for (const record of attendance) {
    if (!attendanceMap.has(record.guest_id)) {
      attendanceMap.set(record.guest_id, new Map());
    }
    attendanceMap.get(record.guest_id)!.set(record.event_id, {
      attending: record.attending,
      shuttle_to: record.shuttle_to,
      shuttle_from: record.shuttle_from,
    });
  }

  // Create meal option lookup
  const mealLookup: MealOptionLookup = { starter: {}, main: {}, dessert: {} };
  for (const option of mealOptions) {
    mealLookup[option.course_type][option.option_number] = option.meal_name;
  }

  // Generate event metadata with colors (max 10)
  const sortedEvents = events
    .slice(0, 10)
    .sort((a, b) => a.event_order - b.event_order);

  const eventMeta: EventColumnMeta[] = sortedEvents.map((event, index) => ({
    id: event.id,
    name: event.event_name,
    order: event.event_order,
    color: `hsl(${(index * 36) % 360}, 70%, 90%)`, // Rotate through hues
  }));

  // Transform guests to table rows
  const rows: GuestTableRowData[] = guests.map(guest => {
    const guestAttendance = attendanceMap.get(guest.id) || new Map();
    const eventAttendance: Record<string, EventAttendanceData> = {};

    for (const event of sortedEvents) {
      eventAttendance[event.id] = guestAttendance.get(event.id) || {
        attending: false,
        shuttle_to: null,
        shuttle_from: null,
      };
    }

    return {
      ...guest,
      eventAttendance,
    };
  });

  return { rows, eventMeta, mealLookup };
}
```

## Query Patterns

### Fetch Table Data Query

```typescript
// In useGuestTableData.ts
const fetchGuestTableData = async (weddingId: string) => {
  // Parallel queries for better performance
  const [guestsResult, eventsResult, attendanceResult, mealOptionsResult] =
    await Promise.all([
      // 1. All guests with all fields
      supabase
        .from('guests')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('name'),

      // 2. Events for column generation (max 10)
      supabase
        .from('events')
        .select('id, event_name, event_order')
        .eq('wedding_id', weddingId)
        .order('event_order')
        .limit(10),

      // 3. All attendance records
      supabase
        .from('guest_event_attendance')
        .select('guest_id, event_id, attending, shuttle_to, shuttle_from')
        .eq('wedding_id', weddingId),

      // 4. Meal options for name display
      supabase
        .from('meal_options')
        .select('option_number, meal_name, course_type')
        .eq('wedding_id', weddingId),
    ]);

  // Error handling
  if (guestsResult.error) throw guestsResult.error;
  if (eventsResult.error) throw eventsResult.error;
  if (attendanceResult.error) throw attendanceResult.error;
  if (mealOptionsResult.error) throw mealOptionsResult.error;

  return transformToTableRows(
    guestsResult.data || [],
    eventsResult.data || [],
    attendanceResult.data || [],
    mealOptionsResult.data || []
  );
};
```

### Update Guest Field Query

```typescript
// Reuses existing useGuestMutations.ts
const updateGuestField = async (
  guestId: string,
  field: string,
  value: unknown
) => {
  const { error } = await supabase
    .from('guests')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', guestId);

  if (error) throw error;
};
```

### Update Event Attendance Query

```typescript
// Upsert attendance record
const updateEventAttendance = async (
  guestId: string,
  eventId: string,
  field: 'attending' | 'shuttle_to' | 'shuttle_from',
  value: boolean | string | null
) => {
  const { error } = await supabase
    .from('guest_event_attendance')
    .upsert({
      guest_id: guestId,
      event_id: eventId,
      [field]: value,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'guest_id,event_id',
    });

  if (error) throw error;
};
```

## localStorage Schema

```typescript
// Key: 'guestsViewPreference'
// Type: 'card' | 'table'
// Default: 'card'

const VIEW_PREFERENCE_KEY = 'guestsViewPreference';

export const getViewPreference = (): GuestViewMode => {
  try {
    const stored = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return stored === 'table' ? 'table' : 'card';
  } catch {
    return 'card'; // Fallback if localStorage unavailable
  }
};

export const setViewPreference = (mode: GuestViewMode): void => {
  try {
    localStorage.setItem(VIEW_PREFERENCE_KEY, mode);
  } catch {
    // Silent fail if localStorage unavailable
  }
};
```

## Column Definitions

```typescript
// In tableColumns.ts
export const BASE_COLUMNS: TableColumnDef[] = [
  // Basic Info
  { id: 'name', header: 'Name', field: 'name', category: 'basic', type: 'text', editable: true, width: 180, minWidth: 120 },
  { id: 'email', header: 'Email', field: 'email', category: 'basic', type: 'text', editable: true, width: 200, minWidth: 140 },
  { id: 'phone', header: 'Phone', field: 'phone', category: 'basic', type: 'text', editable: true, width: 140, minWidth: 100 },
  { id: 'email_valid', header: 'Email Valid', field: 'email_valid', category: 'basic', type: 'boolean', editable: true, width: 100, minWidth: 80 },
  { id: 'guest_type', header: 'Type', field: 'guest_type', category: 'basic', type: 'enum', editable: true, width: 120, minWidth: 100, enumOptions: ['adult', 'child', 'vendor', 'staff'] },
  { id: 'gender', header: 'Gender', field: 'gender', category: 'basic', type: 'enum', editable: true, width: 100, minWidth: 80, enumOptions: ['male', 'female'] },
  { id: 'wedding_party_side', header: 'Party Side', field: 'wedding_party_side', category: 'basic', type: 'enum', editable: true, width: 120, minWidth: 100, enumOptions: ['bride', 'groom'] },
  { id: 'wedding_party_role', header: 'Party Role', field: 'wedding_party_role', category: 'basic', type: 'enum', editable: true, width: 140, minWidth: 120, enumOptions: ['best_man', 'groomsmen', 'maid_of_honor', 'bridesmaids', 'parent', 'close_relative', 'relative', 'other'] },

  // RSVP
  { id: 'invitation_status', header: 'Status', field: 'invitation_status', category: 'rsvp', type: 'enum', editable: true, width: 140, minWidth: 100, enumOptions: ['pending', 'invited', 'confirmed', 'declined'] },
  { id: 'rsvp_deadline', header: 'Deadline', field: 'rsvp_deadline', category: 'rsvp', type: 'date', editable: true, width: 140, minWidth: 120 },
  { id: 'rsvp_received_date', header: 'Received', field: 'rsvp_received_date', category: 'rsvp', type: 'date', editable: true, width: 140, minWidth: 120 },
  { id: 'rsvp_method', header: 'Method', field: 'rsvp_method', category: 'rsvp', type: 'enum', editable: true, width: 120, minWidth: 100, enumOptions: ['email', 'phone', 'in_person', 'online'] },
  { id: 'has_plus_one', header: 'Has +1', field: 'has_plus_one', category: 'rsvp', type: 'boolean', editable: true, width: 100, minWidth: 80 },
  { id: 'plus_one_name', header: '+1 Name', field: 'plus_one_name', category: 'rsvp', type: 'text', editable: true, width: 160, minWidth: 120 },
  { id: 'plus_one_confirmed', header: '+1 Confirmed', field: 'plus_one_confirmed', category: 'rsvp', type: 'boolean', editable: true, width: 100, minWidth: 80 },
  { id: 'notes', header: 'Notes', field: 'notes', category: 'rsvp', type: 'text', editable: true, width: 200, minWidth: 140 },

  // Seating
  { id: 'table_number', header: 'Table', field: 'table_number', category: 'seating', type: 'text', editable: true, width: 120, minWidth: 80 },
  { id: 'table_position', header: 'Seat', field: 'table_position', category: 'seating', type: 'number', editable: true, width: 100, minWidth: 80 },

  // Dietary
  { id: 'dietary_restrictions', header: 'Restrictions', field: 'dietary_restrictions', category: 'dietary', type: 'text', editable: true, width: 160, minWidth: 120 },
  { id: 'allergies', header: 'Allergies', field: 'allergies', category: 'dietary', type: 'text', editable: true, width: 160, minWidth: 120 },
  { id: 'dietary_notes', header: 'Diet Notes', field: 'dietary_notes', category: 'dietary', type: 'text', editable: true, width: 200, minWidth: 140 },

  // Meals
  { id: 'starter_choice', header: 'Starter', field: 'starter_choice', category: 'meals', type: 'meal', editable: true, width: 160, minWidth: 120, courseType: 'starter' },
  { id: 'main_choice', header: 'Main', field: 'main_choice', category: 'meals', type: 'meal', editable: true, width: 160, minWidth: 120, courseType: 'main' },
  { id: 'dessert_choice', header: 'Dessert', field: 'dessert_choice', category: 'meals', type: 'meal', editable: true, width: 160, minWidth: 120, courseType: 'dessert' },
  { id: 'plus_one_starter_choice', header: '+1 Starter', field: 'plus_one_starter_choice', category: 'meals', type: 'meal', editable: true, width: 160, minWidth: 120, courseType: 'starter', isPlusOneMeal: true },
  { id: 'plus_one_main_choice', header: '+1 Main', field: 'plus_one_main_choice', category: 'meals', type: 'meal', editable: true, width: 160, minWidth: 120, courseType: 'main', isPlusOneMeal: true },
  { id: 'plus_one_dessert_choice', header: '+1 Dessert', field: 'plus_one_dessert_choice', category: 'meals', type: 'meal', editable: true, width: 160, minWidth: 120, courseType: 'dessert', isPlusOneMeal: true },

  // Other
  { id: 'created_at', header: 'Created', field: 'created_at', category: 'other', type: 'datetime', editable: false, width: 160, minWidth: 140 },
  { id: 'updated_at', header: 'Updated', field: 'updated_at', category: 'other', type: 'datetime', editable: false, width: 160, minWidth: 140 },
  { id: 'id', header: 'ID', field: 'id', category: 'other', type: 'text', editable: false, width: 120, minWidth: 100 },
];

/**
 * Generate event columns for a list of events
 */
export function generateEventColumns(events: EventColumnMeta[]): TableColumnDef[] {
  return events.flatMap(event => [
    {
      id: `event_${event.id}_attending`,
      header: `${event.name} - Attending`,
      field: `eventAttendance.${event.id}.attending`,
      category: 'event' as const,
      type: 'boolean' as const,
      editable: true,
      width: 120,
      minWidth: 100,
      eventId: event.id,
      eventName: event.name,
    },
    {
      id: `event_${event.id}_shuttle_to`,
      header: `${event.name} - Shuttle TO`,
      field: `eventAttendance.${event.id}.shuttle_to`,
      category: 'event' as const,
      type: 'text' as const,
      editable: true,
      width: 140,
      minWidth: 100,
      eventId: event.id,
      eventName: event.name,
    },
    {
      id: `event_${event.id}_shuttle_from`,
      header: `${event.name} - Shuttle FROM`,
      field: `eventAttendance.${event.id}.shuttle_from`,
      category: 'event' as const,
      type: 'text' as const,
      editable: true,
      width: 140,
      minWidth: 100,
      eventId: event.id,
      eventName: event.name,
    },
  ]);
}
```
