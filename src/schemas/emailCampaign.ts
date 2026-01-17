/**
 * Email Campaign Zod Validation Schemas
 * @feature 016-email-campaigns
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

export const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'sending', 'sent', 'failed'] as const;

export const RECIPIENT_TYPES = ['guest', 'vendor'] as const;

export const CAMPAIGN_STATUS_LABELS: Record<typeof CAMPAIGN_STATUSES[number], string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sending: 'Sending',
  sent: 'Sent',
  failed: 'Failed',
};

export const EMAIL_LOG_STATUSES = [
  'pending',
  'sent',
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'soft_bounce',
  'hard_bounce',
  'failed',
  'spam',
] as const;

export const EMAIL_LOG_STATUS_LABELS: Record<typeof EMAIL_LOG_STATUSES[number], string> = {
  pending: 'Pending',
  sent: 'Sent',
  delivered: 'Delivered',
  opened: 'Opened',
  clicked: 'Clicked',
  bounced: 'Bounced',
  soft_bounce: 'Soft Bounce',
  hard_bounce: 'Hard Bounce',
  failed: 'Failed',
  spam: 'Spam',
};

// =============================================================================
// Base Type Schemas
// =============================================================================

export const campaignStatusSchema = z.enum(CAMPAIGN_STATUSES);
export const recipientTypeSchema = z.enum(RECIPIENT_TYPES);
export const emailLogStatusSchema = z.enum(EMAIL_LOG_STATUSES);

// =============================================================================
// Filter Schemas
// =============================================================================

export const guestFilterSchema = z.object({
  rsvp_status: z.enum(['pending', 'accepted', 'declined']).optional(),
  event_id: z.string().uuid().optional(),
  has_dietary_restrictions: z.boolean().optional(),
  table_assigned: z.boolean().optional(),
});

export const vendorFilterSchema = z.object({
  vendor_type: z.string().optional(),
  contract_status: z.enum(['pending', 'signed', 'expired']).optional(),
  payment_status: z.enum(['pending', 'partial', 'paid']).optional(),
});

export const recipientFilterSchema = z.union([guestFilterSchema, vendorFilterSchema]);

// =============================================================================
// Form Input Schema
// =============================================================================

/**
 * Zod schema for email campaign form validation
 */
export const emailCampaignFormSchema = z.object({
  campaign_name: z.string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters'),

  template_id: z.string().uuid().nullable(),

  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),

  body_html: z.string()
    .min(1, 'Email content is required'),

  body_text: z.string().nullable(),

  recipient_type: recipientTypeSchema,

  recipient_filter: recipientFilterSchema.nullable(),

  scheduled_at: z.string().nullable().refine(
    (val) => {
      if (!val) return true;
      const scheduledDate = new Date(val);
      return scheduledDate > new Date();
    },
    { message: 'Scheduled time must be in the future' }
  ),
});

export type EmailCampaignFormSchemaType = z.infer<typeof emailCampaignFormSchema>;

// =============================================================================
// Database Submission Schema
// =============================================================================

/**
 * Schema for transforming form data to database format
 */
export const emailCampaignDbSchema = z.object({
  wedding_id: z.string().uuid(),
  template_id: z.string().uuid().nullable(),
  campaign_name: z.string().min(1).max(100),
  campaign_type: z.string(),
  subject: z.string().min(1).max(200),
  body_html: z.string().min(1),
  body_text: z.string().nullable(),
  recipient_type: recipientTypeSchema,
  recipient_filter: recipientFilterSchema.nullable(),
  status: campaignStatusSchema,
  scheduled_at: z.string().nullable(),
  total_recipients: z.number().int().min(0),
  created_by: z.string().uuid().nullable(),
});

export type EmailCampaignDbSchemaType = z.infer<typeof emailCampaignDbSchema>;

// =============================================================================
// Database Entity Schema (for validation of fetched data)
// =============================================================================

export const emailCampaignEntitySchema = z.object({
  id: z.string().uuid(),
  wedding_id: z.string().uuid(),
  template_id: z.string().uuid().nullable(),
  campaign_name: z.string(),
  campaign_type: z.string(),
  subject: z.string(),
  body_html: z.string(),
  body_text: z.string().nullable(),
  recipient_type: recipientTypeSchema,
  recipient_filter: recipientFilterSchema.nullable(),
  status: campaignStatusSchema,
  scheduled_at: z.string().nullable(),
  sent_at: z.string().nullable(),
  total_recipients: z.number().int(),
  total_sent: z.number().int(),
  total_delivered: z.number().int(),
  total_opened: z.number().int(),
  total_clicked: z.number().int(),
  total_bounced: z.number().int(),
  total_failed: z.number().int(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EmailCampaignEntitySchemaType = z.infer<typeof emailCampaignEntitySchema>;

// =============================================================================
// Email Log Entity Schema
// =============================================================================

export const emailLogEntitySchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid().nullable(),
  wedding_id: z.string().uuid(),
  recipient_type: recipientTypeSchema,
  recipient_id: z.string().uuid().nullable(),
  recipient_email: z.string().email(),
  recipient_name: z.string().nullable(),
  subject: z.string(),
  status: emailLogStatusSchema,
  sent_at: z.string().nullable(),
  delivered_at: z.string().nullable(),
  opened_at: z.string().nullable(),
  first_clicked_at: z.string().nullable(),
  bounced_at: z.string().nullable(),
  bounce_type: z.enum(['soft', 'hard']).nullable(),
  bounce_reason: z.string().nullable(),
  error_message: z.string().nullable(),
  open_count: z.number().int(),
  click_count: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EmailLogEntitySchemaType = z.infer<typeof emailLogEntitySchema>;
