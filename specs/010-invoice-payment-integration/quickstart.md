# Quickstart: Vendor Invoice Payment Integration

**Feature Branch**: `010-invoice-payment-integration`
**Date**: 2026-01-15

## Prerequisites

1. Development server running: `npm run dev`
2. Logged in as a wedding consultant
3. At least one wedding with a vendor exists
4. Navigate to: `/weddings/{weddingId}/vendors/{vendorId}`

---

## Manual Testing Checklist

### Test 1: Tab Order Verification

**Steps**:
1. Navigate to any vendor detail page
2. Observe the tab order

**Expected**:
- Tabs appear in order: Overview, Contract, Invoices, Payments
- (Previously: Overview, Contract, Payments, Invoices)

**Pass Criteria**: Invoices tab appears before Payments tab

---

### Test 2: Financial Summary Card - Empty State

**Steps**:
1. Navigate to a vendor with no invoices and no payments
2. Click on "Invoices" tab
3. Observe the summary card at the top

**Expected**:
- Summary card displays:
  - Total Invoiced: R 0.00
  - Total Paid: R 0.00
  - Balance Due: R 0.00

**Pass Criteria**: All values show R 0.00 with proper formatting

---

### Test 3: Financial Summary Card - With Data

**Steps**:
1. Create an invoice for R 10,000
2. Create a payment for R 5,000 and mark as paid
3. View the Invoices or Payments tab

**Expected**:
- Total Invoiced: R 10,000.00
- Total Paid: R 5,000.00
- Balance Due: R 5,000.00

**Pass Criteria**: Calculations are accurate

---

### Test 4: Pay This Invoice Button - Visibility

**Steps**:
1. Create an unpaid invoice for R 5,000
2. View the Invoices tab

**Expected**:
- "Pay This Invoice" button visible on the invoice row
- Button has appropriate styling (primary color)

**Pass Criteria**: Button only shows for unpaid invoices

---

### Test 5: Pay This Invoice Button - Hidden for Paid

**Steps**:
1. Create an invoice and pay it fully
2. Mark the linked payment as paid
3. View the Invoices tab

**Expected**:
- "Pay This Invoice" button is NOT visible for paid invoices

**Pass Criteria**: Button hidden when invoice.status === 'paid'

---

### Test 6: Pay This Invoice - Pre-filled Modal

**Steps**:
1. Create an invoice: INV-001, R 5,000, due 2026-02-15
2. Click "Pay This Invoice" button

**Expected**:
- Payment modal opens
- Milestone name pre-filled: "Payment for Invoice INV-001"
- Amount pre-filled: 5,000 (or R 5,000.00)
- Due date pre-filled: 2026-02-15

**Pass Criteria**: All fields pre-populated from invoice data

---

### Test 7: Pay This Invoice - Create and Link

**Steps**:
1. Click "Pay This Invoice" on an invoice
2. Submit the payment form
3. View the Payments tab

**Expected**:
- New payment appears in Payments table
- Payment shows "Invoice #INV-001" in Invoice column
- Toast notification: "Payment created successfully"

**Pass Criteria**: Payment linked to invoice

---

### Test 8: Invoice Column in Payments Table

**Steps**:
1. View the Payments tab
2. Observe the table columns

**Expected**:
- "Invoice" column exists in the table
- Linked payments show "Invoice #XXX"
- Unlinked payments show "—"

**Pass Criteria**: Invoice column displays correct data

---

### Test 9: Invoice Status - Auto Update to Paid

**Steps**:
1. Create invoice for R 5,000 (status: unpaid)
2. Click "Pay This Invoice" → create payment
3. Mark the payment as paid
4. View the Invoices tab

**Expected**:
- Invoice status changes from "Unpaid" to "Paid"
- Status badge changes to green

**Pass Criteria**: Invoice status updates automatically

---

### Test 10: Invoice Status - Partial Payment

**Steps**:
1. Create invoice for R 10,000
2. Create payment from invoice
3. Edit payment amount to R 5,000 (partial)
4. Mark payment as paid

**Expected**:
- Invoice status: "Partially Paid"
- Badge color: Orange

**Pass Criteria**: Partial payment status calculated correctly

---

### Test 11: Overdue Status

**Steps**:
1. Create invoice with due_date in the past (e.g., 2025-01-01)
2. Do NOT pay it
3. View Invoices tab

**Expected**:
- Invoice status: "Overdue"
- Badge color: Red

**Pass Criteria**: Overdue status calculated from due_date

---

### Test 12: Financial Summary - Real-time Update

**Steps**:
1. Note current totals
2. Create a new invoice for R 3,000
3. Observe summary card

**Expected**:
- Total Invoiced increases by R 3,000
- Balance Due increases by R 3,000
- Update happens without page refresh

**Pass Criteria**: Query invalidation works correctly

---

### Test 13: Responsive Design - Mobile

**Steps**:
1. Resize browser to mobile width (375px)
2. View Invoices tab with summary card

**Expected**:
- Summary card stacks vertically
- All three totals are visible
- "Pay This Invoice" button fits on screen

**Pass Criteria**: Mobile layout is usable

---

### Test 14: Accessibility - Keyboard Navigation

**Steps**:
1. Use Tab key to navigate through Invoices tab
2. Navigate to "Pay This Invoice" button
3. Press Enter to activate

**Expected**:
- Focus indicators visible on all elements
- Button activates with keyboard
- Modal traps focus correctly

**Pass Criteria**: Full keyboard accessibility

---

### Test 15: Edge Case - Delete Linked Payment

**Steps**:
1. Create invoice, pay it
2. Delete the payment
3. View Invoices tab

**Expected**:
- Invoice is no longer linked (payment_schedule_id becomes null)
- Invoice status may revert to unpaid (or remain)
- No errors occur

**Pass Criteria**: Deletion handled gracefully

---

### Test 16: Edge Case - Overpayment

**Steps**:
1. Create invoice for R 5,000
2. Create payment from invoice
3. Edit payment amount to R 7,000
4. Mark as paid

**Expected**:
- Invoice status: "Paid" (paid >= total_amount)
- Balance Due can be negative (shows overpayment)

**Pass Criteria**: Overpayment doesn't break calculations

---

## Performance Checklist

| Metric | Target | How to Test |
|--------|--------|-------------|
| Tab switch | < 200ms | Chrome DevTools Performance |
| Summary load | < 500ms | Network tab |
| Payment creation | < 1s | Measure from click to toast |
| Status update | < 1s | Measure from mark-paid to badge change |

---

## Browser Testing

Test all above scenarios on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Sign-off

| Tester | Date | Pass/Fail | Notes |
|--------|------|-----------|-------|
|        |      |           |       |
