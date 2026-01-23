/**
 * Guest Table Column Definitions
 * Configuration for all 30 base columns plus dynamic event columns
 */

import type { TableColumnDef, EventColumnMeta } from '@/types/guest-table';

/**
 * Base column definitions for the guest table (30 columns)
 */
export const BASE_COLUMNS: TableColumnDef[] = [
  // Basic Info (8 columns)
  {
    id: 'name',
    header: 'Name',
    field: 'name',
    category: 'basic',
    type: 'text',
    editable: true,
    width: 180,
    minWidth: 120,
  },
  {
    id: 'email',
    header: 'Email',
    field: 'email',
    category: 'basic',
    type: 'text',
    editable: true,
    width: 200,
    minWidth: 140,
  },
  {
    id: 'phone',
    header: 'Phone',
    field: 'phone',
    category: 'basic',
    type: 'text',
    editable: true,
    width: 140,
    minWidth: 100,
  },
  {
    id: 'email_valid',
    header: 'Email Valid',
    field: 'email_valid',
    category: 'basic',
    type: 'boolean',
    editable: true,
    width: 100,
    minWidth: 80,
  },
  {
    id: 'guest_type',
    header: 'Type',
    field: 'guest_type',
    category: 'basic',
    type: 'enum',
    editable: true,
    width: 120,
    minWidth: 100,
    enumOptions: ['adult', 'child', 'vendor', 'staff'],
  },
  {
    id: 'gender',
    header: 'Gender',
    field: 'gender',
    category: 'basic',
    type: 'enum',
    editable: true,
    width: 100,
    minWidth: 80,
    enumOptions: ['male', 'female'],
  },
  {
    id: 'wedding_party_side',
    header: 'Party Side',
    field: 'wedding_party_side',
    category: 'basic',
    type: 'enum',
    editable: true,
    width: 120,
    minWidth: 100,
    enumOptions: ['bride', 'groom'],
  },
  {
    id: 'wedding_party_role',
    header: 'Party Role',
    field: 'wedding_party_role',
    category: 'basic',
    type: 'enum',
    editable: true,
    width: 140,
    minWidth: 120,
    enumOptions: [
      'best_man',
      'groomsmen',
      'maid_of_honor',
      'bridesmaids',
      'parent',
      'close_relative',
      'relative',
      'other',
    ],
  },

  // RSVP (8 columns)
  {
    id: 'invitation_status',
    header: 'Status',
    field: 'invitation_status',
    category: 'rsvp',
    type: 'enum',
    editable: true,
    width: 140,
    minWidth: 100,
    enumOptions: ['pending', 'invited', 'confirmed', 'declined'],
  },
  {
    id: 'rsvp_deadline',
    header: 'Deadline',
    field: 'rsvp_deadline',
    category: 'rsvp',
    type: 'date',
    editable: true,
    width: 140,
    minWidth: 120,
  },
  {
    id: 'rsvp_received_date',
    header: 'Received',
    field: 'rsvp_received_date',
    category: 'rsvp',
    type: 'date',
    editable: true,
    width: 140,
    minWidth: 120,
  },
  {
    id: 'rsvp_method',
    header: 'Method',
    field: 'rsvp_method',
    category: 'rsvp',
    type: 'enum',
    editable: true,
    width: 120,
    minWidth: 100,
    enumOptions: ['email', 'phone', 'in_person', 'online'],
  },
  {
    id: 'has_plus_one',
    header: 'Has +1',
    field: 'has_plus_one',
    category: 'rsvp',
    type: 'boolean',
    editable: true,
    width: 100,
    minWidth: 80,
  },
  {
    id: 'plus_one_name',
    header: '+1 Name',
    field: 'plus_one_name',
    category: 'rsvp',
    type: 'text',
    editable: true,
    width: 160,
    minWidth: 120,
    requiresPlusOne: true,
  },
  {
    id: 'plus_one_confirmed',
    header: '+1 Confirmed',
    field: 'plus_one_confirmed',
    category: 'rsvp',
    type: 'boolean',
    editable: true,
    width: 100,
    minWidth: 80,
    requiresPlusOne: true,
  },
  {
    id: 'notes',
    header: 'Notes',
    field: 'notes',
    category: 'rsvp',
    type: 'text',
    editable: true,
    width: 200,
    minWidth: 140,
  },

  // Seating (2 columns)
  {
    id: 'table_number',
    header: 'Table',
    field: 'table_number',
    category: 'seating',
    type: 'text',
    editable: true,
    width: 120,
    minWidth: 80,
  },
  {
    id: 'table_position',
    header: 'Seat',
    field: 'table_position',
    category: 'seating',
    type: 'number',
    editable: true,
    width: 100,
    minWidth: 80,
  },

  // Dietary (3 columns)
  {
    id: 'dietary_restrictions',
    header: 'Restrictions',
    field: 'dietary_restrictions',
    category: 'dietary',
    type: 'text',
    editable: true,
    width: 160,
    minWidth: 120,
  },
  {
    id: 'allergies',
    header: 'Allergies',
    field: 'allergies',
    category: 'dietary',
    type: 'text',
    editable: true,
    width: 160,
    minWidth: 120,
  },
  {
    id: 'dietary_notes',
    header: 'Diet Notes',
    field: 'dietary_notes',
    category: 'dietary',
    type: 'text',
    editable: true,
    width: 200,
    minWidth: 140,
  },

  // Meals (6 columns)
  {
    id: 'starter_choice',
    header: 'Starter',
    field: 'starter_choice',
    category: 'meals',
    type: 'meal',
    editable: true,
    width: 160,
    minWidth: 120,
    courseType: 'starter',
  },
  {
    id: 'main_choice',
    header: 'Main',
    field: 'main_choice',
    category: 'meals',
    type: 'meal',
    editable: true,
    width: 160,
    minWidth: 120,
    courseType: 'main',
  },
  {
    id: 'dessert_choice',
    header: 'Dessert',
    field: 'dessert_choice',
    category: 'meals',
    type: 'meal',
    editable: true,
    width: 160,
    minWidth: 120,
    courseType: 'dessert',
  },
  {
    id: 'plus_one_starter_choice',
    header: '+1 Starter',
    field: 'plus_one_starter_choice',
    category: 'meals',
    type: 'meal',
    editable: true,
    width: 160,
    minWidth: 120,
    courseType: 'starter',
    isPlusOneMeal: true,
    requiresPlusOne: true,
  },
  {
    id: 'plus_one_main_choice',
    header: '+1 Main',
    field: 'plus_one_main_choice',
    category: 'meals',
    type: 'meal',
    editable: true,
    width: 160,
    minWidth: 120,
    courseType: 'main',
    isPlusOneMeal: true,
    requiresPlusOne: true,
  },
  {
    id: 'plus_one_dessert_choice',
    header: '+1 Dessert',
    field: 'plus_one_dessert_choice',
    category: 'meals',
    type: 'meal',
    editable: true,
    width: 160,
    minWidth: 120,
    courseType: 'dessert',
    isPlusOneMeal: true,
    requiresPlusOne: true,
  },

  // Other (3 columns)
  {
    id: 'created_at',
    header: 'Created',
    field: 'created_at',
    category: 'other',
    type: 'datetime',
    editable: false,
    width: 160,
    minWidth: 140,
  },
  {
    id: 'updated_at',
    header: 'Updated',
    field: 'updated_at',
    category: 'other',
    type: 'datetime',
    editable: false,
    width: 160,
    minWidth: 140,
  },
  {
    id: 'id',
    header: 'ID',
    field: 'id',
    category: 'other',
    type: 'text',
    editable: false,
    width: 120,
    minWidth: 100,
  },
];

