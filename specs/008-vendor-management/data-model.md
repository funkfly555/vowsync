# Data Model: Vendor Management System (Phase 7A)

**Branch**: `008-vendor-management` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)

## Entity Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Entity Relationships                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Wedding (1) ─────────────────────────────────────── (*) Vendor      │
│                                                          │           │
│                                        ┌─────────────────┼──────┐    │
│                                        │                 │      │    │
│                                        ▼                 ▼      ▼    │
│                                  VendorContact    PaymentSchedule    │
│                                   (Phase 7B)       (Phase 7B)        │
│                                                          │           │
│                                                          ▼           │
│                                                    VendorInvoice     │
│                                                     (Phase 7B)       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Primary Entity: Vendor

### Database Schema (Existing)

```sql
-- Table: vendors (EXISTS - no migration needed)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,

  -- Basic Info (FR-006, FR-007)
  vendor_type TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  website TEXT,

  -- Contract Details (FR-008)
  contract_signed BOOLEAN DEFAULT FALSE,
  contract_date DATE,
  contract_expiry_date DATE,
  contract_value DECIMAL(12, 2),
  cancellation_policy TEXT,
  cancellation_fee_percentage DECIMAL(5, 2),
  insurance_required BOOLEAN DEFAULT FALSE,
  insurance_verified BOOLEAN DEFAULT FALSE,
  insurance_expiry_date DATE,

  -- Banking Information
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  branch_code TEXT,
  swift_code TEXT,

  -- Metadata
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'backup')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (EXISTS)
CREATE INDEX idx_vendors_wedding ON vendors(wedding_id);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_contract_expiry ON vendors(contract_expiry_date);
CREATE INDEX idx_vendors_insurance_expiry ON vendors(insurance_expiry_date);
```

### TypeScript Interface

```typescript
// src/types/vendor.ts

/**
 * Database entity - mirrors Supabase vendors table
 */
export interface Vendor {
  id: string;
  wedding_id: string;

  // Basic Info
  vendor_type: VendorType;
  company_name: string;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website: string | null;

  // Contract Details
  contract_signed: boolean;
  contract_date: string | null;
  contract_expiry_date: string | null;
  contract_value: number | null;
  cancellation_policy: string | null;
  cancellation_fee_percentage: number | null;
  insurance_required: boolean;
  insurance_verified: boolean;
  insurance_expiry_date: string | null;

  // Banking Information
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  branch_code: string | null;
  swift_code: string | null;

  // Metadata
  notes: string | null;
  status: VendorStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Vendor type enumeration
 */
export type VendorType =
  | 'Catering'
  | 'Photography'
  | 'Videography'
  | 'Flowers'
  | 'Music/DJ'
  | 'Venue'
  | 'Transportation'
  | 'Officiant'
  | 'Hair/Makeup'
  | 'Rentals'
  | 'Decor'
  | 'Other';

/**
 * Vendor status enumeration
 */
export type VendorStatus = 'active' | 'inactive' | 'backup';

/**
 * Contract status for badge display (FR-012)
 * Calculated at runtime, not stored
 */
export type ContractStatusLabel = 'Unsigned' | 'Signed' | 'Expiring Soon' | 'Expired';

export interface ContractStatusBadge {
  label: ContractStatusLabel;
  color: 'green' | 'yellow' | 'orange' | 'red';
}

/**
 * Payment status for badge display (FR-013)
 * Phase 7A: Always 'Pending' placeholder
 * Phase 7B: Calculated from vendor_payment_schedule
 */
export type PaymentStatusLabel = 'Paid' | 'Pending' | 'Overdue' | 'Due Soon';

export interface PaymentStatusBadge {
  label: PaymentStatusLabel;
  color: 'green' | 'blue' | 'red' | 'orange';
}
```

### Display Type (with computed fields)

```typescript
/**
 * Extended vendor with computed display properties
 */
export interface VendorDisplay extends Vendor {
  contractStatus: ContractStatusBadge;
  paymentStatus: PaymentStatusBadge;
  maskedAccountNumber: string | null;
}

/**
 * Calculate contract status badge (FR-012)
 */
export function calculateContractStatus(vendor: Vendor): ContractStatusBadge {
  if (!vendor.contract_signed) {
    return { label: 'Unsigned', color: 'yellow' };
  }

  if (!vendor.contract_expiry_date) {
    return { label: 'Signed', color: 'green' };
  }

  const today = new Date();
  const expiry = new Date(vendor.contract_expiry_date);
  const daysUntilExpiry = Math.floor(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) {
    return { label: 'Expired', color: 'red' };
  }

  if (daysUntilExpiry <= 30) {
    return { label: 'Expiring Soon', color: 'orange' };
  }

  return { label: 'Signed', color: 'green' };
}

/**
 * Calculate payment status badge (FR-013)
 * Phase 7A: Always returns 'Pending' placeholder
 */
export function calculatePaymentStatus(_vendor: Vendor): PaymentStatusBadge {
  // Phase 7A placeholder - will be implemented in Phase 7B
  return { label: 'Pending', color: 'blue' };
}

/**
 * Mask account number for card display
 */
export function maskAccountNumber(accountNumber: string | null): string | null {
  if (!accountNumber || accountNumber.length < 4) return null;
  return `••••${accountNumber.slice(-4)}`;
}

/**
 * Transform raw vendor to display vendor
 */
export function toVendorDisplay(vendor: Vendor): VendorDisplay {
  return {
    ...vendor,
    contractStatus: calculateContractStatus(vendor),
    paymentStatus: calculatePaymentStatus(vendor),
    maskedAccountNumber: maskAccountNumber(vendor.account_number),
  };
}
```

