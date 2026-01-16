/**
 * Repurposing Timeline TypeScript Types
 * @feature 014-repurposing-timeline
 */

// =============================================================================
// Status Type
// =============================================================================

/**
 * Status type for repurposing instructions
 * Matches database CHECK constraint
 */
export type RepurposingStatus = 'pending' | 'in_progress' | 'completed' | 'issue';

// =============================================================================
// Database Entity Types
// =============================================================================

/**
 * Database entity - mirrors Supabase repurposing_instructions table
 * CRITICAL: All field names use snake_case matching database columns
 */
export interface RepurposingInstruction {
  id: string;
  wedding_id: string;
  wedding_item_id: string;
  from_event_id: string;
  from_event_end_time: string | null;     // TIME as "HH:MM:SS"
  pickup_location: string;
  pickup_time: string;                     // TIME as "HH:MM:SS"
  pickup_time_relative: string | null;
  to_event_id: string;
  to_event_start_time: string | null;     // TIME as "HH:MM:SS"
  dropoff_location: string;
  dropoff_time: string;                    // TIME as "HH:MM:SS"
  dropoff_time_relative: string | null;
  responsible_party: string;
  responsible_vendor_id: string | null;
  handling_notes: string | null;
  setup_required: boolean;
  breakdown_required: boolean;
  is_critical: boolean;
  status: RepurposingStatus;
  started_at: string | null;               // TIMESTAMPTZ as ISO string
  completed_at: string | null;             // TIMESTAMPTZ as ISO string
  completed_by: string | null;
  issue_description: string | null;
  created_at: string;                      // TIMESTAMPTZ as ISO string
  updated_at: string;                      // TIMESTAMPTZ as ISO string
}

// =============================================================================
// Reference Types for Joins
// =============================================================================

/**
 * Wedding item reference for display
 */
export interface RepurposingItemRef {
  id: string;
  description: string;
  category: string;
}

/**
 * Event reference for display
 */
export interface RepurposingEventRef {
  id: string;
  event_name: string;
  event_date: string;        // DATE as "YYYY-MM-DD"
  event_start_time?: string; // TIME as "HH:MM:SS"
  event_end_time?: string;   // TIME as "HH:MM:SS"
}

/**
 * Vendor reference for display
 */
export interface RepurposingVendorRef {
  id: string;
  company_name: string;
}

// =============================================================================
// Extended Type with Relations
// =============================================================================

/**
 * Repurposing instruction with all related entities for display
 */
export interface RepurposingInstructionWithRelations extends RepurposingInstruction {
  wedding_items: RepurposingItemRef;
  from_event: RepurposingEventRef;
  to_event: RepurposingEventRef;
  vendors: RepurposingVendorRef | null;
}

// =============================================================================
// Form Types
// =============================================================================

/**
 * Form data for create/edit repurposing instruction modal
 * Note: Time fields use "HH:MM" format for input, converted to "HH:MM:SS" on submit
 */
export interface RepurposingFormData {
  // Movement tab
  wedding_item_id: string;
  from_event_id: string;
  pickup_location: string;
  pickup_time: string;              // "HH:MM" format for input
  pickup_time_relative: string;
  to_event_id: string;
  dropoff_location: string;
  dropoff_time: string;             // "HH:MM" format for input
  dropoff_time_relative: string;

  // Responsibility tab
  responsible_party: string;
  responsible_vendor_id: string;    // Empty string if none
  setup_required: boolean;
  breakdown_required: boolean;
  is_critical: boolean;

  // Handling tab
  handling_notes: string;

  // Status tab (edit only)
  status: RepurposingStatus;
  completed_by: string;
  issue_description: string;
}

/**
 * Default values for new instruction form
 */
export const DEFAULT_REPURPOSING_FORM: RepurposingFormData = {
  wedding_item_id: '',
  from_event_id: '',
  pickup_location: '',
  pickup_time: '',
  pickup_time_relative: '',
  to_event_id: '',
  dropoff_location: '',
  dropoff_time: '',
  dropoff_time_relative: '',
  responsible_party: '',
  responsible_vendor_id: '',
  setup_required: false,
  breakdown_required: false,
  is_critical: false,
  handling_notes: '',
  status: 'pending',
  completed_by: '',
  issue_description: '',
};

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Validation result severity
 */
export type ValidationSeverity = 'error' | 'warning' | 'success';

/**
 * Single validation result
 */
export interface ValidationResult {
  type: ValidationSeverity;
  message: string;
  field?: string;
}

/**
 * Combined validation state for form
 */
export interface RepurposingValidationState {
  pickupBeforeDropoff: ValidationResult;
  pickupAfterEventEnd: ValidationResult;
  dropoffBeforeEventStart: ValidationResult;
  sameEventCheck: ValidationResult;
  hasBlockingErrors: boolean;
  hasWarnings: boolean;
}

// =============================================================================
// Filter Types
// =============================================================================

/**
 * Filter state for repurposing list
 */
export interface RepurposingFilters {
  status: RepurposingStatus | 'all';
  responsibleParty: string;  // 'all' or specific party name
  eventId: string;           // 'all' or specific event ID
  itemId: string;            // 'all' or specific item ID
}

/**
 * Default filter values
 */
export const DEFAULT_REPURPOSING_FILTERS: RepurposingFilters = {
  status: 'all',
  responsibleParty: 'all',
  eventId: 'all',
  itemId: 'all',
};

// =============================================================================
// Gantt Chart Types
// =============================================================================

/**
 * Gantt bar data for visualization
 */
export interface GanttBarData {
  id: string;
  label: string;
  startTime: string;        // "HH:MM:SS" format
  endTime: string;          // "HH:MM:SS" format
  startPercent: number;     // Position as percentage of day (0-100)
  widthPercent: number;     // Width as percentage of day
  color: string;            // Hex color for the bar
  status: RepurposingStatus;
  fromEvent: string;
  toEvent: string;
  isCritical: boolean;
}

/**
 * Gantt row representing an item with its movement bars
 */
export interface GanttRowData {
  itemId: string;
  itemDescription: string;
  itemCategory: string;
  bars: GanttBarData[];
}

// =============================================================================
// Status Colors (for UI consistency)
// =============================================================================

/**
 * Status badge color classes for Tailwind
 */
export const STATUS_COLORS: Record<RepurposingStatus, { bg: string; text: string; border: string }> = {
  pending: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  in_progress: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  issue: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
};

/**
 * Status hex colors for Gantt chart bars
 */
export const STATUS_HEX_COLORS: Record<RepurposingStatus, string> = {
  pending: '#2196F3',
  in_progress: '#FF9800',
  completed: '#4CAF50',
  issue: '#F44336',
};

/**
 * Status display labels
 */
export const STATUS_LABELS: Record<RepurposingStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  issue: 'Issue',
};
