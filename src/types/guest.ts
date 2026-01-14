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
