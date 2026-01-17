# Data Model: Email Templates & Campaigns

**Feature**: 016-email-campaigns
**Date**: 2026-01-17

## Entity Overview

```
┌─────────────────────┐     ┌─────────────────────┐
│   email_templates   │     │       weddings      │
│                     │     │                     │
│  consultant_id ─────┼─────│  id                 │
│  template_name      │     │  consultant_id      │
│  template_type      │     └─────────────────────┘
│  subject            │               │
│  body_html          │               │
│  body_text          │               │
│  variables          │               ▼
│  is_default         │     ┌─────────────────────┐
│  is_active          │     │   email_campaigns   │
└─────────────────────┘     │                     │
         │                  │  wedding_id ────────┼──▶ weddings.id
         │                  │  template_id ───────┼──▶ email_templates.id (nullable)
         └──────────────────│  campaign_name      │
                            │  subject            │
                            │  body_html          │
                            │  recipient_type     │
                            │  recipient_filter   │
                            │  status             │
                            │  scheduled_at       │
                            │  sent_at            │
                            │  total_*            │
                            └─────────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │     email_logs      │
                            │                     │
                            │  campaign_id ───────┼──▶ email_campaigns.id
                            │  wedding_id ────────┼──▶ weddings.id
                            │  recipient_type     │
                            │  recipient_id ──────┼──▶ guests.id OR vendors.id
                            │  recipient_email    │
                            │  status             │
                            │  bounce_type        │
                            └─────────────────────┘
```

## Entity Definitions

### EmailTemplate

Reusable email content blueprint owned by a consultant.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default `gen_random_uuid()` | Unique identifier |
| consultant_id | UUID | FK → users.id, NOT NULL | Owner consultant |
| template_name | TEXT | NOT NULL | Display name |
| template_type | TEXT | NOT NULL | Category (rsvp_reminder, vendor_brief, thank_you, payment_reminder, custom) |
| subject | TEXT | NOT NULL | Email subject line |
| body_html | TEXT | NOT NULL | HTML content with variables |
| body_text | TEXT | NULL | Plain text fallback |
| variables | JSONB | DEFAULT '[]' | Extracted variable names |
| is_default | BOOLEAN | DEFAULT false | Default template for type |
| is_active | BOOLEAN | DEFAULT true | Active for selection |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_email_templates_consultant_id` ON consultant_id
- `idx_email_templates_type` ON template_type

**RLS Policy**: `consultant_id = auth.uid()`

### EmailCampaign

Email send operation targeting recipients within a wedding.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default `gen_random_uuid()` | Unique identifier |
| wedding_id | UUID | FK → weddings.id, NOT NULL | Wedding scope |
| template_id | UUID | FK → email_templates.id, NULL | Source template (optional) |
| campaign_name | TEXT | NOT NULL | Display name |
| campaign_type | TEXT | NOT NULL | Type (matches template_type) |
| subject | TEXT | NOT NULL | Email subject |
| body_html | TEXT | NOT NULL | HTML content |
| body_text | TEXT | NULL | Plain text fallback |
| recipient_type | TEXT | NOT NULL | 'guest' or 'vendor' |
| recipient_filter | JSONB | NULL | Filter criteria |
| status | TEXT | NOT NULL, CHECK | draft, scheduled, sending, sent, failed |
| scheduled_at | TIMESTAMPTZ | NULL | Scheduled send time |
| sent_at | TIMESTAMPTZ | NULL | Actual send time |
| total_recipients | INTEGER | DEFAULT 0 | Total recipient count |
| total_sent | INTEGER | DEFAULT 0 | Successfully queued |
| total_delivered | INTEGER | DEFAULT 0 | Delivery confirmed |
| total_opened | INTEGER | DEFAULT 0 | Email opened |
| total_clicked | INTEGER | DEFAULT 0 | Link clicked |
| total_bounced | INTEGER | DEFAULT 0 | All bounces |
| total_failed | INTEGER | DEFAULT 0 | Failed to send |
| created_by | UUID | FK → users.id, NULL | Creator user |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_email_campaigns_wedding_id` ON wedding_id
- `idx_email_campaigns_status` ON status
- `idx_email_campaigns_created_at` ON created_at DESC

**RLS Policy**: `EXISTS (SELECT 1 FROM weddings WHERE weddings.id = email_campaigns.wedding_id AND weddings.consultant_id = auth.uid())`

### EmailLog

