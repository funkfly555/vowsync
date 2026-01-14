# Feature Specification: Vendor Management System (Phase 7A)

**Feature Branch**: `008-vendor-management`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Build a comprehensive vendor management interface for wedding consultants to track vendors, contracts, and payments."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Search Vendors (Priority: P1)

As a wedding consultant, I need to view all vendors for a wedding in an organized card grid so I can quickly scan and find the vendors I need to manage.

**Why this priority**: This is the foundational capability - users must be able to see their vendors before they can manage them. Without this, no other functionality is useful.

**Independent Test**: Can be fully tested by navigating to a wedding's vendor page and verifying the card grid displays with search and filter functionality working correctly.

**Acceptance Scenarios**:

1. **Given** I am on a wedding's vendor page with 6 vendors, **When** the page loads, **Then** I see a card grid with 3 columns on desktop showing all 6 vendor cards with type icon, company name, contact name, contract status badge, and payment status badge

2. **Given** I am viewing vendors on a mobile device, **When** the page loads, **Then** the card grid displays in a single column layout

3. **Given** I have 10 vendors and I type "Photo" in the search box, **When** 300ms passes after I stop typing, **Then** only vendors with "Photo" in their company name or contact name are displayed

4. **Given** I have vendors of various types, **When** I select "Photography" from the type filter, **Then** only photography vendors are displayed

5. **Given** I have vendors with different contract statuses, **When** I select "Expiring Soon" from the contract status filter, **Then** only vendors with contracts expiring within 30 days are displayed

6. **Given** I have no vendors matching my search criteria, **When** I search for "NonexistentVendor", **Then** I see an empty state message indicating no vendors match the search

---

### User Story 2 - Add New Vendor (Priority: P1)

As a wedding consultant, I need to add new vendors to a wedding with their basic info, contract details, and banking information so I can track all vendor relationships in one place.

**Why this priority**: Adding vendors is a core capability alongside viewing - without the ability to add vendors, the system has no value.

**Independent Test**: Can be fully tested by clicking the "Add Vendor" button, filling out the modal form, and verifying the vendor appears in the list.

**Acceptance Scenarios**:

1. **Given** I am on the vendor list page, **When** I click "Add Vendor" button, **Then** a modal opens with 3 tabs: Basic Info, Contract Details, Banking Information

2. **Given** I am on the Basic Info tab, **When** I fill in vendor_type (select), company_name (text), and contact_name (text), **Then** these required fields are validated and I can proceed

3. **Given** I am on the Contract Details tab and contract_signed is unchecked, **When** I view the form, **Then** contract date, expiry date, value, and other contract fields are hidden

4. **Given** I am on the Contract Details tab and I check contract_signed, **When** the checkbox is checked, **Then** contract date, expiry date, contract value, cancellation policy, cancellation fee percentage, insurance required, and insurance verified fields become visible

5. **Given** I have filled all required fields (vendor_type, company_name, contact_name), **When** I click Save, **Then** the vendor is created, the modal closes, and the vendor appears in the list with appropriate status badges

6. **Given** I have not filled all required fields, **When** I click Save, **Then** validation errors appear on the required fields and the form does not submit

---

### User Story 3 - Edit Existing Vendor (Priority: P2)

As a wedding consultant, I need to edit vendor information so I can keep vendor records current as details change.

**Why this priority**: Editing is essential for maintenance but users can create vendors correctly the first time - this supports ongoing management.

**Independent Test**: Can be fully tested by clicking a vendor's edit button, modifying data, saving, and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** I have an existing vendor, **When** I click the edit icon on their card, **Then** a modal opens pre-populated with all current vendor data across all 3 tabs

2. **Given** I am editing a vendor with a signed contract, **When** the modal opens, **Then** the Contract Details tab shows all contract fields populated with existing values

3. **Given** I am editing a vendor, **When** I change the company name and click Save, **Then** the vendor card updates to show the new company name

4. **Given** I am editing a vendor, **When** I clear a required field and try to save, **Then** validation errors appear and changes are not saved

---

### User Story 4 - Delete Vendor (Priority: P2)

As a wedding consultant, I need to delete vendors I no longer need so I can keep my vendor list clean and relevant.

**Why this priority**: Deletion is important for data hygiene but is used less frequently than viewing, adding, and editing.

**Independent Test**: Can be fully tested by clicking delete on a vendor, confirming in the dialog, and verifying the vendor is removed.

**Acceptance Scenarios**:

1. **Given** I have an existing vendor, **When** I click the delete icon on their card, **Then** a confirmation dialog appears warning that this will delete the vendor and all related records (contacts, payments, invoices)

