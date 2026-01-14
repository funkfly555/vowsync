# Requirements Checklist: Vendor Payments & Invoices (Phase 7B)

## Implementation Progress

### Payment Schedule Requirements
- [ ] FR-001: Payment milestones table with description, due_date, amount_due, amount_paid, status
- [ ] FR-002: Automatic payment status calculation
- [ ] FR-003: CRUD operations on payment milestones
- [ ] FR-004: Paid payments have read-only amount/date
- [ ] FR-005: "Mark as Paid" action for unpaid payments
- [ ] FR-006: Capture payment_date and payment_method
- [ ] FR-007: Sort payments by due_date ascending

### Payment Status Logic
- [ ] FR-008: "Paid" (green) when paid_date is not null
- [ ] FR-009: "Cancelled" (gray) when status is 'cancelled'
- [ ] FR-010: "Overdue" (red) when due_date < today AND not paid
- [ ] FR-011: "Due Soon" (orange) when within 7 days AND not paid
- [ ] FR-012: "Pending" (blue) when > 7 days away AND not paid

### Invoice Requirements
- [ ] FR-013: Invoice table with all required columns
- [ ] FR-014: Auto-calculate vat_amount
- [ ] FR-015: Auto-calculate total_amount
- [ ] FR-016: CRUD operations on invoices
- [ ] FR-017: Invoice statuses: Draft, Sent, Paid, Overdue, Cancelled

### Invoice Status Logic
- [ ] FR-018: "Draft" (gray) when newly created
- [ ] FR-019: "Sent" (blue) when marked as sent
- [ ] FR-020: "Paid" (green) when paid_date is set
- [ ] FR-021: "Overdue" (red) when past due and not paid/cancelled
- [ ] FR-022: "Cancelled" (gray) when explicitly cancelled

### Vendor Contacts Requirements
- [ ] FR-023: Contact list with name, role, email, phone, is_primary
- [ ] FR-024: CRUD operations on vendor contacts
- [ ] FR-025: Primary contact designation
- [ ] FR-026: Prevent deleting only/primary contact

## User Stories Completion

### P1 - MVP
- [ ] US1: View Payment Schedule
- [ ] US2: Add Payment Milestone
- [ ] US3: Mark Payment as Paid

### P2 - Core Features
- [ ] US4: Edit Payment Milestone
- [ ] US5: Delete Payment Milestone
- [ ] US6: View Invoices
- [ ] US7: Add/Edit Invoice

### P3 - Extended Features
- [ ] US8: View Vendor Contacts
- [ ] US9: Manage Vendor Contacts

## Success Criteria Validation

- [ ] SC-001: Payment milestones load within 2 seconds
- [ ] SC-002: Status badges are 100% accurate
- [ ] SC-003: Add payment under 30 seconds
- [ ] SC-004: Mark as paid under 10 seconds
- [ ] SC-005: VAT calculations accurate to 2 decimals
- [ ] SC-006: All operations have loading/error feedback
- [ ] SC-007: No regressions in Phase 7A features
