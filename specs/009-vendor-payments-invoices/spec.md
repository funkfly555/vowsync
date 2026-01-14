# Feature Specification: Vendor Payments & Invoices (Phase 7B)

**Feature Branch**: `009-vendor-payments-invoices`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Phase 7B: Vendor Payments & Invoices - Track vendor payment schedules and invoices"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Payment Schedule (Priority: P1) 🎯 MVP

As a wedding consultant, I need to view all payment milestones for a vendor so I can track upcoming payments and ensure nothing is missed.

**Why this priority**: Payment visibility is the core value of this feature - consultants need to see what's due before they can act on it.

**Independent Test**: Navigate to vendor detail page, click Payments tab, verify payment schedule table displays with correct status badges and amounts.

**Acceptance Scenarios**:

1. **Given** a vendor with payment milestones, **When** I navigate to the Payments tab, **Then** I see a table with description, due date, amount, and status for each payment
2. **Given** payment milestones with various due dates, **When** I view the payments table, **Then** payments are sorted by due date ascending (nearest first)
3. **Given** a payment due within 7 days, **When** I view the payments table, **Then** the status badge shows "Due Soon" in orange
4. **Given** a payment past its due date and not paid, **When** I view the payments table, **Then** the status badge shows "Overdue" in red

---

### User Story 2 - Add Payment Milestone (Priority: P1) 🎯 MVP

As a wedding consultant, I need to add payment milestones to a vendor's schedule so I can track deposits, installments, and final payments.

**Why this priority**: Creating payment records is essential for tracking - without this, consultants cannot use the payment feature.

**Independent Test**: Click "Add Payment" button, fill form with description, due date, and amount, save, verify new payment appears in table.

**Acceptance Scenarios**:

1. **Given** I am on the vendor Payments tab, **When** I click "Add Payment", **Then** a modal opens with fields for description, due_date, amount_due, and notes
2. **Given** I fill in required fields (description, due_date, amount_due), **When** I click Save, **Then** the payment is created and appears in the table
3. **Given** I leave required fields empty, **When** I try to save, **Then** validation errors are displayed for missing fields
4. **Given** a new payment is created, **When** it appears in the table, **Then** its status is automatically calculated based on due_date

---

### User Story 3 - Mark Payment as Paid (Priority: P1) 🎯 MVP

As a wedding consultant, I need to mark payments as paid with the actual payment date so I can track what has been completed.

**Why this priority**: Completing payments is the primary action consultants take - this closes the loop on payment tracking.

**Independent Test**: Click "Mark as Paid" on a pending payment, enter payment date and optional payment method, save, verify status changes to "Paid".

**Acceptance Scenarios**:

1. **Given** a payment with status "Pending" or "Due Soon", **When** I click "Mark as Paid", **Then** a dialog opens asking for payment_date and optional payment_method
2. **Given** I enter a payment date, **When** I confirm, **Then** the payment's paid_date is set and status becomes "Paid" (green badge)
3. **Given** a payment is marked as paid, **When** I view the table, **Then** the "Mark as Paid" action is replaced with "View Receipt" placeholder
4. **Given** a payment with status "Paid", **When** I view the vendor detail page overview, **Then** the payment status badge reflects accurate paid/pending counts

---

### User Story 4 - Edit Payment Milestone (Priority: P2)

As a wedding consultant, I need to edit payment details when dates or amounts change so I can keep records accurate.

**Why this priority**: Modifications happen frequently as vendor negotiations evolve, but viewing and adding comes first.

**Independent Test**: Click edit icon on a payment row, modify fields, save, verify changes persist in the table.

**Acceptance Scenarios**:

1. **Given** a pending payment, **When** I click the edit icon, **Then** a modal opens pre-populated with current values
2. **Given** I modify the amount_due, **When** I save, **Then** the table reflects the updated amount
3. **Given** a paid payment, **When** I try to edit, **Then** I can only edit notes (description, amount, date are read-only)

---

### User Story 5 - Delete Payment Milestone (Priority: P2)

As a wedding consultant, I need to delete payment milestones that were entered incorrectly so I can maintain accurate records.