/**
 * Generate event columns for a list of events
 * Creates 5 columns per event (SAME data as card view):
 * 1. Attending (checkbox)
 * 2. Shuttle (toggle - "Yes" or null, sets both shuttle_to_event and shuttle_from_event)
 * 3. Pickup (read-only - location + departure time from events table)
 * 4. Event (read-only - location + start time from events table)
 * 5. Return (read-only - location + departure time from events table)
 */
export function generateEventColumns(events: EventColumnMeta[]): TableColumnDef[] {
  return events.flatMap((event) => [
    // 1. ATTENDING checkbox
    {
      id: `event_${event.id}_attending`,
      header: 'Attending',
      field: `eventAttendance.${event.id}.attending`,
      category: 'event' as const,
      type: 'boolean' as const,
      editable: true,
      width: 90,
      minWidth: 70,
      eventId: event.id,
      eventName: event.name,
    },
    // 2. SHUTTLE toggle (sets both shuttle_to_event and shuttle_from_event to "Yes" or null)
    {
      id: `event_${event.id}_shuttle`,
      header: 'Shuttle',
      field: `eventAttendance.${event.id}.shuttle_to_event`,
      category: 'event' as const,
      type: 'shuttle-toggle' as const,
      editable: true,
      width: 90,
      minWidth: 70,
      eventId: event.id,
      eventName: event.name,
    },
    // 3. PICKUP (read-only - from events table: shuttle_from_location + shuttle_departure_to_event)
    // Only shows data when ATTENDING and SHUTTLE are both enabled
    {
      id: `event_${event.id}_pickup`,
      header: 'Pickup',
      field: `_eventMeta.${event.id}.pickup`,
      category: 'event' as const,
      type: 'shuttle-info' as const,
      editable: false,
      width: 160,
      minWidth: 120,
      eventId: event.id,
      eventName: event.name,
      // Store the actual values for conditional display
      displayValue: formatPickupDisplay(event.shuttleFromLocation, event.shuttleDepartureToEvent),
    },
    // 4. EVENT (read-only - from events table: event_location + event_start_time)
    // Only shows data when ATTENDING and SHUTTLE are both enabled
    {
      id: `event_${event.id}_event_info`,
      header: 'Event',
      field: `_eventMeta.${event.id}.event`,
      category: 'event' as const,
      type: 'shuttle-info' as const,
      editable: false,
      width: 160,
      minWidth: 120,
      eventId: event.id,
      eventName: event.name,
      displayValue: formatEventDisplay(event.eventLocation, event.eventStartTime),
    },
    // 5. RETURN (read-only - from events table: shuttle_from_location + shuttle_departure_from_event)
    // Only shows data when ATTENDING and SHUTTLE are both enabled
    {
      id: `event_${event.id}_return`,
      header: 'Return',
      field: `_eventMeta.${event.id}.return`,
      category: 'event' as const,
      type: 'shuttle-info' as const,
      editable: false,
      width: 160,
      minWidth: 120,
      eventId: event.id,
      eventName: event.name,
      displayValue: formatReturnDisplay(event.shuttleFromLocation, event.shuttleDepartureFromEvent),
    },
  ]);
}

