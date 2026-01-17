# Feature Specification: Notifications System with Bell Icon

**Feature Branch**: `018-notifications`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Notifications System with Bell Icon - As a wedding consultant, I need a notification system that alerts me to important deadlines and events (payments due, RSVPs overdue, tasks approaching, etc.), so I can stay on top of all my wedding planning responsibilities without missing critical dates."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Notification Bell with Unread Count (Priority: P1)

As a wedding consultant, I want to see a bell icon in the application header with a badge showing my unread notification count, so I can immediately know if there are items requiring my attention.

**Why this priority**: This is the entry point for the entire notification system. Without the bell icon visible, users cannot access notifications at all. It provides constant, non-intrusive awareness of pending items.

**Independent Test**: Can be fully tested by logging in and verifying the bell icon appears in the header with correct unread count badge, delivering immediate visibility into notification status.

**Acceptance Scenarios**:

1. **Given** I am logged into the application, **When** I view any page, **Then** I see a bell icon in the header
2. **Given** I have 5 unread notifications, **When** I view the header, **Then** I see a badge showing "5" on the bell icon
3. **Given** I have 0 unread notifications, **When** I view the header, **Then** I see the bell icon without a badge (or badge hidden)
4. **Given** I have more than 99 unread notifications, **When** I view the header, **Then** I see a badge showing "99+"

---

### User Story 2 - View Recent Notifications in Dropdown (Priority: P1)

As a wedding consultant, I want to click the bell icon to see a dropdown panel with my most recent notifications, so I can quickly review what needs attention without leaving my current page.

**Why this priority**: This is the primary interaction method for notifications. Users need quick access to see what notifications exist before deciding on action.

**Independent Test**: Can be fully tested by clicking the bell icon and verifying dropdown appears with notification cards showing icon, title, message, timestamp, and action button.

**Acceptance Scenarios**:

1. **Given** I have notifications, **When** I click the bell icon, **Then** a dropdown panel opens showing up to 10 recent notifications
2. **Given** a notification exists, **When** I view the dropdown, **Then** I see each notification with: type icon, title, message, relative timestamp (e.g., "2 hours ago"), and action button
3. **Given** I have unread notifications, **When** I view the dropdown, **Then** unread notifications appear with bold text and colored background
4. **Given** I have read notifications, **When** I view the dropdown, **Then** read notifications appear dimmed/grayed out
5. **Given** I have no notifications, **When** I click the bell icon, **Then** I see an empty state message "No notifications"

---

### User Story 3 - Mark Notifications as Read (Priority: P1)

As a wedding consultant, I want to mark notifications as read individually or all at once, so I can keep track of what I've already reviewed.

**Why this priority**: Core functionality - users must be able to clear their notification queue to maintain its usefulness. Without this, the unread count becomes meaningless.

**Independent Test**: Can be fully tested by clicking individual notifications or "Mark All Read" button and verifying unread count decreases appropriately.

**Acceptance Scenarios**:

1. **Given** I have an unread notification, **When** I click on the notification card, **Then** it is marked as read and the unread count decreases by 1
2. **Given** I have 5 unread notifications, **When** I click "Mark All Read" in the dropdown, **Then** all notifications are marked as read and the unread count becomes 0
3. **Given** I click on a notification, **When** it has an action_url, **Then** I am navigated to the relevant page (e.g., vendor detail, task list)

---

### User Story 4 - View All Notifications on Full Page (Priority: P2)

As a wedding consultant, I want to access a full-page view of all my notifications with filtering options, so I can review my complete notification history and find specific items.

**Why this priority**: Important for comprehensive review but not essential for basic notification awareness. Users can function with just the dropdown for MVP.

**Independent Test**: Can be fully tested by navigating to /notifications page and verifying all notifications display with filtering and sorting capabilities.

**Acceptance Scenarios**:

