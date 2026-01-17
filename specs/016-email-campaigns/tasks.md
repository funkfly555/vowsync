# Tasks: Email Templates & Campaigns

**Input**: Design documents from `/specs/016-email-campaigns/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing with Playwright MCP only (per constitution). No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create foundational type definitions

- [x] T001 Install Tiptap dependencies: `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-placeholder`
- [x] T002 [P] Create email type definitions in src/types/email.ts (all interfaces from data-model.md)
- [x] T003 [P] Create email template Zod schema in src/schemas/emailTemplate.ts
- [x] T004 [P] Create email campaign Zod schema in src/schemas/emailCampaign.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared components and hooks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Create EmailStatusBadge component in src/components/email/shared/EmailStatusBadge.tsx
- [x] T006 [P] Create EmailStatsCard component in src/components/email/shared/EmailStatsCard.tsx
- [x] T007 Create RichTextEditor component with Tiptap in src/components/email/shared/RichTextEditor.tsx
- [x] T008 [P] Create useRecipients hook for guest/vendor filtering in src/hooks/useRecipients.ts
- [x] T009 Add email routes to src/App.tsx (4 new routes under wedding layout)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create and Manage Email Templates (Priority: P1) 🎯 MVP

**Goal**: Consultants can create, edit, clone, and organize reusable email templates with variable placeholders

**Independent Test**: Create a template with variables, clone it, set as default, toggle active status

### Implementation for User Story 1

- [x] T010 [P] [US1] Create useEmailTemplates hook in src/hooks/useEmailTemplates.ts
- [x] T011 [P] [US1] Create useEmailTemplate hook in src/hooks/useEmailTemplate.ts
- [x] T012 [US1] Create useEmailTemplateMutations hook in src/hooks/useEmailTemplateMutations.ts (create, update, delete, clone, setDefault)
- [x] T013 [P] [US1] Create VariableHelper component in src/components/email/templates/VariableHelper.tsx
- [x] T014 [US1] Create EmailTemplateForm component in src/components/email/templates/EmailTemplateForm.tsx (uses RichTextEditor, VariableHelper)
- [x] T015 [US1] Create EmailTemplateModal component in src/components/email/templates/EmailTemplateModal.tsx
- [x] T016 [P] [US1] Create DeleteEmailTemplateDialog component in src/components/email/templates/DeleteEmailTemplateDialog.tsx
- [x] T017 [US1] Create EmailTemplateCard component in src/components/email/templates/EmailTemplateCard.tsx
- [x] T018 [US1] Create EmailTemplateList component in src/components/email/templates/EmailTemplateList.tsx
- [x] T019 [US1] Create EmailTemplatesPage in src/pages/EmailTemplatesPage.tsx

**Checkpoint**: User Story 1 complete - templates can be created, edited, cloned, and managed independently

---

## Phase 4: User Story 2 - Create and Send Email Campaigns (Priority: P1) 🎯 MVP

**Goal**: Consultants can compose campaigns, select recipients with filters, preview, and send (simulated)

**Independent Test**: Create campaign from template, filter recipients, preview with variables, execute send

### Implementation for User Story 2

- [x] T020 [P] [US2] Create useEmailCampaigns hook in src/hooks/useEmailCampaigns.ts
- [x] T021 [P] [US2] Create useEmailCampaign hook in src/hooks/useEmailCampaign.ts
- [x] T022 [US2] Create useEmailCampaignMutations hook in src/hooks/useEmailCampaignMutations.ts (create, update, delete, send, schedule)
- [x] T023 [P] [US2] Create RecipientSelector component in src/components/email/campaigns/RecipientSelector.tsx
- [x] T024 [P] [US2] Create EmailPreview component in src/components/email/campaigns/EmailPreview.tsx
- [x] T025 [US2] Create TemplateStep wizard component in src/components/email/campaigns/CampaignWizard/TemplateStep.tsx
- [x] T026 [US2] Create ContentStep wizard component in src/components/email/campaigns/CampaignWizard/ContentStep.tsx
- [x] T027 [US2] Create RecipientsStep wizard component in src/components/email/campaigns/CampaignWizard/RecipientsStep.tsx
- [x] T028 [US2] Create ScheduleStep wizard component in src/components/email/campaigns/CampaignWizard/ScheduleStep.tsx
- [x] T029 [US2] Create ReviewStep wizard component in src/components/email/campaigns/CampaignWizard/ReviewStep.tsx
- [x] T030 [US2] Create CampaignWizard index component in src/components/email/campaigns/CampaignWizard/index.tsx
- [x] T031 [US2] Implement email sending simulation logic in useEmailCampaignMutations (90% delivered, 5% hard_bounce, 3% soft_bounce, 2% failed)
- [x] T032 [US2] Create CreateEmailCampaignPage in src/pages/CreateEmailCampaignPage.tsx

**Checkpoint**: User Story 2 complete - campaigns can be created, recipients filtered, previewed, and sent (simulated)

---

## Phase 5: User Story 3 - Track Campaign Performance (Priority: P2)

**Goal**: Consultants can view campaign statistics and individual email delivery status

**Independent Test**: View campaign detail page with stats dashboard, filter email logs by status

### Implementation for User Story 3

- [x] T033 [P] [US3] Create useEmailLogs hook with pagination in src/hooks/useEmailLogs.ts
- [x] T034 [US3] Create CampaignStats component in src/components/email/campaigns/CampaignStats.tsx
- [x] T035 [US3] Create EmailLogTable component in src/components/email/logs/EmailLogTable.tsx
- [x] T036 [US3] Create EmailLogDetail component in src/components/email/logs/EmailLogDetail.tsx
- [x] T037 [US3] Create EmailCampaignDetailPage in src/pages/EmailCampaignDetailPage.tsx

**Checkpoint**: User Story 3 complete - campaign stats and email logs are viewable and filterable

---

## Phase 6: User Story 4 - Handle Bounces and Invalid Emails (Priority: P2)

**Goal**: System handles bounces by flagging invalid emails and excluding them from future campaigns

**Independent Test**: Simulate bounce, verify guest/vendor email marked invalid, verify exclusion from recipient selection

### Implementation for User Story 4

- [x] T038 [US4] Add bounce processing logic to useEmailCampaignMutations (hard bounce sets email_valid=false)
- [x] T039 [US4] Update useRecipients to exclude recipients with email_valid=false
- [x] T040 [US4] Add invalid email indicator to RecipientSelector component
- [x] T041 [US4] Add bounce details display to EmailLogDetail component

**Checkpoint**: User Story 4 complete - bounces are handled and invalid emails excluded from campaigns

---

## Phase 7: User Story 5 - View Campaign History (Priority: P3)

**Goal**: Consultants can view all past campaigns with performance summaries

**Independent Test**: View campaigns list with sorting, filter by status

### Implementation for User Story 5

- [x] T042 [P] [US5] Create EmailCampaignCard component in src/components/email/campaigns/EmailCampaignCard.tsx
- [x] T043 [US5] Create EmailCampaignList component in src/components/email/campaigns/EmailCampaignList.tsx
- [x] T044 [US5] Create EmailCampaignsPage in src/pages/EmailCampaignsPage.tsx

**Checkpoint**: User Story 5 complete - campaign history is viewable with sorting and filtering

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T045 [P] Add loading states and skeletons to all list components
- [x] T046 [P] Add error boundaries and toast notifications for all mutations
- [x] T047 [P] Ensure keyboard navigation and WCAG 2.1 AA compliance
- [x] T048 Add navigation link to emails section in wedding sidebar
- [x] T049 Run quickstart.md validation - verify all flows work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority - can run in parallel if staffed
  - US3 and US4 are P2 priority - depend on US2 for campaign/logs to exist
  - US5 is P3 priority - can start after US2
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - templates have no dependencies on campaigns
- **User Story 2 (P1)**: Can use templates from US1, but works without them (start from scratch option)
- **User Story 3 (P2)**: Requires US2 complete (needs campaigns and logs to view)
- **User Story 4 (P2)**: Requires US2 complete (needs sending simulation to generate bounces)
- **User Story 5 (P3)**: Requires US2 complete (needs campaigns to list)

### Within Each User Story

- Hooks before components that use them
- Form components before modal/page components
- Wizard steps before wizard index
- List components before page components

### Parallel Opportunities

**Phase 1** (all parallel):
```
T002, T003, T004 can run simultaneously
```

**Phase 2** (mostly parallel):
```
T005, T006, T008 can run simultaneously
T007 is independent but may take longer (Tiptap integration)
```

**Phase 3 - User Story 1**:
```
T010, T011 can run simultaneously (hooks)
T013, T016 can run simultaneously (independent components)
```

**Phase 4 - User Story 2**:
```
T020, T021 can run simultaneously (hooks)
T023, T024 can run simultaneously (independent components)
```

**Phase 5-7**: Mostly sequential within each phase

**Phase 8** (all parallel):
```
T045, T046, T047 can run simultaneously
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Templates)
4. Complete Phase 4: User Story 2 (Campaigns + Send)
5. **STOP and VALIDATE**: Test templates and campaign sending independently
6. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Templates work → Demo
3. Add User Story 2 → Campaigns work → Demo (Full MVP!)
4. Add User Story 3 → Tracking works → Demo
5. Add User Story 4 → Bounce handling works → Demo
6. Add User Story 5 → History view works → Demo
7. Polish → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Templates)
   - Developer B: User Story 2 (Campaigns)
3. After both P1 stories complete:
   - Developer A: User Story 3 (Tracking)
   - Developer B: User Story 4 (Bounce Handling)
4. User Story 5 and Polish can follow

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Manual testing with Playwright MCP per constitution
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
