# Data Model: Vendor Invoice Payment Integration

**Feature Branch**: `010-invoice-payment-integration`
**Date**: 2026-01-15

## Overview

This feature integrates existing `vendor_invoices` and `vendor_payment_schedule` tables. **No database migrations required** - all necessary columns already exist from Phase 7B.

---

## Existing Entities (No Changes)

### vendor_invoices

```typescript
interface VendorInvoice {
  id: string;                           // UUID, primary key
  vendor_id: string;                    // UUID, FK to vendors
  payment_schedule_id: string | null;   // UUID, FK to vendor_payment_schedule ← THE LINK

  invoice_number: string;               // TEXT, NOT NULL
  invoice_date: string;                 // DATE
  due_date: string;                     // DATE
  amount: number;                       // DECIMAL(12,2)
  vat_amount: number;                   // DECIMAL(12,2), default 0
  total_amount: number;                 // GENERATED: amount + vat_amount

  status: InvoiceStatus;                // default 'unpaid'
  paid_date: string | null;             // DATE
  payment_method: string | null;        // TEXT
  payment_reference: string | null;     // TEXT
  notes: string | null;                 // TEXT

  created_at: string;                   // TIMESTAMPTZ
  updated_at: string;                   // TIMESTAMPTZ
}

type InvoiceStatus = 'unpaid' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
```

### vendor_payment_schedule

```typescript
interface VendorPaymentSchedule {
  id: string;                           // UUID, primary key
  vendor_id: string;                    // UUID, FK to vendors

  milestone_name: string;               // TEXT, NOT NULL
  due_date: string;                     // DATE
  amount: number;                       // DECIMAL(12,2)
  percentage: number | null;            // DECIMAL(5,2)

  status: PaymentStatus;                // default 'pending'
  paid_date: string | null;             // DATE
  payment_method: string | null;        // TEXT
  payment_reference: string | null;     // TEXT
  notes: string | null;                 // TEXT

  created_at: string;                   // TIMESTAMPTZ
  updated_at: string;                   // TIMESTAMPTZ
}

type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
```

---

## New TypeScript Interfaces

### VendorTotals (Add to types/vendor.ts)

```typescript
/**
 * Financial summary for a vendor
 * Calculated from invoices and payments, not stored in DB
 */
interface VendorTotals {
  totalInvoiced: number;   // Sum of all invoice total_amount
  totalPaid: number;       // Sum of all payment amounts where status = 'paid'
  balanceDue: number;      // totalInvoiced - totalPaid
}
```

### PaymentWithInvoice (Add to types/vendor.ts)

```typescript
/**
 * Payment with linked invoice info for table display
 */
interface PaymentWithInvoice extends VendorPaymentSchedule {
  linkedInvoice: {
    id: string;
    invoice_number: string;
  } | null;
}
```

---

## Entity Relationships

```
┌─────────────────────┐         ┌─────────────────────────┐
│    vendors          │         │  vendor_payment_schedule │
│─────────────────────│         │─────────────────────────│
│ id (PK)             │◄───────┐│ id (PK)                 │
│ wedding_id (FK)     │        ││ vendor_id (FK)          │
│ ...                 │        ││ milestone_name          │
└─────────────────────┘        ││ amount                  │
         │                     ││ status                  │
         │                     │└─────────────────────────┘
         │                     │           ▲
         │                     │           │
         │                     │           │ payment_schedule_id (FK)
         │                     │           │
         ▼                     │┌─────────────────────────┐
┌─────────────────────┐        ││    vendor_invoices      │
│  (vendor_id FK)     │────────┘│─────────────────────────│
└─────────────────────┘         │ id (PK)                 │
                                │ vendor_id (FK)          │
                                │ payment_schedule_id (FK)│───► Links to payment
                                │ invoice_number          │
                                │ total_amount            │
                                │ status                  │
                                └─────────────────────────┘
```

### Relationship Rules

1. **Invoice → Payment** (Many-to-One via `payment_schedule_id`)
   - One invoice can be linked to one payment
   - When "Pay This Invoice" is clicked, a new payment is created and linked
   - The invoice's `payment_schedule_id` is set to the new payment's `id`

2. **Payment → Invoice** (One-to-Many, reverse lookup)
   - A payment can have multiple invoices linked to it (for future bulk payment)
   - Query: `SELECT * FROM vendor_invoices WHERE payment_schedule_id = ?`

3. **Vendor → Invoices/Payments** (One-to-Many)
   - Each vendor has many invoices and payments
   - Used for calculating VendorTotals

---

## State Transitions

### Invoice Status Transitions

