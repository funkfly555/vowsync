# Feature Specification: Repurposing Timeline Management

**Feature Branch**: `014-repurposing-timeline`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "Repurposing Timeline Management - Track item movements between events with Gantt chart visualization"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Repurposing Instructions (Priority: P1)

As a wedding consultant, I need to create repurposing instructions that link a furniture or equipment item to two events (source and destination), specifying pickup and dropoff details so that logistics coordinators know exactly what needs to move, when, and who is responsible.

**Why this priority**: This is the core data entry capability - without the ability to create instructions, no other feature can function. It establishes the foundation for all logistics coordination.

**Independent Test**: Can be fully tested by creating a repurposing instruction with all required fields and verifying the data persists correctly. Delivers immediate value by documenting a single item movement.

**Acceptance Scenarios**:

1. **Given** a wedding with multiple events and items, **When** I create a new repurposing instruction selecting an item, source event, and destination event, **Then** the system saves the instruction with all pickup and dropoff details.

2. **Given** I am creating a repurposing instruction, **When** I specify pickup time, location, and relative description (e.g., "30 min after event ends"), **Then** all pickup details are captured and displayed.

3. **Given** I am creating a repurposing instruction, **When** I specify dropoff time, location, and relative description (e.g., "1 hour before event starts"), **Then** all dropoff details are captured and displayed.

4. **Given** I am creating a repurposing instruction, **When** I assign a responsible party (person/role or vendor), **Then** the assignment is saved and visible on the instruction.

5. **Given** I am creating a repurposing instruction, **When** I add handling notes and flags (setup required, breakdown required, critical), **Then** these special instructions are captured and visually indicated.

---

### User Story 2 - Time Validation and Warnings (Priority: P1)

As a wedding consultant, I need the system to validate timing and warn me of scheduling issues so that I can prevent logistical conflicts and ensure items arrive when needed.

**Why this priority**: Validation prevents costly mistakes in the field. Without timing validation, the feature provides data entry but not the intelligence that makes it valuable.

**Independent Test**: Can be fully tested by creating instructions with various time combinations and verifying appropriate errors and warnings appear. Delivers value by catching scheduling conflicts before wedding day.

**Acceptance Scenarios**:

1. **Given** I am saving a repurposing instruction, **When** pickup time is equal to or after dropoff time, **Then** the system displays an error "Pickup must be before dropoff" and prevents save.

2. **Given** I am saving a repurposing instruction, **When** pickup time is before the source event's end time, **Then** the system displays a warning "Pickup scheduled before event ends" but allows save.

3. **Given** I am saving a repurposing instruction, **When** dropoff time is after the destination event's start time, **Then** the system displays a warning "Delivery after event starts" but allows save.

4. **Given** I am saving a repurposing instruction, **When** pickup and dropoff are on different dates, **Then** the system detects overnight storage, auto-appends "Overnight storage required" to handling notes, and prompts for storage location.

---

### User Story 3 - View and Filter Instructions List (Priority: P2)

As a wedding consultant, I need to view all repurposing instructions for a wedding and filter them by various criteria so that I can quickly find and manage specific movements.

**Why this priority**: After creating instructions, users need to view and find them. This provides the management interface for existing data.

**Independent Test**: Can be fully tested by viewing a list of instructions with various filter combinations. Delivers value by enabling efficient review of logistics plans.

**Acceptance Scenarios**:

1. **Given** a wedding has repurposing instructions, **When** I navigate to the repurposing page, **Then** I see all instructions displayed with item name, source/destination events, times, responsible party, and status.

2. **Given** I am viewing the repurposing list, **When** I filter by responsible party, **Then** only instructions assigned to that party are displayed.

3. **Given** I am viewing the repurposing list, **When** I filter by event (source or destination), **Then** only instructions involving that event are displayed.

4. **Given** I am viewing the repurposing list, **When** I filter by item, **Then** only instructions for that item are displayed.

5. **Given** items exist in the wedding, **When** I view items, **Then** I can see which items have repurposing instructions attached.

---

