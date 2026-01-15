/**
 * Bar Order Item Zod Validation Schemas
 * @feature 012-bar-order-management
 */

import { z } from 'zod';

// =============================================================================
// Form Input Schema
// =============================================================================

/**
 * Zod schema for bar order item form validation
 * Validates item parameters and percentage constraints
 */
export const barOrderItemFormSchema = z.object({
  item_name: z.string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be less than 100 characters'),

  percentage: z.number()
    .min(0.01, 'Percentage must be greater than 0')
    .max(1, 'Percentage cannot exceed 100%'),

  servings_per_unit: z.number()
    .int('Servings per unit must be a whole number')
    .min(1, 'Servings per unit must be at least 1'),

  cost_per_unit: z.number()
    .min(0, 'Cost must be 0 or more')
    .nullable(),

  sort_order: z.number()
    .int('Sort order must be a whole number')
    .min(0, 'Sort order must be 0 or more'),
});

export type BarOrderItemFormSchemaType = z.infer<typeof barOrderItemFormSchema>;

// =============================================================================
// Form Input Schema (String-based for form inputs)
// =============================================================================

/**
 * Schema for form inputs where numbers are entered as strings
 * Used with React Hook Form for controlled inputs
 */
export const barOrderItemFormInputSchema = z.object({
  item_name: z.string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be less than 100 characters'),

  percentage: z.string()
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 100;
    }, {
      message: 'Percentage must be between 0% and 100%',
    }),

  servings_per_unit: z.string()
    .refine(val => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 1;
    }, {
      message: 'Servings per unit must be at least 1',
    }),

  cost_per_unit: z.string()
    .refine(val => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, {
      message: 'Cost must be 0 or more',
    }),

  sort_order: z.number().int().min(0),
});

export type BarOrderItemFormInputSchemaType = z.infer<typeof barOrderItemFormInputSchema>;

// =============================================================================
// Database Submission Schema
// =============================================================================

/**
 * Schema for transforming form data to database format
 * Used when submitting to Supabase
 */
export const barOrderItemDbSchema = z.object({
  bar_order_id: z.string().uuid(),
  item_name: z.string().min(1),
  percentage: z.number().min(0.01).max(1),
  servings_per_unit: z.number().int().min(1),
  cost_per_unit: z.number().min(0).nullable(),
  sort_order: z.number().int().min(0),
});

export type BarOrderItemDbSchemaType = z.infer<typeof barOrderItemDbSchema>;

// =============================================================================
// Database Entity Schema (for validation of fetched data)
// =============================================================================

export const barOrderItemEntitySchema = z.object({
  id: z.string().uuid(),
  bar_order_id: z.string().uuid(),
  item_name: z.string(),
  percentage: z.number(),
  servings_per_unit: z.number().int(),
  cost_per_unit: z.number().nullable(),
  calculated_servings: z.number(),
  units_needed: z.number().int(),
  total_cost: z.number().nullable(),
  sort_order: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BarOrderItemEntitySchemaType = z.infer<typeof barOrderItemEntitySchema>;

// =============================================================================
// Transform Helpers
// =============================================================================

/**
 * Transform string form input to number form data
 */
export function transformItemFormInput(input: BarOrderItemFormInputSchemaType): Omit<BarOrderItemFormSchemaType, 'sort_order'> & { sort_order: number } {
  return {
    item_name: input.item_name,
    percentage: parseFloat(input.percentage) / 100, // Convert % to decimal
    servings_per_unit: parseInt(input.servings_per_unit, 10),
    cost_per_unit: input.cost_per_unit ? parseFloat(input.cost_per_unit) : null,
    sort_order: input.sort_order,
  };
}
