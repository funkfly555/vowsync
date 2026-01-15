# API Contracts: Vendor Invoice Payment Integration

**Feature Branch**: `010-invoice-payment-integration`
**Date**: 2026-01-15

## Overview

This feature uses Supabase client-side queries. No custom backend endpoints. All operations go through the Supabase JavaScript client with RLS policies enforcing access control.

---

## Supabase Query Contracts

### Q1: Fetch Vendor Totals

**Purpose**: Get financial summary for a vendor (Total Invoiced, Total Paid, Balance Due)

**Hook**: `useVendorTotals(vendorId: string)`

**Query Key**: `['vendor-totals', vendorId]`

**Queries**:

```typescript
// Query 1: Get invoice totals
const { data: invoices } = await supabase
  .from('vendor_invoices')
  .select('total_amount')
  .eq('vendor_id', vendorId);

// Query 2: Get paid payment totals
const { data: payments } = await supabase
  .from('vendor_payment_schedule')
  .select('amount')
  .eq('vendor_id', vendorId)
  .eq('status', 'paid');
```

**Response Interface**:

```typescript
interface VendorTotals {
  totalInvoiced: number;  // Sum of invoice total_amount
  totalPaid: number;      // Sum of paid payment amounts
  balanceDue: number;     // totalInvoiced - totalPaid
}
```

**Error Handling**:
- Returns `null` if vendorId is undefined
- Throws on Supabase error → caught by TanStack Query

---

### Q2: Fetch Invoices with Payment Link

**Purpose**: Get all invoices for a vendor with their linked payment info

**Hook**: `useVendorInvoices(vendorId: string)` (existing, may need modification)

**Query Key**: `['vendor-invoices', vendorId]`

**Query**:

```typescript
const { data: invoices } = await supabase
  .from('vendor_invoices')
  .select(`
    *,
    payment:vendor_payment_schedule(
      id,
      status,
      amount,
      paid_date,
      payment_method
    )
  `)
  .eq('vendor_id', vendorId)
  .order('due_date', { ascending: true });
```

**Response Interface**:

```typescript
interface VendorInvoiceWithPayment extends VendorInvoice {
  payment: {
    id: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    amount: number;
    paid_date: string | null;
    payment_method: string | null;
  } | null;
}
```

---

### Q3: Fetch Payments with Invoice Link

**Purpose**: Get all payments with linked invoice number for display

**Hook**: `useVendorPaymentsWithInvoices(vendorId: string)` (new or extend existing)

**Query Key**: `['vendor-payments', vendorId]`

**Queries**:

```typescript
// Query 1: Get payments
const { data: payments } = await supabase
  .from('vendor_payment_schedule')
  .select('*')
  .eq('vendor_id', vendorId)
  .order('due_date', { ascending: true });

// Query 2: Get linked invoices
const paymentIds = payments?.map(p => p.id) ?? [];
const { data: invoices } = await supabase
  .from('vendor_invoices')
  .select('id, invoice_number, payment_schedule_id')
  .in('payment_schedule_id', paymentIds);
```

**Response Interface**:

```typescript
interface PaymentWithInvoice extends VendorPaymentSchedule {
  linkedInvoice: {
    id: string;
    invoice_number: string;
  } | null;
}
```

---

## Mutation Contracts

### M1: Create Payment from Invoice

**Purpose**: Create a new payment pre-filled from invoice data and link them

**Hook**: `useCreatePaymentFromInvoice()`

**Query Keys to Invalidate**: `['vendor-payments']`, `['vendor-invoices']`, `['vendor-totals']`

**Input Interface**:

```typescript
interface CreatePaymentFromInvoiceInput {
  vendorId: string;
  invoiceId: string;
  invoice: VendorInvoice;
}
```

**Mutation**:

```typescript
async function createPaymentFromInvoice({ vendorId, invoiceId, invoice }) {
  // Step 1: Create payment
  const { data: payment, error: paymentError } = await supabase
    .from('vendor_payment_schedule')
    .insert({
      vendor_id: vendorId,
      milestone_name: `Payment for Invoice ${invoice.invoice_number}`,
      due_date: invoice.due_date,
      amount: invoice.total_amount,
      notes: `Linked to invoice ${invoice.invoice_number}`,
      status: 'pending'
    })
    .select()
    .single();

  if (paymentError) throw paymentError;

  // Step 2: Link invoice to payment
  const { error: linkError } = await supabase
    .from('vendor_invoices')
    .update({ payment_schedule_id: payment.id })
    .eq('id', invoiceId);

  if (linkError) throw linkError;

  return payment;
}
```

**Success Toast**: "Payment created and linked to invoice"

**Error Toast**: "Failed to create payment"

---

### M2: Mark Payment as Paid (with Invoice Status Update)

**Purpose**: Mark payment as paid and update linked invoice status

