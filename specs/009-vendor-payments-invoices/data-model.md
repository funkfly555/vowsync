# Data Model: Vendor Payments & Invoices (Phase 7B)

**Date**: 2026-01-14
**Status**: Database tables already exist - this documents TypeScript interfaces

---

## Entity Relationship Diagram

```
┌─────────────┐
│   vendors   │
│     (1)     │
└──────┬──────┘
       │
       │ vendor_id (FK)
       │
       ├────────────────────┬─────────────────────┐
       │                    │                     │
       ▼                    ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌─────────────────┐
│   vendor_    │    │   vendor_    │    │     vendor_     │
│   payment_   │◄───│   invoices   │    │    contacts     │
│   schedule   │    │              │    │                 │
│     (N)      │    │     (N)      │    │       (N)       │
└──────────────┘    └──────────────┘    └─────────────────┘
       ▲
       │ payment_schedule_id (FK, optional)
       │
       └────────────────────┘
```

---

## Entity: VendorPaymentSchedule

**Table**: `vendor_payment_schedule`
**Description**: Payment milestones for a vendor (deposits, installments, final payments)

### Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| id | UUID | Yes | gen_random_uuid() | PK | Unique identifier |
| vendor_id | UUID | Yes | - | FK → vendors.id | Parent vendor |
| milestone_name | text | Yes | - | - | Description (e.g., "Deposit", "50% Payment") |
| due_date | date | Yes | - | - | When payment is due |
| amount | numeric | Yes | - | > 0 | Payment amount in ZAR |
| percentage | numeric | No | NULL | 0-100 | Optional percentage of contract value |
| status | text | No | 'pending' | CHECK | pending, paid, overdue, cancelled |
| paid_date | date | No | NULL | - | Date payment was made |
| payment_method | text | No | NULL | - | EFT, Credit Card, Cash, etc. |
| payment_reference | text | No | NULL | - | Bank reference or receipt number |
| notes | text | No | NULL | - | Additional notes |
| created_at | timestamptz | No | now() | - | Record creation |
| updated_at | timestamptz | No | now() | - | Last modification |

### TypeScript Interface

```typescript
export interface VendorPaymentSchedule {
  id: string;
  vendor_id: string;
  milestone_name: string;
  due_date: string; // ISO date string
  amount: number;
  percentage: number | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorPaymentScheduleFormData {
  milestone_name: string;
  due_date: string;
  amount: number;
  percentage?: number | null;
  notes?: string;
}

export interface MarkAsPaidFormData {
  paid_date: string;
  payment_method?: string;
  payment_reference?: string;
}
```

### State Transitions

```
                 ┌─────────────┐
                 │   pending   │ (initial state)
                 └──────┬──────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐ ┌───────────┐ ┌───────────────┐
│    overdue    │ │   paid    │ │   cancelled   │
│ (auto by date)│ │ (manual)  │ │   (manual)    │
└───────┬───────┘ └───────────┘ └───────────────┘
        │
        │ (can still be marked paid)
        ▼
  ┌───────────┐
  │   paid    │
  └───────────┘
```

---

## Entity: VendorInvoice

**Table**: `vendor_invoices`
**Description**: Invoices received from vendors

### Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| id | UUID | Yes | gen_random_uuid() | PK | Unique identifier |
| vendor_id | UUID | Yes | - | FK → vendors.id | Parent vendor |
| payment_schedule_id | UUID | No | NULL | FK → vendor_payment_schedule.id | Linked payment milestone |
| invoice_number | text | Yes | - | - | Vendor's invoice number |
| invoice_date | date | Yes | - | - | Date invoice was issued |
| due_date | date | Yes | - | - | Payment due date |
| amount | numeric | Yes | - | > 0 | Subtotal before VAT |
| vat_amount | numeric | No | 0 | >= 0 | VAT amount |
| total_amount | numeric | Generated | amount + vat_amount | - | Auto-calculated total |
| status | text | No | 'unpaid' | CHECK | unpaid, paid, partially_paid, overdue, cancelled |
| paid_date | date | No | NULL | - | Date invoice was paid |
| payment_method | text | No | NULL | - | Payment method used |
| payment_reference | text | No | NULL | - | Bank reference |
| notes | text | No | NULL | - | Additional notes |
| created_at | timestamptz | No | now() | - | Record creation |
| updated_at | timestamptz | No | now() | - | Last modification |

### TypeScript Interface

```typescript
export interface VendorInvoice {
  id: string;
  vendor_id: string;
  payment_schedule_id: string | null;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  vat_amount: number;
  total_amount: number; // Generated column
  status: 'unpaid' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  paid_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorInvoiceFormData {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  vat_amount: number;
  payment_schedule_id?: string | null;
  notes?: string;
}
```

### VAT Calculation