2. **Given** the confirmation dialog is open, **When** I click "Cancel", **Then** the dialog closes and the vendor remains in the list

3. **Given** the confirmation dialog is open, **When** I click "Delete", **Then** the vendor and all related records are deleted and the vendor disappears from the list

---

### User Story 5 - View Vendor Details (Priority: P2)

As a wedding consultant, I need to view detailed information about a vendor on a dedicated page so I can see all vendor information in context.

**Why this priority**: Detail views enhance usability but users can function with card-level information initially.

**Independent Test**: Can be fully tested by clicking a vendor card and verifying the detail page loads with correct tabs and information.

**Acceptance Scenarios**:

1. **Given** I am on the vendor list page, **When** I click on a vendor card (not the edit/delete icons), **Then** I navigate to the vendor detail page at /weddings/:weddingId/vendors/:vendorId

2. **Given** I am on the vendor detail page, **When** the page loads, **Then** I see a tabbed interface with tabs: Overview, Contract, Payments, Invoices

3. **Given** I am on the Overview tab, **When** I view the content, **Then** I see the vendor's basic information (type, company name, contact details, address, website) and banking information (bank name, account details, branch/swift codes)

4. **Given** I am on the Contract tab, **When** I view the content, **Then** I see contract status, contract dates, contract value, cancellation policy, cancellation fee, and insurance information

5. **Given** I click on the Payments tab, **When** I view the content, **Then** I see a placeholder message: "Payment schedule management coming in Phase 7B"

6. **Given** I click on the Invoices tab, **When** I view the content, **Then** I see a placeholder message: "Invoice management coming in Phase 7B"

---

### User Story 6 - Filter Vendors (Priority: P3)

As a wedding consultant, I need to filter vendors by multiple criteria so I can quickly find vendors in specific states.

**Why this priority**: Filtering enhances efficiency but users can find vendors through search and scrolling initially.

**Independent Test**: Can be fully tested by applying various filter combinations and verifying correct vendors are displayed.

**Acceptance Scenarios**:

1. **Given** I have vendors of different types, **When** I open the type filter dropdown, **Then** I see options including: Catering, Photography, Flowers, Venue, Music/DJ, Video, Decor, Transportation, Officiant, Hair/Makeup, Rentals, Other

2. **Given** I have vendors with different contract statuses, **When** I open the contract status filter, **Then** I see options: All, Signed, Unsigned, Expiring Soon, Expired

3. **Given** I have vendors with different payment statuses, **When** I open the payment status filter, **Then** I see options: All, Paid, Pending, Overdue, Due Soon

4. **Given** I have multiple filters active (type: Photography, contract: Signed), **When** I view the results, **Then** only photography vendors with signed contracts are displayed

5. **Given** I have filters active, **When** I click "Clear Filters" button, **Then** all filters reset and all vendors are displayed

---

### Edge Cases

- What happens when a wedding has no vendors? Display an empty state with illustration and "Add your first vendor" call-to-action
- What happens when a vendor has no contract (contract_signed = false)? Display "Unsigned" badge in yellow
- What happens when contract_expiry_date is null but contract_signed is true? Display "Signed" badge in green (no expiry concern)
- What happens when a user deletes a vendor with associated contacts, payments, and invoices? All cascade delete - confirmation dialog explicitly warns user
- What happens when search term matches both company_name and contact_name? Display the vendor once (not duplicated)
- How does the system handle special characters in search? Search is performed as-is, matching literal characters
- What happens when vendor banking information contains sensitive data? Display masked account number showing only last 4 digits on cards (full details on detail page)

## Requirements *(mandatory)*

### Functional Requirements

**Vendor List View**
- **FR-001**: System MUST display vendors in a responsive card grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- **FR-002**: Each vendor card MUST display: vendor type icon, company name, contact name, contract status badge, and payment status badge
- **FR-003**: System MUST support real-time search filtering with 300ms debounce on company_name and contact_name fields (case-insensitive, partial match)
- **FR-004**: System MUST provide filter dropdowns for: vendor type, contract status, and payment status
- **FR-005**: System MUST display appropriate empty state when no vendors exist or no vendors match filter/search criteria

**Vendor CRUD Operations**
- **FR-006**: System MUST provide a modal form for creating new vendors with 3 tabs: Basic Info, Contract Details, Banking Information
- **FR-007**: System MUST require vendor_type, company_name, and contact_name fields; all other fields are optional
- **FR-008**: System MUST conditionally show contract fields (contract_date, contract_expiry_date, contract_value, cancellation_policy, cancellation_fee_percentage, insurance fields) only when contract_signed checkbox is checked
- **FR-009**: System MUST pre-populate the edit modal with existing vendor data when editing
- **FR-010**: System MUST display a confirmation dialog before deleting a vendor, explicitly warning about cascade deletion of related records
- **FR-011**: Vendor deletion MUST cascade to related vendor_contacts, vendor_payment_schedule, and vendor_invoices records