**Why this priority**: Error correction is important but less frequent than adding/viewing payments.

**Independent Test**: Click delete icon on a payment row, confirm in dialog, verify payment is removed from table.

**Acceptance Scenarios**:

1. **Given** a pending payment, **When** I click the delete icon, **Then** a confirmation dialog appears
2. **Given** I confirm deletion, **When** the dialog closes, **Then** the payment is removed from the table
3. **Given** a paid payment, **When** I try to delete, **Then** I see a warning that paid payments should not be deleted (soft block)

---

### User Story 6 - View Invoices (Priority: P2)

As a wedding consultant, I need to view all invoices from a vendor so I can track billing and payments owed.

**Why this priority**: Invoice tracking complements payment tracking but is secondary to the core payment schedule feature.

**Independent Test**: Navigate to vendor detail page, click Invoices tab, verify invoice table displays with amounts and status.

**Acceptance Scenarios**:

1. **Given** a vendor with invoices, **When** I navigate to the Invoices tab, **Then** I see a table with invoice_number, issue_date, due_date, subtotal, vat_amount, total_amount, and status
2. **Given** invoices with various statuses, **When** I view the table, **Then** appropriate status badges are displayed (Draft, Sent, Paid, Overdue, Cancelled)
3. **Given** an invoice past due_date and not paid, **When** I view the table, **Then** the status badge shows "Overdue" in red

---

### User Story 7 - Add/Edit Invoice (Priority: P2)

As a wedding consultant, I need to create and edit invoices for vendor services so I can track what I owe each vendor.

**Why this priority**: Invoice management enables complete financial tracking but builds on payment foundation.

**Independent Test**: Click "Add Invoice", fill form, save, verify invoice appears in table with calculated VAT.

**Acceptance Scenarios**:

1. **Given** I am on the Invoices tab, **When** I click "Add Invoice", **Then** a modal opens with fields for invoice_number, issue_date, due_date, subtotal, vat_rate, notes
2. **Given** I enter subtotal and vat_rate, **When** I view the form, **Then** vat_amount and total_amount are auto-calculated
3. **Given** required fields are filled, **When** I save, **Then** the invoice is created with status "Draft"
4. **Given** an existing invoice, **When** I click edit, **Then** the modal opens pre-populated for editing

---

### User Story 8 - View Vendor Contacts (Priority: P3)

As a wedding consultant, I need to view additional contacts for a vendor so I can reach the right person for different matters.

**Why this priority**: Multiple contacts is a nice-to-have feature that extends vendor detail completeness.

**Independent Test**: Navigate to vendor Contacts tab (or section), verify contact list displays with name, role, email, phone.

**Acceptance Scenarios**:

1. **Given** a vendor with additional contacts, **When** I navigate to the Contacts section, **Then** I see a list of contacts with contact_name, role, email, phone
2. **Given** no additional contacts, **When** I view the section, **Then** I see an empty state with "Add Contact" prompt

---

### User Story 9 - Manage Vendor Contacts (Priority: P3)

As a wedding consultant, I need to add, edit, and delete vendor contacts so I can maintain accurate contact information.

**Why this priority**: Contact CRUD is a supporting feature that doesn't block core payment/invoice functionality.

**Independent Test**: Add a new contact, edit their role, delete them, verify all operations persist.

**Acceptance Scenarios**:

1. **Given** I click "Add Contact", **When** I fill contact_name and email, **Then** the contact is added to the vendor
2. **Given** an existing contact, **When** I click edit, **Then** I can modify their details
3. **Given** an existing contact, **When** I click delete, **Then** a confirmation appears before removal

---

### Edge Cases

- What happens when a payment due_date is today? → Shows "Due Soon" status
- What happens when payment amount_paid differs from amount_due? → Store both, show difference if partial payment
- How does system handle negative VAT rate? → Validation prevents negative values
- What happens when invoice is marked paid but linked payments aren't? → Allow independent tracking (invoice ≠ payment schedule)
- How does system handle currency formatting? → Use South African Rand (ZAR) formatting with R prefix

## Requirements *(mandatory)*

