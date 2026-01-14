# Feature Specification: Guest CRUD & Event Attendance

**Feature Branch**: `007-guest-crud-attendance`
**Created**: 2026-01-14
**Status**: Draft
**Input**: Phase 6B - Complete guest management with CRUD operations, filtering, bulk actions, export, and event attendance matrix

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add New Guest (Priority: P1)

As a wedding planner, I need to add new guests to my wedding so I can track attendees and manage RSVPs.

**Why this priority**: Adding guests is the foundational action - without it, all other guest management features are useless. This is the primary entry point for guest data.

**Independent Test**: Can be fully tested by opening the Add Guest modal, filling in guest details across all tabs, and saving. Delivers immediate value by populating the guest list.

**Acceptance Scenarios**:

1. **Given** I am on the guest list page, **When** I click "+ Add Guest", **Then** a modal opens with 5 tabs (Basic Info, RSVP, Dietary, Meal, Events)
2. **Given** the Add Guest modal is open on Basic Info tab, **When** I enter name "John Smith" and select type "Adult", **Then** the required fields are satisfied and I can save
3. **Given** I have filled in guest details, **When** I click "Save Guest", **Then** the guest is created, modal closes, list refreshes, and success toast appears
4. **Given** I try to save without a name, **When** I click "Save Guest", **Then** validation prevents save and shows error on the name field
5. **Given** I am on the Events tab, **When** I check "Attending" for an event, **Then** shuttle input fields appear for that event

---

### User Story 2 - Edit Existing Guest (Priority: P1)

As a wedding planner, I need to edit guest information so I can update details as RSVPs come in and preferences change.

**Why this priority**: Guest information changes frequently (RSVPs, dietary updates, meal selections). This is essential for maintaining accurate records.

**Independent Test**: Can be fully tested by clicking Edit on any guest row, modifying fields, and saving changes.

**Acceptance Scenarios**:

1. **Given** I see a guest in the table, **When** I click the Edit icon, **Then** the Edit Guest modal opens with all fields pre-populated
2. **Given** I am editing a guest, **When** I change the RSVP received date and save, **Then** the guest record updates and the RSVP badge changes accordingly
3. **Given** I am editing guest event attendance, **When** I check/uncheck events, **Then** the attendance records update correctly on save

---

### User Story 3 - Delete Guest (Priority: P1)

As a wedding planner, I need to remove guests who are no longer attending so my guest list stays accurate.

**Why this priority**: Essential for list maintenance. Without delete, users cannot correct mistakes or remove cancelled guests.

**Independent Test**: Can be fully tested by clicking Delete, confirming, and verifying the guest is removed.

**Acceptance Scenarios**:

1. **Given** I see a guest in the table, **When** I click the Delete icon, **Then** a confirmation dialog appears with the guest's name
2. **Given** the delete confirmation is showing, **When** I click "Delete", **Then** the guest is removed, list refreshes, and success toast appears
3. **Given** the delete confirmation is showing, **When** I click "Cancel", **Then** the dialog closes and no changes are made

---

### User Story 4 - Search and Filter Guests (Priority: P2)

As a wedding planner, I need to search and filter guests so I can quickly find specific people or groups.

**Why this priority**: With large guest lists (100+ guests), finding specific guests without search/filter is tedious. Critical for efficient management.

**Independent Test**: Can be fully tested by typing in search, selecting filters, and verifying results match criteria.

**Acceptance Scenarios**:

1. **Given** I have 100 guests, **When** I type "Smith" in search, **Then** only guests with "Smith" in their name appear
2. **Given** I select "Adult" in the Type filter, **When** the list updates, **Then** only Adult type guests are shown
3. **Given** I select "Overdue" in RSVP filter, **When** the list updates, **Then** only guests past their RSVP deadline with no response appear
4. **Given** I select an event in the Event filter, **When** the list updates, **Then** only guests attending that specific event appear
5. **Given** I apply multiple filters, **When** the list updates, **Then** all filters work together with AND logic

---

### User Story 5 - Bulk Table Assignment (Priority: P2)

As a wedding planner, I need to assign multiple guests to tables at once so I can efficiently organize seating.

**Why this priority**: Assigning 100+ guests one-by-one is impractical. Bulk actions dramatically improve efficiency for seating management.

**Independent Test**: Can be fully tested by selecting multiple guests, choosing a table from dropdown, and verifying all selected guests are assigned.

**Acceptance Scenarios**:

1. **Given** I have checked 5 guests, **When** I select "Table 3" from the Assign Table dropdown, **Then** all 5 guests are assigned to Table 3
2. **Given** I have guests assigned to tables, **When** I select them and choose "Clear Table", **Then** their table assignments are removed
3. **Given** I have selected guests, **When** the bulk action completes, **Then** the selection is cleared and a success toast shows the count

---

### User Story 6 - Export Guest List (Priority: P2)

As a wedding planner, I need to export my guest list so I can share it with vendors, print for reference, or backup my data.

**Why this priority**: Export enables data portability and offline access. Essential for sharing with caterers, venue coordinators, etc.

**Independent Test**: Can be fully tested by clicking Export > CSV and verifying a file downloads with correct data.

**Acceptance Scenarios**:

1. **Given** I have guests in my list, **When** I click Export > CSV, **Then** a CSV file downloads containing all guest data
2. **Given** the CSV exports, **When** I open it, **Then** it contains columns: Name, Email, Phone, Type, RSVP Status, Table, Dietary, Allergies
3. **Given** I have applied filters, **When** I export, **Then** only the filtered/visible guests are exported

---

### User Story 7 - Event Attendance Matrix (Priority: P3)

As a wedding planner, I need a matrix view to manage which guests attend which events so I can track attendance across multiple wedding events efficiently.

**Why this priority**: With multiple events (ceremony, reception, rehearsal dinner, etc.), managing attendance per-guest is tedious. Matrix view provides bird's-eye efficiency.

**Independent Test**: Can be fully tested by opening the matrix, checking/unchecking attendance boxes, entering shuttle info, and saving.

**Acceptance Scenarios**:

1. **Given** I click "Attendance Matrix", **When** the modal opens, **Then** I see all guests as rows and all events as columns
2. **Given** I check attendance for a guest-event combination, **When** I save, **Then** the attendance record is created/updated
3. **Given** I check attendance, **When** shuttle fields appear, **Then** I can enter shuttle to/from information
4. **Given** I look at the footer, **When** I view totals, **Then** I see the count of attending guests per event
5. **Given** I am on mobile, **When** I open the matrix, **Then** I see one event at a time with a selector to switch events

---

### User Story 8 - RSVP Status Display (Priority: P2)

As a wedding planner, I need to see RSVP status at a glance so I can quickly identify who needs follow-up.

**Why this priority**: Visual status indicators prevent missed RSVPs and enable proactive follow-up before deadlines.

**Independent Test**: Can be fully tested by viewing the guest table and verifying badge colors match RSVP status logic.

**Acceptance Scenarios**:

1. **Given** a guest has an RSVP received date, **When** I view the table, **Then** they show a green "Yes" badge
2. **Given** a guest is past their deadline without response, **When** I view the table, **Then** they show a red "Overdue" badge
3. **Given** a guest has a future deadline without response, **When** I view the table, **Then** they show a yellow "Pending" badge

---

### Edge Cases

- What happens when saving a guest with duplicate name? → Allow duplicates (common for families)
- What happens when deleting a guest with event attendance records? → Cascade delete removes attendance records
- What happens when filtering shows zero results? → Display "No guests found matching filters"
- What happens when exporting an empty list? → Generate CSV with headers only
- What happens when RSVP deadline is null? → Display as "Pending" (no overdue possible)
- What happens when saving Events tab with no events in the wedding? → Show message "No events created yet"

## Requirements *(mandatory)*

### Functional Requirements

**Guest CRUD**
- **FR-001**: System MUST allow creating guests with required fields: name and type
- **FR-002**: System MUST validate email format when email is provided
- **FR-003**: System MUST allow editing all guest fields after creation
- **FR-004**: System MUST require confirmation before deleting a guest
- **FR-005**: System MUST cascade delete guest attendance records when guest is deleted

**Add/Edit Modal**
- **FR-006**: Modal MUST have 5 tabs: Basic Info, RSVP, Dietary, Meal, Events
- **FR-007**: Basic Info tab MUST include: Name*, Email, Phone, Type*, Invitation Status, Attendance Confirmed
- **FR-008**: RSVP tab MUST include: Deadline, Received Date, Method (conditional), Plus One section
- **FR-009**: RSVP Method field MUST only appear when RSVP Received Date has a value
- **FR-010**: Plus One Name and Confirmed fields MUST only appear when Has Plus One is checked
- **FR-011**: Dietary tab MUST include: Restrictions, Allergies, Notes
- **FR-012**: Meal tab MUST include: Starter, Main, Dessert dropdowns (options 1-5)
- **FR-013**: Events tab MUST list all wedding events with attendance checkbox and shuttle fields

