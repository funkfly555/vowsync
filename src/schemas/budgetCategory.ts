/**
 * Budget Category Zod Validation Schema
 * @feature 011-budget-tracking
 * @feature 029-budget-vendor-integration
 * T003: Zod validation for budget category forms
 * T033: Category type validation with conditional custom_name
 */

import { z } from 'zod';

/**
 * Schema for creating/editing budget categories
 * FR-012: category_name required, max 100 chars
 * FR-013: projected_amount required, >= 0, max 9,999,999.99
 * FR-014: actual_amount >= 0, max 9,999,999.99, defaults to 0
 * T033: category_type_id required, custom_name required when "Other/Custom"
 */
export const budgetCategorySchema = z.object({
  category_name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters'),
  projected_amount: z
    .number({ error: 'Projected amount must be a number' })
    .min(0, 'Projected amount cannot be negative')
    .max(9999999.99, 'Projected amount cannot exceed R 9,999,999.99'),
  actual_amount: z
    .number({ error: 'Actual amount must be a number' })
    .min(0, 'Actual amount cannot be negative')
    .max(9999999.99, 'Actual amount cannot exceed R 9,999,999.99'),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable(),
  // Feature 029: Category type fields
  category_type_id: z.string().optional(),
  custom_name: z
    .string()
    .max(100, 'Custom name must be less than 100 characters')
    .optional()
    .nullable(),
});

export type BudgetCategoryFormValues = z.infer<typeof budgetCategorySchema>;

/**
 * Default values for budget category form
 */
export const defaultBudgetCategoryValues: BudgetCategoryFormValues = {
  category_name: '',
  projected_amount: 0,
  actual_amount: 0,
  notes: '',
  category_type_id: '',
  custom_name: '',
};

/**
 * Transform form values to database insert format
 * T034: Include category_type_id and custom_name
 */
export function toBudgetCategoryInsert(
  values: BudgetCategoryFormValues,
  weddingId: string
): {
  wedding_id: string;
  category_name: string;
  projected_amount: number;
  actual_amount: number;
  notes: string | null;
  category_type_id: string | null;
  custom_name: string | null;
} {
  return {
    wedding_id: weddingId,
    category_name: values.category_name.trim(),
    projected_amount: values.projected_amount,
    actual_amount: values.actual_amount,
    notes: values.notes?.trim() || null,
    category_type_id: values.category_type_id || null,
    custom_name: values.custom_name?.trim() || null,
  };
}

/**
 * Transform form values to database update format
 * T034: Include category_type_id and custom_name
 */
export function toBudgetCategoryUpdate(values: BudgetCategoryFormValues): {
  category_name: string;
  projected_amount: number;
  actual_amount: number;
  notes: string | null;
  category_type_id: string | null;
  custom_name: string | null;
} {
  return {
    category_name: values.category_name.trim(),
    projected_amount: values.projected_amount,
    actual_amount: values.actual_amount,
    notes: values.notes?.trim() || null,
    category_type_id: values.category_type_id || null,
    custom_name: values.custom_name?.trim() || null,
  };
}
