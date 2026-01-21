# Feature Specification: Guest Page Ad-Hoc Fixes

**Feature Branch**: `025-guest-page-fixes`
**Created**: 2026-01-21
**Status**: Draft
**Input**: User description: "Guest Page Ad-Hoc Fixes - Auto-save, field reorganization, deletion support, meal options integration, and wedding party details"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auto-Save Guest Edits (Priority: P1)

As a wedding consultant, I want changes I make to guest information to save automatically so I don't lose data or have to manually click save buttons.

**Why this priority**: Core usability improvement that eliminates data loss risk and reduces friction for every single guest edit operation.

**Independent Test**: Can be fully tested by editing any guest field and navigating away - changes persist without explicit save action.

**Acceptance Scenarios**:

1. **Given** a guest card is expanded for editing, **When** I change a text field and move focus away (blur), **Then** the change is saved automatically and a subtle saving indicator appears
2. **Given** a guest card is expanded for editing, **When** I change a dropdown selection, **Then** the change is saved immediately upon selection
3. **Given** I am editing a guest, **When** auto-save triggers, **Then** a brief visual indicator (e.g., "Saving..." then "Saved") confirms the operation
4. **Given** auto-save fails due to network error, **When** the save operation completes, **Then** an error notification appears and the field reverts to previous value

---

### User Story 2 - Wedding Party Details (Priority: P1)

As a wedding consultant, I need to capture which side of the wedding party each guest belongs to (Bride/Groom) and their role, so I can organize seating, photos, and ceremonial duties.

**Why this priority**: Critical for wedding planning logistics - affects seating charts, processional order, and photo lists.

**Independent Test**: Can be tested by selecting Bride/Groom side and verifying role dropdown updates with appropriate options.

**Acceptance Scenarios**:

1. **Given** the Basic Info tab of a guest, **When** I view the form, **Then** I see a "Bride/Groom Side" radio button group
2. **Given** I select "Bride" side, **When** the role dropdown appears, **Then** it shows: Maid of Honor, Bridesmaids, Parent, Close Relative, Relative, Other
3. **Given** I select "Groom" side, **When** the role dropdown appears, **Then** it shows: Best Man, Groomsmen, Parent, Close Relative, Relative, Other
4. **Given** no side is selected, **When** I view the Basic Info tab, **Then** the role dropdown is hidden or disabled
5. **Given** I change from one side to another, **When** the new side is selected, **Then** the role dropdown resets and shows appropriate options for the new side

---

### User Story 3 - Gender Field with Icon Display (Priority: P2)

As a wedding consultant, I need to capture guest gender so I can properly plan seating arrangements and formal invitations.

**Why this priority**: Supports proper addressing on invitations and balanced seating arrangements.

**Independent Test**: Can be tested by setting gender on a guest and verifying the icon appears on the card.

**Acceptance Scenarios**:

1. **Given** the Basic Info tab, **When** I view the form, **Then** I see a Gender dropdown with Male and Female options
2. **Given** I set a guest's gender to Male, **When** I view the guest card in the list, **Then** a male icon appears between the TYPE and RSVP columns
3. **Given** I set a guest's gender to Female, **When** I view the guest card in the list, **Then** a female icon appears between the TYPE and RSVP columns
4. **Given** a guest has no gender set, **When** I view the guest card, **Then** no gender icon is displayed

---

### User Story 4 - Field Organization in RSVP Tab (Priority: P2)

As a wedding consultant, I need RSVP-related fields grouped logically so I can quickly manage invitation responses.

**Why this priority**: Improves data entry efficiency by organizing related fields together.

**Independent Test**: Can be tested by navigating to RSVP tab and verifying both fields are present.

**Acceptance Scenarios**:

1. **Given** I open a guest's expanded view, **When** I navigate to the RSVP tab, **Then** I see "Invitation Status" field
2. **Given** I open a guest's expanded view, **When** I navigate to the RSVP tab, **Then** I see "Plus One Attendance Confirmed" field
3. **Given** I open a guest's expanded view, **When** I navigate to the Basic Info tab, **Then** I do NOT see "Invitation Status" or "Plus One Attendance Confirmed" fields

---

### User Story 5 - Guest Deletion (Priority: P2)

As a wedding consultant, I need to delete guests individually or in bulk so I can maintain an accurate guest list.

**Why this priority**: Essential list management capability for removing duplicate or cancelled guests.

