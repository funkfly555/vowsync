# Feature Specification: Bar Order Management

**Feature Branch**: `012-bar-order-management`
**Created**: 2026-01-15
**Status**: Draft
**Input**: Bar Order Management - Calculate beverage requirements with consumption model and catalog

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Bar Orders List (Priority: P1)

As a wedding consultant, I need to view all bar orders for a wedding so I can quickly see the status of beverage planning across all events.

**Why this priority**: This is the entry point for the feature - users must be able to see existing bar orders before creating or managing them. Provides immediate value by giving visibility into beverage planning status.

**Independent Test**: Navigate to `/weddings/:id/bar-orders` and verify the list displays with order cards showing event name, guest count, total units, and status. Empty state should show helpful message when no orders exist.

**Acceptance Scenarios**:

1. **Given** a wedding with 3 bar orders, **When** I navigate to the bar orders page, **Then** I see a card grid with all 3 orders showing event name, guest count, total units, and status badge
2. **Given** a wedding with no bar orders, **When** I navigate to the bar orders page, **Then** I see an empty state with a helpful message and option to create a new order
3. **Given** I am viewing bar orders on mobile, **When** the screen width is less than 768px, **Then** the cards stack in a single column

---

### User Story 2 - Create Bar Order with Consumption Model (Priority: P1)

As a wedding consultant, I need to create a new bar order linked to an event with customizable consumption parameters so the system can calculate how many drinks per person are needed.

**Why this priority**: Core functionality - without the ability to create orders and set consumption parameters, the feature has no value. The consumption model is the key differentiator of this feature.

**Independent Test**: Create a new bar order, link it to an event, customize consumption parameters, and verify total servings per person is auto-calculated correctly.

**Acceptance Scenarios**:

1. **Given** I am creating a new bar order, **When** I select an event, **Then** the guest count (adults) is automatically populated from the event
2. **Given** a 5-hour event with default consumption parameters (2 hours at 2 drinks/hr, remainder at 1 drink/hr), **When** the order is saved, **Then** total servings per person = (2 x 2) + (3 x 1) = 7
3. **Given** I am creating a bar order, **When** I customize first hours to 3 and first hours drinks to 1.5, **Then** the total servings recalculates accordingly
4. **Given** I am creating a bar order, **When** I optionally link a vendor, **Then** the vendor is associated with the order

---

### User Story 3 - Add Beverage Items with Auto-Calculation (Priority: P1)

As a wedding consultant, I need to add beverage items to an order with percentage allocation so the system calculates how many units (bottles, cases) I need to order.

**Why this priority**: This is the main value proposition - automatic calculation of beverage quantities based on consumption model. Without item calculations, the feature doesn't deliver its core promise.

**Independent Test**: Add beverage items (wine 40%, beer 30%, spirits 30%) to an order and verify calculated servings and units needed are correct.

**Acceptance Scenarios**:

1. **Given** an order with 7 servings/person and 150 adult guests, **When** I add wine at 40% with 4 servings/bottle, **Then** calculated servings = 7 x 0.40 x 150 = 420, units needed = CEIL(420/4) = 105 bottles
2. **Given** I am adding an item, **When** I enter item name, percentage, and servings per unit, **Then** the system auto-calculates servings and units needed
3. **Given** I set cost per unit as R50, **When** units needed is 105, **Then** total cost displays as R5,250

---

### User Story 4 - Percentage Validation (Priority: P2)

As a wedding consultant, I need to see warnings when my beverage percentages don't total 100% so I can ensure accurate ordering.

**Why this priority**: Important for accuracy but not blocking - users can still create orders with imperfect percentages. Enhances reliability of calculations.

**Independent Test**: Add items totaling 90%, 100%, and 110% and verify appropriate warnings/errors display.

**Acceptance Scenarios**:

1. **Given** items totaling exactly 100%, **When** I save the order, **Then** no warnings display
2. **Given** items totaling 95%, **When** I view the order, **Then** I see a warning: "Total is 95.0%. Should be 100%."
3. **Given** items totaling 85%, **When** I try to save, **Then** I see an error: "Total percentage must be between 90% and 110%"
4. **Given** items totaling 115%, **When** I try to save, **Then** I see an error: "Total percentage must be between 90% and 110%"

---

### User Story 5 - Order Status Management (Priority: P2)

As a wedding consultant, I need to track bar order status through the ordering lifecycle so I can manage my vendor relationships effectively.

**Why this priority**: Workflow management is important but secondary to core calculation functionality. Provides operational value once orders are created.

**Independent Test**: Change an order status from draft to confirmed to ordered to delivered and verify status badge updates correctly.

**Acceptance Scenarios**:

1. **Given** a new bar order, **When** it is created, **Then** default status is "draft" with gray badge
2. **Given** a draft order, **When** I change status to "confirmed", **Then** badge turns blue
3. **Given** a confirmed order, **When** I change status to "ordered", **Then** badge turns orange
4. **Given** an ordered order, **When** I change status to "delivered", **Then** badge turns green

---

### User Story 6 - View Order Summary Totals (Priority: P2)

