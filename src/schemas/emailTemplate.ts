/**
 * Email Template Zod Validation Schemas
 * @feature 016-email-campaigns
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

export const TEMPLATE_TYPES = [
  'rsvp_reminder',
  'vendor_brief',
  'thank_you',
  'payment_reminder',
  'custom',
] as const;

export const TEMPLATE_TYPE_LABELS: Record<typeof TEMPLATE_TYPES[number], string> = {
  rsvp_reminder: 'RSVP Reminder',
  vendor_brief: 'Vendor Brief',
  thank_you: 'Thank You',
  payment_reminder: 'Payment Reminder',
  custom: 'Custom',
};

// =============================================================================
// Base Type Schemas
// =============================================================================

export const templateTypeSchema = z.enum(TEMPLATE_TYPES);

// =============================================================================
// Form Input Schema
// =============================================================================

/**
 * Zod schema for email template form validation
 */
export const emailTemplateFormSchema = z.object({
  template_name: z.string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be less than 100 characters'),

  template_type: templateTypeSchema,

  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),

  body_html: z.string()
    .min(1, 'Email content is required')
    .max(50000, 'Content must be less than 50,000 characters'),

  body_text: z.string()
    .max(50000, 'Plain text must be less than 50,000 characters')
    .nullable(),

  is_default: z.boolean(),

  is_active: z.boolean(),
});

export type EmailTemplateFormSchemaType = z.infer<typeof emailTemplateFormSchema>;

// =============================================================================
// Database Submission Schema
// =============================================================================

/**
 * Schema for transforming form data to database format
 */
export const emailTemplateDbSchema = z.object({
  consultant_id: z.string().uuid(),
  template_name: z.string().min(1).max(100),
  template_type: templateTypeSchema,
  subject: z.string().min(1).max(200),
  body_html: z.string().min(1),
  body_text: z.string().nullable(),
  variables: z.array(z.string()),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export type EmailTemplateDbSchemaType = z.infer<typeof emailTemplateDbSchema>;

// =============================================================================
// Database Entity Schema (for validation of fetched data)
// =============================================================================

export const emailTemplateEntitySchema = z.object({
  id: z.string().uuid(),
  consultant_id: z.string().uuid(),
  template_name: z.string(),
  template_type: templateTypeSchema,
  subject: z.string(),
  body_html: z.string(),
  body_text: z.string().nullable(),
  variables: z.array(z.string()),
  is_default: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EmailTemplateEntitySchemaType = z.infer<typeof emailTemplateEntitySchema>;
