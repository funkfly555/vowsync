/**
 * Guest CRUD & Event Attendance - API Contracts
 * @feature 007-guest-crud-attendance
 *
 * TypeScript interfaces defining the API contract between
 * components, hooks, and Supabase database operations.
 */

import { z } from 'zod';

// =============================================================================
// Enums & Constants
// =============================================================================

export const GUEST_TYPES = ['adult', 'child', 'vendor', 'staff'] as const;
export type GuestType = (typeof GUEST_TYPES)[number];

export const INVITATION_STATUSES = ['pending', 'invited', 'confirmed', 'declined'] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export const RSVP_METHODS = ['email', 'phone', 'in_person', 'online'] as const;
export type RsvpMethod = (typeof RSVP_METHODS)[number];

export const RSVP_STATUSES = ['yes', 'overdue', 'pending'] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export const MEAL_OPTIONS = [1, 2, 3, 4, 5] as const;
export type MealOption = (typeof MEAL_OPTIONS)[number];

export const TABLE_NUMBERS = Array.from({ length: 20 }, (_, i) => String(i + 1));

// =============================================================================
// Database Entity Types
// =============================================================================

/**
 * Full guest entity from database
 */
export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  guest_type: GuestType;
  email: string | null;
  phone: string | null;
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
  shuttle_to: string | null;
  shuttle_from: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Form Validation Schemas
// =============================================================================

/**
 * Basic Info tab validation schema
 */
export const basicInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  guest_type: z.enum(GUEST_TYPES),
  email: z.string().email('Invalid email format').or(z.literal('')),
  phone: z.string().max(50).optional(),
  invitation_status: z.enum(INVITATION_STATUSES),
  attendance_confirmed: z.boolean(),
});

/**
 * RSVP tab validation schema
 */
export const rsvpSchema = z
  .object({
    rsvp_deadline: z.date().nullable(),
    rsvp_received_date: z.date().nullable(),
    rsvp_method: z.enum(RSVP_METHODS).nullable(),
    rsvp_notes: z.string().max(1000).optional(),
    has_plus_one: z.boolean(),
    plus_one_name: z.string().max(255).optional(),
    plus_one_confirmed: z.boolean(),
  })
  .refine(
    (data) => {
      // If RSVP received, method should be set
      if (data.rsvp_received_date && !data.rsvp_method) {
        return false;
      }
      return true;
    },
    {
      message: 'RSVP method is required when RSVP date is set',
      path: ['rsvp_method'],
    }
  )
  .refine(
    (data) => {
      // If has plus one, name should be provided
      if (data.has_plus_one && !data.plus_one_name?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: 'Plus one name is required',
      path: ['plus_one_name'],
    }
  );

/**
 * Dietary tab validation schema
 */
export const dietarySchema = z.object({
  dietary_restrictions: z.string().max(500).optional(),
  allergies: z.string().max(500).optional(),
  dietary_notes: z.string().max(1000).optional(),
});

/**
 * Meal tab validation schema
 */
export const mealSchema = z.object({
  starter_choice: z.number().min(1).max(5).nullable(),
  main_choice: z.number().min(1).max(5).nullable(),
  dessert_choice: z.number().min(1).max(5).nullable(),
});

/**
 * Event attendance item schema
 */
export const eventAttendanceItemSchema = z.object({
  event_id: z.string().uuid(),
  attending: z.boolean(),
  shuttle_to: z.string().max(255).optional(),
  shuttle_from: z.string().max(255).optional(),
});

/**
 * Events tab validation schema
 */
export const eventsSchema = z.object({
  event_attendance: z.array(eventAttendanceItemSchema),
});

/**
 * Complete guest form validation schema
 */
export const guestFormSchema = z.object({
  ...basicInfoSchema.shape,
  ...rsvpSchema.innerType().shape,
  ...dietarySchema.shape,
  ...mealSchema.shape,
  ...eventsSchema.shape,
});

export type GuestFormData = z.infer<typeof guestFormSchema>;

// =============================================================================
// API Request/Response Types
// =============================================================================

/**
 * Create guest request payload
 */
export interface CreateGuestRequest {
  wedding_id: string;
  data: GuestFormData;
}

/**
 * Update guest request payload
 */
export interface UpdateGuestRequest {
  guest_id: string;
  data: Partial<GuestFormData>;
}

/**
 * Delete guest request payload
 */
export interface DeleteGuestRequest {
  guest_id: string;
}

/**
 * Bulk table assignment request
 */
export interface BulkTableAssignmentRequest {
  guest_ids: string[];
  table_number: string | null; // null = clear table
}

/**
 * Attendance matrix save request
 */
export interface AttendanceMatrixSaveRequest {
  wedding_id: string;
  updates: AttendanceUpdatePayload[];
}

export interface AttendanceUpdatePayload {
  guest_id: string;
  event_id: string;
  attending: boolean;
  shuttle_to: string | null;
  shuttle_from: string | null;
}

/**
 * Standard mutation response
 */
export interface MutationResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * useGuest hook return type (single guest fetch)
 */
export interface UseGuestReturn {
  guest: Guest | null;
  attendance: GuestEventAttendance[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * useGuestMutations hook return type
 */
export interface UseGuestMutationsReturn {
  createGuest: {
    mutate: (data: CreateGuestRequest) => void;
    mutateAsync: (data: CreateGuestRequest) => Promise<Guest>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
  updateGuest: {
    mutate: (data: UpdateGuestRequest) => void;
    mutateAsync: (data: UpdateGuestRequest) => Promise<Guest>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
  deleteGuest: {
    mutate: (data: DeleteGuestRequest) => void;
    mutateAsync: (data: DeleteGuestRequest) => Promise<void>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
  bulkAssignTable: {
    mutate: (data: BulkTableAssignmentRequest) => void;
    mutateAsync: (data: BulkTableAssignmentRequest) => Promise<void>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
}

/**
 * useAttendanceMatrix hook return type
 */
export interface UseAttendanceMatrixReturn {
  data: AttendanceMatrixData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  saveAttendance: {
    mutate: (updates: AttendanceUpdatePayload[]) => void;
    mutateAsync: (updates: AttendanceUpdatePayload[]) => Promise<void>;
    isPending: boolean;
  };
}

export interface AttendanceMatrixData {
  guests: AttendanceMatrixGuest[];
  events: AttendanceMatrixEvent[];
}

export interface AttendanceMatrixGuest {
  id: string;
  name: string;
  guest_type: GuestType;
  attendance: Record<string, AttendanceRecord>; // eventId -> record
}

export interface AttendanceMatrixEvent {
  id: string;
  event_name: string;
  event_order: number;
}

export interface AttendanceRecord {
  attending: boolean;
  shuttle_to: string;
  shuttle_from: string;
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * GuestModal props
 */
export interface GuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  guestId?: string; // undefined = create mode, string = edit mode
  onSuccess?: () => void;
}

/**
 * DeleteGuestDialog props
 */
export interface DeleteGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: { id: string; name: string } | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

/**
 * AttendanceMatrix props
 */
export interface AttendanceMatrixProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
}

/**
 * BulkActionsBar props (extended)
 */
export interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onSendEmail: () => void;
  onAssignTable: (tableNumber: string | null) => void;
  isAssigning?: boolean;
}

// =============================================================================
// Export Types
// =============================================================================

/**
 * CSV export column definition
 */
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

/**
 * Generate CSV filename with timestamp
 */
export function generateExportFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `guests_export_${timestamp}.csv`;
}
