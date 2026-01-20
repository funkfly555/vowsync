/**
 * Guest TypeScript Types
 * @feature 006-guest-list
 */

// =============================================================================
// Database Entity Types
// =============================================================================

export type GuestType = 'adult' | 'child' | 'vendor' | 'staff';

export type InvitationStatus = 'pending' | 'invited' | 'confirmed' | 'declined';

export type RsvpMethod = 'email' | 'phone' | 'in_person' | 'online';

/**
 * Full guest entity from database
 */
export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  guest_type: GuestType;
  invitation_status: InvitationStatus;
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
  // Primary guest meal choices
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;
  // Plus one meal choices (024-guest-menu-management)
  plus_one_starter_choice: number | null;
  plus_one_main_choice: number | null;
  plus_one_dessert_choice: number | null;
  email: string | null;
  phone: string | null;
  email_valid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Display Types
// =============================================================================

/**
 * Simplified guest data for list display
 */
export interface GuestListItem {
  id: string;
  name: string;
  guest_type: GuestType;
  invitation_status: InvitationStatus;
  rsvp_deadline: string | null;
  rsvp_received_date: string | null;
  table_number: string | null;
}

/**
 * Guest with invitation status for display
 */
export interface GuestDisplayItem extends GuestListItem {
  invitation_status: InvitationStatus;
}

// =============================================================================
// Filter Types
// =============================================================================

export interface GuestFilters {
  search: string;
  type: GuestType | 'all';
  invitationStatus: InvitationStatus | 'all';
  eventId: string | null;
}

export const DEFAULT_GUEST_FILTERS: GuestFilters = {
  search: '',
  type: 'all',
  invitationStatus: 'all',
  eventId: null,
};

// =============================================================================
// Pagination Types
// =============================================================================

export const PAGE_SIZE = 50;

export interface PaginationState {
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Transform Guest to GuestDisplayItem
 */
export function toGuestDisplayItem(guest: Guest): GuestDisplayItem {
  return {
    id: guest.id,
    name: guest.name,
    guest_type: guest.guest_type,
    rsvp_deadline: guest.rsvp_deadline,
    rsvp_received_date: guest.rsvp_received_date,
    table_number: guest.table_number,
    invitation_status: guest.invitation_status,
  };
}

// =============================================================================
// Display Configuration
// =============================================================================

export const INVITATION_STATUS_CONFIG: Record<
  InvitationStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: 'To Be Sent',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  invited: {
    label: 'Invited',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  declined: {
    label: 'Declined',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
};

export const GUEST_TYPE_CONFIG: Record<GuestType, { label: string }> = {
  adult: { label: 'Adult' },
  child: { label: 'Child' },
  vendor: { label: 'Vendor' },
  staff: { label: 'Staff' },
};

// =============================================================================
// Form Types (Phase 6B - Guest CRUD)
// =============================================================================

/**
 * Guest event attendance record from database
 * Note: Database uses shuttle_to_event/shuttle_from_event as TEXT for shuttle group assignment
 */
export interface GuestEventAttendance {
  event_id: string;
  attending: boolean;
  shuttle_to_event: string | null;
  shuttle_from_event: string | null;
  notes: string | null;
}

/**
 * Event attendance form data for a single event
 */
export interface EventAttendanceFormData {
  event_id: string;
  attending: boolean;
  shuttle_to_event: string | null;
  shuttle_from_event: string | null;
  notes: string | null;
}

/**
 * Form data for creating/updating a guest
 * Dates are Date objects in form, converted to ISO strings for API
 */
export interface GuestFormData {
  // Basic Info
  name: string;
  guest_type: GuestType;
  email: string;
  phone: string;
  invitation_status: InvitationStatus;

  // RSVP
  rsvp_deadline: Date | null;
  rsvp_received_date: Date | null;
  rsvp_method: RsvpMethod | null;
  has_plus_one: boolean;
  plus_one_name: string;
  plus_one_confirmed: boolean;

  // Seating
  table_number: string | null;
  table_position: number | null;

  // Dietary
  dietary_restrictions: string;
  allergies: string;
  dietary_notes: string;

  // Meal - Primary Guest
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;

  // Meal - Plus One
  plus_one_starter_choice: number | null;
  plus_one_main_choice: number | null;
  plus_one_dessert_choice: number | null;

  // Events
  event_attendance: EventAttendanceFormData[];
}

/**
 * Default values for guest form
 */
export const DEFAULT_GUEST_FORM_DATA: GuestFormData = {
  name: '',
  guest_type: 'adult',
  email: '',
  phone: '',
  invitation_status: 'pending',
  rsvp_deadline: null,
  rsvp_received_date: null,
  rsvp_method: null,
  has_plus_one: false,
  plus_one_name: '',
  plus_one_confirmed: false,
  table_number: null,
  table_position: null,
  dietary_restrictions: '',
  allergies: '',
  dietary_notes: '',
  starter_choice: null,
  main_choice: null,
  dessert_choice: null,
  plus_one_starter_choice: null,
  plus_one_main_choice: null,
  plus_one_dessert_choice: null,
  event_attendance: [],
};

/**
 * Guest with attendance records (for edit mode)
 */
export interface GuestWithAttendance extends Guest {
  event_attendance: GuestEventAttendance[];
}

// =============================================================================
// Mutation Types
// =============================================================================

export interface CreateGuestRequest {
  wedding_id: string;
  data: GuestFormData;
}

export interface UpdateGuestRequest {
  guest_id: string;
  data: Partial<GuestFormData> | Record<string, unknown>;
}

export interface DeleteGuestRequest {
  guest_id: string;
}

export interface BulkTableAssignmentRequest {
  guest_ids: string[];
  table_number: string | null;
}

// =============================================================================
// Attendance Matrix Types
// =============================================================================

export interface AttendanceMatrixData {
  guests: AttendanceMatrixGuest[];
  events: AttendanceMatrixEvent[];
}

export interface AttendanceMatrixGuest {
  id: string;
  name: string;
  guest_type: string;
  eventAttendance: Record<string, GuestEventAttendance>;
}

export interface AttendanceMatrixEvent {
  id: string;
  event_name: string;
  event_date: string | null;
}

export interface AttendanceUpdatePayload {
  guest_id: string;
  event_id: string;
  attending: boolean;
  shuttle_to_event: string | null;
  shuttle_from_event: string | null;
}

// =============================================================================
// Export Types
// =============================================================================

export interface ExportColumn {
  header: string;
  accessor: keyof Guest | ((guest: Guest) => string);
}

export const CSV_EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: (g) => g.email ?? '' },
  { header: 'Phone', accessor: (g) => g.phone ?? '' },
  { header: 'Type', accessor: (g) => g.guest_type.charAt(0).toUpperCase() + g.guest_type.slice(1) },
  {
    header: 'Invitation Status',
    accessor: (g) => INVITATION_STATUS_CONFIG[g.invitation_status]?.label ?? g.invitation_status,
  },
  { header: 'Table', accessor: (g) => g.table_number ?? '' },
  { header: 'Dietary', accessor: (g) => g.dietary_restrictions ?? '' },
  { header: 'Allergies', accessor: (g) => g.allergies ?? '' },
];

