# Feature Specification: Guest View Toggle - Card and Table Views

**Feature Branch**: `026-guest-view-toggle`
**Created**: 2026-01-21
**Status**: Draft
**Input**: User description: "Guest View Toggle - Card and Table Views allowing wedding consultants to switch between a simplified card overview and a comprehensive data table with all guest details and event attendance."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Toggle Interface (Priority: P1)

As a wedding consultant, I want to see view toggle buttons at the top of the Guests page so I can switch between Card View and Table View.

**Why this priority**: This is the foundational UI element that enables all other functionality. Without the toggle, users cannot access the Table View at all.

**Independent Test**: Can be fully tested by verifying the toggle buttons render, respond to clicks, and display correct active/inactive states. Delivers immediate value by providing the interface for view switching.

**Acceptance Scenarios**:

1. **Given** I am on the Guests page, **When** the page loads, **Then** I see two toggle buttons labeled "Card View" and "Table View" at the top of the page
2. **Given** I am on the Guests page, **When** I first visit (no stored preference), **Then** "Card View" button has dusty rose background (#D4A5A5) with white text (active state)
3. **Given** "Card View" is active, **When** I click "Table View" button, **Then** "Table View" becomes active (dusty rose background) and "Card View" becomes inactive (white background with gray border)
4. **Given** I have selected a view, **When** I close and reopen the browser, **Then** my last selected view is restored from localStorage

---

### User Story 2 - Card View Preservation (Priority: P1)

As a wedding consultant, I want the Card View to work exactly as it does today so I don't lose any existing functionality.

**Why this priority**: Zero regression is critical. Existing users depend on the current Card View functionality. Breaking it would severely impact user trust and workflow.

**Independent Test**: Can be fully tested by running all existing Card View tests and manually verifying current functionality. Delivers value by ensuring stability.

**Acceptance Scenarios**:

1. **Given** Card View is selected, **When** I view the guest list, **Then** I see the exact same card-based layout as before this feature was added
2. **Given** Card View is selected, **When** I expand a guest card, **Then** I see all 6 tabs (Basic, RSVP, Seating, Dietary, Meals, Events & Shuttles) working correctly
3. **Given** Card View is selected, **When** I use search/filters, **Then** they work identically to current implementation
4. **Given** Card View is selected, **When** I perform inline editing, **Then** auto-save works with 500ms debounce as before

---

### User Story 3 - Table View Basic Display (Priority: P1)

As a wedding consultant, I want to see all guest data in a comprehensive table format so I can view and compare all information at once.

**Why this priority**: This is the core new functionality. The table view provides the comprehensive data overview that is the main purpose of this feature.

**Independent Test**: Can be fully tested by switching to Table View and verifying all 30 guest columns render with correct data. Delivers immediate value by showing all guest data in tabular format.

**Acceptance Scenarios**:

1. **Given** I click "Table View", **When** the view loads, **Then** I see a data table with all guests as rows and all guest fields as columns
2. **Given** Table View is displayed, **When** I look at the column headers, **Then** I see columns grouped by category: Basic Info (8 cols), RSVP (8 cols), Seating (2 cols), Dietary (3 cols), Meals (6 cols), Other (3 cols)
3. **Given** Table View is displayed, **When** I look at a guest row, **Then** I see all their data correctly displayed in the appropriate columns
4. **Given** the table is wider than the viewport, **When** I scroll horizontally, **Then** I can see all columns with smooth scrolling

---

### User Story 4 - Event Attendance Columns (Priority: P2)

As a wedding consultant, I want to see each event's attendance data as separate columns in the table so I can quickly see who is attending which events.

**Why this priority**: This extends the table view with dynamic event columns. Important for comprehensive view but Table View is usable without it (showing only guest base data).

**Independent Test**: Can be tested by creating events and verifying each event generates 3 columns (Attending, Shuttle TO, Shuttle FROM) in correct order.

**Acceptance Scenarios**:

1. **Given** the wedding has 3 events, **When** I view Table View, **Then** I see 9 additional columns (3 events × 3 columns each) after the base guest columns
2. **Given** Table View with events, **When** I look at event column headers, **Then** they show "{Event Name} - Attending", "{Event Name} - Shuttle TO", "{Event Name} - Shuttle FROM"
3. **Given** Table View with events, **When** I look at the column headers, **Then** each event group has a unique color-coded background
4. **Given** a guest has attendance records, **When** I view their row, **Then** I see checkboxes for attending and text values for shuttle assignments

---

### User Story 5 - Table Inline Editing (Priority: P2)

As a wedding consultant, I want to edit guest data directly in the table cells so I can make quick updates without opening individual guest cards.

**Why this priority**: Enhances productivity but Table View is usable in read-only mode. Core display functionality takes precedence.

**Independent Test**: Can be tested by clicking on editable cells, modifying values, and verifying auto-save triggers and data persists.

**Acceptance Scenarios**:

1. **Given** Table View is displayed, **When** I click on an editable text cell, **Then** it becomes an editable input field
2. **Given** I am editing a cell, **When** I change the value and click away, **Then** the change is auto-saved after 500ms debounce
3. **Given** I am editing a dropdown cell (like guest_type), **When** I click it, **Then** I see a dropdown with valid options
4. **Given** I am editing a checkbox cell (like attending), **When** I click the checkbox, **Then** it toggles and auto-saves

---

### User Story 6 - Table Sorting and Filtering (Priority: P3)

As a wedding consultant, I want to sort and filter table columns so I can find specific guests and organize data for analysis.

**Why this priority**: Nice-to-have enhancement. Table is useful without sorting/filtering; users can scroll and search.

**Independent Test**: Can be tested by clicking sort icons and filter dropdowns, verifying data reorders correctly.

**Acceptance Scenarios**:

1. **Given** Table View is displayed, **When** I click the sort icon (↕) on a column header, **Then** the table sorts by that column (ascending/descending toggle)
2. **Given** Table View is displayed, **When** I click the filter icon (⋮) on a column header, **Then** I see filtering options appropriate for that column type
3. **Given** I have applied a filter, **When** I switch to Card View and back, **Then** my filter is preserved

---

### User Story 7 - Column Resizing (Priority: P3)

As a wedding consultant, I want to resize table columns by dragging so I can adjust the view to show more or less of certain data.

**Why this priority**: Usability enhancement. Table works fine with default column widths.

**Independent Test**: Can be tested by dragging column border and verifying width changes and persists during session.

**Acceptance Scenarios**:

1. **Given** Table View is displayed, **When** I hover over a column border, **Then** I see a resize cursor
2. **Given** I am dragging a column border, **When** I release, **Then** the column width adjusts to where I dragged
3. **Given** I have resized columns, **When** I navigate away and return (same session), **Then** column widths are maintained

---

### Edge Cases

- What happens when a guest has no event attendance records? → Display empty checkboxes (unchecked) and empty text inputs
- How does system handle a wedding with 0 events? → Show only base guest columns (30 columns), no event columns
- What happens when a wedding has 10+ events? → Display maximum 10 events (30 event columns), ignore additional events
- How does system handle meal choice columns when no menu options exist? → Display the number (1-5) with "(No menu configured)" tooltip
- What happens when switching views while data is being edited? → Complete any pending auto-save before switching views
- How does system handle very long text values in cells? → Truncate with ellipsis, show full value on hover/tooltip

## Requirements *(mandatory)*

### Functional Requirements

**View Toggle**
- **FR-001**: System MUST display "Card View" and "Table View" toggle buttons at the top of the Guests page
- **FR-002**: System MUST default to Card View when no view preference exists in localStorage
- **FR-003**: System MUST persist selected view preference to localStorage (key: 'guestsViewPreference')
- **FR-004**: System MUST restore view preference from localStorage on page load
- **FR-005**: Active view button MUST have dusty rose background (#D4A5A5) with white text
- **FR-006**: Inactive view button MUST have white background with gray border (#E8E8E8) and dark text (#2C2C2C)

**Card View (Zero Changes)**
- **FR-007**: Card View MUST work identically to current implementation with zero breaking changes
- **FR-008**: All existing Card View features (expand, tabs, inline edit, auto-save) MUST continue working

**Table View - Display**
- **FR-009**: Table View MUST display all guests as rows with all database fields as columns
- **FR-010**: Table MUST group columns by category: Basic Info, RSVP, Seating, Dietary, Meals, Other
- **FR-011**: Table header MUST have background color #F5F5F5
- **FR-012**: Table rows MUST have hover effect with background #FAFAFA
- **FR-013**: Table MUST support horizontal scrolling when columns exceed viewport width
- **FR-014**: Table cells MUST have minimum width of 120px

**Table View - Event Columns**
- **FR-015**: System MUST pivot event attendance data into columns (3 columns per event: Attending, Shuttle TO, Shuttle FROM)
- **FR-016**: Event columns MUST be ordered by event_order field
- **FR-017**: Each event group MUST have a unique color-coded header background
- **FR-018**: System MUST support maximum 10 events (30 event columns)

**Table View - Editing**
- **FR-019**: All editable cells MUST support inline editing
- **FR-020**: Inline edits MUST auto-save with 500ms debounce
- **FR-021**: Boolean fields MUST render as checkboxes
- **FR-022**: Enum fields MUST render as dropdowns with valid options
- **FR-023**: Date fields MUST render with date picker on edit

**Table View - Features**
- **FR-024**: Each column header MUST have a sort toggle icon (↕)
- **FR-025**: Each column header MUST have a filter icon (⋮)
- **FR-026**: Column borders MUST be draggable for resizing
- **FR-027**: Meal choice columns MUST display menu option names (not just numbers)

**Search/Filter Integration**
- **FR-028**: Search functionality MUST work identically in both views
- **FR-029**: Filter state MUST be preserved when switching between views
- **FR-030**: Both views MUST share the same search/filter controls

### Key Entities

- **guests**: Core entity with 30 base fields across 6 categories (Basic Info, RSVP, Seating, Dietary, Meals, Other). All fields use snake_case. See database schema for complete field list.
- **guest_event_attendance**: Junction entity linking guests to events with attendance status and shuttle assignments. Pivoted into dynamic columns in Table View.
- **events**: Reference entity providing event names and ordering for dynamic column generation. Maximum 10 events supported.
- **meal_options**: Reference entity for displaying meal choice names instead of numbers in the Meals columns.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between Card View and Table View in under 1 second
- **SC-002**: Table View renders all 30 base columns plus up to 30 event columns (60 total) without performance degradation
- **SC-003**: Table View supports 500+ guests with smooth scrolling and no visible lag
- **SC-004**: 100% of existing Card View functionality continues working (zero regressions)
- **SC-005**: View preference persists correctly across browser sessions (localStorage)
- **SC-006**: Inline table editing auto-saves successfully 99%+ of the time
- **SC-007**: Column sorting completes in under 500ms for datasets up to 500 guests
- **SC-008**: Users can locate specific guest data 50% faster using Table View compared to expanding individual cards

## Assumptions

- Wedding has a maximum of 10 events (as stated in business rules)
- Meal options (1-5) are configured in the meal_options table
- All database tables (guests, guest_event_attendance, events, meal_options) already exist with proper RLS policies
- Existing Card View implementation uses the same data source/hooks that can be reused
- Browser localStorage is available and not blocked by user settings
- Users have modern browsers supporting CSS Grid and Flexbox for table layout