**Search and Filters**
- **FR-014**: System MUST filter guests by name search (case-insensitive partial match)
- **FR-015**: System MUST filter by guest type (Adult, Child, Vendor, Staff)
- **FR-016**: System MUST filter by calculated RSVP status (Pending, Confirmed, Overdue)
- **FR-017**: System MUST filter by event attendance
- **FR-018**: All filters MUST work together with AND logic
- **FR-019**: "Showing X of Y" count MUST update when filters are applied

**RSVP Status Calculation**
- **FR-020**: RSVP status MUST be calculated as: Confirmed (if received date exists), Overdue (if past deadline without response), Pending (otherwise)
- **FR-021**: Status badges MUST display with appropriate colors: green=Confirmed, red=Overdue, yellow=Pending

**Table Display**
- **FR-022**: Guest table MUST show columns: Checkbox, Name, Type, RSVP Status, Table, Actions
- **FR-023**: Actions column MUST include Edit and Delete icons
- **FR-024**: Table MUST support bulk selection via header checkbox and row checkboxes

**Bulk Actions**
- **FR-025**: Bulk actions bar MUST appear when 1+ guests are selected
- **FR-026**: System MUST support bulk table assignment (Tables 1-20, Clear Table)
- **FR-027**: Send Email bulk action MUST show placeholder toast "Email feature coming in Phase 13"
- **FR-028**: Selection MUST clear after successful bulk action

**Export**
- **FR-029**: System MUST support CSV export with columns: Name, Email, Phone, Type, RSVP Status, Table, Dietary, Allergies
- **FR-030**: Export MUST download file with timestamp in filename
- **FR-031**: Excel export MAY be implemented or show toast for future phase

**Pagination**
- **FR-032**: Guest list MUST paginate at 50 items per page
- **FR-033**: Pagination MUST show page numbers with previous/next navigation

**Event Attendance Matrix**
- **FR-034**: System MUST provide a matrix view accessible from header
- **FR-035**: Matrix MUST display guests as rows and events as columns
- **FR-036**: Matrix MUST support checking/unchecking attendance per guest-event
- **FR-037**: Matrix MUST show shuttle to/from fields when attendance is checked
- **FR-038**: Matrix MUST save all changes in a single batch operation
- **FR-039**: Matrix MUST show event totals (attending count) in footer
- **FR-040**: Matrix MUST support guest name search/filter

**Mobile Responsive**
- **FR-041**: Guest list MUST switch to card layout on mobile (<768px)
- **FR-042**: Modals MUST be full-screen or near-full-screen on mobile
- **FR-043**: Event matrix MUST show single event with selector on mobile

### Key Entities

- **Guest**: Person attending the wedding (name, type, contact info, RSVP details, dietary needs, meal choices, table assignment)
- **Guest Event Attendance**: Junction record linking guest to event with attendance status and shuttle preferences
- **Event**: Wedding event that guests can attend (from existing events table)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a new guest with all details in under 2 minutes
- **SC-002**: Users can find any specific guest in a list of 200+ using search in under 5 seconds
- **SC-003**: Users can assign 20 guests to a table using bulk action in under 30 seconds
- **SC-004**: Users can update event attendance for all guests using matrix in under 5 minutes
- **SC-005**: 100% of guests display correct RSVP status badges based on deadline logic
- **SC-006**: CSV export contains complete and accurate guest data for all visible guests
- **SC-007**: All CRUD operations provide visual feedback via toast notifications
- **SC-008**: Mobile users can perform all operations without horizontal scrolling (except matrix)

## Assumptions

- Guest table schema from database already exists (created in Phase 1)
- Phase 6A guest list UI exists and provides foundation for enhancements
- Events for the wedding have been created via Phase 3 Events CRUD
- No authentication/authorization changes needed (wedding-level access assumed)
- Maximum of 20 tables is sufficient for table assignment dropdown
- Meal options will be displayed as "Option 1" through "Option 5" (customizable names deferred)

## Out of Scope

- Table drag-and-drop assignment (seating chart visualization)
- Guest groups/families linking
- Photo uploads for guests
- QR code generation
- Guest portal (self-service RSVP)
- Seating chart visualization
- Advanced email templates
- SMS notifications
- Auto-reminder functionality (notifications deferred to Phase 13)
