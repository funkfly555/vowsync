/**
 * Guest Table Utilities
 * Transform, filter, and sort functions for the guest table view
 * Uses SAME data structure as card view (EventsShuttlesTab)
 */

import type {
  GuestTableRowData,
  EventColumnMeta,
  MealOptionLookup,
  EventAttendanceData,
  SortConfig,
  ColumnFilter,
} from '@/types/guest-table';
import type { GuestFiltersState } from '@/types/guest';

interface RawGuest {
  id: string;
  wedding_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  email_valid: boolean;
  guest_type: 'adult' | 'child' | 'vendor' | 'staff';
  gender: 'male' | 'female' | null;
  wedding_party_side: 'bride' | 'groom' | null;
  wedding_party_role: string | null;
  invitation_status: 'pending' | 'invited' | 'confirmed' | 'declined';
  rsvp_deadline: string | null;
  rsvp_received_date: string | null;
  rsvp_method: 'email' | 'phone' | 'in_person' | 'online' | null;
  has_plus_one: boolean;
  plus_one_name: string | null;
  plus_one_confirmed: boolean;
  notes: string | null;
  table_number: string | null;
  table_position: number | null;
  dietary_restrictions: string | null;
  allergies: string | null;
  dietary_notes: string | null;
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;
  plus_one_starter_choice: number | null;
  plus_one_main_choice: number | null;
  plus_one_dessert_choice: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * RawEvent - matches the card view's EventWithShuttle interface
 * Shuttle info is stored directly on the events table
 */
interface RawEvent {
  id: string;
  event_name: string;
  event_order: number;
  event_date: string | null;
  event_start_time: string | null;
  event_end_time: string | null;
  event_location: string | null;
  shuttle_from_location: string | null;
  shuttle_departure_to_event: string | null;
  shuttle_departure_from_event: string | null;
}

interface RawAttendance {
  guest_id: string;
  event_id: string;
  attending: boolean;
  shuttle_to_event: string | null;
  shuttle_from_event: string | null;
}

interface RawMealOption {
  option_number: number;
  meal_name: string;
  course_type: 'starter' | 'main' | 'dessert';
}

/**
 * Transform raw database results into table rows
 * Uses SAME data structure as card view - shuttle info comes from events table
 */
export function transformToTableRows(
  guests: RawGuest[],
  events: RawEvent[],
  attendance: RawAttendance[],
  mealOptions: RawMealOption[]
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
      shuttle_to_event: record.shuttle_to_event,
      shuttle_from_event: record.shuttle_from_event,
    });
  }

  // Create meal option lookup
  const mealLookup: MealOptionLookup = { starter: {}, main: {}, dessert: {} };
  for (const option of mealOptions) {
    mealLookup[option.course_type][option.option_number] = option.meal_name;
  }

  // Generate event metadata with colors (max 10)
  // Includes shuttle info from events table
  const sortedEvents = [...events]
    .slice(0, 10)
    .sort((a, b) => a.event_order - b.event_order);

  const eventMeta: EventColumnMeta[] = sortedEvents.map((event, index) => ({
    id: event.id,
    name: event.event_name,
    order: event.event_order,
    color: `hsl(${(index * 36) % 360}, 70%, 90%)`,
    // Shuttle info from events table - SAME as card view
    eventLocation: event.event_location,
    eventStartTime: event.event_start_time,
    eventEndTime: event.event_end_time,
    shuttleFromLocation: event.shuttle_from_location,
    shuttleDepartureToEvent: event.shuttle_departure_to_event,
    shuttleDepartureFromEvent: event.shuttle_departure_from_event,
  }));

  // Transform guests to table rows
  const rows: GuestTableRowData[] = guests.map((guest) => {
    const guestAttendance = attendanceMap.get(guest.id) || new Map();
    const eventAttendance: Record<string, EventAttendanceData> = {};

    for (const event of sortedEvents) {
      eventAttendance[event.id] = guestAttendance.get(event.id) || {
        attending: false,
        shuttle_to_event: null,
        shuttle_from_event: null,
      };
    }

    return {
      ...guest,
      eventAttendance,
    };
  });

  return { rows, eventMeta, mealLookup };
}

/**
 * Apply shared guest filters to rows
 */
