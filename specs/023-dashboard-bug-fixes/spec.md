# Feature Specification: Dashboard Bug Fixes

**Feature Branch**: `023-dashboard-bug-fixes`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "Dashboard Bug Fixes - Event Timeline, Budget Graph, Vendors Error"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Vendors Page Without Errors (Priority: P1)

As a wedding consultant, I want to access the vendors page without encountering any errors, so I can manage vendor information reliably and without frustration.

**Why this priority**: A page crash completely blocks access to vendor data, making this a critical severity bug. Users cannot work with vendors at all when this occurs.

**Independent Test**: Can be fully tested by navigating to the vendors page and verifying it loads completely without console errors and displays all vendor cards.

**Acceptance Scenarios**:

1. **Given** I am logged into the application, **When** I navigate to the vendors page, **Then** the page loads successfully without any JavaScript errors
2. **Given** vendors exist for the wedding, **When** the vendors page loads, **Then** all vendor cards display correctly with their data visible
3. **Given** a vendor has incomplete data (missing status or payment info), **When** I view the vendor card, **Then** the card displays with appropriate default values instead of crashing

---

### User Story 2 - View Event Timeline Without Scrolling (Priority: P2)

As a wedding consultant, I want to view all event timeline cards on the dashboard without horizontal scrolling, so I can quickly see the complete wedding schedule at a glance on my desktop screen.

**Why this priority**: The event timeline is a primary dashboard element. Horizontal scrolling creates friction and hides important event information, degrading the user experience but not blocking functionality.

**Independent Test**: Can be fully tested by loading the dashboard on a 1920px wide screen and verifying all event cards are visible without horizontal scrolling.

**Acceptance Scenarios**:

1. **Given** I am on the wedding dashboard on a 1920px wide desktop, **When** I view the event timeline section, **Then** all event cards are visible without any horizontal scrollbar appearing
2. **Given** I have 5 events for a wedding, **When** I view the dashboard on a 1440px wide screen, **Then** all 5 event cards are displayed in a compact layout without horizontal overflow
3. **Given** I have a wedding with events, **When** I view the dashboard on a 1366px wide screen, **Then** the event timeline displays all events without requiring horizontal scroll

---

### User Story 3 - View Budget Chart with Readable Labels (Priority: P3)

As a wedding consultant, I want to view the budget breakdown pie chart with all category labels clearly visible and readable, so I can understand budget allocation without labels overlapping or being cut off.

**Why this priority**: The budget chart provides important financial visibility. Overlapping labels reduce usability but don't block access to data, making this a medium-priority visual fix.

**Independent Test**: Can be fully tested by loading the dashboard with 12+ budget categories and verifying all legend labels are readable without overlap.

**Acceptance Scenarios**:

1. **Given** I have a wedding with 12 budget categories, **When** I view the budget breakdown chart, **Then** all category labels in the legend are fully readable without overlapping each other
2. **Given** the budget chart displays many categories, **When** I view the legend, **Then** the layout accommodates all labels in an organized manner (multi-column or scrollable)
3. **Given** I view the budget chart on desktop, **When** checking the visual presentation, **Then** the chart and legend appear clean and professional

---

### Edge Cases

- What happens when a vendor card has null/undefined status values? The card should display with default "Unknown" text instead of crashing
- What happens when a vendor has missing payment status data? The card should display gracefully with fallback text
- What happens when the event timeline has 10+ events? Cards should wrap or use a scrollable container gracefully
- How does the budget chart handle 20+ categories? Legend should remain usable with scrolling or truncation
- How does the event timeline behave on tablet (768px) and mobile (375px) viewports? Should remain functional with appropriate responsive adjustments

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Vendors page MUST load without JavaScript errors for all vendor data states
- **FR-002**: Vendor cards MUST handle undefined or null properties with defensive null checks
- **FR-003**: Vendor cards MUST display default values (e.g., "Unknown") when status or payment data is missing
- **FR-004**: Dashboard MUST display the event timeline without horizontal scrollbar on desktop viewports (1920px, 1440px, 1366px wide)
- **FR-005**: Event timeline cards MUST use compact spacing with reduced padding (16px instead of 24px)
- **FR-006**: Event timeline cards MUST have reduced minimum width to fit more cards in the available space
- **FR-007**: Budget breakdown chart legend MUST display all category labels without overlap
- **FR-008**: Budget legend MUST use a layout that accommodates 12+ categories (multi-column or scrollable)
- **FR-009**: Budget legend MUST maintain readable font size (minimum 12px caption size)
- **FR-010**: All existing dashboard and vendor functionality MUST continue to work after fixes

### Key Entities

- **Event**: Represents a wedding event with name, date, start time, end time, and display order
- **Budget Category**: Represents a budget line item with name, projected amount, and actual amount spent
- **Vendor**: Represents a wedding vendor with type, company name, contact details, contract status, and payment status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Vendors page loads with zero console errors for 100% of test cases including incomplete data scenarios
- **SC-002**: All vendor cards display correctly regardless of data completeness (0 crashes)
- **SC-003**: Event timeline displays without horizontal scroll on standard desktop viewports (1920px, 1440px, 1366px)
- **SC-004**: All budget category labels (up to 15 categories) are fully readable without any text overlap
- **SC-005**: Page load time for dashboard and vendors pages remains under 2 seconds after fixes
- **SC-006**: Mobile and tablet responsive layouts continue to function correctly after fixes

## Assumptions

- The vendor page error is caused by accessing `.label` property on undefined objects (likely status badge or payment status)
- Event timeline cards currently use 24px padding which can be reduced to 16px per design system
- Event timeline cards have excessive minimum width causing overflow on standard desktop viewports
- Budget categories typically range from 5-15; the chart should handle up to 20 categories
- The design system specifies event colors (#E8B4B8, #F5E6D3, #C9D4C5, #E5D4EF, #FFE5CC) which should already be applied
- Existing responsive behavior on mobile and tablet should not be impacted by these fixes