export function generateExportFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `guests_export_${timestamp}.csv`;
}

// =============================================================================
// Constants
// =============================================================================

export const MEAL_OPTIONS = [1, 2, 3, 4, 5] as const;
export type MealOption = (typeof MEAL_OPTIONS)[number];

export const TABLE_NUMBERS = Array.from({ length: 20 }, (_, i) => String(i + 1));

// =============================================================================
// UI State Types (Phase 021 - Guest Page Redesign)
// =============================================================================

/**
 * Track which guest cards are expanded
 * Set<string> of guest IDs for O(1) lookup
 */
export type ExpandedCardsState = Set<string>;

/**
 * Track which guests are selected for bulk actions
 * Set<string> of guest IDs for O(1) lookup
 */
export type SelectedGuestsState = Set<string>;

/**
 * Tab names for the 6-tab interface in expanded cards
 * (Events & Shuttles merged into single tab)
 */
export type TabName = 'basic' | 'rsvp' | 'seating' | 'dietary' | 'meals' | 'events-shuttles';

/**
 * Track active tab per expanded card
 * Record mapping guest ID to active tab name
 */
export type ActiveTabsState = Record<string, TabName>;

/**
 * Enhanced filter state for guest list redesign
 */
export interface GuestFiltersState {
  search: string;
  type: GuestType | 'all';
  invitationStatus: InvitationStatus | 'all';
  tableNumber: string | 'all' | 'none';
  eventId: string | null;
}

export const DEFAULT_GUEST_FILTERS_STATE: GuestFiltersState = {
  search: '',
  type: 'all',
  invitationStatus: 'all',
  tableNumber: 'all',
  eventId: null,
};

// =============================================================================
// Display Models (Phase 021 - Guest Page Redesign)
// =============================================================================

/**
 * Guest card display item with computed/joined data
 * Extends Guest with event attendance for display
 */
export interface GuestCardDisplayItem extends Guest {
  eventAttendance: GuestEventAttendance[];
  attendingEventsCount: number;
  totalEventsCount: number;
}

/**
 * Guest count summary for header display
 * Format: "X guests + Y plus ones = Z total"
 */
export interface GuestCountSummary {
  primaryGuests: number;
  plusOnes: number;
  total: number;
}

/**
 * Table seating display for circular visualization
 */
export interface TableSeatingDisplay {
  tableNumber: string;
  seats: (TableSeat | null)[];
}

/**
 * Individual seat at a table
 */
export interface TableSeat {
  position: number;
  guestId: string;
  guestName: string;
  isPlusOne: boolean;
}

// =============================================================================
// Form Data Types (Phase 021 - Guest Page Redesign)
// =============================================================================

/**
 * Form data for editing a guest via expanded card tabs
 * Used by React Hook Form in tab components
 */
export interface GuestEditFormData {
  // Basic Info Tab
  name: string;
  email: string;
  phone: string;
  guest_type: GuestType;
  invitation_status: InvitationStatus;

  // Plus One (Basic Info Tab)
  has_plus_one: boolean;
  plus_one_name: string;
  plus_one_confirmed: boolean;

  // RSVP Tab
  rsvp_deadline: Date | null;
  rsvp_received_date: Date | null;
  rsvp_method: RsvpMethod | null;
  rsvp_notes: string;

  // Seating Tab
  table_number: string;
  table_position: number | null;

  // Dietary Tab
  dietary_restrictions: string;
  allergies: string;
  dietary_notes: string;

  // Meals Tab
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;

  // Events & Shuttle Tab
  event_attendance: EventAttendanceFormData[];
}

/**
 * Default values for guest edit form
 */
export const DEFAULT_GUEST_EDIT_FORM_DATA: GuestEditFormData = {
  name: '',
  email: '',
  phone: '',
  guest_type: 'adult',
  invitation_status: 'pending',
  has_plus_one: false,
  plus_one_name: '',
  plus_one_confirmed: false,
  rsvp_deadline: null,
  rsvp_received_date: null,
  rsvp_method: null,
  rsvp_notes: '',
  table_number: '',
  table_position: null,
  dietary_restrictions: '',
  allergies: '',
  dietary_notes: '',
  starter_choice: null,
  main_choice: null,
  dessert_choice: null,
  event_attendance: [],
};
