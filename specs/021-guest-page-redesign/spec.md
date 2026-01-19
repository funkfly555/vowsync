# Feature Specification: Guest Page Redesign

**Feature Branch**: `021-guest-page-redesign`
**Created**: 2026-01-18
**Status**: Draft
**Input**: Guest Page Redesign - Design 3 Enhanced with inline expandable cards, 5-tab interface, plus one full capture, bulk actions, and seating modals

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Expand Guest Cards (Priority: P1)

As a wedding consultant, I need to view all guests as collapsed cards and expand them inline to see full details, so I can quickly scan the guest list and dive deep into individual guest information without navigating away from the page.

**Why this priority**: This is the core interaction pattern that replaces the current table/modal design. Without this, no other features can be tested or used.

**Independent Test**: Can be fully tested by loading the guest list, verifying collapsed cards display key info (name, type, invitation status, table, events attending), clicking a card to expand it, and verifying the 5-tab interface appears inline with all guest data.

**Acceptance Scenarios**:

1. **Given** I am on the Guests page with existing guests, **When** the page loads, **Then** I see all guests displayed as collapsed cards showing: name, guest type badge, invitation status badge, table assignment, and events attending count
2. **Given** I see a collapsed guest card, **When** I click on the card, **Then** the card expands inline (without opening a modal) to reveal a 5-tab interface (Basic, RSVP, Seating, Dietary, Meals)
3. **Given** I have multiple guest cards, **When** I expand one card and then click another collapsed card, **Then** both cards remain expanded for side-by-side comparison
4. **Given** I have an expanded guest card, **When** I click the card header or collapse button, **Then** the card collapses back to the summary view

---

### User Story 2 - Edit Guest Information via Tabs (Priority: P1)

As a wedding consultant, I need to edit guest information directly within the expanded card tabs, so I can make changes efficiently without opening separate edit dialogs.

**Why this priority**: Editing is essential for managing guest data. Combined with Story 1, this forms the minimum viable product.

**Independent Test**: Can be tested by expanding a guest card, navigating through each tab, editing fields, saving changes, and verifying data persists after collapse/re-expand.

**Acceptance Scenarios**:

1. **Given** I have a guest card expanded to the Basic Info tab, **When** I edit the guest's name, email, phone, or type, **Then** the changes are saved when I click Save or move to another tab
2. **Given** I am on the RSVP tab, **When** I change the invitation status, RSVP deadline, or RSVP method, **Then** the changes are persisted and the collapsed card summary updates accordingly
3. **Given** I am on the Seating tab, **When** I enter a table number or position, **Then** the seating assignment is saved and visible on the collapsed card
4. **Given** I am on the Dietary tab, **When** I enter dietary restrictions, allergies, or notes, **Then** the information is saved for catering purposes
5. **Given** I am on the Meals tab, **When** I select starter, main, and dessert choices (1-5), **Then** the meal selections are saved

---

### User Story 3 - Plus One Management Within Tabs (Priority: P2)

As a wedding consultant, I need to see and manage Plus One details alongside the primary guest in each tab, so I can efficiently capture complete information for both people in one place.

**Why this priority**: Plus ones represent significant event attendees who need full data capture. This enables accurate headcounts and catering planning.

**Independent Test**: Can be tested by enabling "has plus one" for a guest, entering plus one details in each tab, saving, and verifying plus one data appears in all relevant views.

**Acceptance Scenarios**:

1. **Given** I have a guest with has_plus_one enabled, **When** I view any expanded tab, **Then** I see a two-column layout with primary guest info on the left and Plus One info on the right
2. **Given** I am on the Basic Info tab with Plus One enabled, **When** I enter plus_one_name and set plus_one_confirmed, **Then** the Plus One details are saved
3. **Given** I am on the Seating tab with Plus One enabled, **When** I assign table and position for the Plus One, **Then** the Plus One has their own seating assignment (separate from primary guest)
4. **Given** I am on the Dietary tab with Plus One enabled, **When** I enter Plus One dietary restrictions and allergies, **Then** the Plus One dietary requirements are captured separately
5. **Given** I am on the Meals tab with Plus One enabled, **When** I select meal choices for the Plus One, **Then** the Plus One has independent meal selections

---

### User Story 4 - Bulk Guest Selection and Actions (Priority: P2)

As a wedding consultant, I need to select multiple guests and perform bulk actions, so I can efficiently manage large guest lists without repetitive individual edits.

**Why this priority**: Bulk operations dramatically improve efficiency for weddings with 100+ guests.