**Independent Test**: Can be tested by selecting guests and deleting them, verifying they are removed from the list.

**Acceptance Scenarios**:

1. **Given** a single guest card, **When** I click the delete action, **Then** a confirmation dialog appears
2. **Given** the delete confirmation dialog is shown, **When** I confirm deletion, **Then** the guest is removed from the list
3. **Given** multiple guests are selected via bulk selection, **When** I click bulk delete, **Then** a confirmation dialog shows the count of guests to be deleted
4. **Given** bulk delete confirmation, **When** I confirm, **Then** all selected guests are removed from the list
5. **Given** I cancel the delete confirmation, **When** the dialog closes, **Then** no guests are deleted

---

### User Story 6 - Meal Options from Database (Priority: P3)

As a wedding consultant, I need the Meals tab dropdowns to pull options from the meal_options table so guests can select from the actual menu items configured for the wedding.

**Why this priority**: Ensures meal selections match actual catering options, preventing invalid selections.

**Independent Test**: Can be tested by adding meal options to the database and verifying they appear in guest Meals tab dropdowns.

**Acceptance Scenarios**:

1. **Given** meal options exist in the meal_options table, **When** I open a guest's Meals tab, **Then** the course dropdowns are populated with options from the database
2. **Given** meal options are organized by course type (starter, main, dessert), **When** I view a specific course dropdown, **Then** only options for that course type appear
3. **Given** no meal options exist for a course, **When** I view that course dropdown, **Then** the dropdown is empty or shows a placeholder message

---

### Edge Cases

- What happens when auto-save is triggered multiple times rapidly? System must debounce with 500ms delay.
- How does system handle deleting a guest who is assigned to events or has meal selections? Cascading delete removes related records.
- What happens when wedding party side is changed after a role was selected? Role resets to null.
- How does the system handle concurrent edits to the same guest from different devices? Last-write-wins with optimistic locking pattern.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST auto-save guest field changes on blur events for text inputs
- **FR-002**: System MUST auto-save guest field changes immediately on selection for dropdowns and radio buttons
- **FR-003**: System MUST display a visual saving indicator during auto-save operations
- **FR-004**: System MUST display an error notification when auto-save fails
- **FR-005**: System MUST debounce rapid auto-save triggers with a 500ms delay
- **FR-006**: System MUST provide a delete action on individual guest cards
- **FR-007**: System MUST provide bulk delete functionality when multiple guests are selected
- **FR-008**: System MUST show a confirmation dialog before any delete operation
- **FR-009**: System MUST move "Invitation Status" field from Basic Info to RSVP tab
- **FR-010**: System MUST move "Plus One Attendance Confirmed" field from Basic Info to RSVP tab
- **FR-011**: System MUST fetch meal options from the meal_options database table
- **FR-012**: System MUST filter meal options by course type in respective dropdowns
- **FR-013**: System MUST capture guest gender with Male/Female options in Basic Info tab
- **FR-014**: System MUST display gender icon on guest cards between TYPE and RSVP columns
- **FR-015**: System MUST capture wedding party side (Bride/Groom) via radio buttons in Basic Info tab
- **FR-016**: System MUST show role dropdown only when a wedding party side is selected
- **FR-017**: System MUST filter role options based on selected wedding party side
- **FR-018**: Bride side roles MUST include: Maid of Honor, Bridesmaids, Parent, Close Relative, Relative, Other
- **FR-019**: Groom side roles MUST include: Best Man, Groomsmen, Parent, Close Relative, Relative, Other
- **FR-020**: System MUST reset role selection when wedding party side is changed

### Key Entities

- **guests**: Primary entity representing wedding attendees. New fields: gender (male/female), wedding_party_side (bride/groom), wedding_party_role (varies by side)
- **meal_options**: Existing entity containing available meal choices organized by course type (starter, main, dessert)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can edit and save guest information without clicking any save button - changes persist automatically
- **SC-002**: Users can identify guest gender at a glance via icon on guest cards
- **SC-003**: Users can delete single or multiple guests with no more than 2 clicks plus confirmation
- **SC-004**: RSVP-related fields are grouped together in the RSVP tab, improving task completion efficiency
- **SC-005**: Wedding party side and role can be captured for 100% of guests in the wedding party
- **SC-006**: Meal selection dropdowns display actual menu options from the wedding's configured meal options
- **SC-007**: Auto-save indicator provides feedback within 200ms of initiating a save operation
