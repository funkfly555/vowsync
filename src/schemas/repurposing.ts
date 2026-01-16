/**
 * Repurposing Timeline Zod Validation Schemas
 * @feature 014-repurposing-timeline
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

export const REPURPOSING_STATUSES = ['pending', 'in_progress', 'completed', 'issue'] as const;

// =============================================================================
// Base Type Schemas
// =============================================================================

export const repurposingStatusSchema = z.enum(REPURPOSING_STATUSES);

/**
 * Time format regex - accepts HH:MM format for form inputs
 */
const timeFormatRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Time field schema - validates HH:MM format
 */
const timeFieldSchema = z.string()
  .regex(timeFormatRegex, 'Time must be in HH:MM format (e.g., 14:30)');

// =============================================================================
// Form Input Schema
// =============================================================================

/**
 * Zod schema for repurposing instruction form validation
 * Validates all fields with appropriate constraints
 */
export const repurposingFormSchema = z.object({
  // Movement tab
  wedding_item_id: z.string()
    .uuid('Please select a valid item')
    .min(1, 'Item is required'),

  from_event_id: z.string()
    .uuid('Please select a valid source event')
    .min(1, 'Source event is required'),

  pickup_location: z.string()
    .min(1, 'Pickup location is required')
    .max(200, 'Pickup location must be less than 200 characters'),

  pickup_time: timeFieldSchema,

  pickup_time_relative: z.string()
    .max(100, 'Relative time must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  to_event_id: z.string()
    .uuid('Please select a valid destination event')
    .min(1, 'Destination event is required'),

  dropoff_location: z.string()
    .min(1, 'Dropoff location is required')
    .max(200, 'Dropoff location must be less than 200 characters'),

  dropoff_time: timeFieldSchema,

  dropoff_time_relative: z.string()
    .max(100, 'Relative time must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  // Responsibility tab
  responsible_party: z.string()
    .min(1, 'Responsible party is required')
    .max(100, 'Responsible party must be less than 100 characters'),

  responsible_vendor_id: z.string()
    .uuid()
    .optional()
    .or(z.literal('')),

  setup_required: z.boolean(),

  breakdown_required: z.boolean(),

  is_critical: z.boolean(),

  // Handling tab
  handling_notes: z.string()
    .max(1000, 'Handling notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),

  // Status tab (for edit mode)
  status: repurposingStatusSchema.optional(),

  completed_by: z.string()
    .max(100, 'Completed by must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  issue_description: z.string()
    .max(500, 'Issue description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type RepurposingFormSchemaType = z.infer<typeof repurposingFormSchema>;

// =============================================================================
// Database Submission Schema
// =============================================================================

/**
 * Schema for transforming form data to database format
 * Used when submitting to Supabase
 * Note: Time fields are converted from HH:MM to HH:MM:SS
 */
export const repurposingDbSchema = z.object({
  wedding_id: z.string().uuid(),
  wedding_item_id: z.string().uuid(),
  from_event_id: z.string().uuid(),
  from_event_end_time: z.string().nullable(),
  pickup_location: z.string().min(1).max(200),
  pickup_time: z.string(), // HH:MM:SS format
  pickup_time_relative: z.string().max(100).nullable(),
  to_event_id: z.string().uuid(),
  to_event_start_time: z.string().nullable(),
  dropoff_location: z.string().min(1).max(200),
  dropoff_time: z.string(), // HH:MM:SS format
  dropoff_time_relative: z.string().max(100).nullable(),
  responsible_party: z.string().min(1).max(100),
  responsible_vendor_id: z.string().uuid().nullable(),
  handling_notes: z.string().max(1000).nullable(),
  setup_required: z.boolean(),
  breakdown_required: z.boolean(),
  is_critical: z.boolean(),
  status: repurposingStatusSchema,
});

export type RepurposingDbSchemaType = z.infer<typeof repurposingDbSchema>;

// =============================================================================
// Status Update Schemas
// =============================================================================

/**
 * Schema for starting an instruction (pending → in_progress)
 */
export const startInstructionSchema = z.object({
  status: z.literal('in_progress'),
  started_at: z.string(),
});

/**
 * Schema for completing an instruction (in_progress → completed)
 */
export const completeInstructionSchema = z.object({
  status: z.literal('completed'),
  completed_at: z.string(),
  completed_by: z.string()
    .min(1, 'Please enter who completed this instruction')
    .max(100, 'Name must be less than 100 characters'),
});

export type CompleteInstructionSchemaType = z.infer<typeof completeInstructionSchema>;

/**
 * Schema for reporting an issue
 */
export const reportIssueSchema = z.object({
  status: z.literal('issue'),
  issue_description: z.string()
    .min(1, 'Please describe the issue')
    .max(500, 'Description must be less than 500 characters'),
});

export type ReportIssueSchemaType = z.infer<typeof reportIssueSchema>;

/**
 * Schema for resuming after an issue (issue → in_progress)
 */
export const resumeInstructionSchema = z.object({
  status: z.literal('in_progress'),
  issue_description: z.null(),
  started_at: z.string(),
});

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert time from HH:MM to HH:MM:SS format for database storage
 * @param time - Time string in HH:MM format
 * @returns Time string in HH:MM:SS format
 */
export function convertTimeToDbFormat(time: string): string {
  if (!time) return '';
  // If already has seconds, return as-is
  if (time.split(':').length === 3) return time;
  return `${time}:00`;
}

/**
 * Convert time from HH:MM:SS to HH:MM format for form display
 * @param time - Time string in HH:MM:SS format
 * @returns Time string in HH:MM format
 */
export function convertTimeToFormFormat(time: string | null): string {
  if (!time) return '';
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
}