### Functional Requirements

#### Payment Schedule Requirements

- **FR-001**: System MUST display payment milestones in a table with columns: description, due_date, amount_due, amount_paid, status
- **FR-002**: System MUST automatically calculate payment status based on: paid_date, due_date, and current date
- **FR-003**: System MUST allow CRUD operations on payment milestones (create, read, update, delete)
- **FR-004**: System MUST prevent editing amount/date on paid payments (only notes editable)
- **FR-005**: System MUST display "Mark as Paid" action for pending/due soon/overdue payments
- **FR-006**: System MUST capture payment_date and optional payment_method when marking as paid
- **FR-007**: System MUST sort payments by due_date ascending (nearest due first)

#### Payment Status Logic

- **FR-008**: Status "Paid" (green) when paid_date is not null
- **FR-009**: Status "Cancelled" (gray) when status field is 'cancelled'
- **FR-010**: Status "Overdue" (red) when due_date < today AND not paid
- **FR-011**: Status "Due Soon" (orange) when due_date within 7 days AND not paid AND not overdue
- **FR-012**: Status "Pending" (blue) when due_date > 7 days away AND not paid

#### Invoice Requirements

- **FR-013**: System MUST display invoices in a table with: invoice_number, issue_date, due_date, subtotal, vat_amount, total_amount, status
- **FR-014**: System MUST auto-calculate vat_amount = subtotal × (vat_rate / 100)
- **FR-015**: System MUST auto-calculate total_amount = subtotal + vat_amount
- **FR-016**: System MUST allow CRUD operations on invoices
- **FR-017**: System MUST support invoice statuses: Draft, Sent, Paid, Overdue, Cancelled

#### Invoice Status Logic

- **FR-018**: Status "Draft" (gray) when newly created
- **FR-019**: Status "Sent" (blue) when marked as sent to vendor
- **FR-020**: Status "Paid" (green) when paid_date is set
- **FR-021**: Status "Overdue" (red) when due_date < today AND status not in (Paid, Cancelled)
- **FR-022**: Status "Cancelled" (gray) when explicitly cancelled

#### Vendor Contacts Requirements

- **FR-023**: System MUST display vendor contacts with: contact_name, role, email, phone, is_primary
- **FR-024**: System MUST allow CRUD operations on vendor contacts
- **FR-025**: System MUST mark one contact as primary (is_primary = true)
- **FR-026**: System MUST prevent deleting the only/primary contact without reassigning

### Key Entities *(existing in database)*

- **VendorPaymentSchedule**: Payment milestones for a vendor (vendor_id, description, due_date, amount_due, amount_paid, paid_date, payment_method, status, notes)
- **VendorInvoice**: Invoices from vendor (vendor_id, invoice_number, issue_date, due_date, subtotal, vat_rate, vat_amount, total_amount, status, notes, file_url)
- **VendorContact**: Additional contacts for vendor (vendor_id, contact_name, role, email, phone, is_primary)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Consultants can view all payment milestones for a vendor within 2 seconds of navigating to Payments tab
- **SC-002**: Payment status badges accurately reflect current status based on dates (100% accuracy)
- **SC-003**: Consultants can add a new payment milestone in under 30 seconds
- **SC-004**: Consultants can mark a payment as paid in under 10 seconds (2 clicks + date entry)
- **SC-005**: Invoice VAT calculations are accurate to 2 decimal places
- **SC-006**: All payment/invoice operations provide immediate visual feedback (loading states, success/error toasts)
- **SC-007**: Phase 7B integrates seamlessly with Phase 7A vendor detail page (no regressions)

### Definition of Done

- [ ] Payment schedule table displays on Payments tab with correct status badges
- [ ] Add/Edit payment modal functions with validation
- [ ] Mark as Paid dialog captures payment date
- [ ] Delete payment with confirmation
- [ ] Invoice table displays on Invoices tab
- [ ] Add/Edit invoice modal with VAT auto-calculation
- [ ] Vendor contacts section with CRUD operations
- [ ] All operations have loading states and error handling
- [ ] Manual E2E testing passes for all user stories
