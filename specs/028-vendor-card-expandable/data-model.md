# Data Model: Vendor Card Expandable

**Feature**: 028-vendor-card-expandable
**Date**: 2026-01-23

## Entity Relationship Diagram

```
┌─────────────────────┐
│       Vendor        │
├─────────────────────┤
│ id (PK)             │
│ wedding_id (FK)     │
│ vendor_type         │
│ company_name        │
│ contact_name        │
│ contact_email       │
│ contact_phone       │
│ address             │
│ website             │
│ notes               │
│ status              │
│ contract_signed     │
│ contract_date       │
│ contract_expiry_date│
│ contract_value      │
│ cancellation_policy │
│ cancellation_fee_pct│
│ insurance_required  │
│ insurance_verified  │
│ insurance_expiry_dt │
│ bank_name           │
│ account_name        │
│ account_number      │
│ branch_code         │
│ swift_code          │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ VendorPaymentSchedule│   │   VendorInvoice     │    │   VendorContact     │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ id (PK)             │    │ id (PK)             │    │ id (PK)             │
│ vendor_id (FK)      │    │ vendor_id (FK)      │    │ vendor_id (FK)      │
│ milestone_name      │    │ payment_schedule_id │    │ contact_name        │
│ due_date            │    │ invoice_number      │    │ contact_role        │
│ amount              │    │ invoice_date        │    │ contact_email       │
│ percentage          │    │ due_date            │    │ contact_phone       │
│ status              │    │ amount              │    │ is_primary          │
│ paid_date           │    │ vat_amount          │    │ is_onsite_contact   │
│ payment_method      │    │ total_amount        │    │ created_at          │
│ payment_reference   │    │ status              │    │ updated_at          │
│ notes               │    │ paid_date           │    └─────────────────────┘
│ created_at          │    │ payment_method      │
│ updated_at          │    │ payment_reference   │
└─────────────────────┘    │ notes               │
                           │ created_at          │
                           │ updated_at          │
                           └─────────────────────┘
```

## Entity Definitions

### Vendor (Primary Entity)

**Source**: `src/types/vendor.ts`
**Table**: `vendors`

| Field | Type | Nullable | Description | Tab |
|-------|------|----------|-------------|-----|
| id | uuid | No | Primary key | - |
| wedding_id | uuid | No | Foreign key to weddings | - |
| vendor_type | VendorType | No | Enum: Catering, Photography, etc. | Overview |
| company_name | string | No | Business name | Overview |
| contact_name | string | No | Primary contact person | Overview |
| contact_email | string | Yes | Email address | Overview |
| contact_phone | string | Yes | Phone number | Overview |
| address | string | Yes | Business address | Overview |
| website | string | Yes | Website URL | Overview |
| notes | string | Yes | General notes | Overview |
| status | VendorStatus | No | active/inactive/backup | Overview |
| contract_signed | boolean | No | Whether contract is signed | Contract |
| contract_date | date | Yes | Date contract was signed | Contract |
| contract_expiry_date | date | Yes | Contract expiration date | Contract |
| contract_value | decimal | Yes | Total contract amount | Contract |
| cancellation_policy | string | Yes | Cancellation terms | Contract |
| cancellation_fee_percentage | decimal | Yes | Fee percentage (0-100) | Contract |
| insurance_required | boolean | No | Whether insurance needed | Contract |
| insurance_verified | boolean | No | Whether insurance verified | Contract |
| insurance_expiry_date | date | Yes | Insurance expiration | Contract |
| bank_name | string | Yes | Bank name | Contract |
| account_name | string | Yes | Account holder name | Contract |
| account_number | string | Yes | Account number (masked) | Contract |
| branch_code | string | Yes | Bank branch code | Contract |
| swift_code | string | Yes | SWIFT/BIC code | Contract |
| created_at | timestamp | No | Creation timestamp | - |
| updated_at | timestamp | No | Last update timestamp | - |

**Enums**:
```typescript
type VendorType =
  | 'Catering' | 'Photography' | 'Videography' | 'Flowers' | 'Florist'
  | 'Music/DJ' | 'Entertainment' | 'Venue' | 'Transportation' | 'Officiant'
  | 'Hair/Makeup' | 'Hair & Makeup' | 'Rentals' | 'Decor' | 'Cake'
  | 'Stationery' | 'Beverages' | 'Other';

type VendorStatus = 'active' | 'inactive' | 'backup';
```

### VendorPaymentSchedule (Payments Tab)

**Source**: `src/types/vendor.ts`
**Table**: `vendor_payment_schedule`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | uuid | No | Primary key |
| vendor_id | uuid | No | Foreign key to vendors |
| milestone_name | string | No | Payment milestone name |
| due_date | date | No | Payment due date |
| amount | decimal | No | Payment amount |
| percentage | decimal | Yes | Percentage of contract value |
| status | PaymentStatus | No | pending/paid/overdue/cancelled |
| paid_date | date | Yes | Actual payment date |
| payment_method | string | Yes | Payment method used |
| payment_reference | string | Yes | Reference/confirmation number |
| notes | string | Yes | Additional notes |
| created_at | timestamp | No | Creation timestamp |
| updated_at | timestamp | No | Last update timestamp |

### VendorInvoice (Invoices Tab)