**Status Badge Display**
- **FR-012**: Contract status badge MUST display as: "Unsigned" (yellow) when contract_signed is false; "Expired" (red) when contract_expiry_date < today; "Expiring Soon" (orange) when contract_expiry_date - today <= 30 days; "Signed" (green) otherwise
- **FR-013**: Payment status badge MUST display as "Pending" (blue) as a placeholder for Phase 7A (actual calculation deferred to Phase 7B)

**Vendor Detail Page**
- **FR-014**: System MUST provide a vendor detail page at route /weddings/:weddingId/vendors/:vendorId
- **FR-015**: Vendor detail page MUST display tabbed interface with: Overview, Contract, Payments, Invoices tabs
- **FR-016**: Overview tab MUST display basic vendor information and banking details
- **FR-017**: Contract tab MUST display all contract-related fields and insurance information
- **FR-018**: Payments and Invoices tabs MUST display placeholder messages indicating "Coming in Phase 7B"

**Data Validation**
- **FR-019**: System MUST validate email format for contact_email field when provided
- **FR-020**: System MUST validate that contract_value and cancellation_fee_percentage are non-negative numbers when provided
- **FR-021**: System MUST validate that contract_expiry_date is after contract_date when both are provided

### Key Entities

- **Vendor**: Represents a service provider for a wedding (caterer, photographer, florist, etc.). Contains basic contact information, contract details, banking information, and metadata. Each vendor belongs to exactly one wedding.

- **VendorType**: Classification of vendor services (Catering, Photography, Flowers, Venue, Music/DJ, Video, Decor, Transportation, Officiant, Hair/Makeup, Rentals, Other). Stored as text field on vendor record.

- **Contract Status**: Derived state based on contract_signed boolean and contract_expiry_date. Not stored, calculated at display time. Possible states: Unsigned, Signed, Expiring Soon (within 30 days), Expired.

- **Payment Status**: Derived state based on vendor_payment_schedule records. For Phase 7A, always displays as "Pending" placeholder. Actual states in Phase 7B: Paid in Full, Overdue, Due Soon (within 7 days), Pending.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all vendors for a wedding within 2 seconds of page load
- **SC-002**: Users can add a new vendor (filling all 3 tabs) in under 3 minutes
- **SC-003**: Search results appear within 500ms of user stopping typing (including 300ms debounce)
- **SC-004**: Users can identify vendors needing attention (expiring contracts, overdue payments) at a glance through badge colors
- **SC-005**: 95% of users can successfully find a specific vendor using search or filters on first attempt
- **SC-006**: Zero data loss when editing or deleting vendors (proper cascade behavior)
- **SC-007**: Vendor detail page loads within 1 second of navigation
- **SC-008**: Modal forms provide clear validation feedback, with users able to correct errors without losing entered data

## Assumptions

- Database tables (vendors, vendor_contacts, vendor_payment_schedule, vendor_invoices) already exist with RLS policies configured
- Wedding ID is available from route parameters
- User authentication is handled by existing auth system
- Badge colors follow the design system: Success #4CAF50, Warning #FF9800, Error #F44336, Info #2196F3
- Standard vendor types cover majority of use cases; "Other" handles edge cases
- 30-day threshold for "Expiring Soon" is appropriate for wedding planning timeline
- Banking information display on cards shows masked account numbers for security

## Scope Boundaries

### In Scope (Phase 7A)
- Vendor list page with card grid
- Search and filter functionality
- Vendor create/edit/delete operations
- Vendor detail page with Overview and Contract tabs
- Contract status badge calculation
- Payment status placeholder badge

### Out of Scope (Deferred to Phase 7B)
- Payment schedule management (CRUD for vendor_payment_schedule)
- Invoice management (CRUD for vendor_invoices)
- Additional contacts management (CRUD for vendor_contacts)
- Actual payment status calculation from payment_schedule data
- Payment/Invoice tabs functional implementation
- Document upload for contracts
- Vendor communication history
- Vendor ratings or reviews

## Dependencies

- Existing database schema from Phase 1 (vendors, vendor_contacts, vendor_payment_schedule, vendor_invoices tables)
- Navigation shell from Phase 5 for routing integration
- Existing design system components (cards, badges, modals, forms, tabs)
- Wedding context/selection from existing wedding management features
