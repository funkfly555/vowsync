# Feature Specification: Vendor Invoice Payment Integration

**Feature Branch**: `010-invoice-payment-integration`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "Link invoices to payments with proper workflow and totals so wedding consultants can track which invoices have been paid and see accurate financial summaries."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pay an Invoice (Priority: P1)

As a wedding consultant, I want to pay an invoice directly from the Invoices tab so that the payment is automatically linked to that invoice and I don't have to manually track the relationship.

**Why this priority**: This is the core value proposition - linking invoices to payments is the primary workflow gap being addressed. Without this, invoices and payments remain disconnected.

**Independent Test**: Can be fully tested by creating an invoice, clicking "Pay This Invoice", completing the payment, and verifying the invoice status updates to "paid" - delivers end-to-end invoice payment tracking.

**Acceptance Scenarios**:

1. **Given** an unpaid invoice for R 5,000 exists, **When** I click "Pay This Invoice" button, **Then** a payment form opens with amount pre-filled as R 5,000 and milestone name as "Payment for Invoice INV-001"
2. **Given** I am creating a payment from an invoice, **When** I submit the payment form, **Then** the payment is created and automatically linked to the invoice
3. **Given** a payment linked to an invoice is marked as paid, **When** the total paid equals or exceeds the invoice total, **Then** the invoice status automatically updates to "paid"

---

### User Story 2 - View Financial Summary (Priority: P1)

As a wedding consultant, I want to see a summary of Total Invoiced, Total Paid, and Balance Due for each vendor so I can quickly understand the financial status without manual calculations.

**Why this priority**: Financial visibility is essential for consultants to manage vendor relationships and budget tracking. This enables at-a-glance understanding of payment status.

**Independent Test**: Can be fully tested by adding invoices and payments, then verifying the summary card displays correct totals - delivers immediate financial visibility.

**Acceptance Scenarios**:

1. **Given** a vendor has R 15,000 in total invoices and R 10,000 in paid payments, **When** I view the Invoices or Payments tab, **Then** I see a summary card showing Total Invoiced: R 15,000, Total Paid: R 10,000, Balance Due: R 5,000
2. **Given** no invoices or payments exist for a vendor, **When** I view the financial summary, **Then** all values show R 0.00
3. **Given** all invoices are fully paid, **When** I view the summary, **Then** Balance Due shows R 0.00

---

### User Story 3 - View Invoice Link in Payments (Priority: P2)

As a wedding consultant, I want to see which invoice each payment is for (if linked) so I can trace payments back to their source invoices.

**Why this priority**: Enhances traceability but is not critical for basic workflow - payments can be useful without knowing their linked invoice.

**Independent Test**: Can be fully tested by creating linked and unlinked payments, then verifying the Invoice column shows correct values.

**Acceptance Scenarios**:

1. **Given** a payment is linked to invoice INV-001, **When** I view the Payments tab, **Then** the payment row shows "Invoice #INV-001" in the Invoice column
2. **Given** a payment is not linked to any invoice, **When** I view the Payments tab, **Then** the payment row shows "—" in the Invoice column

---

### User Story 4 - Partial Payment Tracking (Priority: P2)

As a wedding consultant, I want to see when an invoice is partially paid so I know there's still an outstanding balance on that specific invoice.

**Why this priority**: Important for multi-payment scenarios but not blocking basic functionality.

**Independent Test**: Can be fully tested by creating an invoice for R 10,000, paying R 5,000, and verifying the invoice shows "Partially Paid" status.

**Acceptance Scenarios**:

1. **Given** an invoice for R 10,000 has one linked payment of R 5,000 marked as paid, **When** I view the invoice, **Then** status shows "Partially Paid" with orange badge
2. **Given** an invoice for R 10,000 has payments totaling R 10,000+ marked as paid, **When** I view the invoice, **Then** status shows "Paid" with green badge

---

### User Story 5 - Tab Order for Workflow (Priority: P3)

As a wedding consultant, I want to see Invoices tab before Payments tab so the workflow matches my natural process of receiving invoices then making payments.

