/**
 * Invoice Zod Validation Schema
 * @feature 009-vendor-payments-invoices
 * T011: Zod validation for invoice forms
 */

import { z } from 'zod';

/**
 * Schema for creating/editing invoices
 */
export const invoiceSchema = z.object({
  invoice_number: z
    .string()
    .min(1, 'Invoice number is required')
    .max(50, 'Invoice number must be less than 50 characters'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  amount: z
    .number({ error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  vat_amount: z
    .number({ error: 'VAT amount must be a number' })
    .min(0, 'VAT cannot be negative'),
  payment_schedule_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

/**
 * Schema for marking an invoice as paid
 */
export const markInvoicePaidSchema = z.object({
  paid_date: z.string().min(1, 'Payment date is required'),
  payment_method: z.string().optional(),
  payment_reference: z.string().max(100, 'Reference must be less than 100 characters').optional(),
});

export type MarkInvoicePaidFormValues = z.infer<typeof markInvoicePaidSchema>;

/**
 * Default values for invoice form
 */
export const defaultInvoiceValues: InvoiceFormValues = {
  invoice_number: '',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: '',
  amount: 0,
  vat_amount: 0,
  payment_schedule_id: null,
  notes: '',
};

/**
 * Default values for mark invoice as paid form
 */
export const defaultMarkInvoicePaidValues: MarkInvoicePaidFormValues = {
  paid_date: new Date().toISOString().split('T')[0],
  payment_method: '',
  payment_reference: '',
};