/**
 * Format pickup display: "Location, Time"
 */
function formatPickupDisplay(location: string | null, time: string | null): string {
  const loc = location || 'TBD';
  const t = formatTimeDisplay(time);
  return `${loc}, ${t}`;
}

/**
 * Format event display: "Location, Time"
 */
function formatEventDisplay(location: string | null, time: string | null): string {
  const loc = location || 'TBD';
  const t = formatTimeDisplay(time);
  return `${loc}, ${t}`;
}

/**
 * Format return display: "Location, Time"
 */
function formatReturnDisplay(location: string | null, time: string | null): string {
  const loc = location || 'TBD';
  const t = formatTimeDisplay(time);
  return `${loc}, ${t}`;
}

/**
 * Format time for display (HH:MM AM/PM)
 */
function formatTimeDisplay(timeStr: string | null): string {
  if (!timeStr) return 'TBD';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Category configuration for header rendering
 */
export const CATEGORY_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  basic: { label: 'Basic Info', className: 'bg-[#F5F5F5]' },
  rsvp: { label: 'RSVP', className: 'bg-[#F5F5F5]' },
  seating: { label: 'Seating', className: 'bg-[#F5F5F5]' },
  dietary: { label: 'Dietary', className: 'bg-[#F5F5F5]' },
  meals: { label: 'Meals', className: 'bg-[#F5F5F5]' },
  other: { label: 'Other', className: 'bg-[#F5F5F5]' },
  event: { label: 'Events', className: '' }, // Color per event
};

/**
 * Group columns by category for header rendering
 */
export function groupColumnsByCategory(columns: TableColumnDef[]): {
  category: string;
  columns: TableColumnDef[];
  eventId?: string;
  eventName?: string;
  color?: string;
}[] {
  const groups: {
    category: string;
    columns: TableColumnDef[];
    eventId?: string;
    eventName?: string;
    color?: string;
  }[] = [];
  let currentGroup: (typeof groups)[0] | null = null;

  for (const col of columns) {
    // For event columns, group by event
    if (col.category === 'event' && col.eventId) {
      if (!currentGroup || currentGroup.eventId !== col.eventId) {
        currentGroup = {
          category: 'event',
          columns: [],
          eventId: col.eventId,
          eventName: col.eventName,
        };
        groups.push(currentGroup);
      }
      currentGroup.columns.push(col);
    } else {
      // Regular category grouping
      if (!currentGroup || currentGroup.category !== col.category) {
        currentGroup = { category: col.category, columns: [] };
        groups.push(currentGroup);
      }
      currentGroup.columns.push(col);
    }
  }

  return groups;
}
