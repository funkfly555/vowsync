/**
 * Vendor Contact Zod Validation Schema
 * @feature 009-vendor-payments-invoices
 * T012: Zod validation for vendor contact forms
 */

import { z } from 'zod';

/**
 * Schema for creating/editing vendor contacts
 */
export const vendorContactSchema = z.object({
  contact_name: z
    .string()
    .min(1, 'Contact name is required')
    .max(100, 'Contact name must be less than 100 characters'),
  contact_role: z
    .string()
    .max(100, 'Role must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  contact_email: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  contact_phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  is_primary: z.boolean(),
  is_onsite_contact: z.boolean(),
});

export type VendorContactFormValues = z.infer<typeof vendorContactSchema>;

/**
 * Default values for vendor contact form
 */
export const defaultVendorContactValues: VendorContactFormValues = {
  contact_name: '',
  contact_role: '',
  contact_email: '',
  contact_phone: '',
  is_primary: false,
  is_onsite_contact: false,
};
