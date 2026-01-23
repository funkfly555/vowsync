# Feature Specification: Vendor Card Expandable

**Feature Branch**: `028-vendor-card-expandable`
**Created**: 2026-01-23
**Status**: Draft
**Input**: User description: "Vendors Card Expandable - Expandable vendor cards with tabs matching Guests page pattern"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Vendor Summary in Collapsed Card (Priority: P1)

As a wedding consultant, I want to see essential vendor information at a glance without expanding the card, so I can quickly scan my vendor list and identify which vendors need attention.

**Why this priority**: This is the foundation of the feature - users must be able to see meaningful data in the collapsed state before any expanded functionality matters. Provides immediate value by replacing the current basic card view.

**Independent Test**: Can be fully tested by loading the vendors page in Card View and verifying that each collapsed card displays company name, vendor type badge, contact name, contract status badge, and payment summary without any interaction required.

**Acceptance Scenarios**:

1. **Given** a list of vendors exists, **When** I view the Vendors page in Card View, **Then** I see each vendor displayed as a collapsed card showing company name (large, bold), vendor type badge, contact name, contract status badge (Signed/Expiring/Unsigned), and payment status summary (e.g., "2 of 3 paid").

2. **Given** I am viewing collapsed vendor cards, **When** I look at a vendor with a signed contract expiring within 30 days, **Then** I see an "Expiring" badge with appropriate visual warning indicator.

3. **Given** I am viewing collapsed vendor cards, **When** I look at a vendor with unsigned contract, **Then** I see an "Unsigned" badge with appropriate visual warning indicator.

---

### User Story 2 - Expand/Collapse Individual Cards (Priority: P1)

As a wedding consultant, I want to click on a vendor card to expand it and see detailed information organized in tabs, so I can review and edit vendor details without navigating to a separate page.

**Why this priority**: Core interaction pattern that enables inline editing. Without this, the expandable card feature has no value.

**Independent Test**: Can be fully tested by clicking on a collapsed card and verifying it expands to show 5 tabs, then clicking the card/chevron again to collapse it.

**Acceptance Scenarios**:

1. **Given** I am viewing collapsed vendor cards, **When** I click on a card or its chevron button, **Then** the card expands smoothly (0.2s transition) to reveal 5 tabs: Overview, Contract, Payments, Invoices, Contacts.

2. **Given** a vendor card is expanded, **When** I click on the card header or chevron button, **Then** the card collapses smoothly back to its summary state.

3. **Given** multiple vendor cards exist, **When** I expand one card, **Then** other cards remain in their current state (independent expand/collapse).

4. **Given** I expand a card and switch tabs, **When** I collapse and re-expand the same card, **Then** the default tab (Overview) is shown.

---

### User Story 3 - Edit Vendor Details Inline (Priority: P1)

As a wedding consultant, I want to edit vendor fields directly within the expanded card tabs, so I can make quick updates without navigating away from the list view.

**Why this priority**: Inline editing is the primary productivity gain of this feature. It eliminates the need to navigate to a separate detail page for simple changes.

**Independent Test**: Can be fully tested by expanding a card, editing a field (e.g., contact email), and verifying the change saves automatically with visual feedback.

**Acceptance Scenarios**:

1. **Given** a vendor card is expanded on the Overview tab, **When** I edit the contact email field and blur/tab away, **Then** the change auto-saves with optimistic update and shows save status indicator.

2. **Given** I am editing a field with invalid data (e.g., malformed email), **When** I blur the field, **Then** I see a validation error message and the save is prevented.

3. **Given** I make a valid edit that fails to save, **When** the server returns an error, **Then** the optimistic update is rolled back and an error message is displayed.

4. **Given** I am editing fields across multiple expanded cards, **When** each card saves, **Then** each card shows its own independent save status.

---

### User Story 4 - Bulk Expand/Collapse All Cards (Priority: P2)

As a wedding consultant, I want to expand or collapse all vendor cards at once, so I can either see all details or get a compact overview quickly.

**Why this priority**: Convenience feature that improves workflow efficiency but is not essential for core functionality.

**Independent Test**: Can be fully tested by clicking "Expand All" and verifying all cards expand, then clicking "Collapse All" and verifying all cards collapse.

**Acceptance Scenarios**:

1. **Given** all vendor cards are collapsed, **When** I click "Expand All", **Then** all visible cards expand simultaneously.

2. **Given** all vendor cards are expanded, **When** I click "Collapse All", **Then** all cards collapse simultaneously.

3. **Given** some cards are expanded and some collapsed, **When** I click "Expand All", **Then** the button shows "Collapse All" and all cards are now expanded.

