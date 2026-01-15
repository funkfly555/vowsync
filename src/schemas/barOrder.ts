/**
 * Bar Order Zod Validation Schemas
 * @feature 012-bar-order-management
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

export const BAR_ORDER_STATUSES = ['draft', 'confirmed', 'ordered', 'delivered'] as const;

// =============================================================================
// Base Type Schemas
// =============================================================================

export const barOrderStatusSchema = z.enum(BAR_ORDER_STATUSES);

// =============================================================================
// Form Input Schema
// =============================================================================

/**
 * Zod schema for bar order form validation
 * Validates consumption model parameters and business rules
 */
export const barOrderFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),

  event_id: z.string().uuid().nullable(),

  vendor_id: z.string().uuid().nullable(),

  guest_count_adults: z.number()
    .int('Guest count must be a whole number')
    .min(0, 'Guest count must be 0 or more'),

  event_duration_hours: z.number()
    .min(0.5, 'Duration must be at least 30 minutes')
    .max(24, 'Duration cannot exceed 24 hours'),

  first_hours: z.number()
    .min(0, 'First hours must be 0 or more'),

  first_hours_drinks_per_hour: z.number()
    .min(0, 'Drinks per hour must be 0 or more'),

  remaining_hours_drinks_per_hour: z.number()
    .min(0, 'Drinks per hour must be 0 or more'),

  status: barOrderStatusSchema,

  notes: z.string().max(2000, 'Notes must be less than 2000 characters').nullable(),
}).refine(
  (data) => data.first_hours <= data.event_duration_hours,
  {
    message: 'First hours cannot exceed event duration',
    path: ['first_hours'],
  }
);

export type BarOrderFormSchemaType = z.infer<typeof barOrderFormSchema>;

// =============================================================================
// Database Submission Schema
// =============================================================================

/**
 * Schema for transforming form data to database format
 * Used when submitting to Supabase
 */
export const barOrderDbSchema = z.object({
  name: z.string().min(1),
  event_id: z.string().uuid().nullable(),
  vendor_id: z.string().uuid().nullable(),
  guest_count_adults: z.number().int().min(0),
  event_duration_hours: z.number().min(0.5).max(24),
  first_hours: z.number().min(0),
  first_hours_drinks_per_hour: z.number().min(0),
  remaining_hours_drinks_per_hour: z.number().min(0),
  status: barOrderStatusSchema,
  notes: z.string().nullable(),
});

export type BarOrderDbSchemaType = z.infer<typeof barOrderDbSchema>;

// =============================================================================
// Database Entity Schema (for validation of fetched data)
// =============================================================================

export const barOrderEntitySchema = z.object({
  id: z.string().uuid(),
  wedding_id: z.string().uuid(),
  event_id: z.string().uuid().nullable(),
  vendor_id: z.string().uuid().nullable(),
  name: z.string(),
  guest_count_adults: z.number().int(),
  event_duration_hours: z.number(),
  first_hours: z.number(),
  first_hours_drinks_per_hour: z.number(),
  remaining_hours_drinks_per_hour: z.number(),
  total_servings_per_person: z.number(),
  status: barOrderStatusSchema,
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BarOrderEntitySchemaType = z.infer<typeof barOrderEntitySchema>;
