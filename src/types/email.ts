/**
 * Email Types
 * @feature 016-email-campaigns
 */

// =============================================================================
// Status Enumerations
// =============================================================================

export type TemplateType =
  | 'rsvp_reminder'
  | 'vendor_brief'
  | 'thank_you'
  | 'payment_reminder'
  | 'custom';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed';

export type EmailLogStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'soft_bounce'
  | 'hard_bounce'
  | 'failed'
  | 'spam';

export type RecipientType = 'guest' | 'vendor';

export type BounceType = 'soft' | 'hard';

// =============================================================================
// Database Entity Interfaces
// =============================================================================

export interface EmailTemplate {
  id: string;
  consultant_id: string;
  template_name: string;
  template_type: TemplateType;
  subject: string;
  body_html: string;
  body_text: string | null;
  variables: string[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  wedding_id: string;
  template_id: string | null;
  campaign_name: string;
  campaign_type: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  recipient_type: RecipientType;
  recipient_filter: RecipientFilter | null;
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  campaign_id: string | null;
  wedding_id: string;
  recipient_type: RecipientType;
  recipient_id: string | null;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  status: EmailLogStatus;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  first_clicked_at: string | null;
  bounced_at: string | null;
  bounce_type: BounceType | null;
  bounce_reason: string | null;
  error_message: string | null;
  open_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Filter Interfaces
// =============================================================================

export interface GuestFilter {
  rsvp_status?: 'pending' | 'accepted' | 'declined';
  event_id?: string;
  has_dietary_restrictions?: boolean;
  table_assigned?: boolean;
}

export interface VendorFilter {
  vendor_type?: string;
  contract_status?: 'pending' | 'signed' | 'expired';
  payment_status?: 'pending' | 'partial' | 'paid';
}

export type RecipientFilter = GuestFilter | VendorFilter;

// =============================================================================
// Extended Types with Relations
// =============================================================================

export interface EmailCampaignWithTemplate extends EmailCampaign {
  email_templates: {
    template_name: string;
    template_type: string;
  } | null;
}

// =============================================================================
// Form Data Interfaces
// =============================================================================

export interface EmailTemplateFormData {
  template_name: string;
  template_type: TemplateType;
  subject: string;
  body_html: string;
  body_text: string | null;
  is_default: boolean;
  is_active: boolean;
}

export interface EmailCampaignFormData {
  campaign_name: string;
  template_id: string | null;
  subject: string;
  body_html: string;
  body_text: string | null;
  recipient_type: RecipientType;
  recipient_filter: RecipientFilter | null;
  scheduled_at: string | null;
}

// =============================================================================
// Recipient Selection
// =============================================================================

export interface Recipient {
  id: string;
  name: string;
  email: string;
  type: RecipientType;
  email_valid?: boolean;
}

export interface RecipientSelectionResult {
  recipients: Recipient[];
  totalCount: number;
  invalidEmailCount: number;
}

// =============================================================================
// Statistics
// =============================================================================

export interface CampaignStats {
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

// =============================================================================
// Variable System
// =============================================================================

export interface TemplateVariable {
  entity: 'guest' | 'vendor' | 'wedding' | 'event';
  field: string;
  placeholder: string;
  description: string;
}

export const AVAILABLE_VARIABLES: TemplateVariable[] = [
  // Guest variables
  { entity: 'guest', field: 'name', placeholder: '{{guest.name}}', description: 'Guest full name' },
  { entity: 'guest', field: 'email', placeholder: '{{guest.email}}', description: 'Guest email address' },
  { entity: 'guest', field: 'table_number', placeholder: '{{guest.table_number}}', description: 'Assigned table number' },

  // Vendor variables
  { entity: 'vendor', field: 'company_name', placeholder: '{{vendor.company_name}}', description: 'Vendor company name' },
  { entity: 'vendor', field: 'contact_name', placeholder: '{{vendor.contact_name}}', description: 'Primary contact name' },

  // Wedding variables
  { entity: 'wedding', field: 'bride_name', placeholder: '{{wedding.bride_name}}', description: 'Bride name' },
  { entity: 'wedding', field: 'groom_name', placeholder: '{{wedding.groom_name}}', description: 'Groom name' },
  { entity: 'wedding', field: 'date', placeholder: '{{wedding.date}}', description: 'Wedding date' },
  { entity: 'wedding', field: 'venue_name', placeholder: '{{wedding.venue_name}}', description: 'Wedding venue' },

  // Event variables
  { entity: 'event', field: 'name', placeholder: '{{event.name}}', description: 'Event name' },
  { entity: 'event', field: 'date', placeholder: '{{event.date}}', description: 'Event date' },
  { entity: 'event', field: 'time', placeholder: '{{event.time}}', description: 'Event start time' },
  { entity: 'event', field: 'location', placeholder: '{{event.location}}', description: 'Event location' },
];

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_TEMPLATE_FORM: EmailTemplateFormData = {
  template_name: '',
  template_type: 'custom',
  subject: '',
  body_html: '',
  body_text: null,
  is_default: false,
  is_active: true,
};

export const DEFAULT_CAMPAIGN_FORM: EmailCampaignFormData = {
  campaign_name: '',
  template_id: null,
  subject: '',
  body_html: '',
  body_text: null,
  recipient_type: 'guest',
  recipient_filter: null,
  scheduled_at: null,
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Extract variables from template content
 * Finds all {{entity.field}} patterns
 */
export function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = content.match(regex);
  if (!matches) return [];
  return [...new Set(matches)];
}

/**
 * Replace variables in template with actual values
 */
export function replaceVariables(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.');
    let value: unknown = data;
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key];
    }
    return value?.toString() || match;
  });
}

/**
 * Calculate campaign statistics with rates
 */
export function calculateCampaignStats(campaign: EmailCampaign): CampaignStats {
  const {
    total_recipients,
    total_sent,
    total_delivered,
    total_opened,
    total_clicked,
    total_bounced,
    total_failed,
  } = campaign;

  return {
    total_recipients,
    total_sent,
    total_delivered,
    total_opened,
    total_clicked,
    total_bounced,
    total_failed,
    delivery_rate: total_sent > 0 ? (total_delivered / total_sent) * 100 : 0,
    open_rate: total_delivered > 0 ? (total_opened / total_delivered) * 100 : 0,
    click_rate: total_opened > 0 ? (total_clicked / total_opened) * 100 : 0,
    bounce_rate: total_sent > 0 ? (total_bounced / total_sent) * 100 : 0,
  };
}