export function applyGuestFilters(
  rows: GuestTableRowData[],
  filters: GuestFiltersState
): GuestTableRowData[] {
  let result = [...rows];

  // Search filter (name, email, plus_one_name)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (row) =>
        row.name.toLowerCase().includes(searchLower) ||
        row.email?.toLowerCase().includes(searchLower) ||
        row.plus_one_name?.toLowerCase().includes(searchLower)
    );
  }

  // Guest type filter
  if (filters.type && filters.type !== 'all') {
    result = result.filter((row) => row.guest_type === filters.type);
  }

  // Invitation status filter
  if (filters.invitationStatus && filters.invitationStatus !== 'all') {
    result = result.filter(
      (row) => row.invitation_status === filters.invitationStatus
    );
  }

  // Table number filter
  if (filters.tableNumber) {
    if (filters.tableNumber === 'none') {
      result = result.filter((row) => !row.table_number);
    } else if (filters.tableNumber !== 'all') {
      result = result.filter((row) => row.table_number === filters.tableNumber);
    }
  }

  // Event filter (attending specific event)
  if (filters.eventId) {
    result = result.filter(
      (row) => row.eventAttendance[filters.eventId!]?.attending === true
    );
  }

  return result;
}

/**
 * Normalize a value for filter comparison
 * Must match the normalization used in ColumnFilterDropdown
 */
function normalizeValueForFilter(value: unknown, field: string): string {
  if (value === null || value === undefined) {
    return '__null__';
  }

  // Check for boolean type based on value or field name
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  // Check for shuttle toggle fields (value is "Yes" or null)
  if (field.includes('shuttle_to_event') || field.includes('shuttle_from_event')) {
    return value === 'Yes' ? 'Yes' : 'No';
  }

  return String(value);
}

/**
 * Apply column-specific filters to rows
 * Uses AND logic - all filters must pass for a row to be included
 */
export function applyColumnFilters(
  rows: GuestTableRowData[],
  filters: ColumnFilter[],
  columnFieldMap: Record<string, string>
): GuestTableRowData[] {
  if (filters.length === 0) return rows;

  return rows.filter((row) => {
    return filters.every((filter) => {
      // Get the field path from column ID
      const fieldPath = columnFieldMap[filter.column] || filter.column;
      const value = getNestedValue(row, fieldPath);
      const normalizedValue = normalizeValueForFilter(value, fieldPath);

      switch (filter.operator) {
        case 'equals':
          return normalizedValue === filter.value;
        case 'contains':
          return String(value || '')
            .toLowerCase()
            .includes(String(filter.value).toLowerCase());
        case 'in':
          // The filter.value is an array of normalized strings
          return Array.isArray(filter.value) && filter.value.includes(normalizedValue);
        case 'gte':
          return (value as number) >= (filter.value as number);
        case 'lte':
          return (value as number) <= (filter.value as number);
        case 'isEmpty':
          return value === null || value === undefined || value === '';
        case 'isNotEmpty':
          return value !== null && value !== undefined && value !== '';
        default:
          return true;
      }
    });
  });
}

/**
 * Build column ID to field path mapping from column definitions
 */
export function buildColumnFieldMap(
  columns: { id: string; field: string }[]
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const col of columns) {
    map[col.id] = col.field;
  }
  return map;
}

/**
 * Sort rows by column
 */
export function sortRows(
  rows: GuestTableRowData[],
  sortConfig: SortConfig
): GuestTableRowData[] {
  if (!sortConfig.column) return rows;

  const sorted = [...rows].sort((a, b) => {
    const aValue = getNestedValue(a, sortConfig.column!);
    const bValue = getNestedValue(b, sortConfig.column!);

    // Handle null/undefined
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Handle booleans
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return aValue === bValue ? 0 : aValue ? -1 : 1;
    }

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue;
    }

    // Handle strings (including dates as ISO strings)
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return aStr.localeCompare(bStr);
  });

  return sortConfig.direction === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Get nested value from object using dot notation path
 * e.g., getNestedValue(obj, 'eventAttendance.uuid.attending')
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((curr: unknown, key: string) => {
    if (curr === null || curr === undefined) return undefined;
    return (curr as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Format enum value to display label
 */
export function formatEnumLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format time for display (HH:MM AM/PM format)
 * SAME as card view's formatTime function
 */
export function formatTime(timeStr: string | null): string {
  if (!timeStr) return 'TBD';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * localStorage helpers for view preference
 */
const VIEW_PREFERENCE_KEY = 'guestsViewPreference';

export function getViewPreference(): 'card' | 'table' {
  try {
    const stored = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return stored === 'table' ? 'table' : 'card';
  } catch {
    return 'card';
  }
}

export function setViewPreference(mode: 'card' | 'table'): void {
  try {
    localStorage.setItem(VIEW_PREFERENCE_KEY, mode);
  } catch {
    // Silent fail if localStorage unavailable
  }
}