As a wedding consultant, I need to see summary totals (total units, total cost) for a bar order so I can understand the overall order size and budget impact.

**Why this priority**: Provides valuable aggregated view but builds on item-level calculations. Users need individual items working first.

**Independent Test**: Create an order with multiple items and verify summary totals correctly aggregate units and costs.

**Acceptance Scenarios**:

1. **Given** an order with 3 items totaling 150 units, **When** I view the order, **Then** I see "Total Units: 150" in the summary
2. **Given** items with total costs of R5,250 + R3,000 + R2,100, **When** I view the order, **Then** I see "Total Cost: R10,350" in the summary

---

### Edge Cases

- What happens when event duration equals first hours? (Remaining hours is 0, calculation uses only first hours formula)
- What happens when guest count is 0? (Calculations result in 0 servings and 0 units)
- What happens when percentage is entered as 40 instead of 0.40? (Validation prevents values > 1)
- What happens when servings per unit is 0? (Validation prevents division by zero)
- What happens when event has no guests assigned? (User must manually enter guest count)
- What happens when linked event is deleted? (Order retains last known guest count, event_id becomes null)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a list of all bar orders for the current wedding in a card grid layout
- **FR-002**: System MUST allow creating a new bar order with optional event and vendor linkage
- **FR-003**: System MUST auto-populate guest count (adults) when an event is selected
- **FR-004**: System MUST allow customization of consumption parameters: first hours (default 2), first hours drinks/hr (default 2), remaining hours drinks/hr (default 1)
- **FR-005**: System MUST auto-calculate total servings per person using formula: (first_hours x first_hours_drinks_per_hour) + ((event_duration_hours - first_hours) x remaining_hours_drinks_per_hour)
- **FR-006**: System MUST allow adding beverage items with: item name, percentage (0-100%), servings per unit, cost per unit
- **FR-007**: System MUST auto-calculate for each item: calculated_servings = total_servings_per_person x percentage x guest_count_adults
- **FR-008**: System MUST auto-calculate units_needed = CEIL(calculated_servings / servings_per_unit)
- **FR-009**: System MUST display percentage validation: warning if 90-110% but not 100%, error if outside 90-110%
- **FR-010**: System MUST auto-calculate total_cost = units_needed x cost_per_unit for each item
- **FR-011**: System MUST display order totals: sum of all units_needed, sum of all total_cost
- **FR-012**: System MUST support order status: draft (default), confirmed, ordered, delivered
- **FR-013**: System MUST display status badges with appropriate colors: gray (draft), blue (confirmed), orange (ordered), green (delivered)
- **FR-014**: System MUST display empty state with helpful message when no orders exist
- **FR-015**: System MUST validate: event_duration_hours > 0 and <= 24
- **FR-016**: System MUST validate: first_hours >= 0 and <= event_duration_hours
- **FR-017**: System MUST validate: percentage > 0 and <= 1
- **FR-018**: System MUST validate: servings_per_unit > 0
- **FR-019**: System MUST validate: item_name is 1-100 characters
- **FR-020**: System MUST support editing existing bar orders and items
- **FR-021**: System MUST support deleting bar orders and items

### Key Entities

- **Bar Order**: Represents a beverage order for a wedding event. Contains consumption parameters (first hours, drinks per hour rates), links to event and vendor, and calculates total servings per person. Has status lifecycle (draft -> confirmed -> ordered -> delivered).

- **Bar Order Item**: Individual beverage line item within an order. Contains item name, percentage allocation of total consumption, servings per unit, and cost per unit. System calculates servings needed and units to order.

- **Event**: Existing entity - provides guest count and duration for calculations. Optional linkage to bar order.

- **Vendor**: Existing entity - optional linkage to bar order for supplier tracking.

- **Catalog Item**: Existing entity (future use) - will provide item templates in Phase 9B. Not used in this phase.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Wedding consultants can create a complete bar order with items in under 5 minutes
- **SC-002**: Beverage quantity calculations match manual calculations with 100% accuracy
- **SC-003**: Users can see order status at a glance from the list view without opening each order
- **SC-004**: System supports bar orders for events with up to 500 guests without performance degradation
- **SC-005**: Percentage validation catches 100% of invalid percentage allocations before order save
- **SC-006**: All calculations update in real-time as users modify parameters (no page refresh required)
- **SC-007**: Mobile users can view and create bar orders with full functionality on screens 375px and wider

## Assumptions

- Guest count for calculations uses adults only (children typically don't consume alcoholic beverages)
- Consumption model uses a two-phase approach (initial high consumption, then lower sustained rate)
- Currency displays in South African Rand (R) consistent with existing VowSync convention
- Users understand percentage allocation concept and can divide consumption across beverage types
- Event duration in hours can be fractional (e.g., 4.5 hours)
- Bar orders are wedding-scoped (not shareable across weddings)

## Out of Scope

- Catalog item selection dropdown (Phase 9B)
- Catalog management CRUD (Phase 9B)
- Bar order templates
- Print/export bar order functionality
- Inventory tracking
- Non-alcoholic beverage calculations (uses same model but separate orders if needed)
