# Implementation Plan: Email Templates & Campaigns

**Branch**: `016-email-campaigns` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-email-campaigns/spec.md`

## Summary

Implement email template management and campaign sending system for VowSync wedding consultants. Templates support Mustache-style variables (`{{entity.field}}`), campaigns target guests or vendors with filters, and sending is simulated for Phase 13 MVP. Rich text editing via Tiptap, status tracking via color-coded badges, and campaign statistics dashboard.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tiptap, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (`email_templates`, `email_campaigns`, `email_logs` tables exist with RLS enabled)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (responsive, mobile-first)
**Project Type**: Web application (single frontend + Supabase backend)
**Performance Goals**: Page loads < 2s, log filtering < 1s for 1000 entries
**Constraints**: Email sending simulated (no actual delivery), max 500 recipients per campaign
**Scale/Scope**: ~25 new files, 4 pages, 15+ components, 6 hooks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate calculations, proper validations | [x] |
| VII. Security | RLS, no API key exposure, input validation | [x] |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [x] |
| XI. API Handling | Standard response format, error pattern | [x] |
| XII. Git Workflow | Feature branches, descriptive commits | [x] |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] |
| XIV. Environment | Uses .env, no secrets in git | [x] |
| XV. Prohibited | No violations of prohibited practices | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/016-email-campaigns/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology decisions (complete)
├── data-model.md        # Entity definitions (complete)
├── quickstart.md        # Developer quickstart (complete)
├── contracts/           # API contracts (complete)
│   ├── supabase-queries.md
│   └── component-props.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Implementation tasks (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── email.ts                    # Email types (NEW)
├── schemas/
│   ├── emailTemplate.ts            # Template validation (NEW)
│   └── emailCampaign.ts            # Campaign validation (NEW)
├── hooks/
│   ├── useEmailTemplates.ts        # Template list hook (NEW)
│   ├── useEmailTemplate.ts         # Single template hook (NEW)
│   ├── useEmailTemplateMutations.ts # Template CRUD (NEW)
│   ├── useEmailCampaigns.ts        # Campaign list hook (NEW)
│   ├── useEmailCampaign.ts         # Single campaign hook (NEW)
│   ├── useEmailCampaignMutations.ts # Campaign CRUD + send (NEW)
│   ├── useEmailLogs.ts             # Log list with pagination (NEW)
│   └── useRecipients.ts            # Recipient filtering (NEW)
├── components/
│   └── email/                      # Email components (NEW)
│       ├── templates/
│       │   ├── EmailTemplateList.tsx
│       │   ├── EmailTemplateCard.tsx
│       │   ├── EmailTemplateModal.tsx
│       │   ├── EmailTemplateForm.tsx
│       │   ├── VariableHelper.tsx
│       │   └── DeleteEmailTemplateDialog.tsx
│       ├── campaigns/
│       │   ├── EmailCampaignList.tsx
│       │   ├── EmailCampaignCard.tsx
│       │   ├── CampaignWizard/
│       │   │   ├── index.tsx
│       │   │   ├── TemplateStep.tsx
│       │   │   ├── ContentStep.tsx
│       │   │   ├── RecipientsStep.tsx
│       │   │   ├── ScheduleStep.tsx
│       │   │   └── ReviewStep.tsx
│       │   ├── RecipientSelector.tsx
│       │   ├── EmailPreview.tsx
│       │   └── CampaignStats.tsx
│       ├── logs/
│       │   ├── EmailLogTable.tsx
│       │   └── EmailLogDetail.tsx
│       └── shared/
│           ├── EmailStatusBadge.tsx
│           ├── EmailStatsCard.tsx
│           └── RichTextEditor.tsx
└── pages/
    ├── EmailTemplatesPage.tsx      # /weddings/:id/emails/templates (NEW)
    ├── EmailCampaignsPage.tsx      # /weddings/:id/emails (NEW)
    ├── CreateEmailCampaignPage.tsx # /weddings/:id/emails/new (NEW)
    └── EmailCampaignDetailPage.tsx # /weddings/:id/emails/:campaignId (NEW)
```

**Structure Decision**: Single frontend application following established VowSync patterns. All new files go into existing directory structure with feature-specific subdirectories in `components/email/`.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Key Implementation Notes

### 1. Rich Text Editor (Tiptap)

New dependency for email content editing:
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-text-align`, `@tiptap/extension-placeholder`
- Lazy loaded to minimize bundle impact
- Custom toolbar with variable insertion button

### 2. Variable Replacement System

```typescript
function replaceVariables(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.');
    let value = data;
    for (const key of keys) {
      value = value?.[key];
    }
    return value?.toString() || match;
  });
}
```

### 3. Email Sending Simulation

Phase 13 simulates sending with realistic status distribution:
- 90% delivered
- 5% hard_bounce (marks email invalid)
- 3% soft_bounce (shows retry option)
- 2% failed

Clear UI messaging: "Email sending is simulated in MVP"

### 4. Bounce Handling (R10.1)

- Hard bounce: Sets `email_valid = false` on guest/vendor
- Soft bounce: Retry up to 3 times with 24h delay (simulated)
- Creates notifications for delivery issues

### 5. Status Badge Colors (per Design System)

Campaign: draft (gray), scheduled (blue), sending (orange), sent (green), failed (red)

Email Log: pending (gray), sent (blue), delivered (green), opened (teal), clicked (purple), bounced (orange), hard_bounce (red), failed (red)

## Artifacts Generated

| Artifact | Path | Description |
|----------|------|-------------|
| Research | `research.md` | Technology decisions, architecture |
| Data Model | `data-model.md` | Entity definitions, TypeScript interfaces |
| Queries | `contracts/supabase-queries.md` | All database operations |
| Props | `contracts/component-props.md` | Component interfaces |
| Quickstart | `quickstart.md` | Developer setup guide |

## Next Steps

Run `/speckit.tasks` to generate the implementation task list from this plan.
