# Component Props Contracts: Email Templates & Campaigns

**Feature**: 016-email-campaigns
**Date**: 2026-01-17

This document defines the props interfaces for all components.

## Template Components

### EmailTemplateList

```typescript
interface EmailTemplateListProps {
  consultantId: string;
  onCreateClick: () => void;
  onEditClick: (template: EmailTemplate) => void;
  onCloneClick: (template: EmailTemplate) => void;
  onDeleteClick: (template: EmailTemplate) => void;
}
```

### EmailTemplateCard

```typescript
interface EmailTemplateCardProps {
  template: EmailTemplate;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
}
```

### EmailTemplateModal

```typescript
interface EmailTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate; // undefined = create mode
  consultantId: string;
  onSuccess: () => void;
}
```

### EmailTemplateForm

```typescript
interface EmailTemplateFormProps {
  initialData?: EmailTemplateFormData;
  onSubmit: (data: EmailTemplateFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}
```

### VariableHelper

```typescript
interface VariableHelperProps {
  recipientType: RecipientType;
  onInsertVariable: (variable: string) => void;
}
```

### DeleteEmailTemplateDialog

```typescript
interface DeleteEmailTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplate;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}
```

## Campaign Components

### EmailCampaignList

```typescript
interface EmailCampaignListProps {
  weddingId: string;
  onCreateClick: () => void;
  onViewClick: (campaign: EmailCampaign) => void;
  onEditClick: (campaign: EmailCampaign) => void;
  onDeleteClick: (campaign: EmailCampaign) => void;
}
```

### EmailCampaignCard

```typescript
interface EmailCampaignCardProps {
  campaign: EmailCampaignWithTemplate;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
```

### CampaignWizard

```typescript
interface CampaignWizardProps {
  weddingId: string;
  consultantId: string;
  onComplete: (campaign: EmailCampaign) => void;
  onCancel: () => void;
}
```

### CampaignWizard Steps

```typescript
// Step 1: Template Selection
interface TemplateStepProps {
  consultantId: string;
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string | null) => void;
  onStartFromScratch: () => void;
  onNext: () => void;
}

// Step 2: Content
interface ContentStepProps {
  initialSubject: string;
  initialBodyHtml: string;
  initialBodyText: string | null;
  recipientType: RecipientType;
  onUpdate: (data: { subject: string; body_html: string; body_text: string | null }) => void;
  onBack: () => void;
  onNext: () => void;
}

// Step 3: Recipients
interface RecipientsStepProps {
  weddingId: string;
  recipientType: RecipientType;
  recipientFilter: RecipientFilter | null;
  onRecipientTypeChange: (type: RecipientType) => void;
  onFilterChange: (filter: RecipientFilter | null) => void;
  onBack: () => void;
  onNext: () => void;
}

// Step 4: Schedule
interface ScheduleStepProps {
  sendNow: boolean;
  scheduledAt: string | null;
  onSendNowChange: (sendNow: boolean) => void;
  onScheduledAtChange: (scheduledAt: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}

// Step 5: Review
interface ReviewStepProps {
  campaignData: EmailCampaignFormData;
  recipientCount: number;
  onBack: () => void;
  onSend: () => Promise<void>;
  isLoading: boolean;
}
```

### RecipientSelector

```typescript
interface RecipientSelectorProps {
  weddingId: string;
  recipientType: RecipientType;
  filter: RecipientFilter | null;
  onFilterChange: (filter: RecipientFilter | null) => void;
  selectedRecipientIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  showPreview?: boolean;
  maxPreviewCount?: number;
}
```

### EmailPreview

```typescript
interface EmailPreviewProps {
  subject: string;
  bodyHtml: string;
  recipientType: RecipientType;
  sampleData?: Record<string, any>;
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
}
```

### CampaignStats

```typescript
interface CampaignStatsProps {
  campaign: EmailCampaign;
}
```

## Log Components

### EmailLogTable

```typescript
interface EmailLogTableProps {
  campaignId: string;
  initialStatus?: EmailLogStatus;
  onRowClick?: (log: EmailLog) => void;
}
```

### EmailLogDetail

```typescript
interface EmailLogDetailProps {
  log: EmailLog;
  onClose: () => void;
}
```

## Shared Components

### EmailStatusBadge

```typescript
interface EmailStatusBadgeProps {
  status: CampaignStatus | EmailLogStatus;
  type: 'campaign' | 'log';
  size?: 'sm' | 'md';
  showIcon?: boolean;
}
```

### EmailStatsCard

```typescript
interface EmailStatsCardProps {
  label: string;
  value: number;
  total: number;
  color: 'green' | 'blue' | 'teal' | 'purple' | 'orange' | 'red' | 'gray';
  icon?: LucideIcon;
}
```

### RichTextEditor

```typescript
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  recipientType?: RecipientType;
  onInsertVariable?: (variable: string) => void;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
}
```

## Page Components

### EmailTemplatesPage

```typescript
interface EmailTemplatesPageProps {
  // No props - uses route params
  // Route: /weddings/:weddingId/emails/templates
}
```

### EmailCampaignsPage

```typescript
interface EmailCampaignsPageProps {
  // No props - uses route params
  // Route: /weddings/:weddingId/emails
}
```

### CreateEmailCampaignPage

```typescript
interface CreateEmailCampaignPageProps {
  // No props - uses route params
  // Route: /weddings/:weddingId/emails/new
}
```

### EmailCampaignDetailPage

```typescript
interface EmailCampaignDetailPageProps {
  // No props - uses route params
  // Route: /weddings/:weddingId/emails/:campaignId
}
```

## Form Value Types

### Template Form Values (React Hook Form)

```typescript
interface TemplateFormValues {
  template_name: string;
  template_type: TemplateType;
  subject: string;
  body_html: string;
  body_text: string;
  is_default: boolean;
  is_active: boolean;
}
```

### Campaign Form Values (Wizard State)

```typescript
interface CampaignWizardState {
  step: 1 | 2 | 3 | 4 | 5;
  templateId: string | null;
  campaignName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  recipientType: RecipientType;
  recipientFilter: RecipientFilter | null;
  sendNow: boolean;
  scheduledAt: string | null;
}
```

## Event Handlers

### Template Events

```typescript
type OnTemplateCreate = (data: EmailTemplateFormData) => Promise<void>;
type OnTemplateUpdate = (id: string, data: EmailTemplateFormData) => Promise<void>;
type OnTemplateDelete = (id: string) => Promise<void>;
type OnTemplateClone = (id: string) => Promise<EmailTemplate>;
```

### Campaign Events

```typescript
type OnCampaignCreate = (data: EmailCampaignFormData, recipients: Recipient[]) => Promise<EmailCampaign>;
type OnCampaignUpdate = (id: string, data: Partial<EmailCampaignFormData>) => Promise<void>;
type OnCampaignDelete = (id: string) => Promise<void>;
type OnCampaignSend = (id: string, recipients: Recipient[]) => Promise<void>;
type OnCampaignSchedule = (id: string, scheduledAt: string) => Promise<void>;
```

### Filter Events

```typescript
type OnStatusFilterChange = (status: CampaignStatus | EmailLogStatus | 'all') => void;
type OnRecipientTypeChange = (type: RecipientType) => void;
type OnRecipientFilterChange = (filter: RecipientFilter | null) => void;
type OnSearchChange = (search: string) => void;
type OnPageChange = (page: number) => void;
```
