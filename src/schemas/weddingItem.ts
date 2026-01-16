/**
 * Wedding Item Zod Validation Schemas
 * @feature 013-wedding-items
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

export const AGGREGATION_METHODS = ['ADD', 'MAX'] as const;

// =============================================================================
// Base Type Schemas
// =============================================================================

export const aggregationMethodSchema = z.enum(AGGREGATION_METHODS);

// =============================================================================
// Form Input Schema
// =============================================================================

/**
 * Zod schema for wedding item form validation
 * Validates all fields with appropriate constraints
 */
export const weddingItemFormSchema = z.object({
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category must be less than 100 characters'),

  description: z.string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),

  aggregation_method: aggregationMethodSchema,

  number_available: z.number()
    .int('Available quantity must be a whole number')
    .min(0, 'Available quantity must be 0 or more')
    .nullable(),

  cost_per_unit: z.number()
    .min(0, 'Cost per unit must be 0 or more')
    .nullable(),

  cost_details: z.string()
    .max(500, 'Cost details must be less than 500 characters')
    .nullable(),

  supplier_name: z.string()
    .max(100, 'Supplier name must be less than 100 characters')
    .nullable(),

  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .nullable(),

  event_quantities: z.record(z.string().uuid(), z.number().int().min(0)),
});

export type WeddingItemFormSchemaType = z.infer<typeof weddingItemFormSchema>;

// =============================================================================
// Database Submission Schema
// =============================================================================

/**
 * Schema for transforming form data to database format
 * Used when submitting to Supabase
 */
export const weddingItemDbSchema = z.object({
  wedding_id: z.string().uuid(),
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  aggregation_method: aggregationMethodSchema,
  number_available: z.number().int().min(0).nullable(),
  total_required: z.number().int().min(0),
  cost_per_unit: z.number().min(0).nullable(),
  cost_details: z.string().max(500).nullable(),
  total_cost: z.number().min(0).nullable(),
  supplier_name: z.string().max(100).nullable(),
  notes: z.string().max(1000).nullable(),
});

export type WeddingItemDbSchemaType = z.infer<typeof weddingItemDbSchema>;

// =============================================================================
// Database Entity Schema (for validation of fetched data)
// =============================================================================

export const weddingItemEntitySchema = z.object({
  id: z.string().uuid(),
  wedding_id: z.string().uuid(),
  category: z.string(),
  description: z.string(),
  aggregation_method: aggregationMethodSchema,
  number_available: z.number().int().nullable(),
  total_required: z.number().int(),
  cost_per_unit: z.number().nullable(),
  cost_details: z.string().nullable(),
  total_cost: z.number().nullable(),
  supplier_name: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type WeddingItemEntitySchemaType = z.infer<typeof weddingItemEntitySchema>;

// =============================================================================
// Event Quantity Schema
// =============================================================================

/**
 * Schema for event quantity form input
 */
export const eventQuantityFormSchema = z.object({
  event_id: z.string().uuid(),
  quantity_required: z.number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity must be 0 or more'),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .nullable(),
});

export type EventQuantityFormSchemaType = z.infer<typeof eventQuantityFormSchema>;

/**
 * Schema for event quantity database submission
 */
export const eventQuantityDbSchema = z.object({
  wedding_item_id: z.string().uuid(),
  event_id: z.string().uuid(),
  quantity_required: z.number().int().min(0),
  notes: z.string().max(500).nullable(),
});

export type EventQuantityDbSchemaType = z.infer<typeof eventQuantityDbSchema>;

/**
 * Schema for event quantity entity from database
 */
export const eventQuantityEntitySchema = z.object({
  id: z.string().uuid(),
  wedding_item_id: z.string().uuid(),
  event_id: z.string().uuid(),
  quantity_required: z.number().int(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EventQuantityEntitySchemaType = z.infer<typeof eventQuantityEntitySchema>;
