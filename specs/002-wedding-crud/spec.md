# Feature Specification: Wedding CRUD Interface

**Feature Branch**: `002-wedding-crud`
**Created**: 2026-01-13
**Status**: Draft
**Input**: User description: "Build complete wedding CRUD interface with list view, create form, edit form, and delete functionality."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Wedding List (Priority: P1)

A wedding consultant opens the application and sees all their weddings displayed in an organized grid. They can quickly scan wedding details including couple names, dates, venues, and status. They can search for specific weddings and filter by status to find what they need.

**Why this priority**: This is the entry point to the application - without being able to see weddings, no other functionality matters. Provides immediate value by giving consultants visibility into their portfolio.

**Independent Test**: Can be fully tested by loading the wedding list page and verifying all weddings display with correct information. Delivers immediate value by showing the consultant's wedding portfolio.

**Acceptance Scenarios**:

1. **Given** a consultant has weddings in the system, **When** they load the wedding list page, **Then** all their weddings display in a card grid (3 columns on desktop, 1 on mobile)
2. **Given** a consultant is viewing the wedding list, **When** they type in the search field, **Then** weddings filter in real-time by bride or groom name
3. **Given** a consultant is viewing the wedding list, **When** they select a status filter, **Then** only weddings with that status display
4. **Given** a consultant is viewing the wedding list, **When** they click sort options, **Then** weddings reorder by date ascending or descending
5. **Given** the wedding list is displayed, **When** the consultant hovers over a card, **Then** the card elevates slightly with enhanced shadow

---

### User Story 2 - Create New Wedding (Priority: P1)

A wedding consultant needs to add a new client's wedding to the system. They click "Create Wedding", fill out the required details (couple names, date, venue), and save. The new wedding appears in their list immediately.

**Why this priority**: Core functionality - consultants must be able to add new weddings to start managing them. Equal priority with viewing since you can't have a useful list without the ability to add to it.

**Independent Test**: Can be fully tested by navigating to create form, filling required fields, submitting, and verifying the wedding appears in the list. Delivers value by allowing consultants to onboard new clients.

**Acceptance Scenarios**:

1. **Given** a consultant is on the wedding list, **When** they click "Create Wedding", **Then** they navigate to a create form page
2. **Given** a consultant is filling the create form, **When** they leave required fields empty, **Then** validation errors display for each required field
3. **Given** a consultant enters a past date, **When** they try to submit, **Then** a validation error indicates the wedding date must be in the future
4. **Given** a consultant enters valid data, **When** they submit the form, **Then** the wedding is created, a success message appears, and they return to the list
5. **Given** a consultant is on the create form, **When** they click "Cancel", **Then** they return to the wedding list without creating anything

---

### User Story 3 - Edit Existing Wedding (Priority: P2)

A wedding consultant needs to update details for an existing wedding - perhaps the venue changed or the date shifted. They click on a wedding card, edit the necessary fields, and save their changes.

**Why this priority**: Second tier - requires weddings to exist first (User Story 2). Essential for ongoing wedding management as details frequently change during planning.

**Independent Test**: Can be fully tested by clicking a wedding card, modifying fields, saving, and verifying changes persist. Delivers value by allowing consultants to keep wedding details current.

**Acceptance Scenarios**:

1. **Given** a consultant is viewing the wedding list, **When** they click on a wedding card, **Then** they navigate to the edit form with all fields pre-populated
2. **Given** a consultant modifies wedding details, **When** they submit the form, **Then** changes are saved, a success message appears, and they return to the list
3. **Given** a consultant is editing a wedding, **When** they click "Cancel", **Then** they return to the list without saving changes
4. **Given** a consultant changes the wedding status, **When** they save, **Then** the status badge on the list reflects the new status

---

### User Story 4 - Delete Wedding (Priority: P3)

A wedding consultant needs to remove a wedding from the system - perhaps it was cancelled or entered in error. They click delete, confirm their intent in a modal, and the wedding is removed along with all related data.

**Why this priority**: Third tier - destructive action that's less common than viewing/creating/editing. Must have confirmation to prevent accidental data loss.

**Independent Test**: Can be fully tested by clicking delete on a wedding, confirming in the modal, and verifying the wedding no longer appears. Delivers value by allowing consultants to remove invalid or cancelled weddings.

**Acceptance Scenarios**:

1. **Given** a consultant is viewing a wedding card, **When** they click the delete button, **Then** a confirmation modal appears with wedding details
2. **Given** the delete confirmation modal is open, **When** the consultant clicks "Cancel", **Then** the modal closes and the wedding remains
3. **Given** the delete confirmation modal is open, **When** the consultant clicks "Delete", **Then** the wedding and all related data are removed, a success message appears, and they return to the list
4. **Given** a wedding is deleted, **When** the list refreshes, **Then** the deleted wedding no longer appears

---

### Edge Cases

- What happens when there are no weddings? Display an empty state with a prompt to create the first wedding.
- What happens when search returns no results? Display a "no results found" message with option to clear filters.
- What happens when the network fails during save? Display an error toast and allow retry without losing form data.
- What happens when another user deletes a wedding being edited? Display error message and redirect to list.
- What happens with very long couple names or venue names? Text truncates with ellipsis; full text shows on hover.
- What happens with exactly 10 events (maximum)? Form accepts the value; 11+ shows validation error.

