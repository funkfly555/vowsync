/**
 * Repurposing Timeline Validation Utilities
 * @feature 014-repurposing-timeline
 *
 * Provides time validation functions for repurposing instructions:
 * - ERROR: Pickup must be before dropoff (blocks save)
 * - WARNING: Pickup before event ends (allows save with warning)
 * - WARNING: Dropoff after event starts (allows save with warning)
 * - Overnight storage detection (prompts for storage location)
 */

import type { ValidationResult, RepurposingValidationState } from '@/types/repurposing';

// =============================================================================
// Time Parsing Utilities
// =============================================================================

/**
 * Parse time string (HH:MM or HH:MM:SS) to minutes since midnight
 * @param time - Time string in HH:MM or HH:MM:SS format
 * @returns Minutes since midnight (0-1439)
 */
export function parseTimeToMinutes(time: string | null | undefined): number {
  if (!time) return 0;
  const parts = time.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Format minutes since midnight to HH:MM string
 * @param minutes - Minutes since midnight
 * @returns Time string in HH:MM format
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate percentage position on a 24-hour timeline
 * @param minutes - Minutes since midnight
 * @returns Percentage (0-100)
 */
export function calculateTimelinePercentage(minutes: number): number {
  return (minutes / 1440) * 100;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate that pickup time is before dropoff time
 * @param pickupTime - Pickup time in HH:MM format
 * @param dropoffTime - Dropoff time in HH:MM format
 * @returns ValidationResult with error if invalid
 */
export function validatePickupBeforeDropoff(
  pickupTime: string,
  dropoffTime: string
): ValidationResult {
  const pickupMinutes = parseTimeToMinutes(pickupTime);
  const dropoffMinutes = parseTimeToMinutes(dropoffTime);

  if (pickupMinutes >= dropoffMinutes) {
    return {
      type: 'error',
      message: 'Pickup time must be before dropoff time',
      field: 'pickup_time',
    };
  }

  return {
    type: 'success',
    message: '',
  };
}

/**
 * Validate pickup time against event end time
 * WARNING (not error): Pickup scheduled before event ends
 * @param pickupTime - Pickup time in HH:MM format
 * @param eventEndTime - Event end time in HH:MM:SS format (can be null)
 * @returns ValidationResult with warning if pickup is before event ends
 */
export function validatePickupAfterEventEnd(
  pickupTime: string,
  eventEndTime: string | null
): ValidationResult {
  if (!eventEndTime) {
    return { type: 'success', message: '' };
  }

  const pickupMinutes = parseTimeToMinutes(pickupTime);
  const eventEndMinutes = parseTimeToMinutes(eventEndTime);

  if (pickupMinutes < eventEndMinutes) {
    return {
      type: 'warning',
      message: 'Pickup scheduled before event ends. Confirm intentional.',
      field: 'pickup_time',
    };
  }

  return {
    type: 'success',
    message: '',
  };
}

/**
 * Validate dropoff time against event start time
 * WARNING (not error): Dropoff scheduled after event starts
 * @param dropoffTime - Dropoff time in HH:MM format
 * @param eventStartTime - Event start time in HH:MM:SS format (can be null)
 * @returns ValidationResult with warning if dropoff is after event starts
 */
export function validateDropoffBeforeEventStart(
  dropoffTime: string,
  eventStartTime: string | null
): ValidationResult {
  if (!eventStartTime) {
    return { type: 'success', message: '' };
  }

  const dropoffMinutes = parseTimeToMinutes(dropoffTime);
  const eventStartMinutes = parseTimeToMinutes(eventStartTime);

  if (dropoffMinutes > eventStartMinutes) {
    return {
      type: 'warning',
      message: 'Delivery after event starts. May cause delays.',
      field: 'dropoff_time',
    };
  }

  return {
    type: 'success',
    message: '',
  };
}

/**
 * Validate that source and destination events are different
 * @param fromEventId - Source event ID
 * @param toEventId - Destination event ID
 * @returns ValidationResult with error if same event
 */
export function validateDifferentEvents(
  fromEventId: string,
  toEventId: string
): ValidationResult {
  if (fromEventId && toEventId && fromEventId === toEventId) {
    return {
      type: 'error',
      message: 'Source and destination events must be different',
      field: 'to_event_id',
    };
  }

  return {
    type: 'success',
    message: '',
  };
}

// =============================================================================
// Overnight Storage Detection
// =============================================================================

/**
 * Detect if instruction requires overnight storage
 * (pickup and dropoff on different dates)
 * @param fromEventDate - Source event date (YYYY-MM-DD)
 * @param toEventDate - Destination event date (YYYY-MM-DD)
 * @returns true if overnight storage is required
 */
export function detectOvernightStorage(
  fromEventDate: string | null | undefined,
  toEventDate: string | null | undefined
): boolean {
  if (!fromEventDate || !toEventDate) return false;

  // Compare date strings directly (YYYY-MM-DD format)
  return fromEventDate !== toEventDate;
}

/**
 * Generate overnight storage note to append to handling notes
 * @param storageLocation - User-provided storage location
 * @returns Formatted note string
 */
export function generateOvernightStorageNote(storageLocation: string): string {
  return `Overnight storage required. Location: ${storageLocation}`;
}

// =============================================================================
// Combined Validation
// =============================================================================

/**
 * Perform all validations for a repurposing instruction form
 * @param params - Validation parameters
 * @returns Complete validation state
 */
export function validateRepurposingForm(params: {
  pickupTime: string;
  dropoffTime: string;
  fromEventId: string;
  toEventId: string;
  fromEventEndTime: string | null;
  toEventStartTime: string | null;
}): RepurposingValidationState {
  const pickupBeforeDropoff = validatePickupBeforeDropoff(
    params.pickupTime,
    params.dropoffTime
  );

  const pickupAfterEventEnd = validatePickupAfterEventEnd(
    params.pickupTime,
    params.fromEventEndTime
  );

  const dropoffBeforeEventStart = validateDropoffBeforeEventStart(
    params.dropoffTime,
    params.toEventStartTime
  );

  const sameEventCheck = validateDifferentEvents(
    params.fromEventId,
    params.toEventId
  );

  const hasBlockingErrors =
    pickupBeforeDropoff.type === 'error' ||
    sameEventCheck.type === 'error';

  const hasWarnings =
    pickupAfterEventEnd.type === 'warning' ||
    dropoffBeforeEventStart.type === 'warning';

  return {
    pickupBeforeDropoff,
    pickupAfterEventEnd,
    dropoffBeforeEventStart,
    sameEventCheck,
    hasBlockingErrors,
    hasWarnings,
  };
}

// =============================================================================
// Time Calculation Utilities (for Gantt Chart)
// =============================================================================

/**
 * Calculate the duration in minutes between pickup and dropoff
 * @param pickupTime - Pickup time in HH:MM format
 * @param dropoffTime - Dropoff time in HH:MM format
 * @returns Duration in minutes
 */
export function calculateDuration(pickupTime: string, dropoffTime: string): number {
  const pickupMinutes = parseTimeToMinutes(pickupTime);
  const dropoffMinutes = parseTimeToMinutes(dropoffTime);
  return dropoffMinutes - pickupMinutes;
}

/**
 * Calculate Gantt bar position and width
 * @param pickupTime - Pickup time in HH:MM format
 * @param dropoffTime - Dropoff time in HH:MM format
 * @returns Object with left position and width as percentages
 */
export function calculateGanttBarPosition(
  pickupTime: string,
  dropoffTime: string
): { left: number; width: number } {
  const pickupMinutes = parseTimeToMinutes(pickupTime);
  const dropoffMinutes = parseTimeToMinutes(dropoffTime);

  const left = calculateTimelinePercentage(pickupMinutes);
  const width = calculateTimelinePercentage(dropoffMinutes - pickupMinutes);

  return { left, width };
}