---

### User Story 5 - Select Vendors in Both States (Priority: P2)

As a wedding consultant, I want to select vendors using checkboxes regardless of whether their cards are collapsed or expanded, so I can perform bulk actions on my selection.

**Why this priority**: Selection functionality already exists in current implementation; this ensures it works correctly with the new expandable pattern.

**Independent Test**: Can be fully tested by selecting vendors in collapsed state, expanding some cards, and verifying selection state persists.

**Acceptance Scenarios**:

1. **Given** vendor cards are displayed, **When** I click the checkbox on a collapsed card, **Then** the vendor is selected and the card shows selected styling (dusty rose highlight).

2. **Given** a vendor card is expanded, **When** I click the checkbox, **Then** the vendor is selected and the entire expanded card shows selected styling.

3. **Given** I have selected vendors in collapsed state, **When** I expand those cards, **Then** they remain selected with expanded selected styling.

---

### User Story 6 - View and Manage Payments Tab (Priority: P2)

As a wedding consultant, I want to see payment schedules for a vendor in the Payments tab and mark payments as paid, so I can track payment progress inline.

**Why this priority**: Payments are critical for vendor management, but this tab builds on the existing payment management infrastructure.

**Independent Test**: Can be fully tested by expanding a card, navigating to Payments tab, viewing the payment schedule table, and marking a payment as paid.

**Acceptance Scenarios**:

1. **Given** a vendor card is expanded, **When** I click the Payments tab, **Then** I see a table showing payment milestones with columns: Milestone, Due Date, Amount, Status.

2. **Given** the Payments tab shows unpaid payments, **When** I click "Mark as Paid" action on a payment, **Then** the payment status updates optimistically and a success indicator appears.

3. **Given** the Payments tab is displayed, **When** I view the footer, **Then** I see a summary showing total paid vs total contract value.

---

### User Story 7 - View and Manage Invoices Tab (Priority: P2)

As a wedding consultant, I want to see invoices for a vendor in the Invoices tab and manage their status, so I can track billing inline.

**Why this priority**: Similar to Payments, invoices are important but leverage existing infrastructure.

**Independent Test**: Can be fully tested by expanding a card, navigating to Invoices tab, viewing the invoice table, and marking an invoice as paid.

**Acceptance Scenarios**:

1. **Given** a vendor card is expanded, **When** I click the Invoices tab, **Then** I see a table showing invoices with columns: Invoice #, Date, Due Date, Amount, VAT, Total, Status.

2. **Given** the Invoices tab shows unpaid invoices, **When** I click "Mark as Paid" action, **Then** the invoice status updates optimistically.

3. **Given** the Invoices tab is displayed, **When** I view the footer, **Then** I see a total invoices amount.

---

### User Story 8 - View and Manage Contacts Tab (Priority: P3)

As a wedding consultant, I want to see additional contacts for a vendor in the Contacts tab, so I can track multiple contact persons per vendor.

**Why this priority**: Less frequently used than Overview/Contract/Payments, as many vendors have a single contact.

**Independent Test**: Can be fully tested by expanding a card, navigating to Contacts tab, viewing the contacts table.

**Acceptance Scenarios**:

1. **Given** a vendor card is expanded, **When** I click the Contacts tab, **Then** I see a table showing contacts with columns: Name, Role, Email, Phone, Primary, On-site.

2. **Given** the Contacts tab shows contacts, **When** I identify the primary contact, **Then** I see a visual indicator distinguishing the primary contact.

---

### Edge Cases

- What happens when a vendor has no payments, invoices, or contacts? (Empty state messages in respective tabs)
- What happens when the contract expiry date is in the past? (Show "Expired" badge)
- What happens when editing fails due to network issues? (Show error, rollback optimistic update, allow retry)
- What happens when contract value is edited to negative number? (Validation prevents save)
- What happens when user rapidly expands/collapses cards? (Animations complete gracefully, no visual glitches)
- What happens when filtering vendors while some cards are expanded? (Expanded state resets on filter change)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display vendor cards in a collapsed state showing: checkbox, company name (large, bold), vendor type badge, contact name, contract status badge, payment status summary, and expand/collapse chevron.

- **FR-002**: System MUST expand cards in-place when user clicks the card or chevron, revealing 5 tabs: Overview, Contract, Payments, Invoices, Contacts.

- **FR-003**: System MUST allow individual cards to be expanded/collapsed independently of other cards.

- **FR-004**: System MUST provide "Expand All" and "Collapse All" buttons that control all visible cards simultaneously.