## Requirements *(mandatory)*

### Functional Requirements

**List View**
- **FR-001**: System MUST display all weddings in a responsive card grid (3 columns desktop, 2 columns tablet, 1 column mobile)
- **FR-002**: Each wedding card MUST show: bride name, groom name, wedding date, venue name, status badge, and guest count
- **FR-003**: System MUST provide real-time search filtering by bride or groom name
- **FR-004**: System MUST provide status filtering with options: All, Planning, Confirmed, Completed, Cancelled
- **FR-005**: System MUST provide sorting by wedding date (ascending and descending)
- **FR-006**: System MUST display a "Create Wedding" button prominently
- **FR-007**: Wedding cards MUST be clickable and navigate to the edit form
- **FR-008**: Each wedding card MUST have a delete button

**Create Form**
- **FR-009**: System MUST provide a dedicated create page at a consistent URL pattern
- **FR-010**: Create form MUST include fields: bride name*, groom name*, wedding date*, venue name*, venue address, venue contact name, venue contact phone, venue contact email, number of events* (1-10), status*, notes
- **FR-011**: System MUST validate that all required fields (marked *) are completed before submission
- **FR-012**: System MUST validate that wedding date is a future date
- **FR-013**: System MUST validate that number of events is between 1 and 10 inclusive
- **FR-014**: System MUST display a success notification after wedding creation
- **FR-015**: System MUST return user to wedding list after successful creation
- **FR-016**: System MUST provide a Cancel button that returns to list without saving

**Edit Form**
- **FR-017**: System MUST provide a dedicated edit page at a consistent URL pattern with wedding identifier
- **FR-018**: Edit form MUST pre-populate all fields with existing wedding data
- **FR-019**: Edit form MUST apply same validation rules as create form
- **FR-020**: System MUST display a success notification after wedding update
- **FR-021**: System MUST return user to wedding list after successful update
- **FR-022**: Edit form MUST include a Delete button styled as a danger action

**Delete Functionality**
- **FR-023**: Delete action MUST display a confirmation modal before proceeding
- **FR-024**: Confirmation modal MUST show the couple's names and warning about data loss
- **FR-025**: Confirmation modal MUST have Cancel (secondary) and Delete (danger) buttons
- **FR-026**: Deleting a wedding MUST remove all associated data (events, guests, etc.)
- **FR-027**: System MUST display a success notification after wedding deletion

**Design & Accessibility**
- **FR-028**: Status badges MUST use distinct colors: Planning (blue), Confirmed (green), Completed (gray), Cancelled (red)
- **FR-029**: All form inputs MUST be accessible via keyboard navigation
- **FR-030**: All interactive elements MUST have visible focus indicators
- **FR-031**: All form fields MUST have associated labels
- **FR-032**: Error messages MUST be announced to screen readers
- **FR-033**: System MUST be fully functional on screens 320px and wider

**Error Handling**
- **FR-034**: System MUST display user-friendly error messages for all failure scenarios
- **FR-035**: System MUST preserve form data when submission fails
- **FR-036**: System MUST show loading states during data operations

### Key Entities

- **Wedding**: Core entity representing a wedding event. Contains couple information (bride/groom names), date, venue details (name, address, contact), configuration (number of events, status), and consultant notes. Status can be: planning, confirmed, completed, or cancelled.

- **Consultant**: The user managing weddings. Each wedding belongs to exactly one consultant. (Note: Authentication deferred to Phase 14 - using temporary hardcoded identifier)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Wedding list displays all weddings within 2 seconds of page load
- **SC-002**: Search filters weddings in real-time (under 300ms response)
- **SC-003**: Status filter correctly shows only matching weddings
- **SC-004**: Create form prevents submission when required fields are empty
- **SC-005**: Create form prevents submission with past wedding dates
- **SC-006**: Newly created weddings appear in list immediately without page refresh
- **SC-007**: Edit form loads with all existing data within 2 seconds
- **SC-008**: Updated wedding data persists correctly after save
- **SC-009**: Delete confirmation prevents single-click accidental deletion
- **SC-010**: Deleted wedding and all child data are removed from system
- **SC-011**: All forms display appropriate validation error messages
- **SC-012**: Interface is fully usable on 320px mobile screens
- **SC-013**: Success/error toast notifications appear for all user actions
- **SC-014**: All navigation between list, create, and edit pages works correctly

## Assumptions

- A temporary hardcoded user identifier will be used until authentication is implemented in Phase 14
- The weddings database table already exists with appropriate schema (from Phase 1)
- Guest count will show 0 for now since guest management is in a later phase
- Events are not managed in this feature - only the number of planned events is captured
- The system operates in a single timezone (no timezone conversion needed)
- File attachments are not part of wedding CRUD (separate feature)

## Out of Scope

- User authentication and authorization (Phase 14)
- Event management within weddings (Phase 3)
- Guest management (Phase 6)
- Vendor assignments to weddings
- Budget tracking
- File attachments
- Multi-user collaboration on same wedding
- Wedding templates or duplication
- Bulk operations (delete multiple, status change multiple)
- Export/import functionality
- Audit trail / change history