1. **Given** I am in the dropdown, **When** I click "View All Notifications", **Then** I navigate to the /notifications full-page view
2. **Given** I am on the notifications page, **When** I view the list, **Then** I see all my notifications with pagination if needed
3. **Given** I am on the notifications page, **When** I filter by type (payment, task, RSVP, vendor, budget), **Then** only notifications of that type display
4. **Given** I am on the notifications page, **When** I filter by priority (low, normal, high, urgent), **Then** only notifications of that priority display
5. **Given** I am on the notifications page, **When** I filter by read/unread status, **Then** only notifications matching that status display

---

### User Story 5 - Delete Notifications (Priority: P2)

As a wedding consultant, I want to delete individual notifications from the full-page view, so I can clean up notifications that are no longer relevant.

**Why this priority**: Useful for notification management but not critical to core functionality. Users can function without deletion in MVP.

**Independent Test**: Can be fully tested by clicking delete on a notification and verifying it is removed from the list.

**Acceptance Scenarios**:

1. **Given** I am on the notifications full page, **When** I click delete on a notification, **Then** a confirmation prompt appears
2. **Given** I confirm deletion, **When** the action completes, **Then** the notification is permanently removed from my list
3. **Given** I cancel deletion, **When** the prompt closes, **Then** the notification remains unchanged

---

### User Story 6 - Visual Distinction by Type and Priority (Priority: P2)

As a wedding consultant, I want to see different notification types with distinct icons and colors, so I can quickly identify the category and urgency of each notification.

**Why this priority**: Enhances usability significantly but system is functional with plain notifications. Visual cues improve scanning speed.

**Independent Test**: Can be fully tested by creating sample notifications of each type and verifying correct icons and priority colors display.

**Acceptance Scenarios**:

1. **Given** a payment_due or payment_overdue notification, **When** I view it, **Then** I see a DollarSign icon in red
2. **Given** a task_due or task_overdue notification, **When** I view it, **Then** I see a CheckSquare icon in orange
3. **Given** an rsvp_deadline or rsvp_overdue notification, **When** I view it, **Then** I see a Users icon in blue
4. **Given** a vendor_update notification, **When** I view it, **Then** I see a Briefcase icon in yellow/orange
5. **Given** a budget_warning notification, **When** I view it, **Then** I see an AlertTriangle icon in red
6. **Given** an urgent priority notification, **When** I view it, **Then** it has a red left border
7. **Given** a high priority notification, **When** I view it, **Then** it has an orange left border
8. **Given** a normal priority notification, **When** I view it, **Then** it has a blue left border
9. **Given** a low priority notification, **When** I view it, **Then** it has a gray left border

---

### User Story 7 - Sample Notification Generation (Priority: P3)

As a wedding consultant (in development mode), I want to generate sample notifications of each type for testing purposes, so I can verify the notification system works correctly without waiting for real triggers.

**Why this priority**: Development/testing utility. Not needed for production users but essential for validating the feature during development.

**Independent Test**: Can be fully tested by clicking "Create Sample Notifications" button (dev only) and verifying notifications of each type are created.

**Acceptance Scenarios**:

1. **Given** I am in development environment, **When** I am on the notifications page, **Then** I see a "Create Sample Notifications" button
2. **Given** I click "Create Sample Notifications", **When** the action completes, **Then** sample notifications of each type (payment_due, task_due, rsvp_deadline, vendor_update, budget_warning) are created
3. **Given** I am in production environment, **When** I am on the notifications page, **Then** I do NOT see the "Create Sample Notifications" button

---

### Edge Cases