**Independent Test**: Can be tested by selecting multiple guests via checkboxes, clicking bulk action buttons, completing the action, and verifying changes apply to all selected guests.

**Acceptance Scenarios**:

1. **Given** I am on the Guests page, **When** I click the checkbox on multiple guest cards, **Then** a Bulk Actions Bar appears showing the count of selected guests and available actions
2. **Given** I have 5 guests selected, **When** I click "Assign Table" in the Bulk Actions Bar, **Then** a modal appears where I can enter a table number to assign to all selected guests
3. **Given** I have guests selected, **When** I click "Export" in the Bulk Actions Bar, **Then** only the selected guests are exported to CSV
4. **Given** I have guests selected, **When** I click "Clear Selection", **Then** all checkboxes are unchecked and the Bulk Actions Bar disappears

---

### User Story 5 - Visual Seating Arrangement (Priority: P3)

As a wedding consultant, I need to see a visual representation of table seating, so I can arrange guests at circular tables with specific positions.

**Why this priority**: Visual seating helps prevent conflicts and ensures proper arrangements, but basic text-based assignment is sufficient for MVP.

**Independent Test**: Can be tested by clicking "Arrange Seats" on a guest, viewing the circular table visualization, assigning a position, and verifying the position saves correctly.

**Acceptance Scenarios**:

1. **Given** I have a guest card expanded to the Seating tab, **When** I click "Arrange Seats", **Then** a modal opens showing a circular table diagram with numbered positions (1-10)
2. **Given** I am viewing the seating arrangement modal, **When** I click on a position number, **Then** the guest is assigned to that position and the modal shows their name at that position
3. **Given** there are other guests already assigned to the same table, **When** I view the seating arrangement modal, **Then** I see those guests' names at their assigned positions
4. **Given** I have assigned a position, **When** I close the modal and check the Seating tab, **Then** the table_position field reflects my selection

---

### User Story 6 - Search and Filter Guests (Priority: P2)

As a wedding consultant, I need to search and filter the guest list, so I can quickly find specific guests or view subsets of guests by criteria.

**Why this priority**: Essential for managing large guest lists efficiently.

**Independent Test**: Can be tested by using the search box, applying filters, and verifying only matching guests are displayed.

**Acceptance Scenarios**:

1. **Given** I am on the Guests page, **When** I type a name in the search box, **Then** only guests whose names contain the search term are displayed
2. **Given** I have guests of different types, **When** I filter by guest type (adult/child/vendor/staff), **Then** only guests of that type are shown
3. **Given** I have guests with different invitation statuses, **When** I filter by invitation status (pending/invited/confirmed/declined), **Then** only guests with that status are shown
4. **Given** I have guests assigned to different tables, **When** I filter by table number, **Then** only guests at that table are shown
5. **Given** I have multiple filters applied, **When** I click "Clear Filters", **Then** all filters reset and all guests are displayed

---

### User Story 7 - Expand/Collapse All Cards (Priority: P3)

As a wedding consultant, I need to quickly expand or collapse all guest cards at once, so I can efficiently switch between overview and detailed views.

**Why this priority**: Convenience feature that improves workflow but not essential for core functionality.

**Independent Test**: Can be tested by clicking "Expand All" and verifying all cards expand, then clicking "Collapse All" and verifying all cards collapse.

**Acceptance Scenarios**:

1. **Given** all guest cards are collapsed, **When** I click "Expand All", **Then** all guest cards expand to show their 5-tab interface
2. **Given** some or all guest cards are expanded, **When** I click "Collapse All", **Then** all guest cards collapse to show only the summary view
3. **Given** I have filters applied, **When** I click "Expand All", **Then** only the visible (filtered) cards are expanded

---

### User Story 8 - Guest Count Including Plus Ones (Priority: P2)

As a wedding consultant, I need to see accurate guest counts that include plus ones, so I can plan for the correct number of attendees.

**Why this priority**: Accurate headcounts are critical for venue, catering, and budget planning.

**Independent Test**: Can be tested by adding guests with and without plus ones, and verifying the count display shows correct breakdown.

**Acceptance Scenarios**:

1. **Given** I have 6 guests where 2 have plus ones, **When** I view the guest count display, **Then** I see "6 guests + 2 plus ones = 8 total"
2. **Given** I filter the guest list, **When** I view the count, **Then** the count reflects only the filtered guests and their plus ones
3. **Given** I have guests with unconfirmed plus ones, **When** I view the count, **Then** unconfirmed plus ones are still included in the total (with optional indicator)

