# Feature Specification: Dashboard Visual Metrics Redesign

**Feature Branch**: `022-dashboard-visual-metrics`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "Dashboard Redesign - Visual Metrics Layout with charts and data visualization for wedding consultants"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Stats Overview (Priority: P1)

As a wedding consultant, I need to see key wedding metrics at a glance in a visually engaging Quick Stats row, so I can immediately understand the overall status without scrolling or clicking.

**Why this priority**: This is the first thing users see on the dashboard - immediate visual feedback on guests, events, budget, and vendors provides instant value and sets the visual tone for the redesigned dashboard.

**Independent Test**: Can be fully tested by loading the dashboard and verifying the Quick Stats row displays 4 circular gradient icons with accurate counts. Delivers immediate value by showing Guests count, Events count, Budget percentage, and Vendor invoice count.

**Acceptance Scenarios**:

1. **Given** a wedding with guest, event, vendor, and budget data, **When** I load the dashboard, **Then** I see a Quick Stats row with 4 stat pills showing circular gradient icons and accurate counts
2. **Given** the Quick Stats row is displayed, **When** I view each stat pill, **Then** I see the value in large bold text (32px) with a descriptive label below (14px)
3. **Given** different data states, **When** any count is zero, **Then** the stat still displays with "0" as the value

---

### User Story 2 - Budget Overview Visualization (Priority: P1)

As a wedding consultant, I need to see my budget status as a circular progress chart with a legend, so I can visually understand what percentage has been spent and how much remains.

**Why this priority**: Budget tracking is critical for wedding planning - a visual progress chart makes it easy to quickly assess financial status without reading numbers.

**Independent Test**: Can be fully tested by viewing the Budget Overview card and verifying the circular progress chart displays the correct percentage, with legend showing Total Budget, Spent, and Remaining amounts.

**Acceptance Scenarios**:

1. **Given** a wedding with budget_total of R 60,500 and budget_actual of R 17,000, **When** I view the Budget Overview card, **Then** I see a circular progress chart showing 28% in the center
2. **Given** the Budget Overview card is displayed, **When** I look at the legend, **Then** I see Total Budget (R 60,500), Spent (R 17,000), and Remaining (R 43,500) with colored dots
3. **Given** the circular progress chart, **When** I view it, **Then** it has NO extra padded white space inside - clean and tight design with the chart filling its container
4. **Given** budget_total is zero or null, **When** I view the Budget Overview, **Then** the chart shows 0% gracefully without errors

---

### User Story 3 - RSVP Status Visualization (Priority: P1)

As a wedding consultant, I need to see guest RSVP status as a pie chart, so I can visually understand the response breakdown at a glance.

**Why this priority**: Guest response tracking is essential for event planning - a pie chart provides immediate visual clarity on confirmation status.

**Independent Test**: Can be fully tested by viewing the RSVP Status card and verifying the pie chart displays correct segment sizes and colors for each invitation status.

**Acceptance Scenarios**:

1. **Given** guests with various invitation_status values, **When** I view the RSVP Status card, **Then** I see a pie chart showing segments for each status type
2. **Given** the pie chart is displayed, **When** I look at the legend, **Then** I see color indicators matching: To Be Sent (pending), Confirmed, Declined, and Invited
3. **Given** all guests have the same status, **When** I view the chart, **Then** it displays as a full circle in that status color
4. **Given** no guests exist, **When** I view the RSVP Status card, **Then** it displays an empty state message gracefully

---

### User Story 4 - Event Timeline (Priority: P2)

As a wedding consultant, I need to see upcoming events in a horizontal scrolling timeline with event-specific colors, so I can quickly review the event schedule.

**Why this priority**: Events are the core of wedding planning - a visual timeline with color-coded cards provides quick schedule awareness without navigating away.

**Independent Test**: Can be fully tested by viewing the Event Timeline card and verifying horizontal scrolling works with event cards displaying correct colors matching the Events page.

**Acceptance Scenarios**:

1. **Given** multiple events exist for the wedding, **When** I view the Event Timeline card, **Then** I see horizontally scrolling event cards with event name, date, and expected guests
2. **Given** more events than fit in the viewport, **When** I scroll horizontally, **Then** additional event cards are revealed smoothly
3. **Given** events have gradient colors from the Events page, **When** I view event cards, **Then** they use the EXACT same gradient colors as the Events page
4. **Given** no events exist, **When** I view the Event Timeline, **Then** it displays an empty state with a prompt to add events

---

### User Story 5 - Vendor Invoice Status (Priority: P2)

As a wedding consultant, I need to see vendor invoice amounts grouped by status (Overdue, Unpaid, Partially Paid, Paid), so I can track payment obligations at a glance.

**Why this priority**: Financial tracking requires awareness of payment status - grouping by status with amounts helps prioritize payment actions.

**Independent Test**: Can be fully tested by viewing the Vendor Invoices card and verifying amounts display correctly by status WITHOUT invoice counts.

**Acceptance Scenarios**:

1. **Given** vendor invoices with various statuses, **When** I view the Vendor Invoices card, **Then** I see amounts grouped by status: Overdue, Unpaid, Partially Paid, and Paid
2. **Given** the invoice amounts display, **When** I view each status line, **Then** I see ONLY the amount (e.g., "R 115.00") WITHOUT invoice counts or prefixes
3. **Given** no invoices exist for a status, **When** I view that status line, **Then** it displays "R 0.00" or is hidden gracefully
4. **Given** the status badges, **When** I view them, **Then** each has distinct background and text colors matching the design specification

---

### User Story 6 - Items and Bar Orders Status (Priority: P3)

