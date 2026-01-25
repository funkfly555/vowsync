# Feature Specification: Items Card Table View

**Feature Branch**: `031-items-card-table-view`
**Created**: 2026-01-25
**Status**: Draft
**Input**: User description: "Items Card Table View - Dual view for wedding items with Card and Table layouts"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Toggle Between Card and Table (Priority: P1)

As a wedding consultant, I need to switch between Card View and Table View for my wedding items, so I can choose the layout that best fits my current task - cards for quick browsing, table for bulk data review.

**Why this priority**: This is the core feature that enables the dual-view capability. Without the toggle, the feature has no value.

**Independent Test**: Can be fully tested by clicking the view toggle and verifying both views render correctly with the same data. Delivers immediate value by providing layout choice.

**Acceptance Scenarios**:

1. **Given** I am on the Items page with items loaded, **When** I click the "Table View" toggle button, **Then** the items display in a table layout with columns for Description, Category, Method, Need, Have, Status, Unit Cost, Total Cost, Supplier, and Actions.
2. **Given** I am viewing items in Table View, **When** I click the "Card View" toggle button, **Then** the items display in a responsive card grid (1/2/3 columns based on screen width).
3. **Given** I have selected Card View, **When** I reload the page, **Then** the Card View is still active (preference persisted).
4. **Given** the toggle is displayed, **When** I observe the active view button, **Then** it is highlighted with the dusty rose brand color (#D4A5A5).

---

### User Story 2 - Card View with Expandable Details (Priority: P1)

As a wedding consultant, I need to see item summary information in collapsed cards and expand them for full details including event breakdowns, so I can quickly scan items and drill into specifics when needed.

**Why this priority**: The card view is half of the dual-view feature and provides the visual browsing experience users expect.

**Independent Test**: Can be fully tested by clicking a card to expand, viewing all details, and clicking to collapse. Delivers value by providing visual item browsing with progressive disclosure.

**Acceptance Scenarios**:

1. **Given** I am in Card View with items displayed, **When** I view a collapsed card, **Then** I see: category badge, description, aggregation method badge (ADD/MAX), quantity summary (Need X / Have Y), availability status badge, total cost, and supplier name.
2. **Given** I am viewing a collapsed card, **When** I click on the card, **Then** it expands to show: cost per unit, cost details, notes, and the EventBreakdown component.
3. **Given** I am viewing an expanded card, **When** I click the collapse chevron, **Then** the card collapses back to the summary view.
4. **Given** I am viewing an expanded card with MAX aggregation, **When** I look at the EventBreakdown, **Then** the row(s) with the maximum quantity are highlighted in blue with "(MAX)" label.

---

### User Story 3 - Table View with Sorting and Filtering (Priority: P1)

As a wedding consultant, I need to view items in a sortable, filterable table, so I can quickly find specific items and analyze inventory data across all items at once.

**Why this priority**: The table view is the other half of the dual-view feature and provides the data-dense view for bulk operations.

**Independent Test**: Can be fully tested by viewing the table, clicking column headers to sort, and using column filters to narrow results. Delivers value by enabling efficient data review and analysis.

**Acceptance Scenarios**:

1. **Given** I am in Table View, **When** I view the table, **Then** I see columns: Checkbox, Description, Category, Method, Need, Have, Status, Unit Cost, Total Cost, Supplier, Actions.
2. **Given** I am in Table View, **When** I click a column header, **Then** the table sorts by that column (first click: ascending, second click: descending, third click: no sort).
3. **Given** I am in Table View, **When** I use the column filter dropdown on Category, **Then** I can filter to show only items matching the selected category.
4. **Given** I have applied column filters, **When** I view the filter indicators, **Then** I see badges showing which filters are active, and I can remove individual filters by clicking the X on the badge.
5. **Given** I am in Table View with the table header visible, **When** I scroll down through many items, **Then** the table header remains sticky and visible.

---

### User Story 4 - Table Row Expansion for Details (Priority: P2)

As a wedding consultant, I need to expand table rows to see full item details including event breakdown, so I can access detailed information without leaving the table view.

**Why this priority**: Enhances the table view with drill-down capability, but table view is usable without it.

**Independent Test**: Can be fully tested by clicking a table row to expand and viewing the details panel. Delivers value by providing detail access within table context.

**Acceptance Scenarios**:

1. **Given** I am in Table View, **When** I click on a row, **Then** the row expands to show: EventBreakdown, Notes, and Cost Details below the row.
2. **Given** I have an expanded row with MAX aggregation, **When** I view the EventBreakdown, **Then** the maximum quantity row(s) are highlighted in blue.
3. **Given** I have an expanded row, **When** I click the row again, **Then** it collapses back to the standard row height.

---

### User Story 5 - Search and Filter Items (Priority: P2)

As a wedding consultant, I need to search and filter items by various criteria, so I can quickly find specific items in a large inventory list.

**Why this priority**: Important for usability with large item lists, but basic browsing works without it.

**Independent Test**: Can be fully tested by entering search text and applying filters, then verifying results match criteria. Delivers value by reducing time to find specific items.

**Acceptance Scenarios**:

1. **Given** I am on the Items page, **When** I type in the search box, **Then** items are filtered to show only those with descriptions containing my search text (with 300ms debounce).
2. **Given** I am on the Items page, **When** I select a category from the Category filter dropdown, **Then** only items in that category are displayed.
3. **Given** I am on the Items page, **When** I select "Shortage" from the Availability Status filter, **Then** only items with shortage status are displayed.
4. **Given** I have filters applied that return no results, **When** I view the page, **Then** I see a "No results found" message with a button to clear filters.
5. **Given** I have multiple filters applied, **When** I click "Clear all filters", **Then** all filters are removed and all items are displayed.

---

### User Story 6 - Select and Bulk Delete Items (Priority: P2)

As a wedding consultant, I need to select multiple items and delete them in bulk, so I can efficiently clean up my inventory list.

**Why this priority**: Efficiency feature for power users, but individual delete always works.

**Independent Test**: Can be fully tested by selecting multiple items and clicking bulk delete. Delivers value by saving time on multi-item operations.

**Acceptance Scenarios**:

1. **Given** I am on the Items page in either view, **When** I click the checkbox on an item, **Then** the item is selected and the checkbox shows as checked.
2. **Given** I am in Table View, **When** I click the header checkbox, **Then** all visible (filtered) items are selected.
3. **Given** I have items selected, **When** I view the page, **Then** I see a BulkActionsBar showing "X items selected" with action buttons.
4. **Given** I have items selected, **When** I switch between Card and Table views, **Then** my selection is preserved.
5. **Given** I have 3 items selected and click "Delete Selected", **When** the confirmation dialog appears, **Then** it shows "Delete 3 items?" and I can confirm or cancel.

---

### User Story 7 - Inline Edit Event Quantities (Priority: P2)

As a wedding consultant, I need to edit event quantities directly in the EventBreakdown component, so I can quickly adjust quantities without opening a modal.

**Why this priority**: Convenience feature for common quantity adjustments, but Edit modal always works.

**Independent Test**: Can be fully tested by changing a quantity value in EventBreakdown and verifying it saves. Delivers value by reducing clicks for quantity updates.

**Acceptance Scenarios**:

1. **Given** I am viewing the EventBreakdown (in card or table expanded row), **When** I change a quantity value, **Then** the change auto-saves after 300ms debounce.
2. **Given** I have changed a quantity, **When** the save completes, **Then** the total_required recalculates based on aggregation method (ADD sums, MAX takes maximum).
3. **Given** I have changed a quantity, **When** the save completes, **Then** the availability status badge updates if the status changed.

---

### User Story 8 - Summary Statistics (Priority: P3)

As a wedding consultant, I need to see summary statistics for my items, so I can understand my overall inventory status at a glance.

**Why this priority**: Nice-to-have overview, but items can be managed without summary.

**Independent Test**: Can be fully tested by viewing the summary cards and verifying counts match the filtered data. Delivers value by providing quick inventory health overview.

**Acceptance Scenarios**:

1. **Given** I am on the Items page, **When** I view the summary section, **Then** I see 4 cards: Total Items, Total Cost, Shortages count, Sufficient count.
2. **Given** I have filters applied, **When** I view the summary, **Then** the statistics reflect the filtered items, not all items.
3. **Given** I make a change to an item, **When** the change saves, **Then** the summary statistics update in real-time.

---

### Edge Cases

- What happens when there are no items? Show empty state with "No items yet" message and "Add Item" button.
- What happens when number_available is null? Show "Unknown" availability status with gray badge.
- What happens when cost_per_unit is null? Show "—" for unit cost and total cost.
- What happens when all event quantities are 0? Show total_required as 0, status based on number_available.
- What happens when switching views during a save operation? Selection state is preserved, in-flight saves complete normally.
- What happens when filtering with a debounced search that's still pending? Latest filter state wins when debounce completes.

## Requirements *(mandatory)*

### Functional Requirements

**View Toggle & Persistence**
- **FR-001**: System MUST provide a view toggle with two options: Card View and Table View.
- **FR-002**: System MUST persist the selected view preference and restore it on page reload.
- **FR-003**: System MUST share the same data source between both views (no duplicate data fetching).
- **FR-004**: System MUST highlight the active view toggle button with the brand primary color (#D4A5A5).

**Search & Filters**
- **FR-005**: System MUST provide a search input that filters items by description with 300ms debounce.
- **FR-006**: System MUST provide filter dropdowns for: Category (dynamic), Supplier (dynamic), Aggregation Method (ADD/MAX/All), Availability Status (Sufficient/Shortage/Unknown/All).
- **FR-007**: System MUST display "No results found" message with clear filters option when filters return zero items.
- **FR-008**: System MUST apply filters identically to both Card and Table views.

**Card View**
- **FR-009**: System MUST display items in a responsive grid: 1 column on mobile, 2 columns on tablet, 3 columns on desktop.
- **FR-010**: System MUST show collapsed card with: category badge, description, aggregation badge, quantity summary, availability badge, total cost, supplier.
- **FR-011**: System MUST expand card on click to show: cost per unit, cost details, notes, EventBreakdown.
- **FR-012**: System MUST collapse expanded card when collapse chevron is clicked.
- **FR-013**: System MUST provide checkbox for item selection on each card.
- **FR-014**: System MUST provide Edit and Delete action buttons on expanded cards.

**Table View**
- **FR-015**: System MUST display a table with columns: Checkbox, Description, Category, Method, Need, Have, Status, Unit Cost, Total Cost, Supplier, Actions.
- **FR-016**: System MUST support column sorting with 3-state toggle (ascending, descending, none).
- **FR-017**: System MUST support column filtering via dropdown on: Category, Method, Status, Supplier.
- **FR-018**: System MUST display active filter badges with individual remove (X) buttons.
- **FR-019**: System MUST provide "Clear all filters" functionality.
- **FR-020**: System MUST support row expansion to show EventBreakdown, Notes, Cost Details.
- **FR-021**: System MUST keep table header sticky during vertical scroll.
- **FR-022**: System MUST show footer with "X items displayed" count.
- **FR-023**: System MUST support double-click on row to open Edit modal.

**Selection & Bulk Actions**
- **FR-024**: System MUST support individual item selection via checkbox in both views.
- **FR-025**: System MUST support select-all via header checkbox in Table View.
- **FR-026**: System MUST preserve selection state when switching between views.
- **FR-027**: System MUST display BulkActionsBar when items are selected showing "X items selected".
- **FR-028**: System MUST support bulk delete with confirmation dialog showing item count.

**Business Rules**
- **FR-029**: System MUST display ADD aggregation with orange badge and arrow-up icon.
- **FR-030**: System MUST display MAX aggregation with blue badge and arrow-up-down icon.
- **FR-031**: System MUST calculate ADD total as sum of all event quantities.
- **FR-032**: System MUST calculate MAX total as maximum of all event quantities.
- **FR-033**: System MUST display Sufficient status (green badge) when available >= required.
- **FR-034**: System MUST display Shortage status (orange badge) with "Short by X" when available < required.
- **FR-035**: System MUST display Unknown status (gray badge) when available is null.
- **FR-036**: System MUST highlight MAX rows in EventBreakdown with blue styling and "(MAX)" label.
- **FR-037**: System MUST auto-save event quantity changes after 300ms debounce.

**Data Integrity**
- **FR-038**: System MUST update both views when data changes without page refresh.
- **FR-039**: System MUST update summary statistics in real-time as items change.

### Key Entities

**Wedding Item**
- Represents a piece of furniture, equipment, or supply needed for the wedding
- Key attributes: category, description, aggregation method (ADD/MAX), number available, total required, cost per unit, total cost, supplier name, notes
- Relationship: Has many event quantities (one per event)

**Wedding Item Event Quantity**
- Represents the quantity of an item needed for a specific event
- Key attributes: quantity required, notes
- Relationship: Belongs to one wedding item, belongs to one event

**Event**
- Represents a wedding event (ceremony, reception, etc.)
- Key attributes: event name, event order
- Relationship: Has many item quantities

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between Card and Table views in under 1 second with no perceived delay.
- **SC-002**: View preference persists correctly 100% of the time across page reloads and browser sessions.
- **SC-003**: Users can find a specific item using search or filters in under 10 seconds with 50+ items.
- **SC-004**: Users can select and bulk delete multiple items in under 5 clicks (select, select, select, delete, confirm).
- **SC-005**: Inline quantity edits save successfully 100% of the time with visual feedback.
- **SC-006**: Both views display identical item counts and data when the same filters are applied.
- **SC-007**: Table sorting and filtering operations complete in under 500ms for 100+ items.
- **SC-008**: Summary statistics update within 1 second of any item change.
- **SC-009**: Selection state is preserved 100% of the time when switching between views.
- **SC-010**: All 51 acceptance criteria from the original requirements are met and verifiable.

## Assumptions

1. **Database tables exist**: The `wedding_items` and `wedding_item_event_quantities` tables already exist with all required columns.
2. **Existing components preserved**: The following components will be reused without modification: AggregationMethodBadge, AvailabilityStatusBadge, EventBreakdown, EventQuantitiesTable, WeddingItemsSummary, WeddingItemModal, DeleteWeddingItemDialog.
3. **Existing hooks preserved**: useWeddingItems and useWeddingItemMutations hooks will be reused.
4. **Currency format**: South African Rand (R) formatting will be used for all cost displays.
5. **Brand color**: The dusty rose color (#D4A5A5) is the established brand primary color.
6. **Debounce timing**: 300ms debounce is appropriate for both search and quantity edits.
7. **No pagination needed**: The items list will be manageable without server-side pagination (client-side filtering sufficient).
8. **Single wedding context**: Items page operates within a single wedding context (/weddings/:weddingId/items).

## Scope Boundaries

**In Scope**:
- View toggle between Card and Table views
- localStorage persistence of view preference
- Expandable/collapsible cards and table rows
- Search by description
- Filter by category, supplier, aggregation method, availability status
- Column sorting (table view)
- Column filtering with badges (table view)
- Multi-select with checkboxes
- Bulk delete action
- Inline event quantity editing with auto-save
- Summary statistics display
- All existing CRUD operations (preserved from current implementation)

**Out of Scope** (Future Enhancements):
- Export to Excel
- Drag-and-drop quantity editing
- Supplier catalog integration
- Barcode scanning
- Bulk edit (only bulk delete in this phase)
- Column reordering or hiding
- Saved filter presets