Individual email delivery record tracking status progression.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default `gen_random_uuid()` | Unique identifier |
| campaign_id | UUID | FK → email_campaigns.id, NULL | Parent campaign |
| wedding_id | UUID | FK → weddings.id, NOT NULL | Wedding scope |
| recipient_type | TEXT | NOT NULL | 'guest' or 'vendor' |
| recipient_id | UUID | NULL | Guest or vendor ID |
| recipient_email | TEXT | NOT NULL | Target email address |
| recipient_name | TEXT | NULL | Display name |
| subject | TEXT | NOT NULL | Email subject sent |
| status | TEXT | NOT NULL, CHECK | pending, sent, delivered, opened, clicked, bounced, soft_bounce, hard_bounce, failed, spam |
| sent_at | TIMESTAMPTZ | NULL | When sent |
| delivered_at | TIMESTAMPTZ | NULL | Delivery confirmed |
| opened_at | TIMESTAMPTZ | NULL | First open |
| first_clicked_at | TIMESTAMPTZ | NULL | First click |
| bounced_at | TIMESTAMPTZ | NULL | Bounce received |
| bounce_type | TEXT | NULL | 'soft' or 'hard' |
| bounce_reason | TEXT | NULL | Bounce explanation |
| error_message | TEXT | NULL | Error details |
| open_count | INTEGER | DEFAULT 0 | Total opens |
| click_count | INTEGER | DEFAULT 0 | Total clicks |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_email_logs_campaign_id` ON campaign_id
- `idx_email_logs_wedding_id` ON wedding_id
- `idx_email_logs_status` ON status
- `idx_email_logs_recipient_email` ON recipient_email

**RLS Policy**: `EXISTS (SELECT 1 FROM weddings WHERE weddings.id = email_logs.wedding_id AND weddings.consultant_id = auth.uid())`

## TypeScript Interfaces

```typescript
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
  delivery_rate: number; // delivered / sent * 100
  open_rate: number; // opened / delivered * 100
  click_rate: number; // clicked / opened * 100
  bounce_rate: number; // bounced / sent * 100
}

// =============================================================================
// Variable System
// =============================================================================

export interface TemplateVariable {
  entity: 'guest' | 'vendor' | 'wedding' | 'event';
  field: string;
  placeholder: string; // e.g., "{{guest.name}}"
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
```

## State Transitions

### Campaign Status Flow

```
                              ┌──────────────────────┐
                              │                      │
        ┌───────────────┐     │     ┌──────────┐     ▼
        │     draft     │─────┼────▶│ scheduled│──────────┐
        └───────────────┘     │     └──────────┘          │
                │             │           │               │
                │             │           ▼               │
                │             │     ┌──────────┐          │
                └─────────────┼────▶│ sending  │◀─────────┘
                              │     └──────────┘
                              │           │
                              │     ┌─────┴─────┐
                              │     ▼           ▼
                              │ ┌──────┐   ┌────────┐
                              │ │ sent │   │ failed │
                              │ └──────┘   └────────┘
                              └──────────────────────┘

Valid Transitions:
- draft → sending (send now)
- draft → scheduled (schedule for later)
- scheduled → sending (when scheduled time arrives)
- sending → sent (all emails processed)
- sending → failed (critical error)
```

### Email Log Status Flow

```
        ┌─────────┐
        │ pending │
        └────┬────┘
             │
             ▼
        ┌─────────┐
        │  sent   │
        └────┬────┘
             │
     ┌───────┼───────┬──────────┐
     ▼       ▼       ▼          ▼
┌─────────┐ ┌────────┐ ┌────────────┐ ┌────────┐
│delivered│ │bounced │ │soft_bounce │ │ failed │
└────┬────┘ └────────┘ └─────┬──────┘ └────────┘
     │                       │
     ▼                       ▼ (after 3 retries)
┌─────────┐             ┌────────┐
│ opened  │             │ failed │
└────┬────┘             └────────┘
     │
     ▼
┌─────────┐
│ clicked │
└─────────┘

Additional statuses:
- hard_bounce: Permanent delivery failure
- spam: Marked as spam by recipient
```

## Validation Rules

### Template Validation

| Rule | Validation |
|------|------------|
| template_name | Required, 1-100 characters |
| template_type | Required, must be valid enum |
| subject | Required, 1-200 characters |
| body_html | Required, 1-50000 characters |
| body_text | Optional, max 50000 characters |
| variables | Auto-extracted, validated against known schema |

### Campaign Validation

| Rule | Validation |
|------|------------|
| campaign_name | Required, 1-100 characters |
| subject | Required, 1-200 characters |
| body_html | Required |
| recipient_type | Required, 'guest' or 'vendor' |
| recipients | Must have at least 1 valid recipient |
| scheduled_at | If provided, must be in future |

### Email Log Status Rules

| Current Status | Can Transition To |
|---------------|-------------------|
| pending | sent, failed |
| sent | delivered, bounced, soft_bounce, hard_bounce, failed |
| delivered | opened |
| opened | clicked |
| soft_bounce | pending (retry), failed |
| bounced | (terminal) |
| hard_bounce | (terminal) |
| failed | (terminal) |
| spam | (terminal) |
| clicked | (terminal) |
