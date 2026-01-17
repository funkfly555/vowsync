# Quickstart: Email Templates & Campaigns

**Feature**: 016-email-campaigns
**Date**: 2026-01-17

## Prerequisites

- Node.js 18+
- npm or pnpm
- VowSync project running locally
- Supabase project with existing schema

## 1. Install Dependencies

```bash
# Rich text editor (Tiptap)
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-placeholder
```

## 2. Create Type Definitions

Create `src/types/email.ts`:

```typescript
// Core status types
export type TemplateType = 'rsvp_reminder' | 'vendor_brief' | 'thank_you' | 'payment_reminder' | 'custom';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type EmailLogStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'soft_bounce' | 'hard_bounce' | 'failed' | 'spam';
export type RecipientType = 'guest' | 'vendor';

// Database entities
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
  recipient_filter: Record<string, any> | null;
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
  bounce_type: 'soft' | 'hard' | null;
  bounce_reason: string | null;
  error_message: string | null;
  open_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}
```

## 3. Create Zod Schemas

Create `src/schemas/emailTemplate.ts`:

```typescript
import { z } from 'zod';

export const TEMPLATE_TYPES = ['rsvp_reminder', 'vendor_brief', 'thank_you', 'payment_reminder', 'custom'] as const;

export const emailTemplateFormSchema = z.object({
  template_name: z.string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be less than 100 characters'),
  template_type: z.enum(TEMPLATE_TYPES),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  body_html: z.string()
    .min(1, 'Email content is required')
    .max(50000, 'Content too long'),
  body_text: z.string().max(50000).nullable(),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export type EmailTemplateFormSchemaType = z.infer<typeof emailTemplateFormSchema>;
```

Create `src/schemas/emailCampaign.ts`:

```typescript
import { z } from 'zod';

export const RECIPIENT_TYPES = ['guest', 'vendor'] as const;

export const emailCampaignFormSchema = z.object({
  campaign_name: z.string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters'),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  body_html: z.string().min(1, 'Email content is required'),
  body_text: z.string().nullable(),
  recipient_type: z.enum(RECIPIENT_TYPES),
  recipient_filter: z.record(z.any()).nullable(),
  scheduled_at: z.string().nullable(),
});

export type EmailCampaignFormSchemaType = z.infer<typeof emailCampaignFormSchema>;
```

## 4. Create First Hook

Create `src/hooks/useEmailTemplates.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { EmailTemplate } from '@/types/email';

export const emailTemplateKeys = {
  all: ['email-templates'] as const,
  lists: () => [...emailTemplateKeys.all, 'list'] as const,
  list: (consultantId: string) => [...emailTemplateKeys.lists(), consultantId] as const,
};

interface UseEmailTemplatesParams {
  consultantId: string;
  activeOnly?: boolean;
}

export function useEmailTemplates({ consultantId, activeOnly = false }: UseEmailTemplatesParams) {
  return useQuery({
    queryKey: emailTemplateKeys.list(consultantId),
    queryFn: async () => {
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('consultant_id', consultantId)
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!consultantId,
  });
}
```

## 5. Create Status Badge Component

Create `src/components/email/shared/EmailStatusBadge.tsx`:

```typescript
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, Send, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { CampaignStatus, EmailLogStatus } from '@/types/email';

const CAMPAIGN_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sending: 'bg-orange-100 text-orange-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const LOG_COLORS: Record<EmailLogStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  opened: 'bg-teal-100 text-teal-700',
  clicked: 'bg-purple-100 text-purple-700',
  bounced: 'bg-orange-100 text-orange-700',
  soft_bounce: 'bg-orange-100 text-orange-700',
  hard_bounce: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  spam: 'bg-red-100 text-red-700',
};

interface EmailStatusBadgeProps {
  status: CampaignStatus | EmailLogStatus;
  type: 'campaign' | 'log';
}

export function EmailStatusBadge({ status, type }: EmailStatusBadgeProps) {
  const colors = type === 'campaign' ? CAMPAIGN_COLORS : LOG_COLORS;
  const colorClass = colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';

  return (
    <Badge className={`${colorClass} capitalize`}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
```

