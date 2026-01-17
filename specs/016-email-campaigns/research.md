# Research: Email Templates & Campaigns

**Feature**: 016-email-campaigns
**Date**: 2026-01-17
**Status**: Complete

## Technology Decisions

### 1. Rich Text Editor

**Decision**: Tiptap with StarterKit extension

**Rationale**:
- Tiptap is a headless, framework-agnostic editor built on ProseMirror
- Provides clean HTML output required for email content
- Lightweight compared to alternatives (~50KB gzipped)
- Excellent React integration via `@tiptap/react`
- Extensible architecture for custom variable insertion
- Active maintenance and community support

**Alternatives Considered**:
| Option | Rejected Because |
|--------|-----------------|
| React-Quill | Heavier bundle, less flexible customization |
| Draft.js | Facebook-developed but complex API, maintenance concerns |
| Slate | More complex setup, steeper learning curve |
| CKEditor | Commercial licensing concerns for some features |

**Required Packages**:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-placeholder
```

### 2. Email Sending Simulation

**Decision**: Client-side simulation with random status assignment

**Rationale**:
- Phase 13 explicitly scopes out actual email sending
- Simulation provides realistic UI/UX testing capability
- Random status distribution allows testing all UI states
- Clear messaging informs users this is simulated

**Implementation Approach**:
```typescript
// Simulate sending with realistic delays and status distribution
async function simulateCampaignSend(recipients: Recipient[]) {
  // Create pending logs
  // After 2s delay, update with random statuses:
  // - 90% delivered
  // - 5% hard_bounce
  // - 3% soft_bounce
  // - 2% failed
}
```

### 3. Variable System

**Decision**: Mustache-style `{{entity.field}}` syntax with client-side replacement

**Rationale**:
- Industry-standard variable syntax (used by Mailchimp, SendGrid, etc.)
- Simple regex-based replacement: `/\{\{([^}]+)\}\}/g`
- Preview renders variables with sample data
- Variables extracted and stored in JSONB array for validation

**Supported Variables**:
```typescript
const AVAILABLE_VARIABLES = {
  guest: ['name', 'email', 'table_number'],
  vendor: ['company_name', 'contact_name'],
  wedding: ['bride_name', 'groom_name', 'date', 'venue_name'],
  event: ['name', 'date', 'time', 'location']
};
```

### 4. Recipient Filtering

**Decision**: Dynamic filter UI with Supabase query builder

**Rationale**:
- Filters stored as JSONB in `recipient_filter` column
- Query built dynamically based on filter selections
- Supports AND logic for multiple filter criteria
- Recipient count updates in real-time as filters change

**Filter Schema**:
```typescript
interface RecipientFilter {
  rsvp_status?: 'pending' | 'accepted' | 'declined';
  event_id?: string;
  has_dietary_restrictions?: boolean;
  table_assigned?: boolean;
  vendor_type?: string;
  payment_status?: 'pending' | 'partial' | 'paid';
}
```

### 5. Campaign Wizard Flow

**Decision**: Multi-step wizard with React state management

**Rationale**:
- Complex form broken into digestible steps
- Back/Next navigation preserves state
- Preview step before final submission
- Validation per step prevents errors at end

**Steps**:
1. Template Selection (or start from scratch)
2. Content Editing (subject, body)
3. Recipient Selection (type + filters)
4. Schedule (send now or later)
5. Review & Send

### 6. Status Badge Component

**Decision**: Unified EmailStatusBadge component with Tailwind classes

**Rationale**:
- Single source of truth for status colors
- Consistent with design system specifications
- Supports both campaign statuses and email log statuses
- Icons enhance visual distinction

**Color Mapping**:
```typescript
const STATUS_COLORS = {
  // Campaign Status
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sending: 'bg-orange-100 text-orange-700 animate-pulse',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',

  // Email Log Status
  pending: 'bg-gray-100 text-gray-700',
  delivered: 'bg-green-100 text-green-700',
  opened: 'bg-teal-100 text-teal-700',
  clicked: 'bg-purple-100 text-purple-700',
  bounced: 'bg-orange-100 text-orange-700',
  soft_bounce: 'bg-orange-100 text-orange-700',
  hard_bounce: 'bg-red-100 text-red-700',
  spam: 'bg-red-100 text-red-700'
};
```

### 7. Table Pagination

**Decision**: TanStack Table with pagination (20 items per page)

**Rationale**:
- Consistent with existing project patterns
- Built-in pagination, sorting, filtering
- Optimized for large datasets
- Keyboard accessible

## Architecture Decisions

### Hooks Structure

Following established patterns from `useBarOrders.ts`:

| Hook | Purpose |
|------|---------|
| `useEmailTemplates` | Fetch templates list for consultant |
| `useEmailTemplate` | Fetch single template |
| `useEmailTemplateMutations` | Create, update, delete, clone templates |
| `useEmailCampaigns` | Fetch campaigns list for wedding |
| `useEmailCampaign` | Fetch single campaign with stats |
| `useEmailCampaignMutations` | Create, update, delete, send campaigns |
| `useEmailLogs` | Fetch logs for campaign with pagination |
| `useRecipients` | Fetch filtered guests/vendors for selection |

### Component Structure

```
src/components/email/
├── templates/
│   ├── EmailTemplateList.tsx
│   ├── EmailTemplateCard.tsx
│   ├── EmailTemplateModal.tsx
│   ├── EmailTemplateForm.tsx
│   ├── VariableHelper.tsx
│   └── DeleteEmailTemplateDialog.tsx
├── campaigns/
│   ├── EmailCampaignList.tsx
│   ├── EmailCampaignCard.tsx
│   ├── CampaignWizard/
│   │   ├── index.tsx
│   │   ├── TemplateStep.tsx
│   │   ├── ContentStep.tsx
│   │   ├── RecipientsStep.tsx
│   │   ├── ScheduleStep.tsx
│   │   └── ReviewStep.tsx
│   ├── RecipientSelector.tsx
│   ├── EmailPreview.tsx
│   └── CampaignStats.tsx
├── logs/
│   ├── EmailLogTable.tsx
│   └── EmailLogDetail.tsx
└── shared/
    ├── EmailStatusBadge.tsx
    ├── EmailStatsCard.tsx
    └── RichTextEditor.tsx