As a wedding consultant, I need to see Items Status and Bar Orders status cards at the bottom of the dashboard, so I can monitor inventory and order status.

**Why this priority**: These are secondary metrics that complement the primary wedding status - important but less frequently checked than guests, budget, and events.

**Independent Test**: Can be fully tested by viewing the Items Status and Bar Orders cards and verifying they display relevant summary data.

**Acceptance Scenarios**:

1. **Given** wedding items exist, **When** I view the Items Status card, **Then** I see a summary of total_required vs number_available
2. **Given** bar orders exist, **When** I view the Bar Orders card, **Then** I see a summary of order statuses
3. **Given** no items or bar orders exist, **When** I view these cards, **Then** they display empty states gracefully

---

### User Story 7 - Responsive Layout (Priority: P2)

As a wedding consultant using different devices, I need the dashboard to be fully responsive, so I can access wedding information on mobile, tablet, and desktop.

**Why this priority**: Mobile access is essential for consultants on-the-go - responsive design ensures the dashboard is usable across all devices.

**Independent Test**: Can be fully tested by viewing the dashboard at different viewport sizes and verifying layout adapts appropriately.

**Acceptance Scenarios**:

1. **Given** a desktop viewport (>1024px), **When** I view the dashboard, **Then** I see a 2-column grid layout with Budget Overview and RSVP Status side by side
2. **Given** a tablet viewport (768px-1024px), **When** I view the dashboard, **Then** the grid adjusts to maintain readability
3. **Given** a mobile viewport (<768px), **When** I view the dashboard, **Then** cards stack vertically in a single column
4. **Given** the Event Timeline on mobile, **When** I view it, **Then** it still scrolls horizontally within its container

---

### Edge Cases

- What happens when budget_total is zero or null? → Display 0% progress gracefully
- What happens when no guests exist? → Show empty state in RSVP chart
- What happens when no events exist? → Show empty state with "Add Event" prompt
- What happens when all invoice amounts are zero? → Display "R 0.00" for each status
- What happens when numbers are very large (e.g., R 1,000,000)? → Format with thousands separator and ensure layout doesn't break
- What happens when event names are very long? → Truncate with ellipsis while maintaining readability

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a Quick Stats row with 4 stat pills showing Guests count, Events count, Budget percentage, and Vendor invoice count
- **FR-002**: System MUST display circular gradient icons (56px diameter) for each stat pill with specified gradient colors
- **FR-003**: System MUST display a Budget Overview card with a circular progress chart (180px diameter) showing budget percentage
- **FR-004**: System MUST calculate budget percentage as (budget_actual / budget_total) × 100
- **FR-005**: System MUST display budget legend with Total Budget, Spent, and Remaining amounts with colored dots
- **FR-006**: System MUST display an RSVP Status card with a pie chart showing guest invitation_status breakdown
- **FR-007**: System MUST use specific colors for RSVP statuses: pending (#FF9800), confirmed (#4CAF50), declined (#F44336), invited (#2196F3)
- **FR-008**: System MUST display an Event Timeline card with horizontal scrolling event cards
- **FR-009**: System MUST use the exact gradient colors from the Events page for event cards
- **FR-010**: System MUST display a Vendor Invoices card showing amounts by status WITHOUT invoice counts
- **FR-011**: System MUST format currency amounts with "R" prefix and thousands separators (e.g., "R 56,668.55")
- **FR-012**: System MUST display Items Status and Bar Orders status cards
- **FR-013**: System MUST use icons that match the sidebar navigation icons exactly
- **FR-014**: System MUST ensure the circular progress chart has NO padded white space inside
- **FR-015**: System MUST follow the Vowsync brand palette (#D4A5A5, #A8B8A6, #C9A961)
- **FR-016**: System MUST be fully responsive across mobile, tablet, and desktop viewports
- **FR-017**: System MUST include guest_count_adults + guest_count_children in total guest count

### Key Entities

- **Wedding**: Contains budget_total, budget_actual, guest_count_adults, guest_count_children; source of budget calculations
- **Event**: Contains event_name, event_date, event_start_time, event_order; displayed in timeline with specific colors
- **Guest**: Contains name, guest_type, invitation_status; grouped by status for RSVP pie chart
- **Vendor Invoice**: Contains amount, status (overdue, unpaid, partially_paid, paid); summed by status for display
- **Wedding Item**: Contains total_required, number_available; used for inventory status
- **Bar Order**: Contains status; used for order status summary

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can understand overall wedding status within 5 seconds of viewing the dashboard (Quick Stats visible immediately)
- **SC-002**: Budget progress is visually comprehensible at a glance with percentage clearly displayed in center of circular chart
- **SC-003**: RSVP breakdown is immediately clear through pie chart segments with corresponding legend
- **SC-004**: Event timeline supports horizontal scrolling with each card minimum 280px wide
- **SC-005**: Dashboard renders correctly on mobile (320px), tablet (768px), and desktop (1440px) viewports
- **SC-006**: All stat values update in real-time when underlying data changes
- **SC-007**: Dashboard loads and displays all visual elements within 2 seconds on standard connection
- **SC-008**: Visual design matches provided specifications (colors, sizes, spacing, gradients)
- **SC-009**: Circular progress chart fills its container without extra padding or white space
- **SC-010**: Invoice amounts display without counts, formatted as currency with thousands separators

## Assumptions

- Event colors/gradients are already defined in the Events page and can be reused
- Currency is South African Rand (R) based on the examples provided
- The dashboard is accessed via `/wedding/:weddingId/dashboard` route (existing)
- All required database tables exist with the specified columns (Phase 1 complete)
- The sidebar navigation icons already exist and can be referenced for consistency
- Users have appropriate permissions to view wedding dashboard data