**Why this priority**: UX improvement but not functionally blocking - users can still use the feature with any tab order.

**Independent Test**: Can be fully tested by navigating to vendor detail page and verifying tab order.

**Acceptance Scenarios**:

1. **Given** I navigate to a vendor detail page, **When** I view the tabs, **Then** they appear in order: Overview, Contract, Invoices, Payments

---

### Edge Cases

- What happens when a payment is marked as paid but no invoice is linked? (Status updates only affect linked invoices)
- What happens when an invoice is deleted that has linked payments? (Payments remain, just no longer linked)
- How does the system handle an overpayment? (Invoice marked as paid, excess is tracked in Balance Due calculation)
- What happens when payment amount is edited after being marked as paid? (Invoice status recalculates based on new total)
- What if an invoice's due date passes while unpaid? (Status becomes "Overdue" with red badge)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST reorder tabs to: Overview, Contract, Invoices, Payments
- **FR-002**: System MUST display "Pay This Invoice" button on all unpaid invoices
- **FR-003**: System MUST pre-fill payment form when creating from invoice (amount = invoice total, milestone name = "Payment for Invoice {invoice_number}")
- **FR-004**: System MUST link newly created payment to the source invoice by setting invoice.payment_schedule_id
- **FR-005**: System MUST automatically update invoice status when linked payment is marked as paid
- **FR-006**: System MUST calculate invoice status based on total paid vs invoice total (unpaid, partially_paid, paid)
- **FR-007**: System MUST calculate and display "overdue" status when due_date < today AND status = unpaid
- **FR-008**: System MUST display financial summary card showing Total Invoiced, Total Paid, and Balance Due
- **FR-009**: System MUST calculate Balance Due as: Total Invoiced - Total Paid for the vendor
- **FR-010**: System MUST show linked invoice number in Payments table for linked payments
- **FR-011**: System MUST show "—" in Invoice column for payments not linked to an invoice
- **FR-012**: System MUST use correct status badge colors: Green (paid), Yellow/Orange (unpaid), Orange (partially_paid), Red (overdue)

### Key Entities

- **Invoice**: Represents a bill received from a vendor. Key attributes: invoice_number, amount, vat_amount, total_amount (calculated), status, due_date, payment_schedule_id (link to payment). Status can be: unpaid, partially_paid, paid, overdue, cancelled.

- **Payment (Payment Schedule)**: Represents a payment made to a vendor. Key attributes: milestone_name, amount, status, paid_date, payment_method. Can be linked to an invoice via the invoice's payment_schedule_id.

- **Relationship**: One invoice can be linked to one or more payments (for partial payments). The link is stored on the invoice record pointing to the payment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full invoice-to-payment workflow (view invoice → pay invoice → mark paid) in under 60 seconds
- **SC-002**: Financial summary totals update within 2 seconds of any invoice or payment change
- **SC-003**: Invoice status automatically updates to correct value (paid/partially_paid/unpaid) within 1 second of payment status change
- **SC-004**: 100% of invoice-payment links are preserved and displayed correctly in both Invoices and Payments tabs
- **SC-005**: Users can identify overdue invoices at a glance through visual status badges (red for overdue)
- **SC-006**: Balance Due calculation is always accurate (Total Invoiced - Total Paid = Balance Due)

## Assumptions

- The existing database schema already supports the invoice-payment link via `vendor_invoices.payment_schedule_id`
- No database migrations are required for this feature
- VAT calculation (15%) is already implemented in Phase 7B
- Currency formatting (ZAR with R prefix) is already implemented
- The existing PaymentModal component can be extended to accept pre-filled values
- Users access this feature from the vendor detail page at `/weddings/:weddingId/vendors/:vendorId`

## Out of Scope

- Multi-currency support (all amounts in ZAR)
- Automatic payment reminders/notifications
- Invoice PDF generation or export
- Payment method integrations (PayPal, Stripe, etc.)
- Audit trail of status changes
- Bulk payment operations
