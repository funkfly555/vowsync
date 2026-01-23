/**
 * Guest Table View Types
 * Types for the Table View of the Guests page
 * Uses SAME data structure as card view (EventsShuttlesTab)
 */

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
  | 'meal'
  | 'shuttle-toggle'
  | 'shuttle-info';  // For PICKUP, EVENT, RETURN - shows info only when attending+shuttle enabled

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
  /** Whether this column requires has_plus_one to be true */
  requiresPlusOne?: boolean;
  /** Pre-computed display value for read-only columns (e.g., event info from EventColumnMeta) */
  displayValue?: string;
}

/**
 * Event attendance data for a single event
 * Same as card view - shuttle_to_event/shuttle_from_event are "Yes" or null
 */
export interface EventAttendanceData {
  attending: boolean;
  shuttle_to_event: string | null;
  shuttle_from_event: string | null;
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
  rsvp_deadline: string | null;
  rsvp_received_date: string | null;
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
 * Includes shuttle info from events table - SAME as card view
 */
export interface EventColumnMeta {
  id: string;
  name: string;
  order: number;
  color: string;
  /** Event location */
  eventLocation: string | null;
  /** Event start time */
  eventStartTime: string | null;
  /** Event end time */
  eventEndTime: string | null;
  /** Shuttle pickup location (from events table) */
  shuttleFromLocation: string | null;
  /** Shuttle departure time to event (from events table) */
  shuttleDepartureToEvent: string | null;
  /** Shuttle departure time from event (from events table) */
  shuttleDepartureFromEvent: string | null;
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
  starter: Record<number, string>;
  main: Record<number, string>;
  dessert: Record<number, string>;
}

/**
 * Cell edit event payload
 */
export interface CellEditPayload {
  guestId: string;
  weddingId: string;
  field: string;
  value: string | boolean | number | null;
  eventId?: string;
  attendanceField?: 'attending' | 'shuttle_to_event' | 'shuttle_from_event';
}
