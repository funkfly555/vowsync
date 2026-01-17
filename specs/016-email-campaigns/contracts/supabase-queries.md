# Supabase Query Contracts: Email Templates & Campaigns

**Feature**: 016-email-campaigns
**Date**: 2026-01-17

This document defines the exact Supabase queries to be used for data operations. All queries use snake_case field names matching the database schema.

## Email Templates

### Fetch Templates List

```typescript
// Hook: useEmailTemplates
// Purpose: List all templates for current consultant

const { data, error } = await supabase
  .from('email_templates')
  .select('*')
  .eq('consultant_id', consultantId)
  .order('created_at', { ascending: false });

// Optional filters
.eq('is_active', true) // Only active templates
.eq('template_type', type) // Filter by type
.eq('is_default', true) // Only defaults
```

### Fetch Single Template

```typescript
// Hook: useEmailTemplate
// Purpose: Get template by ID

const { data, error } = await supabase
  .from('email_templates')
  .select('*')
  .eq('id', templateId)
  .single();
```

### Create Template

```typescript
// Hook: useEmailTemplateMutations.create
// Purpose: Create new template

const { data, error } = await supabase
  .from('email_templates')
  .insert({
    consultant_id: consultantId,
    template_name: templateName,
    template_type: templateType,
    subject: subject,
    body_html: bodyHtml,
    body_text: bodyText,
    variables: extractedVariables, // string[]
    is_default: isDefault,
    is_active: true
  })
  .select()
  .single();

// If is_default = true, unset other defaults first
if (isDefault) {
  await supabase
    .from('email_templates')
    .update({ is_default: false })
    .eq('consultant_id', consultantId)
    .eq('template_type', templateType)
    .neq('id', newTemplateId);
}
```

### Update Template

```typescript
// Hook: useEmailTemplateMutations.update
// Purpose: Update existing template

const { data, error } = await supabase
  .from('email_templates')
  .update({
    template_name: templateName,
    template_type: templateType,
    subject: subject,
    body_html: bodyHtml,
    body_text: bodyText,
    variables: extractedVariables,
    is_default: isDefault,
    is_active: isActive,
    updated_at: new Date().toISOString()
  })
  .eq('id', templateId)
  .select()
  .single();
```

### Delete Template

```typescript
// Hook: useEmailTemplateMutations.delete
// Purpose: Delete template by ID

const { error } = await supabase
  .from('email_templates')
  .delete()
  .eq('id', templateId);
```

### Clone Template

```typescript
// Hook: useEmailTemplateMutations.clone
// Purpose: Duplicate template with new name

// 1. Fetch original
const { data: original } = await supabase
  .from('email_templates')
  .select('*')
  .eq('id', templateId)
  .single();

// 2. Insert clone
const { data, error } = await supabase
  .from('email_templates')
  .insert({
    consultant_id: original.consultant_id,
    template_name: `${original.template_name} (Copy)`,
    template_type: original.template_type,
    subject: original.subject,
    body_html: original.body_html,
    body_text: original.body_text,
    variables: original.variables,
    is_default: false, // Never clone default status
    is_active: true
  })
  .select()
  .single();
```

## Email Campaigns

### Fetch Campaigns List

```typescript
// Hook: useEmailCampaigns
// Purpose: List all campaigns for wedding

const { data, error } = await supabase
  .from('email_campaigns')
  .select(`
    *,
    email_templates(template_name, template_type)
  `)
  .eq('wedding_id', weddingId)
  .order('created_at', { ascending: false });

// Optional filters
.eq('status', 'draft') // Filter by status
.gte('created_at', startDate) // Date range
.lte('created_at', endDate)
```

### Fetch Single Campaign

```typescript
// Hook: useEmailCampaign
// Purpose: Get campaign with template info

const { data, error } = await supabase
  .from('email_campaigns')
  .select(`
    *,
    email_templates(template_name, template_type)
  `)
  .eq('id', campaignId)
  .single();
```

### Create Campaign

