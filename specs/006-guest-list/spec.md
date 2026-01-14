# Feature Specification: Guest List Page

**Feature Branch**: `006-guest-list`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Create a guest list page for viewing and managing wedding guests"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Guest List (Priority: P1)

Wedding planners need to view all guests for a wedding in a clear, organized table format with essential information at a glance.

**Why this priority**: Viewing guests is the core functionality - planners cannot manage guests if they cannot see them. This is the foundation for all other guest management features.

**Independent Test**: Can be fully tested by navigating to /weddings/:weddingId/guests and verifying the guest table displays with all columns (Name, Type, RSVP, Table, Actions).

**Acceptance Scenarios**:

1. **Given** user is on the wedding dashboard, **When** they click "Guests" in the navigation, **Then** they are taken to the guest list page showing all guests for that wedding
2. **Given** user is on the guest list page, **When** they view the table header, **Then** they see columns for Checkbox, Name, Type, RSVP, Table, and Actions
3. **Given** guests exist for the wedding, **When** user views the list, **Then** guests are displayed sorted by name A-Z
4. **Given** user views a guest row, **When** they check the RSVP column, **Then** it shows "Yes" (green badge) if rsvp_received_date exists, "Overdue" (red badge) if deadline passed without RSVP, or "Pending" (yellow badge) otherwise
5. **Given** user is on desktop (≥1024px), **When** they view the page, **Then** guests display in a table format with hover effect on rows

---

### User Story 2 - Search and Filter Guests (Priority: P1)

Wedding planners need to quickly find specific guests or filter by criteria to manage subsets of the guest list efficiently.

**Why this priority**: With potentially hundreds of guests, search and filter are essential for usability. Without this, the list becomes unusable at scale.

**Independent Test**: Can be fully tested by searching for a guest name and verifying filtered results appear in real-time.

**Acceptance Scenarios**:

1. **Given** user is on the guest list page, **When** they type a name in the search box, **Then** the list filters in real-time to show only guests whose names contain the search text (case-insensitive)
2. **Given** user selects "Adult" from the Type filter, **When** the filter applies, **Then** only guests with guest_type = 'adult' are shown
3. **Given** user selects "Confirmed" from the RSVP Status filter, **When** the filter applies, **Then** only guests with rsvp_received_date are shown
4. **Given** user selects a specific event from the Event filter, **When** the filter applies, **Then** only guests attending that event are shown
5. **Given** user has multiple filters active, **When** they clear search/filters, **Then** the full guest list is restored

---

### User Story 3 - Mobile Guest View (Priority: P2)

Wedding planners using mobile devices need to view and navigate the guest list in a mobile-friendly format.

**Why this priority**: Mobile access is important for planners who check guests on-the-go at venues or meetings, but desktop is the primary use case for detailed management.

**Independent Test**: Can be fully tested by viewing the guest list on a mobile viewport (<768px) and verifying guests display as cards instead of a table.

**Acceptance Scenarios**:

1. **Given** user is on mobile viewport (<768px), **When** they view the guest list, **Then** guests display as cards instead of a table
2. **Given** user views a guest card on mobile, **When** they examine it, **Then** they see Name, Type, RSVP status, and Table number
3. **Given** user views a guest card on mobile, **When** they look at actions, **Then** they see Edit and Delete buttons on each card

---

### User Story 4 - Pagination (Priority: P2)

Wedding planners with large guest lists need pagination to navigate through guests efficiently without loading everything at once.

**Why this priority**: Performance and usability suffer with hundreds of guests on one page. Pagination is essential for large weddings but can be deferred initially if guest counts are small.

**Independent Test**: Can be fully tested by creating 100+ test guests and verifying pagination controls appear and navigate correctly.

**Acceptance Scenarios**:

1. **Given** more than 50 guests exist, **When** user views the guest list, **Then** pagination controls appear at the bottom showing page numbers
2. **Given** pagination is visible, **When** user clicks page 2, **Then** the list shows guests 51-100
3. **Given** user is on page 3, **When** they view the pagination, **Then** the current page (3) is highlighted with dusty rose background (#D4A5A5)
4. **Given** user is viewing filtered results, **When** pagination updates, **Then** the "Showing X-Y of Total" count reflects the filtered total

---

### User Story 5 - Bulk Selection UI (Priority: P3)

Wedding planners need to select multiple guests for future bulk operations (table assignment, email sending).

**Why this priority**: This is UI preparation for Phase 6B bulk actions. The selection mechanism must exist before bulk operations can be implemented.

**Independent Test**: Can be fully tested by selecting multiple guest checkboxes and verifying the selection count updates.

**Acceptance Scenarios**:

1. **Given** user clicks a checkbox next to a guest, **When** the checkbox is checked, **Then** the "Selected: X" count increments
2. **Given** multiple guests are selected, **When** user views the bulk actions bar, **Then** it shows "Selected: X" with dropdown actions
3. **Given** user clicks a bulk action dropdown, **When** they select an option, **Then** a toast message appears saying "Coming in Phase 6B"

---

### User Story 6 - Empty State (Priority: P3)

Wedding planners starting a new wedding need clear guidance when no guests exist yet.

**Why this priority**: Empty states are important for UX but are only seen once per wedding, making this lower priority than core functionality.

**Independent Test**: Can be fully tested by viewing a wedding with no guests and verifying the empty state message appears.

**Acceptance Scenarios**:

1. **Given** a wedding has no guests, **When** user views the guest list page, **Then** they see a centered message "No guests yet. Click '+ Add Guest' to get started."
2. **Given** the empty state is shown, **When** user clicks "+ Add Guest", **Then** a toast appears saying "Coming in Phase 6B"

---

### Edge Cases

- What happens when user navigates directly to /weddings/:weddingId/guests with an invalid weddingId? Show "Wedding not found" error.
- What happens when search returns no results? Show "No guests match your search criteria" message.
- What happens when guest has no table_number? Display "-" in the Table column.
- What happens when rsvp_deadline is null? Treat guest as "Pending" status (not "Overdue").
- What happens when user resizes from desktop to mobile mid-session? Layout should responsively switch between table and cards.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a guest list page at route /weddings/:weddingId/guests
- **FR-002**: System MUST show page header with title "Guests" and "+ Add Guest" button (dusty rose #D4A5A5)
- **FR-003**: System MUST show "+ Add Guest" button that displays toast "Coming in Phase 6B" when clicked
- **FR-004**: System MUST display a search input with placeholder "Search guests by name..." that filters in real-time
- **FR-005**: System MUST provide three filter dropdowns: Type (All/Adult/Child/Vendor/Staff), RSVP Status (All/Pending/Confirmed/Declined), Event (All Events/specific events)
- **FR-006**: System MUST display export buttons (CSV, Excel) that show toast "Coming in Phase 6B" when clicked
- **FR-007**: System MUST show "Showing X-Y of Total" count reflecting current filter/pagination state
- **FR-008**: System MUST display guests in a table on desktop (≥1024px) with columns: Checkbox, Name, Type, RSVP, Table, Actions
- **FR-009**: System MUST display guests as cards on mobile (<768px) showing Name, Type, RSVP, Table, and action buttons
- **FR-010**: System MUST style table header with #F5F5F5 background and bold text
- **FR-011**: System MUST show hover effect (#FAFAFA background) on table rows
- **FR-012**: System MUST use 1px solid #E8E8E8 borders and 16px padding per cell
- **FR-013**: System MUST calculate RSVP status as: "Yes" (green) if rsvp_received_date exists, "Overdue" (red) if rsvp_deadline passed and no rsvp_received_date, "Pending" (yellow) otherwise
- **FR-014**: System MUST display table_number or "-" if null in the Table column
- **FR-015**: System MUST provide Edit and Delete action icons that show toast "Coming in Phase 6B" when clicked
- **FR-016**: System MUST paginate guests at 50 per page with navigation controls "< 1 2 3 4 5 >"
- **FR-017**: System MUST highlight current page number with #D4A5A5 background
- **FR-018**: System MUST show bulk actions bar when guests are selected with "Selected: X" count
- **FR-019**: System MUST provide bulk action dropdowns (Assign Table, Send Email) that show toast "Coming in Phase 6B"
- **FR-020**: System MUST show empty state message when no guests exist: "No guests yet. Click '+ Add Guest' to get started."
- **FR-021**: System MUST fetch guests from database filtered by wedding_id and sorted by name ASC
- **FR-022**: System MUST apply search filter using case-insensitive name matching
- **FR-023**: System MUST apply type filter by matching guest_type field
- **FR-024**: System MUST apply event filter by joining with guest_event_attendance where attending = true

### Key Entities

- **Guest**: Person invited to the wedding with name, type (adult/child/vendor/staff), contact info (email, phone), RSVP tracking (deadline, received date), and seating assignment (table_number)
- **Guest Event Attendance**: Links guests to specific events within the wedding, tracking which events each guest is attending

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view the complete guest list within 2 seconds of page load
- **SC-002**: Search results update within 300ms of user typing
- **SC-003**: Filtering by type, RSVP status, or event completes within 500ms
- **SC-004**: Page correctly displays 50 guests per page with working pagination
- **SC-005**: Mobile card view renders correctly on viewports under 768px width
- **SC-006**: RSVP status badges display correct colors and icons for all status combinations
- **SC-007**: All placeholder actions (Add, Edit, Delete, Export, Bulk Actions) display appropriate toast messages

## Assumptions

- The `guests` table exists in the database with columns: id, wedding_id, name, guest_type, invitation_status, rsvp_received_date, rsvp_deadline, table_number, email, phone
- The `guest_event_attendance` table exists for filtering guests by event attendance
- The navigation shell from Phase 5 is in place, providing the layout wrapper
- The existing toast notification system (sonner) is available for placeholder action feedback
- Phase 6B will implement the actual add/edit/delete/export/bulk action functionality
