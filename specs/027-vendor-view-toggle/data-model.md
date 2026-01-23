# Data Model: Vendors View Toggle

**Branch**: `027-vendor-view-toggle` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)

## Primary Entity: VendorTableRow

Extended vendor entity with aggregate counts for table view display.

```typescript
// src/types/vendor-table.ts

/**
 * View mode for vendors page
 */
export type VendorViewMode = 'card' | 'table';

/**
 * Vendor table row - extends base vendor with computed aggregates
 */
export interface VendorTableRow {
  // Identity
  id: string;
  wedding_id: string;

  // Basic Info
  vendor_type: string;
  company_name: string;
  contact_name: string;
  status: 'active' | 'inactive' | 'backup';

  // Contact
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;

  // Contract
  contract_signed: boolean;
  contract_date: string | null;        // ISO date string
  contract_expiry_date: string | null; // ISO date string
  contract_value: number | null;
  cancellation_policy: string | null;
  cancellation_fee_percentage: number | null;

  // Insurance
  insurance_required: boolean;
  insurance_verified: boolean;
  insurance_expiry_date: string | null; // ISO date string

  // Banking
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  branch_code: string | null;
  swift_code: string | null;

  // Metadata
  created_at: string;  // ISO datetime string
  updated_at: string;  // ISO datetime string

  // Computed Aggregates (read-only)
  contacts_count: number;
  payments_count: number;
  invoices_count: number;
}
```

---

## Column Definition Types

```typescript
/**
 * Column categories for grouping in header
 */
export type VendorColumnCategory =
  | 'basic'      // vendor_type, company_name, contact_name, status
  | 'contact'    // contact_email, contact_phone, address, website, notes
  | 'contract'   // contract_signed, contract_date, contract_expiry_date, contract_value, cancellation_policy, cancellation_fee_percentage
  | 'insurance'  // insurance_required, insurance_verified, insurance_expiry_date
  | 'banking'    // bank_name, account_name, account_number, branch_code, swift_code
  | 'aggregates' // contacts_count, payments_count, invoices_count
  | 'metadata';  // created_at, updated_at

/**
 * Cell types for rendering and editing
 */
export type VendorCellType =
  | 'text'       // Plain text input
  | 'email'      // Email with validation
  | 'phone'      // Phone formatting
  | 'url'        // URL with validation
  | 'enum'       // Select dropdown
  | 'boolean'    // Checkbox
  | 'date'       // Date picker
  | 'currency'   // Currency formatting ($X,XXX.XX)
  | 'percentage' // Percentage (0-100%)
  | 'masked'     // Masked value (****1234)
  | 'number'     // Read-only number
  | 'datetime';  // Read-only datetime

/**
 * Column definition for table
 */
export interface VendorTableColumnDef {
  id: string;                           // Unique column identifier
  header: string;                       // Display header text
  field: keyof VendorTableRow;          // Database field name
  category: VendorColumnCategory;       // For grouping in header
  type: VendorCellType;                 // For rendering/editing
  editable: boolean;                    // Allow inline editing
  width: number;                        // Default width in pixels
  minWidth: number;                     // Minimum width
  enumOptions?: string[];               // For enum dropdowns
  required?: boolean;                   // Validation required
}
```

---

## Filter Types

```typescript
/**
 * Filter operators for column filtering
 */
export type VendorFilterOperator =
  | 'equals'
  | 'contains'
  | 'in'
  | 'greaterThan'
  | 'lessThan'
  | 'isNull'
  | 'isNotNull';

/**
 * Column filter definition
 */
export interface VendorColumnFilter {
  column: string;
  operator: VendorFilterOperator;
  value: string | boolean | number | string[] | null;
}

/**
 * Sort configuration
 */
export interface VendorSortConfig {
  column: string;
  direction: 'asc' | 'desc';
}
```

---

## Cell Edit Payload

```typescript
/**
 * Payload for inline cell edits
 */
export interface VendorCellEditPayload {
  vendorId: string;
  weddingId: string;
  field: keyof VendorTableRow;
  value: string | boolean | number | null;
}
```

---

## Hook Return Types

