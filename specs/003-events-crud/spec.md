# Feature Specification: Events Management CRUD

**Feature Branch**: `003-events-crud`
**Created**: 2026-01-13
**Status**: Draft
**Input**: User description: "Events management CRUD with timeline view, auto-calculated durations. Events belong to weddings (1-10 events per wedding)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Events Timeline (Priority: P1)

As a wedding consultant, I want to see all events for a wedding displayed in chronological order on a timeline so that I can visualize the wedding day schedule at a glance.

**Why this priority**: The timeline view is the foundation of event management - consultants must see existing events before they can create, edit, or delete them. This provides immediate value by visualizing the wedding schedule.

**Independent Test**: Navigate to a wedding's events page and verify all events display in order with correct information. Delivers value by showing the complete event schedule.

**Acceptance Scenarios**:

1. **Given** a wedding with 3 events exists, **When** I navigate to `/weddings/:weddingId/events`, **Then** I see all 3 events displayed in chronological order with connecting timeline lines
2. **Given** a wedding with no events exists, **When** I navigate to the events page, **Then** I see an empty state message "No events yet. Create your first event!" with an option to add an event
3. **Given** a wedding with events exists, **When** I view the timeline, **Then** each event card shows order number, name, date, time, location, auto-calculated duration, and guest count
4. **Given** events with different order numbers exist, **When** I view the timeline, **Then** each event card has a colored left border matching its order (Event 1: pink, Event 2: cream, etc.)

---

### User Story 2 - Create New Event (Priority: P1)

As a wedding consultant, I want to create a new event for a wedding so that I can build out the wedding day schedule with all activities.

**Why this priority**: Creating events is core functionality - without it, the timeline would always be empty. This enables consultants to start planning the wedding schedule.

**Independent Test**: Fill out the create event form with valid data, submit, and verify the event appears in the timeline. Delivers value by adding activities to the wedding schedule.

**Acceptance Scenarios**:

1. **Given** I am on the create event page for a wedding, **When** I fill all required fields (order, name, type, date, start time, end time, location) and submit, **Then** the event is created and I am redirected to the timeline with a success message
2. **Given** I am creating an event, **When** I enter start time 14:00 and end time 17:30, **Then** the duration field automatically displays "3.5 hours" (read-only)
3. **Given** the wedding already has events with orders 1 and 2, **When** I open the create form, **Then** the order field auto-suggests 3 as the next available number
4. **Given** I am creating an event, **When** I try to select order number 2 which already exists for this wedding, **Then** I see a validation error "Event order 2 is already used"
5. **Given** I am creating an event, **When** I set end time before start time, **Then** I see a validation error "End time must be after start time"
6. **Given** the wedding date is June 15, 2026, **When** I create an event with date June 30, 2026 (15 days apart), **Then** I see a warning "Event date is more than 7 days from wedding date"

---

### User Story 3 - Edit Existing Event (Priority: P2)

As a wedding consultant, I want to edit an existing event's details so that I can update the schedule as plans change.

**Why this priority**: Events rarely remain unchanged - times shift, venues change. Edit capability is essential but depends on events existing first.

**Independent Test**: Click an event card, modify fields, save, and verify changes persist in the timeline. Delivers value by allowing schedule adjustments.

**Acceptance Scenarios**:

1. **Given** an event exists on the timeline, **When** I click on its card, **Then** I am navigated to the edit page with all fields pre-populated
2. **Given** I am editing an event, **When** I change the start time from 14:00 to 15:00, **Then** the duration field updates in real-time to reflect the new calculation
3. **Given** I am editing an event, **When** I modify the name and submit, **Then** I see a success message and am redirected to the timeline with the updated name visible
4. **Given** an event has guests assigned to it, **When** I try to change the event order, **Then** I see a warning "Changing event order may affect guest assignments"
5. **Given** I am on the edit page, **When** I click Cancel, **Then** I am returned to the timeline without any changes saved

---

### User Story 4 - Delete Event (Priority: P3)

As a wedding consultant, I want to delete an event from a wedding so that I can remove activities that are no longer part of the plan.

**Why this priority**: Delete is a destructive action needed less frequently than viewing or editing. Important for cleanup but lower priority than creation and modification.

**Independent Test**: Click delete on an event, confirm in the dialog, and verify the event is removed from the timeline. Delivers value by cleaning up outdated events.

**Acceptance Scenarios**:

1. **Given** an event exists on the timeline, **When** I click the delete button on its card, **Then** a confirmation dialog appears with title "Delete Event?" and the event name
2. **Given** the delete confirmation dialog is open, **When** I click "Delete", **Then** the event is removed, guest attendance records for that event are deleted, and I see a success message
3. **Given** the delete confirmation dialog is open, **When** I click "Cancel", **Then** the dialog closes and the event remains unchanged
4. **Given** I am on the edit page for an event, **When** I click the Delete button (red, bottom left), **Then** the same confirmation dialog appears

---

### Edge Cases

- What happens when a consultant tries to create an 11th event? System prevents creation with error "Maximum of 10 events per wedding"
- How does the system handle events spanning midnight? Duration calculation works correctly across day boundaries
- What happens if the wedding is deleted? All events are automatically deleted via cascade
- How are concurrent edits handled? Last save wins with optimistic updates; stale data shows refresh prompt
- What happens with very long event names? Text truncates with ellipsis, full name shown on hover

