/**
 * Budget Category Zod Validation Schema
 * @feature 011-budget-tracking
 * T003: Zod validation for budget category forms
 */

import { z } from 'zod';

/**
 * Schema for creating/editing budget categories
 * FR-012: category_name required, max 100 chars
 * FR-013: projected_amount required, >= 0, max 9,999,999.99
 * FR-014: actual_amount >= 0, max 9,999,999.99, defaults to 0
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
};

/**
 * Transform form values to database insert format
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
} {
  return {
    wedding_id: weddingId,
    category_name: values.category_name.trim(),
    projected_amount: values.projected_amount,
    actual_amount: values.actual_amount,
    notes: values.notes?.trim() || null,
  };
}

/**
 * Transform form values to database update format
 */
export function toBudgetCategoryUpdate(values: BudgetCategoryFormValues): {
  category_name: string;
  projected_amount: number;
  actual_amount: number;
  notes: string | null;
} {
  return {
    category_name: values.category_name.trim(),
    projected_amount: values.projected_amount,
    actual_amount: values.actual_amount,
    notes: values.notes?.trim() || null,
  };
}