### Filter Type

```typescript
/**
 * Filter options for vendor list (FR-004)
 */
export interface VendorFilters {
  search: string;
  vendorType: VendorType | 'all';
  contractStatus: ContractStatusLabel | 'all';
  paymentStatus: PaymentStatusLabel | 'all';
}

/**
 * Default filter values
 */
export const DEFAULT_VENDOR_FILTERS: VendorFilters = {
  search: '',
  vendorType: 'all',
  contractStatus: 'all',
  paymentStatus: 'all',
};
```

### Form Data Type

```typescript
/**
 * Form data for create/edit vendor modal (FR-006)
 */
export interface VendorFormData {
  // Basic Info Tab
  vendor_type: VendorType;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  website: string;
  notes: string;
  status: VendorStatus;

  // Contract Details Tab (FR-008)
  contract_signed: boolean;
  contract_date: string;
  contract_expiry_date: string;
  contract_value: string; // string for form input
  cancellation_policy: string;
  cancellation_fee_percentage: string; // string for form input
  insurance_required: boolean;
  insurance_verified: boolean;
  insurance_expiry_date: string;

  // Banking Information Tab
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_code: string;
  swift_code: string;
}

/**
 * Default form values for new vendor
 */
export const DEFAULT_VENDOR_FORM: VendorFormData = {
  vendor_type: 'Other',
  company_name: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  address: '',
  website: '',
  notes: '',
  status: 'active',
  contract_signed: false,
  contract_date: '',
  contract_expiry_date: '',
  contract_value: '',
  cancellation_policy: '',
  cancellation_fee_percentage: '',
  insurance_required: false,
  insurance_verified: false,
  insurance_expiry_date: '',
  bank_name: '',
  account_name: '',
  account_number: '',
  branch_code: '',
  swift_code: '',
};
```

---

## Validation Schema

```typescript
// src/schemas/vendor.ts
import { z } from 'zod';

/**
 * Vendor type options for select dropdown
 */
export const VENDOR_TYPES = [
  'Catering',
  'Photography',
  'Videography',
  'Flowers',
  'Music/DJ',
  'Venue',
  'Transportation',
  'Officiant',
  'Hair/Makeup',
  'Rentals',
  'Decor',
  'Other',
] as const;

export const VENDOR_STATUSES = ['active', 'inactive', 'backup'] as const;

/**
 * Zod schema for vendor form validation (FR-019, FR-020, FR-021)
 */
export const vendorSchema = z.object({
  // Basic Info - Required fields (FR-007)
  vendor_type: z.enum(VENDOR_TYPES, {
    required_error: 'Vendor type is required',
  }),
  company_name: z.string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters'),
  contact_name: z.string()
    .min(1, 'Contact name is required')
    .max(100, 'Contact name must be less than 100 characters'),

  // Basic Info - Optional fields
  contact_email: z.string()
    .email('Invalid email format')
    .or(z.literal(''))
    .optional()
    .transform(val => val || null), // FR-019
  contact_phone: z.string()
    .max(30, 'Phone number must be less than 30 characters')
    .optional()
    .transform(val => val || null),
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .transform(val => val || null),
  website: z.string()
    .url('Invalid URL format')
    .or(z.literal(''))
    .optional()
    .transform(val => val || null),
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .transform(val => val || null),
  status: z.enum(VENDOR_STATUSES).default('active'),

  // Contract Details
  contract_signed: z.boolean().default(false),
  contract_date: z.string()
    .optional()
    .transform(val => val || null),
  contract_expiry_date: z.string()
    .optional()
    .transform(val => val || null),
  contract_value: z.string()
    .optional()
    .transform(val => {
      if (!val) return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    })
    .refine(val => val === null || val >= 0, {
      message: 'Contract value must be non-negative', // FR-020
    }),
  cancellation_policy: z.string()
    .max(1000, 'Cancellation policy must be less than 1000 characters')
    .optional()
    .transform(val => val || null),
  cancellation_fee_percentage: z.string()
    .optional()
    .transform(val => {
      if (!val) return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    })
    .refine(val => val === null || (val >= 0 && val <= 100), {
      message: 'Cancellation fee must be between 0 and 100%', // FR-020
    }),
  insurance_required: z.boolean().default(false),
  insurance_verified: z.boolean().default(false),
  insurance_expiry_date: z.string()
    .optional()
    .transform(val => val || null),

  // Banking Information
  bank_name: z.string()
    .max(100, 'Bank name must be less than 100 characters')
    .optional()
    .transform(val => val || null),
  account_name: z.string()
    .max(100, 'Account name must be less than 100 characters')
    .optional()
    .transform(val => val || null),
  account_number: z.string()
    .max(50, 'Account number must be less than 50 characters')
    .optional()
    .transform(val => val || null),
  branch_code: z.string()
    .max(20, 'Branch code must be less than 20 characters')
    .optional()
    .transform(val => val || null),
  swift_code: z.string()
    .max(20, 'SWIFT code must be less than 20 characters')
    .optional()
    .transform(val => val || null),
}).refine(
  // FR-021: Validate contract_expiry_date > contract_date
  (data) => {
    if (data.contract_date && data.contract_expiry_date) {
      return new Date(data.contract_expiry_date) > new Date(data.contract_date);
    }
    return true;
  },
  {
    message: 'Contract expiry date must be after contract date',
    path: ['contract_expiry_date'],
  }
);

export type VendorSchemaType = z.infer<typeof vendorSchema>;
```