```

### Routing Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/weddings/:id/emails` | EmailCampaignsPage | Campaign list |
| `/weddings/:id/emails/templates` | EmailTemplatesPage | Template list |
| `/weddings/:id/emails/new` | CreateEmailCampaignPage | Campaign wizard |
| `/weddings/:id/emails/:campaignId` | EmailCampaignDetailPage | Campaign detail + logs |

## Database Verification

All tables exist per 03-DATABASE-SCHEMA.md:
- `email_templates` with RLS for consultant_id
- `email_campaigns` with RLS for wedding_id (via wedding ownership)
- `email_logs` with RLS for wedding_id

**Field name verification** (snake_case for all):
- ✅ `template_name`, `template_type`, `body_html`, `body_text`
- ✅ `campaign_name`, `recipient_type`, `recipient_filter`
- ✅ `total_recipients`, `total_sent`, `total_delivered`
- ✅ `recipient_email`, `recipient_name`, `bounce_type`

## Performance Considerations

1. **Template List**: Paginated, max 50 templates per consultant
2. **Campaign List**: Paginated by wedding, 20 per page
3. **Email Logs**: Paginated, 20 per page with status filter optimization
4. **Rich Text Editor**: Lazy loaded, ~50KB gzipped
5. **Recipient Preview**: Limited to 100 recipients in preview, full count displayed

## Security Considerations

1. **RLS Enforcement**: All queries filtered by consultant/wedding ownership
2. **Input Sanitization**: Zod validation on all form inputs
3. **HTML Sanitization**: Preview renders in sandboxed iframe
4. **Variable Injection**: Variables only replaced from known schema fields

## Integration Points

- **Guests table**: Recipient selection, email validity check
- **Vendors table**: Recipient selection for vendor campaigns
- **Weddings table**: Campaign scoping
- **Events table**: Event-related variables and filters
- **Users table**: Consultant ownership for templates

## Out of Scope Confirmation

Per spec, these are NOT included in Phase 13:
- ❌ Actual email sending (SendGrid/Mailgun integration)
- ❌ Scheduled job execution
- ❌ Webhook processing for tracking
- ❌ Unsubscribe handling
- ❌ A/B testing
- ❌ Image uploads in editor
- ❌ Analytics dashboard with charts
