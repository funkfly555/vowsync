# Feature Specification: Vendors View Toggle

**Feature Branch**: `027-vendor-view-toggle`
**Created**: 2026-01-23
**Status**: Draft
**Input**: User description: "Vendors View Toggle - Add Card/Table view toggle for vendors page with inline editing, filtering, and sorting"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle Between Card and Table Views (Priority: P1)

As a wedding consultant, I need to switch between Card View and Table View for my vendor list so I can choose the most efficient way to view and manage vendor information based on my current task.

**Why this priority**: This is the core feature that enables all other functionality. Without the view toggle, users cannot access the table view at all.

**Independent Test**: Can be fully tested by clicking the view toggle and observing the view change. Delivers immediate value by providing an alternative way to view vendor data.

**Acceptance Scenarios**:

1. **Given** I am on the vendors page in Card View, **When** I click the Table View icon in the view toggle, **Then** the page displays all vendors in a table format with all 27 vendor fields as columns
2. **Given** I am on the vendors page in Table View, **When** I click the Card View icon in the view toggle, **Then** the page displays vendors as cards (existing behavior)
3. **Given** I switched to Table View in my last session, **When** I return to the vendors page, **Then** the Table View is displayed (preference persisted)
4. **Given** I am viewing the table, **When** I scroll horizontally, **Then** the vendor name column remains sticky on the left for reference

---

### User Story 2 - Inline Editing with Auto-Save (Priority: P2)

As a wedding consultant, I need to edit vendor information directly in the table cells so I can quickly update multiple fields without opening a separate modal for each change.

**Why this priority**: Inline editing is the primary productivity benefit of the table view. Without it, the table would be read-only and less useful than the card view.

**Independent Test**: Can be tested by clicking on any editable cell, modifying the value, and observing the auto-save behavior. Delivers value by reducing clicks needed to update vendor data.

**Acceptance Scenarios**:

1. **Given** I am in Table View, **When** I click on an editable cell (e.g., contact_email), **Then** the cell enters edit mode with the current value selected
2. **Given** I am editing a cell, **When** I type a new value and wait 500ms, **Then** the system automatically saves the change without requiring a save button
3. **Given** I edited a cell, **When** the auto-save completes successfully, **Then** I see a brief visual confirmation (subtle highlight) and the cell returns to display mode
4. **Given** I edited a cell with an invalid value (e.g., invalid email format), **When** the auto-save attempts, **Then** I see an error indicator and the change is rejected
5. **Given** a save fails due to network error, **When** the error occurs, **Then** the cell reverts to its original value and I see an error notification

---

### User Story 3 - Column Filtering (Priority: P3)

As a wedding consultant, I need to filter vendors by column values so I can quickly find vendors matching specific criteria (e.g., all Catering vendors, all with unsigned contracts).

**Why this priority**: Filtering enhances data discovery but the view is still useful without it. This builds on the base table functionality.

**Independent Test**: Can be tested by opening a column filter dropdown, selecting values, and observing the filtered results. Delivers value by enabling quick data discovery.

**Acceptance Scenarios**:

1. **Given** I am in Table View, **When** I click the filter icon on a column header (e.g., vendor_type), **Then** a dropdown appears with checkboxes for each unique value in that column
2. **Given** the filter dropdown is open, **When** I check "Catering" and "Photography", **Then** the table shows only vendors of those types
3. **Given** I have filters applied, **When** I view the filter indicator, **Then** I see a badge showing the number of active filters
4. **Given** I have filters applied in Table View, **When** I switch to Card View, **Then** the same filters remain applied to the card display
5. **Given** I have multiple column filters applied, **When** I click "Clear All Filters", **Then** all filters are removed and all vendors are displayed

---

### User Story 4 - Column Sorting (Priority: P4)

As a wedding consultant, I need to sort the vendor table by any column so I can organize vendors by contract value, due dates, or alphabetically by name.

**Why this priority**: Sorting is a common expectation for tables but not essential for basic data viewing. It enhances usability but isn't a blocker.