- **FR-005**: System MUST track expanded card state using Set<string> of vendor IDs for O(1) lookup performance.

- **FR-006**: System MUST maintain selection state (checkboxes) in both collapsed and expanded states.

- **FR-007**: System MUST display the Overview tab with editable fields: vendor type, company name, contact name, contact email, contact phone, address, website, status dropdown, and notes textarea.

- **FR-008**: System MUST display the Contract tab with editable fields: contract signed checkbox, contract date, contract expiry date, contract value (currency), cancellation policy, cancellation fee percentage, insurance required checkbox, insurance verified checkbox, insurance expiry date.

- **FR-009**: System MUST display the Payments tab with a table of vendor_payment_schedule records showing: Milestone, Due Date, Amount, Status, plus "Mark as Paid" action and total summary.

- **FR-010**: System MUST display the Invoices tab with a table of vendor_invoices records showing: Invoice #, Date, Due Date, Amount, VAT, Total, Status, plus "Mark as Paid" action and total summary.

- **FR-011**: System MUST display the Contacts tab with a table of vendor_contacts records showing: Name, Role, Email, Phone, Primary indicator, On-site indicator.

- **FR-012**: System MUST auto-save changes with optimistic updates and display save status: idle, saving, saved, error.

- **FR-013**: System MUST validate fields according to business rules: required fields (vendor_type, company_name, contact_name), contract expiry >= contract date, positive values for contract value and cancellation fee percentage, valid email format.

- **FR-014**: System MUST mask account number display showing only last 4 digits (****1234).

- **FR-015**: System MUST animate expand/collapse transitions with 0.2s ease timing.

- **FR-016**: System MUST apply dusty rose highlight (#D4A5A5/10) to selected cards in both collapsed and expanded states.

### Key Entities

- **Vendor**: Core entity with 27 fields including basic info, contract details, insurance info, and banking. One-to-many relationships with VendorPaymentSchedule, VendorInvoice, and VendorContact.

- **VendorPaymentSchedule**: Payment milestones with status tracking (pending, paid, overdue, cancelled). Displayed in Payments tab.

- **VendorInvoice**: Billing records with amount, VAT, total, and status. Displayed in Invoices tab.

- **VendorContact**: Additional contact persons per vendor with primary/on-site flags. Displayed in Contacts tab.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can expand a vendor card and access all 5 tabs within 2 seconds of clicking.

- **SC-002**: Users can complete a vendor field edit (change + save confirmation) in under 3 seconds.

- **SC-003**: "Expand All" with 20 vendors completes visually within 500ms.

- **SC-004**: Inline edits persist correctly 100% of the time when network is available.

- **SC-005**: Validation errors display immediately (within 100ms) when invalid data is entered.

- **SC-006**: Card view renders correctly and matches the established Guest page expandable card pattern.

- **SC-007**: All animations complete smoothly at 60fps without visual stuttering.

- **SC-008**: Save status indicator reflects actual save state accurately (no false positives/negatives).

## Design References

### Visual Specifications

- Card border-radius: 8px
- Card padding: 24px
- Card shadow (default): 0 2px 8px rgba(0,0,0,0.08)
- Card shadow (hover): 0 4px 12px rgba(0,0,0,0.12)
- Brand colors: #D4A5A5 (dusty rose primary), #4CAF50 (success green)
- Selection highlight: bg-[#D4A5A5]/10 (10% opacity dusty rose)
- Tab styling: underline on active tab, gray text on inactive tabs
- Transition timing: 0.2s ease for all animations

### Pattern References

- Follow CARD-TABLE-VIEW-PATTERN.md Section 3 (Card View Pattern)
- Match GuestCardCollapsed.tsx and GuestCardExpanded.tsx component structure
- Reuse AutoSaveIndicator pattern from GuestCardExpanded.tsx

## Assumptions

- Database tables (vendors, vendor_contacts, vendor_payment_schedule, vendor_invoices) already exist with RLS policies
- Existing VendorCard.tsx will be replaced completely with new expandable implementation
- VendorsPage.tsx already has Card View / Table View toggle from Feature 027
- Existing badge components (ContractStatusBadge, PaymentStatusBadge) can be reused
- TanStack Query hooks for vendor data already exist (useVendors, useUpdateVendor)

## Out of Scope

- Drag-and-drop card reordering
- Quick actions menu on card
- Card filtering by expanded/collapsed state
- Adding new payment schedules inline (redirect to existing flow)
- Adding new invoices inline (redirect to existing flow)
- Adding new contacts inline (redirect to existing flow)
- Editing/deleting payments, invoices, contacts inline (view only with status actions)
