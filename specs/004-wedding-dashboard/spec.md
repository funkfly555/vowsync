# Feature Specification: Wedding Dashboard

**Feature Branch**: `004-wedding-dashboard`
**Created**: 2026-01-13
**Status**: Draft
**Input**: User description: "Build a comprehensive dashboard for each wedding showing key metrics, event summary, quick actions, and activity overview. This is the main 'home page' when viewing a specific wedding."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Wedding Overview Metrics (Priority: P1)

As a wedding consultant, I want to see key metrics at a glance when I open a wedding so I can quickly understand the wedding's status without navigating through multiple pages.

**Why this priority**: This is the core value proposition of the dashboard - providing immediate situational awareness. Without metrics, the dashboard has no primary purpose.

**Independent Test**: Navigate to `/weddings/:weddingId` and verify all metric cards display correct counts and calculations from the database.

**Acceptance Scenarios**:

1. **Given** a wedding with guests, events, and vendors, **When** I view the dashboard, **Then** I see metric cards showing:
   - Days until wedding (or days since if passed)
   - Total guest count (confirmed vs total invited)
   - Number of events
   - Budget summary (spent vs total)

2. **Given** a wedding with no data yet, **When** I view the dashboard, **Then** I see metric cards with zero values and helpful prompts to add data

3. **Given** a wedding date in the past, **When** I view the dashboard, **Then** the countdown shows "X days ago" instead of "X days until"

---

### User Story 2 - View Events Timeline Summary (Priority: P1)

As a wedding consultant, I want to see an at-a-glance summary of upcoming events on the dashboard so I can quickly understand what's happening and when.

**Why this priority**: Events are central to wedding planning. Seeing them prominently on the dashboard enables quick navigation and context awareness.

**Independent Test**: View dashboard and verify events are listed chronologically with correct times, dates, and quick navigation links.

**Acceptance Scenarios**:

1. **Given** a wedding with 3 events, **When** I view the dashboard, **Then** I see all events listed in chronological order with name, date, time, and location

2. **Given** a wedding with no events, **When** I view the dashboard, **Then** I see an empty state with a prompt to "Add your first event"

3. **Given** I click on an event in the summary, **When** the click is processed, **Then** I navigate to that event's detail/edit page

---

### User Story 3 - Quick Actions Panel (Priority: P2)

As a wedding consultant, I want quick action buttons on the dashboard so I can perform common tasks without navigating through menus.

**Why this priority**: Reduces friction for common workflows but is not essential for understanding wedding status.

**Independent Test**: Click each quick action button and verify it navigates to the correct page or opens the correct modal.

**Acceptance Scenarios**:

1. **Given** I am on the wedding dashboard, **When** I click "Add Guest", **Then** I navigate to the guest creation page/modal

2. **Given** I am on the wedding dashboard, **When** I click "Add Event", **Then** I navigate to the event creation page

3. **Given** I am on the wedding dashboard, **When** I click "View Timeline", **Then** I navigate to the events timeline page

4. **Given** I am on the wedding dashboard, **When** I click "Manage Budget", **Then** I navigate to the budget management page

---

### User Story 4 - RSVP Status Overview (Priority: P2)

As a wedding consultant, I want to see RSVP progress on the dashboard so I can track guest confirmations and follow up as needed.

**Why this priority**: RSVP tracking is important for wedding planning but is secondary to core metrics and event overview.

**Independent Test**: View dashboard with guests in various RSVP states and verify the progress bar and counts are accurate.

**Acceptance Scenarios**:

1. **Given** a wedding with 50 invited guests (30 confirmed, 10 declined, 10 pending), **When** I view the dashboard, **Then** I see a progress bar showing 80% responded (40/50) with breakdown by status

2. **Given** I click on the RSVP section, **When** the click is processed, **Then** I navigate to the guest list filtered by RSVP status

---

### User Story 5 - Recent Activity Feed (Priority: P3)

As a wedding consultant, I want to see recent changes to the wedding so I can stay informed about what has been updated.

**Why this priority**: Useful for audit and awareness but not essential for core planning workflows.

**Independent Test**: Make changes to wedding data and verify they appear in the activity feed with correct timestamps and descriptions.

**Acceptance Scenarios**:

1. **Given** recent changes have been made to guests, events, or vendors, **When** I view the dashboard, **Then** I see a list of the 5 most recent activities with timestamps

2. **Given** no recent activity exists, **When** I view the dashboard, **Then** I see an empty state message "No recent activity"

3. **Given** I click "View all activity", **When** the click is processed, **Then** I navigate to a full activity log page

---

### Edge Cases

- What happens when the wedding date is today? Show "Wedding Day!" instead of countdown
- What happens when budget_total is 0? Show "Budget not set" instead of percentage
- How does the dashboard handle loading states? Show skeleton loaders for each section
- What happens when database queries fail? Show error state with retry button

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a countdown/countup for days until/since the wedding date
- **FR-002**: System MUST display total guest count with confirmed vs total breakdown
- **FR-003**: System MUST display number of events for the wedding
- **FR-004**: System MUST display budget summary showing actual vs projected spending
- **FR-005**: System MUST display a chronological list of events with name, date, time, location
- **FR-006**: System MUST provide quick action buttons for common operations
- **FR-007**: System MUST display RSVP progress as a visual progress bar with counts
- **FR-008**: System MUST display recent activity from the activity_log table
- **FR-009**: System MUST handle loading states with skeleton loaders
- **FR-010**: System MUST handle error states with user-friendly messages and retry options
- **FR-011**: System MUST be responsive and work well on mobile devices

### Key Entities *(include if feature involves data)*

- **Wedding**: Core entity containing wedding_date, budget_total, budget_actual, guest counts
- **Event**: Events linked to wedding with date, time, location
- **Guest**: Guests with invitation_status and attendance_confirmed fields
- **Activity Log**: Audit trail entries for recent changes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dashboard loads within 2 seconds on standard connection
- **SC-002**: All metric calculations match underlying data (verified via Playwright tests)
- **SC-003**: Navigation from quick actions takes user to correct destination 100% of the time
- **SC-004**: Dashboard displays correctly on viewport widths from 320px to 1920px
- **SC-005**: All interactive elements are keyboard accessible (WCAG 2.1 AA compliant)