- What happens when user has no active wedding selected? Notifications display across all weddings for the user.
- How does system handle notifications for weddings that have been deleted? Notifications remain orphaned with wedding_id null or are cascade-deleted based on database policy.
- What happens when clicking a notification action_url that leads to a deleted entity? User sees appropriate "not found" message and notification can still be marked as read.
- How are timestamps displayed for very old notifications? Relative timestamps switch to date format (e.g., "Jan 15, 2026") for items older than 7 days.
- What happens when notification list exceeds dropdown height? Dropdown becomes scrollable with max-height of 500px.
- How does system handle rapid clicking on "Mark All Read"? Button is disabled during processing to prevent duplicate requests.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a bell icon in the application header on all authenticated pages
- **FR-002**: System MUST display an unread notification count badge on the bell icon when count > 0
- **FR-003**: System MUST hide the badge when unread count is 0
- **FR-004**: System MUST display "99+" when unread count exceeds 99
- **FR-005**: System MUST open a dropdown panel when user clicks the bell icon
- **FR-006**: Dropdown MUST display up to 10 most recent notifications ordered by creation date descending
- **FR-007**: Each notification card MUST display: type-specific icon, title, message, relative timestamp, and action button (if action_url exists)
- **FR-008**: System MUST visually distinguish unread notifications (bold text, colored background) from read notifications (dimmed/grayed)
- **FR-009**: System MUST display a colored left border on notifications based on priority (urgent=red, high=orange, normal=blue, low=gray)
- **FR-010**: System MUST mark a notification as read when user clicks on it
- **FR-011**: System MUST navigate to action_url when user clicks a notification with an action_url
- **FR-012**: System MUST provide "Mark All Read" functionality in the dropdown
- **FR-013**: System MUST provide "View All Notifications" link in dropdown that navigates to /notifications page
- **FR-014**: Notifications page MUST display all notifications with pagination
- **FR-015**: Notifications page MUST provide filtering by: notification_type, priority, read/unread status
- **FR-016**: Notifications page MUST allow users to delete individual notifications with confirmation
- **FR-017**: System MUST display relative timestamps (e.g., "2 hours ago", "3 days ago") for recent notifications
- **FR-018**: System MUST display formatted dates for notifications older than 7 days
- **FR-019**: System MUST display an empty state message when no notifications exist
- **FR-020**: System MUST display type-specific icons: DollarSign (payment), CheckSquare (task), Users (RSVP), Briefcase (vendor), AlertTriangle (budget)
- **FR-021**: System MUST provide a development-only "Create Sample Notifications" utility for testing

### Key Entities

- **Notification**: Represents an alert to the user about an event requiring attention. Contains title, message, type (payment_due, task_due, rsvp_deadline, vendor_update, budget_warning, etc.), priority (low, normal, high, urgent), read status, optional link to related entity (vendor, task, guest, payment), and timestamps. Belongs to a user and optionally to a specific wedding.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their unread notification count within 1 second of any page load
- **SC-002**: Users can open the notification dropdown and view recent notifications within 500ms of clicking the bell icon
- **SC-003**: Users can identify notification urgency (type and priority) within 2 seconds of viewing a notification card
- **SC-004**: Users can mark all notifications as read with a single click
- **SC-005**: Users can navigate from notification to related entity (payment, task, etc.) with a single click
- **SC-006**: 95% of users can successfully find and use the notification bell icon on first attempt
- **SC-007**: Users can filter notifications by type and priority on the full page within 3 clicks
- **SC-008**: Notification dropdown displays correctly on both desktop and mobile viewports
- **SC-009**: Relative timestamps are accurate and update appropriately (e.g., "just now" becomes "1 minute ago")

## Assumptions

- The `notifications` table already exists in the database from Phase 1 with the required schema
- Users are already authenticated when accessing the notification system
- The application header component exists and can be extended to include the bell icon
- Lucide React icons are available for use (Bell, DollarSign, CheckSquare, Users, Briefcase, AlertTriangle)
- date-fns library is available for relative timestamp formatting
- Shadcn/ui components (Popover, Button, Badge, ScrollArea) are available
- Automated notification generation (background jobs) is deferred to a future enhancement - this feature focuses on the notification UI/UX
- Real-time updates via Supabase Realtime are deferred to a future enhancement

## Out of Scope

- Automated notification generation (background cron jobs checking for due dates)
- Real-time notification updates via Supabase Realtime subscriptions
- Email notification delivery
- Push notifications (PWA)
- Notification preferences/settings per type
- Notification grouping (e.g., "5 payments due this week")
- Snooze functionality
- Notification history export