**Hook**: `useMarkPaymentAsPaid()` (existing, needs extension)

**Query Keys to Invalidate**: `['vendor-payments']`, `['vendor-invoices']`, `['vendor-totals']`

**Input Interface**:

```typescript
interface MarkPaymentAsPaidInput {
  paymentId: string;
  vendorId: string;
  data: {
    paid_date: string;
    payment_method?: string;
    payment_reference?: string;
  };
}
```

**Mutation**:

```typescript
async function markPaymentAsPaid({ paymentId, vendorId, data }) {
  // Step 1: Update payment status
  const { data: payment, error: paymentError } = await supabase
    .from('vendor_payment_schedule')
    .update({
      status: 'paid',
      paid_date: data.paid_date,
      payment_method: data.payment_method || null,
      payment_reference: data.payment_reference || null
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (paymentError) throw paymentError;

  // Step 2: Find linked invoices
  const { data: invoices, error: invoiceError } = await supabase
    .from('vendor_invoices')
    .select('id, total_amount')
    .eq('payment_schedule_id', paymentId);

  if (invoiceError) throw invoiceError;

  // Step 3: Update each linked invoice status
  for (const invoice of invoices ?? []) {
    const newStatus = payment.amount >= invoice.total_amount ? 'paid' : 'partially_paid';

    await supabase
      .from('vendor_invoices')
      .update({
        status: newStatus,
        paid_date: newStatus === 'paid' ? data.paid_date : null
      })
      .eq('id', invoice.id);
  }

  return payment;
}
```

**Success Toast**: "Payment marked as paid"

**Error Toast**: "Failed to update payment"

---

### M3: Update Invoice Status

**Purpose**: Manually update invoice status (for edge cases)

**Hook**: `useUpdateInvoiceStatus()`

**Query Keys to Invalidate**: `['vendor-invoices']`, `['vendor-totals']`

**Input Interface**:

```typescript
interface UpdateInvoiceStatusInput {
  invoiceId: string;
  vendorId: string;
  status: 'unpaid' | 'partially_paid' | 'paid';
  paidDate?: string;
}
```

**Mutation**:

```typescript
async function updateInvoiceStatus({ invoiceId, status, paidDate }) {
  const { data, error } = await supabase
    .from('vendor_invoices')
    .update({
      status,
      paid_date: status === 'paid' ? paidDate : null
    })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

---

## Component Contracts

### C1: VendorTotalsSummary

**Props**:

```typescript
interface VendorTotalsSummaryProps {
  vendorId: string;
}
```

**Display**:

| Field | Format | Example |
|-------|--------|---------|
| Total Invoiced | R {amount} | R 15,000.00 |
| Total Paid | R {amount} | R 10,000.00 |
| Balance Due | R {amount} | R 5,000.00 |

**Styling**:
- Card with shadow
- Three columns on desktop, stacked on mobile
- Balance Due highlighted if > 0

---

### C2: Pay This Invoice Button

**Props**:

```typescript
interface PayInvoiceButtonProps {
  invoice: VendorInvoice;
  vendorId: string;
  onPaymentCreated?: (payment: VendorPaymentSchedule) => void;
}
```

**Behavior**:
- Only visible when `invoice.status !== 'paid'`
- On click: Opens PaymentModal with pre-filled values
- Pre-fill values:
  - `milestone_name`: "Payment for Invoice {invoice_number}"
  - `due_date`: invoice.due_date
  - `amount`: invoice.total_amount

---

### C3: Invoice Column in Payments Table

**Display Logic**:

```typescript
function getInvoiceColumnValue(payment: PaymentWithInvoice): string {
  if (payment.linkedInvoice) {
    return `Invoice #${payment.linkedInvoice.invoice_number}`;
  }
  return '—';
}
```

**Styling**:
- Text link style if linked (clickable in future)
- Muted text for "—"

---

## Query Invalidation Matrix

| Action | Queries to Invalidate |
|--------|----------------------|
| Create payment from invoice | `vendor-payments`, `vendor-invoices`, `vendor-totals` |
| Mark payment as paid | `vendor-payments`, `vendor-invoices`, `vendor-totals` |
| Update invoice status | `vendor-invoices`, `vendor-totals` |
| Create invoice | `vendor-invoices`, `vendor-totals` |
| Delete invoice | `vendor-invoices`, `vendor-totals` |
| Create payment | `vendor-payments`, `vendor-totals` |
| Delete payment | `vendor-payments`, `vendor-invoices`, `vendor-totals` |

---

## Error Handling

All mutations follow this pattern:

```typescript
onError: (error) => {
  console.error('Operation failed:', error);
  toast.error('Failed to {action}', {
    description: error instanceof Error ? error.message : 'Please try again'
  });
}
```

All queries follow this pattern:

```typescript
// In component
if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage message="Failed to load data" />;
```
