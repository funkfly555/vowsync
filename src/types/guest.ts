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

export type RsvpStatus = 'yes' | 'overdue' | 'pending';

/**
 * Full guest entity from database
 */
export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  guest_type: GuestType;
  invitation_status: InvitationStatus;
  attendance_confirmed: boolean;
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
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;
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
  rsvp_deadline: string | null;
  rsvp_received_date: string | null;
  table_number: string | null;
}

/**
 * Guest with calculated RSVP status for display
 */
export interface GuestDisplayItem extends GuestListItem {
  rsvpStatus: RsvpStatus;
}

// =============================================================================
// Filter Types
// =============================================================================

export interface GuestFilters {
  search: string;
  type: GuestType | 'all';
  rsvpStatus: RsvpStatus | 'all';
  eventId: string | null;
}

export const DEFAULT_GUEST_FILTERS: GuestFilters = {
  search: '',
  type: 'all',
  rsvpStatus: 'all',
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
 * Calculate RSVP status from guest data
 */
export function calculateRsvpStatus(
  rsvpReceivedDate: string | null,
  rsvpDeadline: string | null
): RsvpStatus {
  if (rsvpReceivedDate) {
    return 'yes';
  }

  if (rsvpDeadline) {
    const deadline = new Date(rsvpDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadline < today) {
      return 'overdue';
    }
  }

  return 'pending';
}

/**
 * Transform Guest to GuestDisplayItem
 */
export function toGuestDisplayItem(guest: Guest | GuestListItem): GuestDisplayItem {
  return {
    id: guest.id,
    name: guest.name,
    guest_type: guest.guest_type,
    rsvp_deadline: guest.rsvp_deadline,
    rsvp_received_date: guest.rsvp_received_date,
    table_number: guest.table_number,
    rsvpStatus: calculateRsvpStatus(guest.rsvp_received_date, guest.rsvp_deadline),
  };
}

// =============================================================================
// Display Configuration
// =============================================================================

export const RSVP_STATUS_CONFIG: Record<
  RsvpStatus,
  { label: string; color: string; bgColor: string }
> = {
  yes: {
    label: 'Yes',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  overdue: {
    label: 'Overdue',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
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
  attendance_confirmed: boolean;

  // RSVP
  rsvp_deadline: Date | null;
  rsvp_received_date: Date | null;
  rsvp_method: RsvpMethod | null;
  has_plus_one: boolean;
  plus_one_name: string;
  plus_one_confirmed: boolean;

  // Dietary
  dietary_restrictions: string;
  allergies: string;
  dietary_notes: string;

  // Meal
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;

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
  attendance_confirmed: false,
  rsvp_deadline: null,
  rsvp_received_date: null,
  rsvp_method: null,
  has_plus_one: false,
  plus_one_name: '',
  plus_one_confirmed: false,
  dietary_restrictions: '',
  allergies: '',
  dietary_notes: '',
  starter_choice: null,
  main_choice: null,
  dessert_choice: null,
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
  data: Partial<GuestFormData>;
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
    header: 'RSVP Status',
    accessor: (g) => {
      if (g.rsvp_received_date) return 'Yes';
      if (g.rsvp_deadline && new Date(g.rsvp_deadline) < new Date()) return 'Overdue';
      return 'Pending';
    },
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
