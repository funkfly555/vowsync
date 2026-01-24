/**
 * Vendor Zod Validation Schemas
 * @feature 008-vendor-management
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

/**
 * Vendor type options for select dropdown
 * Must match VendorType in types/vendor.ts
 */
export const VENDOR_TYPES = [
  'Catering',
  'Photography',
  'Videography',
  'Flowers',
  'Florist',
  'Music/DJ',
  'Entertainment',
  'Venue',
  'Transportation',
  'Officiant',
  'Hair/Makeup',
  'Hair & Makeup',
  'Rentals',
  'Decor',
  'Cake',
  'Stationery',
  'Beverages',
  'Other',
] as const;

export const VENDOR_STATUSES = ['active', 'inactive', 'backup'] as const;

// =============================================================================
// Base Type Schemas
// =============================================================================

export const vendorTypeSchema = z.enum(VENDOR_TYPES);

export const vendorStatusSchema = z.enum(VENDOR_STATUSES);

// =============================================================================
// Form Input Schema (matches VendorFormData - no transforms)
// =============================================================================

/**
 * Zod schema for vendor form validation (FR-019, FR-020, FR-021)
 * This schema matches VendorFormData exactly for React Hook Form compatibility.
 * Transforms are handled manually in the submit handler.
 */
export const vendorFormSchema = z.object({
  // Basic Info - Required fields (FR-007)
  vendor_type: z.enum(VENDOR_TYPES, {
    error: 'Vendor type is required',
  }),
  company_name: z.string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters'),
  contact_name: z.string()
    .min(1, 'Contact name is required')
    .max(100, 'Contact name must be less than 100 characters'),

  // Basic Info - Optional fields (strings for form inputs)
  contact_email: z.string()
    .email('Invalid email format')
    .or(z.literal('')),
  contact_phone: z.string()
    .max(30, 'Phone number must be less than 30 characters'),
  address: z.string()
    .max(500, 'Address must be less than 500 characters'),
  website: z.string()
    .url('Invalid URL format')
    .or(z.literal('')),
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters'),
  status: z.enum(VENDOR_STATUSES),

  // Contract Details (strings for form inputs)
  contract_signed: z.boolean(),
  contract_date: z.string(),
  contract_expiry_date: z.string(),
  contract_value: z.string()
    .refine(val => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, {
      message: 'Contract value must be a non-negative number', // FR-020
    }),
  cancellation_policy: z.string()
    .max(1000, 'Cancellation policy must be less than 1000 characters'),
  cancellation_fee_percentage: z.string()
    .refine(val => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, {
      message: 'Cancellation fee must be between 0 and 100%', // FR-020
    }),
  insurance_required: z.boolean(),
  insurance_verified: z.boolean(),
  insurance_expiry_date: z.string(),

  // Banking Information (strings for form inputs)
  bank_name: z.string()
    .max(100, 'Bank name must be less than 100 characters'),
  account_name: z.string()
    .max(100, 'Account name must be less than 100 characters'),
  account_number: z.string()
    .max(50, 'Account number must be less than 50 characters'),
  branch_code: z.string()
    .max(20, 'Branch code must be less than 20 characters'),
  swift_code: z.string()
    .max(20, 'SWIFT code must be less than 20 characters'),
}).refine(
  // FR-021: Validate contract_expiry_date > contract_date
  (data) => {
    if (data.contract_date && data.contract_expiry_date) {
      return new Date(data.contract_expiry_date) > new Date(data.contract_date);
    }
    return true;
  },
  {
    message: 'Contract expiry date must be after contract date',
    path: ['contract_expiry_date'],
  }
);

export type VendorFormSchemaType = z.infer<typeof vendorFormSchema>;

// =============================================================================
// Database Submission Schema (with transforms for API calls)
// =============================================================================

/**
 * Schema for transforming form data to database format
 * Used when submitting to Supabase
 */
export const vendorSchema = z.object({
  vendor_type: z.enum(VENDOR_TYPES),
  company_name: z.string().min(1),
  contact_name: z.string().min(1),
  contact_email: z.string().transform(val => val || null),
  contact_phone: z.string().transform(val => val || null),
  address: z.string().transform(val => val || null),
  website: z.string().transform(val => val || null),
  notes: z.string().transform(val => val || null),
  status: z.enum(VENDOR_STATUSES),
  contract_signed: z.boolean(),
  contract_date: z.string().transform(val => val || null),
  contract_expiry_date: z.string().transform(val => val || null),
  contract_value: z.string().transform(val => {
    if (!val) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  }),
  cancellation_policy: z.string().transform(val => val || null),
  cancellation_fee_percentage: z.string().transform(val => {
    if (!val) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  }),
  insurance_required: z.boolean(),
  insurance_verified: z.boolean(),
  insurance_expiry_date: z.string().transform(val => val || null),
  bank_name: z.string().transform(val => val || null),
  account_name: z.string().transform(val => val || null),
  account_number: z.string().transform(val => val || null),
  branch_code: z.string().transform(val => val || null),
  swift_code: z.string().transform(val => val || null),
});

export type VendorSchemaType = z.infer<typeof vendorSchema>;

// =============================================================================
// Database Entity Schema (for validation of fetched data)
// =============================================================================

export const vendorDbSchema = z.object({
  id: z.string().uuid(),
  wedding_id: z.string().uuid(),
  vendor_type: vendorTypeSchema,
  company_name: z.string(),
  contact_name: z.string(),
  contact_email: z.string().nullable(),
  contact_phone: z.string().nullable(),
  address: z.string().nullable(),
  website: z.string().nullable(),
  contract_signed: z.boolean(),
  contract_date: z.string().nullable(),
  contract_expiry_date: z.string().nullable(),
  contract_value: z.number().nullable(),
  cancellation_policy: z.string().nullable(),
  cancellation_fee_percentage: z.number().nullable(),
  insurance_required: z.boolean(),
  insurance_verified: z.boolean(),
  insurance_expiry_date: z.string().nullable(),
  bank_name: z.string().nullable(),
  account_name: z.string().nullable(),
  account_number: z.string().nullable(),
  branch_code: z.string().nullable(),
  swift_code: z.string().nullable(),
  notes: z.string().nullable(),
  status: vendorStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type VendorDbSchemaType = z.infer<typeof vendorDbSchema>;

// =============================================================================
// Filter Schema
// =============================================================================

export const vendorFiltersSchema = z.object({
  search: z.string(),
  vendorType: vendorTypeSchema.or(z.literal('all')),
  contractStatus: z.enum(['Unsigned', 'Signed', 'Expiring Soon', 'Expired']).or(z.literal('all')),
  paymentStatus: z.enum(['Paid', 'Pending', 'Overdue', 'Due Soon']).or(z.literal('all')),
});

export type VendorFiltersSchemaType = z.infer<typeof vendorFiltersSchema>;
