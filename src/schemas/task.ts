/**
 * Task Zod Validation Schemas
 * @feature 015-task-management-kanban
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

/**
 * Task type options for select dropdown
 */
export const TASK_TYPES = [
  'delivery',
  'collection',
  'appointment',
  'general',
  'milestone',
] as const;

/**
 * Task priority options for select dropdown
 */
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

/**
 * Task status options
 */
export const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const;

// =============================================================================
// Base Type Schemas
// =============================================================================

export const taskTypeSchema = z.enum(TASK_TYPES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);
export const taskStatusSchema = z.enum(TASK_STATUSES);

// =============================================================================
// Form Input Schema (matches TaskFormData - no transforms)
// =============================================================================

/**
 * Zod schema for task form validation
 * This schema matches TaskFormData exactly for React Hook Form compatibility.
 */
export const taskFormSchema = z.object({
  // Details Tab - Required fields
  task_type: z.enum(TASK_TYPES, {
    message: 'Task type is required',
  }),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters'),
  due_date: z.string().min(1, 'Due date is required'),
  due_time: z.string(),
  priority: z.enum(TASK_PRIORITIES),

  // Assignment Tab - Optional fields
  assigned_to: z.string().max(100, 'Assignee name must be less than 100 characters'),
  vendor_id: z.string(),
  location: z.string().max(200, 'Location must be less than 200 characters'),
  address: z.string().max(500, 'Address must be less than 500 characters'),

  // Contact Tab - Optional fields
  contact_person: z.string().max(100, 'Contact person must be less than 100 characters'),
  contact_phone: z.string().max(30, 'Phone number must be less than 30 characters'),
  contact_email: z.string().email('Invalid email format').or(z.literal('')),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters'),

  // Reminders
  reminder_date: z.string(),
});

export type TaskFormSchemaType = z.infer<typeof taskFormSchema>;

// =============================================================================
// Database Submission Schema (with transforms for API calls)
// =============================================================================

/**
 * Schema for transforming form data to database format
 * Used when submitting to Supabase
 */
export const taskDbSchema = z.object({
  task_type: z.enum(TASK_TYPES),
  title: z.string().min(1),
  description: z.string().transform((val) => val || null),
  due_date: z.string().min(1),
  due_time: z.string().transform((val) => val || null),
  priority: z.enum(TASK_PRIORITIES),
  assigned_to: z.string().transform((val) => val || null),
  vendor_id: z.string().transform((val) => val || null),
  location: z.string().transform((val) => val || null),
  address: z.string().transform((val) => val || null),
  contact_person: z.string().transform((val) => val || null),
  contact_phone: z.string().transform((val) => val || null),
  contact_email: z.string().transform((val) => val || null),
  notes: z.string().transform((val) => val || null),
  reminder_date: z.string().transform((val) => val || null),
});

export type TaskDbSchemaType = z.infer<typeof taskDbSchema>;

// =============================================================================
// Update Status Schema
// =============================================================================

/**
 * Schema for updating task status
 */
export const updateTaskStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(TASK_STATUSES),
  completed_date: z.string().nullable().optional(),
  completed_by: z.string().nullable().optional(),
});

export type UpdateTaskStatusSchemaType = z.infer<typeof updateTaskStatusSchema>;

// =============================================================================
// Filter Schema
// =============================================================================

export const taskFiltersSchema = z.object({
  status: z.enum(TASK_STATUSES).or(z.array(z.enum(TASK_STATUSES))).optional(),
  priority: z.enum(TASK_PRIORITIES).or(z.array(z.enum(TASK_PRIORITIES))).optional(),
  task_type: z.enum(TASK_TYPES).or(z.array(z.enum(TASK_TYPES))).optional(),
  assigned_to: z.string().optional(),
  is_pre_wedding: z.boolean().optional(),
  search: z.string().optional(),
});

export type TaskFiltersSchemaType = z.infer<typeof taskFiltersSchema>;
