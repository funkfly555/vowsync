/**
 * Payment Schedule Zod Validation Schema
 * @feature 009-vendor-payments-invoices
 * T010: Zod validation for payment schedule forms
 */

import { z } from 'zod';

/**
 * Schema for creating/editing payment milestones
 */
export const paymentScheduleSchema = z.object({
  milestone_name: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),
  due_date: z.string().min(1, 'Due date is required'),
  amount: z
    .number({ error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  percentage: z
    .number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage must be at most 100')
    .nullable()
    .optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type PaymentScheduleFormValues = z.infer<typeof paymentScheduleSchema>;

/**
 * Schema for marking a payment as paid
 */
export const markAsPaidSchema = z.object({
  paid_date: z.string().min(1, 'Payment date is required'),
  payment_method: z.string().optional(),
  payment_reference: z.string().max(100, 'Reference must be less than 100 characters').optional(),
});

export type MarkAsPaidFormValues = z.infer<typeof markAsPaidSchema>;

/**
 * Default values for payment schedule form
 */
export const defaultPaymentScheduleValues: PaymentScheduleFormValues = {
  milestone_name: '',
  due_date: '',
  amount: 0,
  percentage: null,
  notes: '',
};

/**
 * Default values for mark as paid form
 */
export const defaultMarkAsPaidValues: MarkAsPaidFormValues = {
  paid_date: new Date().toISOString().split('T')[0],
  payment_method: '',
  payment_reference: '',
};
