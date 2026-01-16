# Feature Specification: Wedding Items Management

**Feature Branch**: `013-wedding-items`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "Furniture Equipment Tracking - Wedding items with multi-event quantities and aggregation logic"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Wedding Items (Priority: P1)

As a wedding consultant, I need to create and manage wedding items (furniture, equipment, linens, decorations) for a wedding so I can track what items are needed across all events.

**Why this priority**: This is the foundational capability - without the ability to create items, no other features work. It delivers immediate value by allowing consultants to inventory their wedding equipment.

**Independent Test**: Can be fully tested by creating, viewing, editing, and deleting a wedding item. Delivers value by providing a centralized inventory of all items needed for a wedding.

**Acceptance Scenarios**:

1. **Given** I am on the items list page for a wedding, **When** I click "Add Item", **Then** I see a form with fields for category, description, aggregation method, availability, cost, and supplier.
2. **Given** I have filled in the required fields (category, description), **When** I save the item, **Then** the item appears in the items list with correct details.
3. **Given** an item exists, **When** I click to edit it, **Then** I can modify all fields and save changes successfully.
4. **Given** an item exists, **When** I delete it, **Then** it is removed from the list and all associated event quantities are deleted.

---

### User Story 2 - Specify Event Quantities with Real-Time Aggregation (Priority: P1)

As a wedding consultant, I need to specify how many of each item is needed for each event, and see the total required automatically calculated based on the aggregation method (ADD for consumables, MAX for reusables).

**Why this priority**: This is the core business logic that differentiates this feature. The ADD/MAX calculation is essential for accurate planning - without it, consultants would manually calculate totals incorrectly.

**Independent Test**: Can be tested by adding event quantities to an item and verifying the total_required updates correctly based on aggregation method.

**Acceptance Scenarios**:

1. **Given** an item with aggregation method "ADD" and event quantities (Event 1: 200, Event 2: 150, Event 3: 180), **When** the totals are calculated, **Then** total_required equals 530 (sum of all quantities).
2. **Given** an item with aggregation method "MAX" and event quantities (Event 1: 14, Event 2: 20, Event 3: 10), **When** the totals are calculated, **Then** total_required equals 20 (maximum of all quantities).
3. **Given** I change an event quantity, **When** I save the change, **Then** the total_required updates immediately without page refresh.
4. **Given** I change an item's aggregation method from MAX to ADD, **When** the change is saved, **Then** the total_required recalculates using the new method.

---

### User Story 3 - View Availability Status and Shortage Warnings (Priority: P2)

As a wedding consultant, I need to see at a glance which items have sufficient availability and which items are short, so I can proactively source additional items.

**Why this priority**: Availability tracking provides critical planning information but requires items and quantities to exist first. Prevents last-minute scrambling by highlighting shortages early.

**Independent Test**: Can be tested by setting number_available for an item and verifying the correct status indicator appears based on comparison to total_required.

**Acceptance Scenarios**:

1. **Given** an item with total_required=20 and number_available=25, **When** I view the item, **Then** I see a green "Sufficient" status indicator.
2. **Given** an item with total_required=20 and number_available=15, **When** I view the item, **Then** I see an orange warning "Short by 5 units".
3. **Given** an item with number_available not set (null), **When** I view the item, **Then** I see a gray "Availability not set" indicator.
4. **Given** the items list view, **When** I look at the summary, **Then** I see a count of items with shortage warnings.

---

### User Story 4 - Filter and Search Items (Priority: P2)

As a wedding consultant, I need to filter items by category and supplier so I can quickly find specific items and generate supplier-specific lists.

**Why this priority**: Filtering improves usability as the item list grows, but basic item management must work first. Enables supplier coordination workflows.

**Independent Test**: Can be tested by creating items with different categories/suppliers, then applying filters and verifying correct results.

**Acceptance Scenarios**:

1. **Given** items exist in categories "Tables", "Chairs", "Linens", **When** I filter by "Tables", **Then** only table items are displayed.
2. **Given** items exist from suppliers "ABC Rentals", "XYZ Decor", **When** I filter by "ABC Rentals", **Then** only items from that supplier are displayed.
3. **Given** filters are applied, **When** I click "Clear filters", **Then** all items are displayed.
4. **Given** I have filtered by a supplier, **When** I view the list, **Then** I can see a supplier-specific view with all their items and total costs.

---

### User Story 5 - Track Costs and View Summary (Priority: P3)

As a wedding consultant, I need to track cost per unit for items and see a summary of total costs so I can manage the wedding budget effectively.

**Why this priority**: Cost tracking is valuable but supplementary to the core quantity management. Integrates with overall budget planning.

**Independent Test**: Can be tested by setting cost_per_unit for items and verifying total_cost calculations and summary totals.

