/**
 * Document Generation Zod Schemas
 * Feature: 017-document-generation
 *
 * Validation schemas for document generation options.
 */

import { z } from 'zod';

/**
 * Document section validation
 */
export const documentSectionSchema = z.enum([
  'wedding_overview',
  'event_summary',
  'guest_list',
  'attendance_matrix',
  'meal_selections',
  'bar_orders',
  'furniture_equipment',
  'repurposing',
  'staff_requirements',
  'transportation',
  'stationery',
  'beauty_services',
  'accommodation',
  'shopping_list',
  'budget_summary',
  'vendor_contacts',
  'timeline',
]);

/**
 * Document format validation
 */
export const documentFormatSchema = z.enum(['pdf', 'docx', 'both']);

/**
 * Branding options validation
 */
export const documentBrandingSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
    .default('#D4A5A5'),
  logo: z.string().optional(),
});

/**
 * Function Sheet generation options validation
 */
export const functionSheetOptionsSchema = z.object({
  weddingId: z.string().uuid('Invalid wedding ID'),
  sections: z
    .array(documentSectionSchema)
    .min(1, 'At least one section must be selected'),
  format: documentFormatSchema,
  branding: documentBrandingSchema,
});

/**
 * Vendor Brief generation options validation
 */
export const vendorBriefOptionsSchema = z.object({
  vendorId: z.string().uuid('Invalid vendor ID'),
  weddingId: z.string().uuid('Invalid wedding ID'),
  format: documentFormatSchema,
  branding: documentBrandingSchema,
});

/**
 * Logo file validation
 */
export const logoFileSchema = z
  .instanceof(File)
  .refine(
    (file) => ['image/png', 'image/jpeg'].includes(file.type),
    'Logo must be PNG or JPG format'
  )
  .refine(
    (file) => file.size <= 2 * 1024 * 1024,
    'Logo must be less than 2MB'
  );

// Type exports inferred from schemas
export type DocumentSectionInput = z.infer<typeof documentSectionSchema>;
export type DocumentFormatInput = z.infer<typeof documentFormatSchema>;
export type DocumentBrandingInput = z.infer<typeof documentBrandingSchema>;
export type FunctionSheetOptionsInput = z.infer<typeof functionSheetOptionsSchema>;
export type VendorBriefOptionsInput = z.infer<typeof vendorBriefOptionsSchema>;