```typescript
// Hook: useEmailCampaignMutations.create
// Purpose: Create new campaign

const { data, error } = await supabase
  .from('email_campaigns')
  .insert({
    wedding_id: weddingId,
    template_id: templateId, // nullable
    campaign_name: campaignName,
    campaign_type: campaignType,
    subject: subject,
    body_html: bodyHtml,
    body_text: bodyText,
    recipient_type: recipientType,
    recipient_filter: recipientFilter, // JSONB
    status: 'draft',
    total_recipients: recipientCount,
    created_by: userId
  })
  .select()
  .single();
```

### Update Campaign

```typescript
// Hook: useEmailCampaignMutations.update
// Purpose: Update draft campaign

const { data, error } = await supabase
  .from('email_campaigns')
  .update({
    campaign_name: campaignName,
    subject: subject,
    body_html: bodyHtml,
    body_text: bodyText,
    recipient_type: recipientType,
    recipient_filter: recipientFilter,
    scheduled_at: scheduledAt,
    total_recipients: recipientCount,
    updated_at: new Date().toISOString()
  })
  .eq('id', campaignId)
  .eq('status', 'draft') // Only update drafts
  .select()
  .single();
```

### Delete Campaign

```typescript
// Hook: useEmailCampaignMutations.delete
// Purpose: Delete draft campaign

const { error } = await supabase
  .from('email_campaigns')
  .delete()
  .eq('id', campaignId)
  .eq('status', 'draft'); // Only delete drafts
```

### Schedule Campaign

```typescript
// Hook: useEmailCampaignMutations.schedule
// Purpose: Schedule campaign for later

const { data, error } = await supabase
  .from('email_campaigns')
  .update({
    status: 'scheduled',
    scheduled_at: scheduledAt,
    updated_at: new Date().toISOString()
  })
  .eq('id', campaignId)
  .eq('status', 'draft')
  .select()
  .single();
```

### Send Campaign (Simulated)

```typescript
// Hook: useEmailCampaignMutations.send
// Purpose: Execute campaign send (simulated)

// 1. Update status to sending
await supabase
  .from('email_campaigns')
  .update({ status: 'sending' })
  .eq('id', campaignId);

// 2. Create email logs for all recipients
const emailLogs = recipients.map(r => ({
  campaign_id: campaignId,
  wedding_id: weddingId,
  recipient_type: recipientType,
  recipient_id: r.id,
  recipient_email: r.email,
  recipient_name: r.name,
  subject: subject,
  status: 'pending'
}));

await supabase
  .from('email_logs')
  .insert(emailLogs);

// 3. Simulate sending (after delay, update statuses)
// See simulation logic in research.md

// 4. Update campaign stats
await supabase
  .from('email_campaigns')
  .update({
    status: 'sent',
    sent_at: new Date().toISOString(),
    total_sent: totalSent,
    total_delivered: totalDelivered,
    total_bounced: totalBounced,
    total_failed: totalFailed
  })
  .eq('id', campaignId);
```

## Email Logs

### Fetch Logs for Campaign

```typescript
// Hook: useEmailLogs
// Purpose: List logs for campaign with pagination

const { data, error, count } = await supabase
  .from('email_logs')
  .select('*', { count: 'exact' })
  .eq('campaign_id', campaignId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

// Optional filters
.eq('status', 'delivered') // Filter by status
.ilike('recipient_email', `%${search}%`) // Search
.eq('recipient_type', 'guest') // Filter by type
```

### Get Log Details

```typescript
// Hook: useEmailLog
// Purpose: Get single log with full details

const { data, error } = await supabase
  .from('email_logs')
  .select('*')
  .eq('id', logId)
  .single();
```

### Update Log Status (Simulation)

```typescript
// Purpose: Update log after simulated send

const { error } = await supabase
  .from('email_logs')
  .update({
    status: newStatus,
    sent_at: sentAt,
    delivered_at: deliveredAt,
    bounced_at: bouncedAt,
    bounce_type: bounceType,
    bounce_reason: bounceReason,
    updated_at: new Date().toISOString()
  })
  .eq('id', logId);
```

## Recipients

### Fetch Guest Recipients