**Acceptance Scenarios**:

1. **Given** an item with cost_per_unit=50 and total_required=20, **When** I view the item, **Then** total_cost displays as 1000.
2. **Given** I update cost_per_unit, **When** the change is saved, **Then** total_cost recalculates automatically.
3. **Given** multiple items with costs, **When** I view the summary section, **Then** I see the total cost across all items.
4. **Given** items with and without costs set, **When** I view the summary, **Then** items without costs are noted separately.

---

### User Story 6 - View Event-by-Event Breakdown (Priority: P3)

As a wedding consultant, I need to see which events each item is used in and the quantity needed per event, so I can plan logistics and communicate with vendors.

**Why this priority**: Provides detailed planning view but primary value comes from aggregate totals. Supports detailed operational planning.

**Independent Test**: Can be tested by expanding an item to view its event quantities breakdown.

**Acceptance Scenarios**:

1. **Given** an item with quantities set for multiple events, **When** I expand the item details, **Then** I see a table showing each event name, date, and quantity needed.
2. **Given** an item with MAX aggregation, **When** I view the breakdown, **Then** the event with the highest quantity is highlighted.
3. **Given** the breakdown view, **When** I click on a quantity field, **Then** I can edit it inline.

---

### Edge Cases

- What happens when an item has no event quantities assigned? Total required should be 0.
- What happens when all event quantities are 0? Total required should be 0.
- What happens when an event is deleted that has item quantities? Quantities for that event should be cascade deleted, totals recalculated.
- What happens when the aggregation method changes while quantities exist? Totals should recalculate immediately.
- How does the system handle very large quantities (e.g., 10,000 napkins)? Should display correctly with proper number formatting.
- What happens when cost_per_unit is set but total_required is 0? Total cost should be 0.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create wedding items with required fields: category (text, 1-100 chars) and description (text, 1-200 chars)
- **FR-002**: System MUST support two aggregation methods: ADD (sum all event quantities) and MAX (take maximum event quantity), defaulting to MAX
- **FR-003**: System MUST auto-calculate total_required based on aggregation method whenever event quantities change
- **FR-004**: System MUST allow users to specify quantity_required for each event associated with the wedding item
- **FR-005**: System MUST enforce unique constraint on (wedding_item_id, event_id) to prevent duplicate event quantities
- **FR-006**: System MUST display availability status: sufficient (green), shortage warning (orange), or unknown (gray)
- **FR-007**: System MUST calculate shortage as (total_required - number_available) when number_available is set
- **FR-008**: System MUST allow filtering items by category and supplier_name
- **FR-009**: System MUST calculate total_cost as (total_required * cost_per_unit) when cost_per_unit is set
- **FR-010**: System MUST display aggregation method badges: ADD (orange badge) and MAX (blue badge)
- **FR-011**: System MUST update all calculated fields (total_required, total_cost) in real-time without page refresh
- **FR-012**: System MUST allow inline editing of event quantities from the item detail view
- **FR-013**: System MUST show event breakdown with event name, date, and quantity for each item
- **FR-014**: System MUST highlight the event with highest quantity for items using MAX aggregation
- **FR-015**: System MUST display a summary showing total items count, total cost, and shortage warning count
- **FR-016**: System MUST cascade delete event quantities when a wedding item is deleted
- **FR-017**: System MUST recalculate total_required when an event associated with quantities is deleted

### Validation Rules

- **VR-001**: category field is required and must be 1-100 characters
- **VR-002**: description field is required and must be 1-200 characters
- **VR-003**: aggregation_method must be either 'ADD' or 'MAX'
- **VR-004**: quantity_required must be >= 0 (non-negative integer)
- **VR-005**: number_available must be >= 0 or null
- **VR-006**: cost_per_unit must be >= 0 or null

### Key Entities

- **Wedding Item**: Represents a piece of furniture, equipment, or supply needed for a wedding. Contains category, description, aggregation method, availability tracking, cost information, and supplier details. Belongs to one wedding.

- **Wedding Item Event Quantity**: Represents the quantity of a specific wedding item needed for a specific event. Links a wedding item to an event with a quantity. Each item can have different quantities for each event.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new wedding item with all required fields in under 1 minute
- **SC-002**: Total required calculations update within 500ms of saving a quantity change
- **SC-003**: Users can identify items with shortages at a glance within 2 seconds of loading the items list
- **SC-004**: Users can filter items by category or supplier with results displaying in under 1 second
- **SC-005**: 100% of event quantity changes correctly update the total_required using the specified aggregation method
- **SC-006**: Users can view all events an item is used in without navigating away from the items page
- **SC-007**: The summary section accurately reflects total items, total cost, and shortage count
- **SC-008**: Users can complete the workflow of adding an item and specifying quantities for 3 events in under 3 minutes