**Independent Test**: Can be tested by clicking column headers and observing sort order changes. Delivers value by enabling custom data organization.

**Acceptance Scenarios**:

1. **Given** I am in Table View with no sort applied, **When** I click the "company_name" column header, **Then** vendors are sorted alphabetically (A-Z) ascending
2. **Given** the table is sorted ascending by company_name, **When** I click the same header again, **Then** the sort reverses to descending (Z-A)
3. **Given** the table is sorted descending, **When** I click the same header again, **Then** the sort is cleared (returns to default order)
4. **Given** I am sorting by contract_value, **When** I sort ascending, **Then** null values appear at the end of the list

---

### User Story 5 - View Aggregate Counts (Priority: P5)

As a wedding consultant, I need to see counts of related records (contacts, payments, invoices) for each vendor in the table so I can quickly identify which vendors need attention.

**Why this priority**: Aggregate counts provide additional context but aren't essential for basic vendor management. This is a "nice to have" enhancement.

**Independent Test**: Can be tested by viewing the table and confirming count columns display correct totals. Delivers value by surfacing related data without navigation.

**Acceptance Scenarios**:

1. **Given** I am in Table View, **When** I view the aggregate columns, **Then** I see read-only columns for Contacts Count, Payments Count, and Invoices Count
2. **Given** a vendor has 3 contacts, 2 payment milestones, and 5 invoices, **When** I view that vendor's row, **Then** the counts display as "3", "2", and "5" respectively
3. **Given** a vendor has no related records, **When** I view that vendor's row, **Then** the counts display as "0" (not blank or null)

---

### Edge Cases

- What happens when a vendor has no vendor_type set? → Display blank cell, show "Select..." placeholder on edit
- How does the system handle concurrent edits? → Last write wins with optimistic update
- What happens when filtering results in zero matches? → Show "No vendors match your filters" message with clear filters button
- What if account_number is null? → Display blank cell (no masking needed for null values)
- What if a required field is cleared during inline edit? → Reject the save and show validation error
- How are very long text fields displayed? → Truncate with ellipsis, show full text on hover/focus
- What happens if localStorage is unavailable? → Default to Card View, log warning to console

## Requirements *(mandatory)*

### Functional Requirements

**View Toggle**
- **FR-001**: System MUST provide a ViewToggle component with Card and Table view icons
- **FR-002**: System MUST persist view preference in localStorage under key "vendorsViewPreference"
- **FR-003**: System MUST default to Card View for new users (no stored preference)

