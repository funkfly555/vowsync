/**
 * Guest List API Contracts
 *
 * TypeScript interfaces for the Guest List Page feature.
 * These define the data structures used throughout the feature.
 *
 * @feature 006-guest-list
 * @date 2026-01-14
 */

// =============================================================================
// Database Entity Types
// =============================================================================

/**
 * Guest type classification
 */
export type GuestType = 'adult' | 'child' | 'vendor' | 'staff';

/**
 * Invitation status tracking
 */
export type InvitationStatus = 'pending' | 'invited' | 'confirmed' | 'declined';

/**
 * Method by which RSVP was received
 */
export type RsvpMethod = 'email' | 'phone' | 'in_person' | 'online';

/**
 * Calculated RSVP status for display
 */
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

/**
 * Guest event attendance junction record
 */
export interface GuestEventAttendance {
  id: string;
  guest_id: string;
  event_id: string;
  attending: boolean;
  shuttle_to_event: string | null;
  shuttle_from_event: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Display Types
// =============================================================================

/**
 * Simplified guest data for list display
 * Contains only fields needed for the guest list table/cards
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
// API Response Types
// =============================================================================

/**
 * Paginated guest list response
 */
export interface GuestListResponse {
  guests: GuestListItem[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Supabase query response shape
 */
export interface SupabaseGuestResponse {
  data: Guest[] | null;
  error: {
    message: string;
    code: string;
  } | null;
  count: number | null;
}

// =============================================================================
// Filter Types
// =============================================================================

/**
 * All filter state for the guest list
 */
export interface GuestFilters {
  /** Search query for name matching */
  search: string;
  /** Filter by guest type or show all */
  type: GuestType | 'all';
  /** Filter by calculated RSVP status */
  rsvpStatus: RsvpStatus | 'all';
  /** Filter by event attendance (event ID or null for all) */
  eventId: string | null;
}

/**
 * Default filter values
 */
export const DEFAULT_GUEST_FILTERS: GuestFilters = {
  search: '',
  type: 'all',
  rsvpStatus: 'all',
  eventId: null,
};

// =============================================================================
// Pagination Types
// =============================================================================

/**
 * Pagination state
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Pagination configuration
 */
export const PAGINATION_CONFIG = {
  /** Items per page */
  PAGE_SIZE: 50,
  /** Maximum visible page numbers */
  MAX_VISIBLE_PAGES: 5,
} as const;

// =============================================================================
// Selection Types
// =============================================================================

/**
 * Bulk selection state
 */
export interface SelectionState {
  selectedIds: Set<string>;
  isAllSelected: boolean;
}

/**
 * Bulk action types (placeholders for Phase 6B)
 */
export type BulkAction = 'assign_table' | 'send_email';

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for GuestTable component
 */
export interface GuestTableProps {
  guests: GuestDisplayItem[];
  selectedIds: Set<string>;
  onSelectGuest: (id: string) => void;
  onSelectAll: () => void;
  onEditGuest: (id: string) => void;
  onDeleteGuest: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Props for GuestCard component (mobile)
 */
export interface GuestCardProps {
  guest: GuestDisplayItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Props for GuestFilters component
 */
export interface GuestFiltersProps {
  filters: GuestFilters;
  onFiltersChange: (filters: Partial<GuestFilters>) => void;
  events: Array<{ id: string; event_name: string }>;
  onExportCsv: () => void;
  onExportExcel: () => void;
}

/**
 * Props for GuestPagination component
 */
export interface GuestPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

/**
 * Props for RsvpBadge component
 */
export interface RsvpBadgeProps {
  status: RsvpStatus;
}

/**
 * Props for BulkActionsBar component
 */
export interface BulkActionsBarProps {
  selectedCount: number;
  onAssignTable: () => void;
  onSendEmail: () => void;
  onClearSelection: () => void;
}

// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * Return type for useGuests hook
 */
export interface UseGuestsReturn {
  guests: GuestDisplayItem[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Query parameters for useGuests hook
 */
export interface UseGuestsParams {
  weddingId: string;
  page: number;
  filters: GuestFilters;
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
  // If they've responded, status is "yes" regardless of deadline
  if (rsvpReceivedDate) {
    return 'yes';
  }

  // Check if deadline has passed
  if (rsvpDeadline) {
    const deadline = new Date(rsvpDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadline < today) {
      return 'overdue';
    }
  }

  // Default: still waiting for response
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

/**
 * RSVP status display configuration
 */
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

/**
 * Guest type display configuration
 */
export const GUEST_TYPE_CONFIG: Record<GuestType, { label: string }> = {
  adult: { label: 'Adult' },
  child: { label: 'Child' },
  vendor: { label: 'Vendor' },
  staff: { label: 'Staff' },
};