```typescript
// VAT rate in South Africa is 15%
const VAT_RATE = 0.15;

// Calculate VAT from subtotal
function calculateVAT(subtotal: number): number {
  return Math.round(subtotal * VAT_RATE * 100) / 100;
}

// Calculate total (done by database generated column)
function calculateTotal(amount: number, vat_amount: number): number {
  return amount + vat_amount;
}
```

---

## Entity: VendorContact

**Table**: `vendor_contacts`
**Description**: Additional contacts for a vendor beyond the primary contact stored in vendors table

### Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| id | UUID | Yes | gen_random_uuid() | PK | Unique identifier |
| vendor_id | UUID | Yes | - | FK → vendors.id | Parent vendor |
| contact_name | text | Yes | - | - | Full name |
| contact_role | text | No | NULL | - | Job title/role |
| contact_email | text | No | NULL | - | Email address |
| contact_phone | text | No | NULL | - | Phone number |
| is_primary | boolean | No | false | - | Primary contact for vendor |
| is_onsite_contact | boolean | No | false | - | Contact for on-site coordination |
| created_at | timestamptz | No | now() | - | Record creation |
| updated_at | timestamptz | No | now() | - | Last modification |

### TypeScript Interface

```typescript
export interface VendorContact {
  id: string;
  vendor_id: string;
  contact_name: string;
  contact_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_primary: boolean;
  is_onsite_contact: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorContactFormData {
  contact_name: string;
  contact_role?: string;
  contact_email?: string;
  contact_phone?: string;
  is_primary?: boolean;
  is_onsite_contact?: boolean;
}
```

---

## Display Types

### Payment Display Status

```typescript
export type PaymentDisplayStatus = 'pending' | 'due-soon' | 'overdue' | 'paid' | 'cancelled';

export interface PaymentStatusDisplay {
  status: PaymentDisplayStatus;
  label: string;
  color: 'blue' | 'orange' | 'red' | 'green' | 'gray';
  icon: string;
  daysInfo?: string; // "Due in 5 days" or "Overdue by 3 days"
}
```

### Invoice Display Status

```typescript
export type InvoiceDisplayStatus = 'unpaid' | 'overdue' | 'partial' | 'paid' | 'cancelled';

export interface InvoiceStatusDisplay {
  status: InvoiceDisplayStatus;
  label: string;
  color: 'blue' | 'red' | 'yellow' | 'green' | 'gray';
  icon: string;
}
```

---

## Validation Rules

### Payment Validation

| Rule | Field | Constraint | Error Message |
|------|-------|------------|---------------|
| Required | milestone_name | Non-empty string | "Description is required" |
| Required | due_date | Valid date | "Due date is required" |
| Required | amount | Positive number | "Amount must be greater than 0" |
| Range | percentage | 0-100 or null | "Percentage must be between 0 and 100" |

### Invoice Validation

| Rule | Field | Constraint | Error Message |
|------|-------|------------|---------------|
| Required | invoice_number | Non-empty string | "Invoice number is required" |
| Required | invoice_date | Valid date | "Invoice date is required" |
| Required | due_date | Valid date | "Due date is required" |
| Required | amount | Positive number | "Amount must be greater than 0" |
| Non-negative | vat_amount | >= 0 | "VAT cannot be negative" |

### Contact Validation

| Rule | Field | Constraint | Error Message |
|------|-------|------------|---------------|
| Required | contact_name | Non-empty string | "Contact name is required" |
| Format | contact_email | Valid email or empty | "Invalid email format" |
| Format | contact_phone | Valid phone or empty | "Invalid phone format" |

---

## Indexes (Existing)

```sql
-- Payment schedule indexes
CREATE INDEX idx_vendor_payment_schedule_vendor_id ON vendor_payment_schedule(vendor_id);
CREATE INDEX idx_vendor_payment_schedule_due_date ON vendor_payment_schedule(due_date);
CREATE INDEX idx_vendor_payment_schedule_status ON vendor_payment_schedule(status);

-- Invoice indexes
CREATE INDEX idx_vendor_invoices_vendor_id ON vendor_invoices(vendor_id);
CREATE INDEX idx_vendor_invoices_due_date ON vendor_invoices(due_date);
CREATE INDEX idx_vendor_invoices_status ON vendor_invoices(status);

-- Contact indexes
CREATE INDEX idx_vendor_contacts_vendor_id ON vendor_contacts(vendor_id);
```

---

## RLS Policies (Existing)

All tables inherit RLS through the wedding ownership chain:
1. User owns wedding via `weddings.consultant_id = auth.uid()`
2. Vendor belongs to wedding via `vendors.wedding_id`
3. Payment/Invoice/Contact belongs to vendor via `vendor_id`

```sql
-- Example policy pattern (already implemented)
CREATE POLICY "Users can view payments of their vendors"
  ON vendor_payment_schedule FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors v
      JOIN weddings w ON w.id = v.wedding_id
      WHERE v.id = vendor_payment_schedule.vendor_id
      AND w.consultant_id = auth.uid()
    )
  );
```