**Source**: `src/types/vendor.ts`
**Table**: `vendor_invoices`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | uuid | No | Primary key |
| vendor_id | uuid | No | Foreign key to vendors |
| payment_schedule_id | uuid | Yes | Link to payment milestone |
| invoice_number | string | No | Invoice reference number |
| invoice_date | date | No | Invoice issue date |
| due_date | date | No | Payment due date |
| amount | decimal | No | Base amount |
| vat_amount | decimal | No | VAT amount |
| total_amount | decimal | No | Total (generated column) |
| status | InvoiceStatus | No | unpaid/paid/partially_paid/overdue/cancelled |
| paid_date | date | Yes | Actual payment date |
| payment_method | string | Yes | Payment method used |
| payment_reference | string | Yes | Reference/confirmation number |
| notes | string | Yes | Additional notes |
| created_at | timestamp | No | Creation timestamp |
| updated_at | timestamp | No | Last update timestamp |

### VendorContact (Contacts Tab)

**Source**: `src/types/vendor.ts`
**Table**: `vendor_contacts`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | uuid | No | Primary key |
| vendor_id | uuid | No | Foreign key to vendors |
| contact_name | string | No | Contact person name |
| contact_role | string | Yes | Role/title |
| contact_email | string | Yes | Email address |
| contact_phone | string | Yes | Phone number |
| is_primary | boolean | No | Primary contact flag |
| is_onsite_contact | boolean | No | On-site day contact flag |
| created_at | timestamp | No | Creation timestamp |
| updated_at | timestamp | No | Last update timestamp |

## Computed/Display Types

### VendorDisplay

**Purpose**: Extended vendor with computed display properties

```typescript
interface VendorDisplay extends Vendor {
  contractStatus: ContractStatusBadge;    // Calculated from contract fields
  paymentStatus: PaymentStatusBadge;      // Calculated from payments
  maskedAccountNumber: string | null;     // ****1234 format
}
```

### ContractStatusBadge

**Purpose**: Computed contract status for badge display

```typescript
type ContractStatusLabel = 'Unsigned' | 'Signed' | 'Expiring Soon' | 'Expired';

interface ContractStatusBadge {
  label: ContractStatusLabel;
  color: 'green' | 'yellow' | 'orange' | 'red';
}
```

**Calculation Logic**:
1. If `contract_signed === false` → Unsigned (yellow)
2. If `contract_signed === true` and no `contract_expiry_date` → Signed (green)
3. If expiry date is in the past → Expired (red)
4. If expiry date is within 30 days → Expiring Soon (orange)
5. Otherwise → Signed (green)

### PaymentSummary

**Purpose**: Summary display for collapsed card

```typescript
interface PaymentSummary {
  paidCount: number;      // Count of payments with status = 'paid'
  totalCount: number;     // Total count of payments
  display: string;        // "2 of 3 paid" or "No payments"
}
```

## Form Data Types

### VendorEditFormData

**Purpose**: Form state for inline editing

```typescript
interface VendorEditFormData {
  // Overview Tab
  vendor_type: VendorType;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  website: string;
  status: VendorStatus;
  notes: string;

  // Contract Tab
  contract_signed: boolean;
  contract_date: string;          // ISO date string
  contract_expiry_date: string;   // ISO date string
  contract_value: string;         // String for form input
  cancellation_policy: string;
  cancellation_fee_percentage: string; // String for form input

  // Insurance (Contract Tab)
  insurance_required: boolean;
  insurance_verified: boolean;
  insurance_expiry_date: string;  // ISO date string
}
```

### MarkAsPaidFormData

**Purpose**: Form data for marking payment/invoice as paid

```typescript
interface MarkAsPaidFormData {
  paid_date: string;           // ISO date string
  payment_method?: string;     // Optional for MVP
  payment_reference?: string;  // Optional for MVP
}
```

## Tab Field Groupings

### Overview Tab Fields
- vendor_type (enum select)
- company_name (text input, required)
- contact_name (text input, required)
- contact_email (email input)
- contact_phone (tel input)
- address (textarea)
- website (url input)
- status (enum select)
- notes (textarea)

### Contract Tab Fields
**Contract Section**:
- contract_signed (checkbox)
- contract_date (date picker)
- contract_expiry_date (date picker)
- contract_value (currency input)
- cancellation_policy (textarea)
- cancellation_fee_percentage (number input 0-100)

**Insurance Section**:
- insurance_required (checkbox)
- insurance_verified (checkbox)
- insurance_expiry_date (date picker)

**Banking Section** (read-only):
- bank_name (display)
- account_name (display)
- account_number (masked display)
- branch_code (display)
- swift_code (display)

### Payments Tab Columns
| Column | Field | Type |
|--------|-------|------|
| Milestone | milestone_name | text |
| Due Date | due_date | date |
| Amount | amount | currency |
| Status | status | badge |
| Action | - | button |

### Invoices Tab Columns
| Column | Field | Type |
|--------|-------|------|
| Invoice # | invoice_number | text |
| Date | invoice_date | date |
| Due Date | due_date | date |
| Amount | amount | currency |
| VAT | vat_amount | currency |
| Total | total_amount | currency |
| Status | status | badge |
| Action | - | button |

### Contacts Tab Columns
| Column | Field | Type |
|--------|-------|------|
| Name | contact_name | text |
| Role | contact_role | text |
| Email | contact_email | email link |
| Phone | contact_phone | tel link |
| Primary | is_primary | badge/icon |
| On-site | is_onsite_contact | badge/icon |