```typescript
// Hook: useRecipients (guest mode)
// Purpose: Get filtered guests for campaign

let query = supabase
  .from('guests')
  .select('id, first_name, last_name, email')
  .eq('wedding_id', weddingId)
  .not('email', 'is', null);

// Apply filters
if (filter?.rsvp_status) {
  query = query.eq('rsvp_status', filter.rsvp_status);
}
if (filter?.event_id) {
  query = query.eq('event_id', filter.event_id);
}
if (filter?.table_assigned !== undefined) {
  if (filter.table_assigned) {
    query = query.not('table_number', 'is', null);
  } else {
    query = query.is('table_number', null);
  }
}

const { data, error } = await query
  .order('last_name', { ascending: true });

// Transform to Recipient interface
return data?.map(g => ({
  id: g.id,
  name: `${g.first_name} ${g.last_name}`,
  email: g.email,
  type: 'guest' as const
}));
```

### Fetch Vendor Recipients

```typescript
// Hook: useRecipients (vendor mode)
// Purpose: Get filtered vendors for campaign

let query = supabase
  .from('vendors')
  .select('id, company_name, contact_email')
  .eq('wedding_id', weddingId)
  .not('contact_email', 'is', null);

// Apply filters
if (filter?.vendor_type) {
  query = query.eq('category', filter.vendor_type);
}
if (filter?.contract_status) {
  query = query.eq('contract_status', filter.contract_status);
}
if (filter?.payment_status) {
  query = query.eq('payment_status', filter.payment_status);
}

const { data, error } = await query
  .order('company_name', { ascending: true });

// Transform to Recipient interface
return data?.map(v => ({
  id: v.id,
  name: v.company_name,
  email: v.contact_email,
  type: 'vendor' as const
}));
```

## Bounce Handling

### Hard Bounce Processing

```typescript
// Purpose: Mark email as invalid after hard bounce

// For guest
await supabase
  .from('guests')
  .update({ email_valid: false })
  .eq('id', recipientId);

// For vendor (set email to null or add email_valid field)
await supabase
  .from('vendors')
  .update({ email_valid: false })
  .eq('id', recipientId);
```

### Campaign Statistics Update

```typescript
// Purpose: Recalculate campaign stats after status changes

const { count: delivered } = await supabase
  .from('email_logs')
  .select('*', { count: 'exact', head: true })
  .eq('campaign_id', campaignId)
  .eq('status', 'delivered');

const { count: opened } = await supabase
  .from('email_logs')
  .select('*', { count: 'exact', head: true })
  .eq('campaign_id', campaignId)
  .eq('status', 'opened');

// ... similar for other statuses

await supabase
  .from('email_campaigns')
  .update({
    total_delivered: delivered,
    total_opened: opened,
    // ... other stats
    updated_at: new Date().toISOString()
  })
  .eq('id', campaignId);
```

## Query Key Factories

```typescript
// For React Query cache management

export const emailTemplateKeys = {
  all: ['email-templates'] as const,
  lists: () => [...emailTemplateKeys.all, 'list'] as const,
  list: (consultantId: string) => [...emailTemplateKeys.lists(), consultantId] as const,
  details: () => [...emailTemplateKeys.all, 'detail'] as const,
  detail: (templateId: string) => [...emailTemplateKeys.details(), templateId] as const,
};

export const emailCampaignKeys = {
  all: ['email-campaigns'] as const,
  lists: () => [...emailCampaignKeys.all, 'list'] as const,
  list: (weddingId: string, status?: string) =>
    status
      ? [...emailCampaignKeys.lists(), weddingId, status]
      : [...emailCampaignKeys.lists(), weddingId],
  details: () => [...emailCampaignKeys.all, 'detail'] as const,
  detail: (campaignId: string) => [...emailCampaignKeys.details(), campaignId] as const,
};

export const emailLogKeys = {
  all: ['email-logs'] as const,
  lists: () => [...emailLogKeys.all, 'list'] as const,
  list: (campaignId: string, filters?: { status?: string; page?: number }) =>
    [...emailLogKeys.lists(), campaignId, filters] as const,
  details: () => [...emailLogKeys.all, 'detail'] as const,
  detail: (logId: string) => [...emailLogKeys.details(), logId] as const,
};

export const recipientKeys = {
  all: ['recipients'] as const,
  lists: () => [...recipientKeys.all, 'list'] as const,
  list: (weddingId: string, type: RecipientType, filter?: RecipientFilter) =>
    [...recipientKeys.lists(), weddingId, type, filter] as const,
};
```
