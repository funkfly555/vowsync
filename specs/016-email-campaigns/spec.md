# Feature Specification: Email Templates and Campaigns

**Feature Branch**: `016-email-campaigns`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Email Templates and Campaigns - Create email templates with variables and send campaigns to guests/vendors"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Email Templates (Priority: P1)

As a wedding consultant, I need to create reusable email templates with placeholders so I can efficiently communicate with guests and vendors without rewriting common messages.

**Why this priority**: Templates are the foundation of the email system. Without templates, campaigns cannot leverage pre-built content, making every email a manual effort. This enables consultant productivity and message consistency.

**Independent Test**: Can be fully tested by creating, editing, cloning, and organizing templates. Delivers immediate value by allowing consultants to build their template library before sending any campaigns.

**Acceptance Scenarios**:

1. **Given** I am on the email templates page, **When** I click "Create Template", **Then** I see a form with fields for template name, type, subject, HTML body, and plain text body
2. **Given** I am creating a template, **When** I type `{{guest.name}}` in the body, **Then** the system recognizes it as a valid variable and shows it in the variables list
3. **Given** I have an existing template, **When** I click "Clone", **Then** a new template is created with " (Copy)" appended to the name and all content duplicated
4. **Given** I have multiple templates, **When** I mark one as default for a type, **Then** any previous default for that type is unmarked
5. **Given** I have a template, **When** I set it to inactive, **Then** it no longer appears in campaign template selection but remains in my template list

---

### User Story 2 - Create and Send Email Campaigns (Priority: P1)

As a wedding consultant, I need to compose email campaigns targeting specific recipients and either send immediately or schedule for later, so I can manage timely communications efficiently.

**Why this priority**: Sending campaigns is the core value proposition. Without this, templates have no purpose and communication goals cannot be achieved.

**Independent Test**: Can be fully tested by creating a campaign, selecting recipients, previewing, and executing (simulated) send. Delivers immediate value by enabling mass communication.

**Acceptance Scenarios**:

1. **Given** I am creating a campaign, **When** I select a template, **Then** the subject and body fields are populated with template content
2. **Given** I am creating a campaign, **When** I choose "All Guests" as recipient type, **Then** the system shows the count of guests who will receive the email
3. **Given** I am creating a campaign with custom filters, **When** I filter by RSVP status "pending", **Then** only guests without confirmed RSVP are included
4. **Given** I have composed a campaign, **When** I click "Preview", **Then** I see the email rendered with sample data replacing variables
5. **Given** I have a campaign ready, **When** I click "Send Now", **Then** the campaign status changes to "sending" and email logs are created for each recipient
6. **Given** I have a campaign ready, **When** I select a future date/time and click "Schedule", **Then** the campaign status is set to "scheduled" with the chosen datetime

---

### User Story 3 - Track Campaign Performance (Priority: P2)

As a wedding consultant, I need to view campaign statistics and individual email delivery status, so I can monitor engagement and identify delivery issues.

**Why this priority**: Tracking enables consultants to understand campaign effectiveness and troubleshoot problems. Essential for iterative improvement but not required for initial sending capability.

**Independent Test**: Can be fully tested by viewing campaign detail page with stats dashboard and email log list. Delivers value by providing visibility into campaign outcomes.

**Acceptance Scenarios**:

1. **Given** I have sent a campaign, **When** I view the campaign detail page, **Then** I see aggregate stats: total sent, delivered, opened, clicked, bounced, failed
2. **Given** I am viewing campaign details, **When** I look at the email logs section, **Then** I see each recipient with their delivery status and timestamp
3. **Given** I am viewing email logs, **When** I filter by status "bounced", **Then** only emails with bounce status are displayed
4. **Given** an email has status "delivered", **When** I view its status badge, **Then** it displays green with appropriate icon
5. **Given** an email has status "hard_bounce", **When** I view its status badge, **Then** it displays red indicating permanent failure

---

### User Story 4 - Handle Bounces and Invalid Emails (Priority: P2)

As a wedding consultant, I need the system to handle email bounces appropriately, so invalid addresses are flagged and I'm notified of delivery issues.

**Why this priority**: Bounce handling prevents repeated failures and maintains email sender reputation. Important for system health but can be implemented after basic sending works.

**Independent Test**: Can be tested by simulating bounce events and verifying guest/vendor email flags are updated. Delivers value by automating email hygiene.

**Acceptance Scenarios**:

1. **Given** an email receives a hard bounce, **When** the bounce is processed, **Then** the guest/vendor's email is marked as invalid
2. **Given** an email receives a soft bounce, **When** the bounce is processed, **Then** the system schedules a retry after 24 hours
3. **Given** an email has soft bounced 3 times, **When** the third retry fails, **Then** the email status is set to "failed" and no more retries occur
4. **Given** a guest's email is marked invalid, **When** I create a campaign to all guests, **Then** that guest is excluded from recipients with a warning indicator

---

### User Story 5 - View Campaign History (Priority: P3)

As a wedding consultant, I need to view all past campaigns with their performance, so I can review communication history and learn from previous campaigns.

**Why this priority**: Historical view provides context and learning but is not required for day-to-day campaign operations.

**Independent Test**: Can be tested by viewing campaigns list with sorting and filtering. Delivers value by enabling campaign management and historical reference.

**Acceptance Scenarios**:

1. **Given** I am on the campaigns page, **When** the page loads, **Then** I see a list of all campaigns with name, status, sent date, and summary stats
2. **Given** I have multiple campaigns, **When** I sort by sent date descending, **Then** most recent campaigns appear first
3. **Given** I have draft, scheduled, and sent campaigns, **When** I filter by status "sent", **Then** only completed campaigns are displayed