---

## Related Entities (Phase 7B - Deferred)

### VendorContact (Read-only display in Phase 7A)

```typescript
// For Phase 7B CRUD implementation
export interface VendorContact {
  id: string;
  vendor_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### VendorPaymentSchedule (Phase 7B)

```typescript
// For Phase 7B CRUD implementation
export interface VendorPaymentSchedule {
  id: string;
  vendor_id: string;
  description: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### VendorInvoice (Phase 7B)

```typescript
// For Phase 7B CRUD implementation
export interface VendorInvoice {
  id: string;
  vendor_id: string;
  invoice_number: string;
  amount: number;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  file_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## State Transitions

### Contract Status State Machine

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
┌──────────────┐   check   ┌──────────────┐   30 days   ┌──┴───────────┐
│   Unsigned   │ ────────► │    Signed    │ ──────────► │ Expiring Soon│
│   (yellow)   │  contract │   (green)    │   before    │   (orange)   │
└──────────────┘  signed   └──────────────┘   expiry    └──────────────┘
       ▲                          │                            │
       │                          │                            │
       │ uncheck contract         │ past expiry                │ past expiry
       │                          ▼                            ▼
       │                   ┌──────────────┐              ┌─────────────┐
       └───────────────────│   Expired    │◄─────────────│   Expired   │
                           │    (red)     │              │    (red)    │
                           └──────────────┘              └─────────────┘
```

### Payment Status State Machine (Phase 7B)

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    ▼                                      │
┌──────────────┐   7 days   ┌──────────────┐   past due  ┌─┴────────────┐
│   Pending    │ ─────────► │   Due Soon   │ ──────────► │   Overdue    │
│    (blue)    │  before    │   (orange)   │             │    (red)     │
└──────────────┘   due      └──────────────┘             └──────────────┘
       │                          │                            │
       │ all paid                 │ all paid                   │ all paid
       ▼                          ▼                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                              Paid (green)                             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Query Patterns

### Fetch All Vendors (with display transform)

```typescript
// src/hooks/useVendors.ts
const fetchVendors = async (weddingId: string): Promise<VendorDisplay[]> => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return (data || []).map(toVendorDisplay);
};
```

### Fetch Single Vendor

```typescript
// src/hooks/useVendor.ts
const fetchVendor = async (vendorId: string): Promise<VendorDisplay | null> => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .single();

  if (error) throw error;
  return data ? toVendorDisplay(data) : null;
};
```

### Create Vendor

```typescript
// Transform form data to insert payload
const toInsertPayload = (
  weddingId: string,
  formData: VendorSchemaType
): Partial<Vendor> => ({
  wedding_id: weddingId,
  ...formData,
});
```

### Update Vendor

```typescript
// Transform form data to update payload
const toUpdatePayload = (formData: VendorSchemaType): Partial<Vendor> => ({
  ...formData,
  updated_at: new Date().toISOString(),
});
```

---

## Indexing Strategy

| Index | Columns | Purpose |
|-------|---------|---------|
| idx_vendors_wedding | wedding_id | Filter vendors by wedding |
| idx_vendors_type | vendor_type | Filter by vendor type |
| idx_vendors_status | status | Filter by vendor status |
| idx_vendors_contract_expiry | contract_expiry_date | Sort/filter expiring contracts |
| idx_vendors_insurance_expiry | insurance_expiry_date | Sort/filter expiring insurance |

All indexes already exist in the database.