```typescript
/**
 * Return type for useVendorTableData hook
 */
export interface UseVendorTableDataReturn {
  rows: VendorTableRow[];
  columns: VendorTableColumnDef[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Parameters for useVendorTableData hook
 */
export interface UseVendorTableDataParams {
  weddingId: string;
  filters?: VendorFiltersState;
  columnFilters?: VendorColumnFilter[];
  enabled?: boolean;
}

/**
 * Existing filter state (from VendorFilters component)
 */
export interface VendorFiltersState {
  search: string;
  vendorType: string;       // 'all' | specific vendor type
  status: string;           // 'all' | 'active' | 'inactive' | 'backup'
  contractStatus: string;   // 'all' | 'signed' | 'unsigned'
}
```

---

## Column Definitions

30 columns organized by category:

### Basic Info (4 columns)
| ID | Header | Field | Type | Editable |
|----|--------|-------|------|----------|
| vendor_type | Type | vendor_type | enum | Yes |
| company_name | Company | company_name | text | Yes |
| contact_name | Contact | contact_name | text | Yes |
| status | Status | status | enum | Yes |

### Contact (5 columns)
| ID | Header | Field | Type | Editable |
|----|--------|-------|------|----------|
| contact_email | Email | contact_email | email | Yes |
| contact_phone | Phone | contact_phone | phone | Yes |
| address | Address | address | text | Yes |
| website | Website | website | url | Yes |
| notes | Notes | notes | text | Yes |

### Contract (6 columns)
| ID | Header | Field | Type | Editable |
|----|--------|-------|------|----------|
| contract_signed | Signed | contract_signed | boolean | Yes |
| contract_date | Contract Date | contract_date | date | Yes |
| contract_expiry_date | Expiry Date | contract_expiry_date | date | Yes |
| contract_value | Value | contract_value | currency | Yes |
| cancellation_policy | Cancellation Policy | cancellation_policy | text | Yes |
| cancellation_fee_percentage | Cancel Fee % | cancellation_fee_percentage | percentage | Yes |

### Insurance (3 columns)
| ID | Header | Field | Type | Editable |
|----|--------|-------|------|----------|
| insurance_required | Required | insurance_required | boolean | Yes |
| insurance_verified | Verified | insurance_verified | boolean | Yes |
| insurance_expiry_date | Insurance Expiry | insurance_expiry_date | date | Yes |

### Banking (5 columns)
| ID | Header | Field | Type | Editable |
|----|--------|-------|------|----------|
| bank_name | Bank | bank_name | text | Yes |
| account_name | Account Name | account_name | text | Yes |
| account_number | Account # | account_number | masked | Yes |
| branch_code | Branch Code | branch_code | text | Yes |
| swift_code | SWIFT | swift_code | text | Yes |

### Aggregates (3 columns)
| ID | Header | Field | Type | Editable |
|----|--------|-------|------|----------|
| contacts_count | Contacts | contacts_count | number | No |
| payments_count | Payments | payments_count | number | No |
| invoices_count | Invoices | invoices_count | number | No |

### Metadata (2 columns)
| ID | Header | Field | Type | Editable |
|----|--------|-------|------|----------|
| created_at | Created | created_at | datetime | No |
| updated_at | Updated | updated_at | datetime | No |

---

## Enum Values

```typescript
/**
 * Vendor type options for dropdown
 */
export const VENDOR_TYPE_OPTIONS = [
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
  'Cake',
  'Stationery',
  'Beverages',
  'Other',
] as const;

/**
 * Status options for dropdown
 */
export const VENDOR_STATUS_OPTIONS = [
  'active',
  'inactive',
  'backup',
] as const;
```

---

## Validation Schema

```typescript
import { z } from 'zod';

export const vendorCellSchema = z.object({
  vendor_type: z.string().min(1, 'Vendor type is required'),
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Invalid email format').nullable().optional(),
  website: z.string()
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://'),
      'Website must start with http:// or https://'
    )
    .nullable()
    .optional(),
  contract_value: z.number().positive('Contract value must be positive').nullable().optional(),
  cancellation_fee_percentage: z.number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage must be at most 100')
    .nullable()
    .optional(),
  status: z.enum(['active', 'inactive', 'backup'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});
```