## Requirements *(mandatory)*

### Functional Requirements

**Timeline Display**
- **FR-001**: System MUST display all events for a wedding in chronological order by event_order then event_date
- **FR-002**: System MUST show visual timeline with connecting lines between event cards
- **FR-003**: Each event card MUST display: order number, event name, date, time range, location, calculated duration, and guest count
- **FR-004**: Event cards MUST have a 4px left border colored by event order (1: #E8B4B8, 2: #F5E6D3, 3: #C9D4C5, 4: #E5D4EF, 5: #FFE5CC, 6: #D4E5F7, 7: #F7D4E5, 8-10: cycle back)
- **FR-005**: System MUST show empty state "No events yet. Create your first event!" when no events exist
- **FR-006**: Timeline page MUST include header "[Wedding Name] - Events" with back button to wedding list
- **FR-007**: System MUST provide "Add Event" button in top right of timeline page

**Event Creation**
- **FR-008**: Create event form MUST be accessible at `/weddings/:weddingId/events/new`
- **FR-009**: System MUST require: event_order (1-10), event_name, event_type, event_date, start_time, end_time, event_location
- **FR-010**: System MUST provide optional: notes field (textarea)
- **FR-011**: Event type dropdown MUST include: ceremony, reception, rehearsal_dinner, welcome_party, brunch, other
- **FR-012**: System MUST auto-suggest the next available event_order number
- **FR-013**: System MUST validate event_order is unique within the wedding
- **FR-014**: System MUST validate end_time is after start_time
- **FR-015**: System MUST display warning if event_date differs from wedding_date by more than 7 days
- **FR-016**: System MUST auto-calculate and display duration_hours from start/end times (read-only)
- **FR-017**: System MUST show success toast and redirect to timeline after successful creation

**Event Editing**
- **FR-018**: Edit event form MUST be accessible at `/weddings/:weddingId/events/:eventId/edit`
- **FR-019**: Edit form MUST pre-populate all fields with existing event data
- **FR-020**: Duration MUST update in real-time when start/end times change
- **FR-021**: System MUST warn user when changing event_order if guests are assigned
- **FR-022**: System MUST show success toast and redirect to timeline after successful update
- **FR-023**: Clicking an event card on timeline MUST navigate to edit page

**Event Deletion**
- **FR-024**: Delete button MUST appear on each event card in timeline
- **FR-025**: Delete button (red) MUST appear on edit page (bottom left)
- **FR-026**: System MUST show confirmation dialog before deletion
- **FR-027**: Confirmation dialog MUST display event name and warn about cascade deletion of attendance records
- **FR-028**: Confirmation dialog MUST have "Cancel" (secondary) and "Delete" (danger red) buttons
- **FR-029**: System MUST show success toast after successful deletion
- **FR-030**: System MUST cascade delete all guest_event_attendance records for the event

**Navigation & UX**
- **FR-031**: Back button on timeline page MUST return to wedding list
- **FR-032**: Cancel button on forms MUST return to timeline without saving
- **FR-033**: All forms MUST be mobile responsive (vertical card layout on small screens)
- **FR-034**: All interactive elements MUST be keyboard accessible

### Key Entities

- **Event**: A scheduled activity within a wedding (ceremony, reception, etc.). Has order number (1-10), name, type, date/time, location, notes. Duration is auto-calculated from start/end times. Belongs to exactly one wedding.
- **Wedding**: Parent entity containing events. Each wedding can have 1-10 events. Deleting a wedding cascades to delete all its events.
- **Guest Event Attendance**: Junction table tracking which guests attend which events. Deleted when parent event is deleted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Timeline displays all events for a wedding in chronological order within 1 second of page load
- **SC-002**: Event cards display correct color coding by order number (visually verified)
- **SC-003**: Duration auto-calculates correctly from start/end times (verified by entering 14:00-17:30 = 3.5 hours)
- **SC-004**: Duration updates in real-time (within 100ms) when times change in the form
- **SC-005**: System prevents duplicate event order numbers within the same wedding
- **SC-006**: System prevents end_time from being set before start_time
- **SC-007**: Warning appears when event_date is more than 7 days from wedding_date
- **SC-008**: New event appears in timeline immediately after creation
- **SC-009**: Event updates are reflected in timeline immediately after save
- **SC-010**: Deleting an event removes it from timeline and cascades to attendance records
- **SC-011**: Empty state displays correctly when wedding has no events
- **SC-012**: Back button successfully returns user to wedding list
- **SC-013**: Timeline is usable on mobile screens (320px minimum width)
- **SC-014**: Toast notifications appear for all create, update, and delete actions

## Assumptions

- The `events` table already exists in the database (created in Phase 1)
- The `duration_hours` column is a generated column that auto-calculates from start/end times
- Events cannot exist without a parent wedding (foreign key constraint)
- Guest attendance management will be handled in a future phase (Phase 6)
- Event colors cycle back to first color after event 7 (for weddings with 8-10 events)
- Consultants can only view/edit events for weddings they own (RLS enforced)