**Table Structure**
- **FR-004**: Table MUST display all 27 vendor fields as columns organized by category
- **FR-005**: Table MUST include 3 aggregate count columns: contacts_count, payments_count, invoices_count (read-only)
- **FR-006**: Table header row MUST be sticky when scrolling vertically
- **FR-007**: First column (checkbox) and second column (company_name) MUST be sticky when scrolling horizontally
- **FR-008**: Table header MUST use dusty rose (#D4A5A5) background color
- **FR-009**: Table cells MUST have minimum height of 40px for touch accessibility

**Column Categories**
- **FR-010**: Columns MUST be grouped into categories: Basic Info, Contact, Contract, Insurance, Banking, Aggregates, Metadata
- **FR-011**: Each category MUST have a distinct visual grouping in the header

**Inline Editing**
- **FR-012**: All vendor fields except id, wedding_id, created_at, updated_at MUST be editable inline
- **FR-013**: Aggregate count columns MUST be read-only (not editable)
- **FR-014**: Edits MUST auto-save after 500ms debounce from last keystroke
- **FR-015**: System MUST show optimistic updates immediately while saving
- **FR-016**: System MUST rollback changes and show error on save failure
- **FR-017**: account_number MUST display masked (last 4 digits only) when not in edit mode

**Field Validation**
- **FR-018**: Required fields (vendor_type, company_name, contact_name) MUST NOT be saveable as empty
- **FR-019**: contact_email MUST validate as proper email format
- **FR-020**: website MUST validate as URL starting with http:// or https:// (or be empty)
- **FR-021**: contract_expiry_date MUST NOT be before contract_date
- **FR-022**: insurance_expiry_date MUST NOT be in the past if insurance_required is true
- **FR-023**: contract_value and cancellation_fee_percentage MUST be positive numbers or null
- **FR-024**: status MUST be one of: 'active', 'inactive', 'backup'

**Filtering**
- **FR-025**: Each column header MUST have a filter icon that opens a dropdown
- **FR-026**: Filter dropdown MUST show checkboxes for each unique value in the column
- **FR-027**: Multiple values MAY be selected for "OR" filtering within a column
- **FR-028**: Multiple column filters MUST combine with "AND" logic
- **FR-029**: Active filter count MUST be displayed as a badge
- **FR-030**: Filter state MUST be shared between Card View and Table View

**Sorting**
- **FR-031**: Clicking a column header MUST cycle through: ascending → descending → no sort
- **FR-032**: Sort indicator (arrow) MUST show current sort direction
- **FR-033**: Only one column MAY be sorted at a time
- **FR-034**: Null values MUST sort to the end regardless of sort direction

**Selection**
- **FR-035**: Selection state (checkboxes) MUST be shared between Card View and Table View
- **FR-036**: Header checkbox MUST select/deselect all visible (filtered) vendors

**Visual Design**
- **FR-037**: Sticky header z-index MUST be 30 for header rows, 40 for intersection cells
- **FR-038**: Table font size MUST be 14px for cells, 12px for headers
- **FR-039**: Boolean fields MUST display as checkboxes
- **FR-040**: Date fields MUST display in user-friendly format (e.g., "Jan 23, 2026")
- **FR-041**: Currency fields (contract_value) MUST display with currency formatting

### Key Entities

**Vendor** (primary entity - 27 fields):
- Represents a wedding vendor/supplier
- Core fields: vendor_type, company_name, contact_name, contact_email, contact_phone, address, website, notes, status
- Contract fields: contract_signed, contract_date, contract_expiry_date, contract_value, cancellation_policy, cancellation_fee_percentage
- Insurance fields: insurance_required, insurance_verified, insurance_expiry_date
- Banking fields: bank_name, account_name, account_number, branch_code, swift_code
- Metadata: id, wedding_id, created_at, updated_at

**Aggregate Counts** (computed, read-only):
- contacts_count: Number of records in vendor_contacts for this vendor
- payments_count: Number of records in vendor_payment_schedule for this vendor
- invoices_count: Number of records in vendor_invoices for this vendor

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between Card and Table views in under 1 second
- **SC-002**: Users can edit and save a vendor field in under 3 seconds (click → type → auto-save)
- **SC-003**: 100% of vendor fields are visible in the table view (all 27 database fields + 3 aggregate counts)
- **SC-004**: View preference persists correctly across browser sessions for 100% of users
- **SC-005**: Filtering reduces visible vendors to only matching results within 500ms
- **SC-006**: Zero data loss from inline editing (all saves either succeed or rollback cleanly)
- **SC-007**: Table scrolls smoothly with 100+ vendors (no performance degradation)
- **SC-008**: 95% of users can locate and use the view toggle without assistance (intuitive placement)

## Assumptions

1. The existing Card View and VendorsPage component will remain functional and be enhanced with the toggle
2. The existing vendor CRUD modal will remain available for bulk edits or detailed editing
3. All 27 vendor fields already exist in the database schema with the documented column names
4. Related tables (vendor_contacts, vendor_payment_schedule, vendor_invoices) exist with vendor_id foreign key
5. The existing useVendors hook can be extended or a new useVendorTableData hook created
6. Touch devices should be able to use inline editing via tap interactions
7. Browser localStorage is available for preference persistence (graceful fallback if not)

## Out of Scope

- Drag-and-drop column reordering
- Column visibility toggle (show/hide columns)
- Export to Excel/CSV
- Bulk edit multiple vendors simultaneously
- Vendor comparison view
- Contract renewal reminder notifications
- Print-optimized table view