---

### Edge Cases

- What happens when a template has invalid variable syntax (e.g., `{{guest.invalid_field}}`)?
  - System validates variables against known schema and warns user of unrecognized variables before saving
- How does system handle a campaign with 0 recipients after filters are applied?
  - Display warning and prevent sending; require at least 1 valid recipient
- What happens when scheduled send time is in the past?
  - Reject scheduling and prompt user to select future time or send immediately
- How does system handle duplicate emails in recipient list?
  - Deduplicate by email address; each address receives only one email per campaign
- What happens if a guest/vendor has no email address?
  - Exclude from recipient count and list; show indicator that some recipients lack email
- What happens when editing a template that's in use by a draft campaign?
  - Allow edit; warn that draft campaigns using this template will reflect changes

## Requirements *(mandatory)*

### Functional Requirements

**Template Management**

- **FR-001**: System MUST allow creation of email templates with name, type, subject, HTML body, and plain text body
- **FR-002**: System MUST support template variables in format `{{entity.field}}` for guests, weddings, events, and vendors
- **FR-003**: System MUST extract and display detected variables when saving a template
- **FR-004**: System MUST allow marking one template as default per template type
- **FR-005**: System MUST allow toggling template active/inactive status
- **FR-006**: System MUST support cloning templates with automatic name suffix
- **FR-007**: Templates MUST be scoped to the consultant (consultant_id)

**Campaign Creation**

- **FR-008**: System MUST allow creating campaigns with name, subject, body (HTML and plain text), and recipient selection
- **FR-009**: System MUST allow selecting recipients by type: all guests, filtered guests, all vendors, filtered vendors
- **FR-010**: System MUST support guest filters: RSVP status, event attendance, table assignment, dietary restrictions
- **FR-011**: System MUST support vendor filters: vendor type, payment status
- **FR-012**: System MUST allow using existing template or custom content for campaign
- **FR-013**: System MUST display recipient count based on current selection and filters
- **FR-014**: System MUST allow email preview with sample data substitution before sending

**Campaign Execution**

- **FR-015**: System MUST support immediate campaign sending (simulated for Phase 13)
- **FR-016**: System MUST support scheduling campaigns for future date/time
- **FR-017**: System MUST create email log entries for each recipient when campaign is sent
- **FR-018**: System MUST update campaign status through lifecycle: draft → scheduled → sending → sent
- **FR-019**: Campaigns MUST be scoped to a wedding (wedding_id)

**Tracking and Statistics**

- **FR-020**: System MUST track campaign aggregate statistics: sent, delivered, opened, clicked, bounced, failed
- **FR-021**: System MUST maintain individual email logs with status, timestamps, and delivery details
- **FR-022**: System MUST support filtering email logs by status, recipient type, and campaign
- **FR-023**: System MUST display status badges with color coding per design system

**Bounce Handling**

- **FR-024**: System MUST mark guest/vendor email as invalid on hard bounce
- **FR-025**: System MUST schedule retry (up to 3 attempts) on soft bounce
- **FR-026**: System MUST set email status to "failed" after 3 unsuccessful soft bounce retries
- **FR-027**: System MUST exclude recipients with invalid email from future campaigns

**Data Display**

- **FR-028**: System MUST display campaign history with sortable columns
- **FR-029**: System MUST display campaign detail page with statistics and email logs
- **FR-030**: Email log status badges MUST follow design system color scheme

### Key Entities

- **Email Template**: Reusable message blueprint with variables; belongs to a consultant; has type, active status, and default flag
- **Email Campaign**: Specific send operation; belongs to a wedding; tracks recipients, status, scheduling, and aggregate performance metrics
- **Email Log**: Individual email delivery record; tracks recipient, status progression, timestamps, bounce details, and engagement metrics

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Consultants can create a new email template in under 2 minutes
- **SC-002**: Campaign creation wizard (template selection, recipients, preview, send) completes in under 5 minutes
- **SC-003**: Email preview accurately renders 100% of supported template variables with sample data
- **SC-004**: Campaign statistics dashboard loads within 2 seconds for campaigns with up to 500 recipients
- **SC-005**: Email log filtering returns results within 1 second for campaigns with up to 1000 email logs
- **SC-006**: 100% of hard bounces result in email invalidation for the affected recipient
- **SC-007**: Consultants can identify delivery issues (bounces, failures) within 3 clicks from campaign list
- **SC-008**: Template cloning creates exact duplicate with modified name in under 1 second
- **SC-009**: Status badges are visually distinguishable with correct color coding per design system
- **SC-010**: System prevents sending campaigns with 0 valid recipients

## Assumptions

- Email sending is simulated/mocked in Phase 13; actual email delivery integration deferred to future phase
- Template variables are limited to documented entities: guest, wedding, event, vendor
- Campaign scheduling stores scheduled_at but actual scheduled job execution is Phase 14
- RLS policies exist on database tables to enforce proper data access
- Bounce processing logic exists but is triggered manually or via simulation in Phase 13
- HTML body allows basic formatting but rich text editor with image upload is Phase 17
- Recipients with invalid/missing email addresses are automatically excluded from campaigns

## Out of Scope (Future Phases)

- Actual email sending integration (Phase 14+)
- Scheduled job automation for RSVP reminders (Phase 14)
- Email unsubscribe handling (Phase 17)
- A/B testing campaigns (Phase 17)
- Rich text editor with image upload (Phase 17)
- Email analytics dashboard with charts (Phase 17)
- Email open/click tracking implementation (requires tracking pixels/links - future)