---

### Edge Cases

- What happens when a user clicks rapidly on multiple cards to expand them? (All should expand without conflict)
- How does the system handle a guest card that fails to save during editing? (Show error toast, retain unsaved data in form)
- What happens when filtering results in zero guests? (Show empty state with "No guests match your filters" message)
- How does the seating modal handle a table that's already full? (Show warning when all positions are occupied)
- What happens when a plus one is removed after having data entered? (Confirm with user, then clear plus one data)
- How does the system handle very long guest names or notes? (Truncate with ellipsis on collapsed card, show full text when expanded)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all guests as collapsed cards showing: name, guest type badge, invitation status badge, table number, and events attending count
- **FR-002**: System MUST expand guest cards inline (not in a modal) when clicked, revealing a 5-tab interface
- **FR-003**: System MUST allow multiple guest cards to be expanded simultaneously
- **FR-004**: System MUST provide 5 tabs in expanded view: Basic Info, RSVP, Seating, Dietary, Meals
- **FR-005**: System MUST display Plus One information in a two-column layout alongside primary guest in each tab when has_plus_one is enabled
- **FR-006**: System MUST allow selection of multiple guests via checkboxes for bulk operations
- **FR-007**: System MUST display a Bulk Actions Bar when one or more guests are selected, showing: selected count, Assign Table button, Export button, Clear Selection button
- **FR-008**: System MUST provide a Table Assignment modal that accepts a table number and applies it to all selected guests
- **FR-009**: System MUST provide a Seating Arrangement modal showing a circular table visualization with numbered positions (1-10)
- **FR-010**: System MUST support search by guest name with real-time filtering
- **FR-011**: System MUST support filtering by: guest type, invitation status, table number, and event attendance
- **FR-012**: System MUST provide "Expand All" and "Collapse All" buttons to toggle all visible cards
- **FR-013**: System MUST display guest counts in format: "X guests + Y plus ones = Z total"
- **FR-014**: System MUST persist all changes made in expanded card tabs to the database
- **FR-015**: System MUST update the collapsed card summary view when underlying data changes
- **FR-016**: System MUST use existing Vowsync design system colors (dusty rose #D4A5A5, sage green #A8B8A6, etc.)
- **FR-017**: System MUST use Tailwind CSS and Shadcn/ui components exclusively (no custom CSS)

### Key Entities

- **Guest**: Represents an invitee with personal info (name, email, phone), RSVP status, seating assignment, dietary needs, meal choices, and optional plus one
- **Plus One**: Extension of Guest representing their companion, with independent seating, dietary, and meal data stored in guest table fields (plus_one_name, plus_one_confirmed, etc.)
- **Guest Event Attendance**: Junction entity tracking which events each guest is attending, including shuttle requirements

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view and expand any guest card within 1 second of clicking
- **SC-002**: Users can edit and save guest information across all 5 tabs within 30 seconds per guest
- **SC-003**: Users can bulk-assign a table to 20+ guests in under 10 seconds
- **SC-004**: Search results filter instantly as user types (debounced to 300ms)
- **SC-005**: Guest count accurately reflects all guests plus confirmed and unconfirmed plus ones
- **SC-006**: All styling matches existing Vowsync design system without visual regression
- **SC-007**: Page remains responsive with 200+ guest cards loaded
- **SC-008**: Users can manage Plus One details in the same time it takes to manage primary guest (no context switching required)

## Assumptions

- Existing guest database schema supports all required fields (verified: guests table has all needed columns)
- Plus One data uses existing guest table fields (plus_one_name, plus_one_confirmed, etc.) rather than a separate table
- The visual seating arrangement shows a generic circular table with 10 positions (not configurable table sizes in this phase)
- Shuttle assignment fields exist in guest_event_attendance table for per-event shuttle tracking
- Invitation status uses the Phase 17 values: pending (displayed as "To Be Sent"), invited, confirmed, declined

## Dependencies

- Existing guests table and guest_event_attendance table from database schema
- Existing Shadcn/ui component library installation
- Existing Tailwind CSS configuration with Vowsync color palette
- TanStack Query for data fetching and mutations
- React Hook Form with Zod for form validation

## Out of Scope

- Drag-and-drop table assignment visualization
- Configurable table sizes/shapes
- CSV/Excel import (already implemented in Phase 6B)
- Event attendance matrix (already implemented in Phase 6B)
- Email campaign integration (already implemented in Phase 13)
- Mobile-specific layout optimization (desktop-first for this phase)