### User Story 4 - Gantt Chart Timeline Visualization (Priority: P2)

As a wedding consultant, I need to view a Gantt chart showing all item movements across the wedding timeline so that I can visualize logistics flow and identify conflicts or gaps.

**Why this priority**: The Gantt chart provides the visual overview that makes complex logistics manageable. It's the key differentiator from a simple list view.

**Independent Test**: Can be fully tested by viewing a Gantt chart with multiple instructions and verifying accurate timeline representation. Delivers value by enabling visual logistics planning.

**Acceptance Scenarios**:

1. **Given** a wedding has repurposing instructions, **When** I view the Gantt chart, **Then** I see a horizontal timeline with item rows showing movement periods from pickup to dropoff.

2. **Given** the Gantt chart is displayed, **When** I view an item movement bar, **Then** I see visual indicators for source event, destination event, and movement direction.

3. **Given** the Gantt chart is displayed, **When** an instruction is marked as critical, **Then** it is visually distinguished (highlighted border).

4. **Given** the Gantt chart is displayed, **When** I view instruction bars, **Then** they are color-coded by status (pending, in progress, completed, issue).

---

### User Story 5 - Update Instruction Status (Priority: P2)

As a wedding consultant or logistics coordinator, I need to update the status of repurposing instructions as work progresses so that everyone can track what has been completed and what issues have arisen.

**Why this priority**: Status tracking enables real-time coordination during wedding execution. Critical for day-of operations.

**Independent Test**: Can be fully tested by updating instruction status through the workflow and verifying status changes persist. Delivers value by enabling progress tracking.

**Acceptance Scenarios**:

1. **Given** an instruction with status "pending", **When** I start the movement, **Then** I can update status to "in_progress" and the system records the start timestamp.

2. **Given** an instruction with status "in_progress", **When** I complete the movement, **Then** I can update status to "completed" with a timestamp and the person who completed it.

3. **Given** an instruction at any status, **When** an issue occurs, **Then** I can update status to "issue" and provide an issue description.

4. **Given** I am marking an instruction complete, **When** I save the completion, **Then** the system captures the timestamp and completing person's name.

---

### User Story 6 - Edit and Delete Instructions (Priority: P3)

As a wedding consultant, I need to edit existing repurposing instructions and delete instructions that are no longer needed so that I can maintain accurate logistics plans.

**Why this priority**: Editing and deletion are necessary for maintenance but are secondary to creation and tracking.

**Independent Test**: Can be fully tested by editing instruction fields and deleting instructions. Delivers value by enabling logistics plan maintenance.

**Acceptance Scenarios**:

1. **Given** an existing repurposing instruction, **When** I open it for editing, **Then** I can modify any field and save the changes.

2. **Given** I am editing an instruction, **When** I change timing values, **Then** the system re-validates and displays any errors or warnings.

3. **Given** an existing repurposing instruction, **When** I delete it, **Then** the system removes the instruction after confirmation.

4. **Given** multiple related records may exist, **When** I delete an instruction, **Then** related data is handled appropriately (cascade or orphan handling).

---

### Edge Cases