## 6. Add Routes

Update `src/App.tsx`:

```typescript
// Add imports
import { EmailTemplatesPage } from '@/pages/EmailTemplatesPage';
import { EmailCampaignsPage } from '@/pages/EmailCampaignsPage';
import { CreateEmailCampaignPage } from '@/pages/CreateEmailCampaignPage';
import { EmailCampaignDetailPage } from '@/pages/EmailCampaignDetailPage';

// Add routes inside wedding layout
<Route path="emails" element={<EmailCampaignsPage />} />
<Route path="emails/templates" element={<EmailTemplatesPage />} />
<Route path="emails/new" element={<CreateEmailCampaignPage />} />
<Route path="emails/:campaignId" element={<EmailCampaignDetailPage />} />
```

## 7. Verify Database Tables Exist

Run in Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('email_templates', 'email_campaigns', 'email_logs');

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('email_templates', 'email_campaigns', 'email_logs');
```

## 8. Run Development Server

```bash
npm run dev
```

Navigate to `/weddings/[id]/emails` to see the campaigns page.

## Development Order

1. **Types & Schemas** (30 min)
   - `src/types/email.ts`
   - `src/schemas/emailTemplate.ts`
   - `src/schemas/emailCampaign.ts`

2. **Hooks** (2 hours)
   - `useEmailTemplates.ts`
   - `useEmailTemplateMutations.ts`
   - `useEmailCampaigns.ts`
   - `useEmailCampaignMutations.ts`
   - `useEmailLogs.ts`
   - `useRecipients.ts`

3. **Shared Components** (1 hour)
   - `EmailStatusBadge.tsx`
   - `EmailStatsCard.tsx`
   - `RichTextEditor.tsx`

4. **Template Components** (2 hours)
   - `EmailTemplateList.tsx`
   - `EmailTemplateCard.tsx`
   - `EmailTemplateModal.tsx`
   - `EmailTemplateForm.tsx`

5. **Campaign Components** (3 hours)
   - `EmailCampaignList.tsx`
   - `EmailCampaignCard.tsx`
   - Campaign Wizard (5 steps)
   - `RecipientSelector.tsx`
   - `EmailPreview.tsx`

6. **Log Components** (1 hour)
   - `EmailLogTable.tsx`
   - `EmailLogDetail.tsx`

7. **Pages** (2 hours)
   - `EmailTemplatesPage.tsx`
   - `EmailCampaignsPage.tsx`
   - `CreateEmailCampaignPage.tsx`
   - `EmailCampaignDetailPage.tsx`

8. **Simulation Logic** (1 hour)
   - Sending simulation
   - Status updates
   - Stats calculation

## Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Types | `src/types/email.ts` |
| Template Schema | `src/schemas/emailTemplate.ts` |
| Campaign Schema | `src/schemas/emailCampaign.ts` |
| Template Hooks | `src/hooks/useEmailTemplates.ts` |
| Campaign Hooks | `src/hooks/useEmailCampaigns.ts` |
| Status Badge | `src/components/email/shared/EmailStatusBadge.tsx` |
| Rich Editor | `src/components/email/shared/RichTextEditor.tsx` |
| Templates Page | `src/pages/EmailTemplatesPage.tsx` |
| Campaigns Page | `src/pages/EmailCampaignsPage.tsx` |

## Common Issues

1. **Tiptap not rendering**: Ensure `@tiptap/react` is imported correctly
2. **RLS blocking queries**: Check consultant_id/wedding_id ownership
3. **Variables not replacing**: Verify regex pattern and sample data structure
4. **Stats not updating**: Check campaign stats update after simulation

## Testing Checklist

- [ ] Create template with variables
- [ ] Clone template
- [ ] Set template as default
- [ ] Create campaign from template
- [ ] Create campaign from scratch
- [ ] Filter guest recipients
- [ ] Filter vendor recipients
- [ ] Preview email with sample data
- [ ] Send campaign (simulated)
- [ ] View campaign stats
- [ ] Filter email logs by status
- [ ] View bounce details