```
                  ┌─────────────┐
                  │   unpaid    │ ← Initial state
                  └──────┬──────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  overdue    │  │partially_paid│  │    paid     │
│ (due_date   │  │ (0 < paid   │  │ (paid >=    │
│  passed)    │  │  < total)   │  │  total)     │
└─────────────┘  └──────┬──────┘  └─────────────┘
                        │                ▲
                        │                │
                        └────────────────┘
                        (more payments)
```

**Transition Triggers**:
- `unpaid` → `overdue`: Due date passes (calculated at render time)
- `unpaid` → `partially_paid`: Linked payment marked as paid, but amount < total_amount
- `unpaid` → `paid`: Linked payment marked as paid, amount >= total_amount
- `partially_paid` → `paid`: Additional payment brings total >= invoice total_amount

### Payment Status Transitions

```
┌─────────────┐      mark as paid      ┌─────────────┐
│   pending   │ ─────────────────────► │    paid     │
└─────────────┘                        └─────────────┘
       │
       │ due_date passed
       ▼
┌─────────────┐
│   overdue   │ ─────────────────────► paid
└─────────────┘      mark as paid
```

---

## Validation Rules

### Invoice Validation (Existing - No Changes)

| Field | Rule | Error Message |
|-------|------|---------------|
| invoice_number | Required, non-empty | "Invoice number is required" |
| invoice_date | Required, valid date | "Invoice date is required" |
| due_date | Required, >= invoice_date | "Due date must be on or after invoice date" |
| amount | Required, > 0 | "Amount must be greater than 0" |
| vat_amount | Optional, >= 0 | "VAT cannot be negative" |

### Payment Validation (Existing - No Changes)

| Field | Rule | Error Message |
|-------|------|---------------|
| milestone_name | Required, non-empty | "Milestone name is required" |
| due_date | Required, valid date | "Due date is required" |
| amount | Required, > 0 | "Amount must be greater than 0" |

### New Validation: Pay This Invoice

When creating payment from invoice:
- `milestone_name`: Auto-filled as "Payment for Invoice {invoice_number}"
- `due_date`: Auto-filled from invoice.due_date
- `amount`: Auto-filled from invoice.total_amount
- User can modify before saving

---

## Calculated Fields

### VendorTotals Calculation

```typescript
// In useVendorTotals hook
async function calculateVendorTotals(vendorId: string): Promise<VendorTotals> {
  // Query 1: Sum of all invoice totals
  const { data: invoices } = await supabase
    .from('vendor_invoices')
    .select('total_amount')
    .eq('vendor_id', vendorId);

  const totalInvoiced = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) ?? 0;

  // Query 2: Sum of paid payments
  const { data: payments } = await supabase
    .from('vendor_payment_schedule')
    .select('amount')
    .eq('vendor_id', vendorId)
    .eq('status', 'paid');

  const totalPaid = payments?.reduce((sum, pay) => sum + pay.amount, 0) ?? 0;

  // Calculate balance
  const balanceDue = totalInvoiced - totalPaid;

  return { totalInvoiced, totalPaid, balanceDue };
}
```

### Invoice Status Calculation

```typescript
function calculateInvoiceStatus(
  invoice: VendorInvoice,
  linkedPayment: VendorPaymentSchedule | null
): InvoiceStatus {
  // If payment exists and is paid
  if (linkedPayment?.status === 'paid') {
    if (linkedPayment.amount >= invoice.total_amount) {
      return 'paid';
    }
    return 'partially_paid';
  }

  // Check if overdue
  const today = new Date();
  const dueDate = new Date(invoice.due_date);
  if (today > dueDate) {
    return 'overdue';
  }

  return 'unpaid';
}
```

---

## Query Patterns

### Get Invoices with Payment Link

```typescript
const { data: invoices } = await supabase
  .from('vendor_invoices')
  .select(`
    *,
    payment:vendor_payment_schedule(id, status, amount, paid_date)
  `)
  .eq('vendor_id', vendorId)
  .order('due_date', { ascending: true });
```

### Get Payments with Invoice Link

```typescript
// First get payments
const { data: payments } = await supabase
  .from('vendor_payment_schedule')
  .select('*')
  .eq('vendor_id', vendorId);

// Then get invoices linked to these payments
const paymentIds = payments?.map(p => p.id) ?? [];
const { data: invoices } = await supabase
  .from('vendor_invoices')
  .select('id, invoice_number, payment_schedule_id')
  .in('payment_schedule_id', paymentIds);

// Build map for display
const invoiceByPaymentId = new Map(
  invoices?.map(inv => [inv.payment_schedule_id, inv])
);
```

---

## Migration Status

**No migrations required.**

All necessary database columns exist from Phase 7B:
- `vendor_invoices.payment_schedule_id` (FK) ✓
- `vendor_invoices.status` with all enum values ✓
- `vendor_payment_schedule.status` with all enum values ✓

RLS policies are already configured for both tables.