- What happens when the source and destination events are the same? System should prevent this with a validation error.
- What happens when the selected item is deleted? Instructions referencing deleted items should display the item as unavailable and prevent further status updates.
- What happens when pickup time is exactly at event end or dropoff at event start? These are valid edge cases - no warning needed as timing is exact.
- How does the system handle very short time windows between pickup and dropoff? No minimum time window is enforced; users are responsible for realistic scheduling.
- What happens when a vendor assigned as responsible party is deleted? The instruction retains the vendor name text but the vendor link becomes null.
- How does the system handle multiple repurposing instructions for the same item on the same day? All are displayed; system does not prevent this but users should review for conflicts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create repurposing instructions linking one item to two events (source and destination).
- **FR-002**: System MUST capture pickup details: location (required), time (required), and relative time description (optional).
- **FR-003**: System MUST capture dropoff details: location (required), time (required), and relative time description (optional).
- **FR-004**: System MUST allow assignment of a responsible party as free text and optionally link to a vendor record.
- **FR-005**: System MUST capture handling notes and boolean flags for setup required, breakdown required, and critical.
- **FR-006**: System MUST display an error and prevent save when pickup time is equal to or after dropoff time.
- **FR-007**: System MUST display a warning (but allow save) when pickup time is before the source event's end time.
- **FR-008**: System MUST display a warning (but allow save) when dropoff time is after the destination event's start time.
- **FR-009**: System MUST detect when pickup and dropoff dates differ, auto-append "Overnight storage required" to handling notes, and prompt for storage location.
- **FR-010**: System MUST support instruction status values: pending, in_progress, completed, issue.
- **FR-011**: System MUST capture start timestamp when status changes to in_progress.
- **FR-012**: System MUST capture completion timestamp and completing person's name when status changes to completed.
- **FR-013**: System MUST capture issue description when status changes to issue.
- **FR-014**: System MUST display a list view of all repurposing instructions for a wedding.
- **FR-015**: System MUST support filtering instructions by responsible party, event, or item.
- **FR-016**: System MUST provide a Gantt chart visualization showing item movements across a horizontal timeline.
- **FR-017**: System MUST color-code Gantt chart bars by status using the defined color scheme.
- **FR-018**: System MUST visually distinguish critical instructions with a highlighted border.
- **FR-019**: System MUST allow editing of all instruction fields with re-validation on save.
- **FR-020**: System MUST allow deletion of instructions with confirmation.
- **FR-021**: System MUST indicate on items which have repurposing instructions attached.
- **FR-022**: System MUST prevent creating an instruction where source and destination events are the same.

### Key Entities

- **Repurposing Instruction**: Represents a planned movement of one item from one event to another. Contains pickup/dropoff logistics details, responsible party assignment, handling requirements, and execution status. Links to wedding, item, source event, destination event, and optionally a vendor.

- **Wedding Item**: Represents furniture or equipment tracked for a wedding. An item can have zero, one, or many repurposing instructions.

- **Event**: Represents a wedding event (ceremony, reception, etc.) with start and end times. Events serve as source or destination for item movements.

- **Vendor**: Represents an external service provider. Can optionally be linked as the responsible party for an instruction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a complete repurposing instruction in under 2 minutes.
- **SC-002**: 100% of invalid time configurations (pickup >= dropoff) are caught before save.
- **SC-003**: Users can identify all items requiring movement for a specific event within 30 seconds using filters.
- **SC-004**: The Gantt chart accurately displays all instructions for a wedding on a single visual timeline.
- **SC-005**: Status updates (pending → in_progress → completed) can be performed in under 10 seconds each.
- **SC-006**: 90% of users can successfully create, view, and update an instruction on first attempt without documentation.
- **SC-007**: System provides appropriate warnings for 100% of timing conflicts (pickup before event end, dropoff after event start).
- **SC-008**: Overnight storage requirements are automatically detected and flagged for 100% of multi-day movements.

## Assumptions

- The `repurposing_instructions` table already exists in the database with all required fields as specified.
- Wedding items and events are already managed through existing features.
- Vendors are already managed through existing vendor management features.
- Users access this feature through the existing wedding detail navigation structure.
- The routing convention follows existing patterns: `/weddings/:id/repurposing` for the main view.
- Modal overlays are used for create/edit operations, consistent with other features in the application.
- Time fields store time values; date context is derived from the associated events.
- The design system colors and component styles specified are already available in the application.

## Design References

### Visual Design

- **Status Colors**: Pending (#2196F3 blue), In Progress (#FF9800 orange), Completed (#4CAF50 green), Issue (#F44336 red)
- **Critical Flag**: Red border on instruction cards
- **Card Style**: 8px radius, 24px padding, shadow
- **Gantt Chart**: Horizontal timeline with item rows, movement arrows indicating direction

### User Interface

- Main view toggles between List view and Gantt chart view
- Create/Edit via modal overlay
- Filters displayed above list/chart
- Status badges with appropriate colors
- Visual movement indicators (arrows) from source to destination
