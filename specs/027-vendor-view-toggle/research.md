# Research Summary: Vendors View Toggle

**Branch**: `027-vendor-view-toggle` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)

## R1: Existing Pattern Analysis

**Question**: What pattern should we follow for implementing Card/Table view toggle?

**Decision**: Reuse CARD-TABLE-VIEW-PATTERN.md from Phase 026 Guests implementation

**Rationale**:
- Pattern is proven and well-documented
- Already follows VowSync constitution and design system
- Reduces implementation risk and time
- Ensures UI/UX consistency across the application

**Reference Files**:
| File | Purpose |
|------|---------|
| `docs/CARD-TABLE-VIEW-PATTERN.md` | Complete implementation guide |
| `src/components/guests/table/*` | Working reference implementation |
| `src/hooks/useGuestTableData.ts` | Data fetching pattern with TanStack Query |
| `src/lib/guest-table-utils.ts` | Utility functions for filtering, sorting |
| `src/types/guest-table.ts` | TypeScript interfaces |

---

## R2: Database Field Mapping

**Question**: What fields exist in the vendors table and how should they be named?

**Decision**: Use exact snake_case field names from the vendors table (27 fields)

**Verified Fields** (from Supabase schema):

| Category | Fields |
|----------|--------|
| Identity | `id`, `wedding_id` |
| Basic Info | `vendor_type`, `company_name`, `contact_name`, `status` |
| Contact | `contact_email`, `contact_phone`, `address`, `website`, `notes` |
| Contract | `contract_signed`, `contract_date`, `contract_expiry_date`, `contract_value`, `cancellation_policy`, `cancellation_fee_percentage` |
| Insurance | `insurance_required`, `insurance_verified`, `insurance_expiry_date` |
| Banking | `bank_name`, `account_name`, `account_number`, `branch_code`, `swift_code` |
| Metadata | `created_at`, `updated_at` |

**Aggregate Counts** (computed via Supabase count):
- `contacts_count` (from `vendor_contacts` table)
- `payments_count` (from `vendor_payment_schedule` table)
- `invoices_count` (from `vendor_invoices` table)

**Important**: Use exact snake_case names. The database uses `vendor_type`, NOT `vendorType` or `category`.

---

## R3: Cell Type Mapping

**Question**: What cell types are needed for vendor fields?

**Decision**: Map vendor fields to appropriate cell types, including new types not in Guests implementation

| Cell Type | Fields | Notes |
|-----------|--------|-------|
| text | `company_name`, `contact_name`, `address`, `notes`, `cancellation_policy`, `bank_name`, `account_name`, `branch_code`, `swift_code` | Standard text input |
| email | `contact_email` | Email validation |
| phone | `contact_phone` | Phone formatting (new type) |
| url | `website` | URL validation (new type) |
| enum | `vendor_type`, `status` | Dropdown select |
| boolean | `contract_signed`, `insurance_required`, `insurance_verified` | Checkbox |
| date | `contract_date`, `contract_expiry_date`, `insurance_expiry_date` | Date picker |
| currency | `contract_value` | Currency formatting (new type) |
| percentage | `cancellation_fee_percentage` | Percentage formatting (new type) |
| masked | `account_number` | Show last 4 digits only (new type) |
| number | `contacts_count`, `payments_count`, `invoices_count` | Read-only counts |
| datetime | `created_at`, `updated_at` | Read-only timestamps |

**New Cell Types Required**:
- `phone` - Display formatted, validate on edit
- `url` - Display as link, validate http/https
- `currency` - Display with $ symbol and formatting
- `percentage` - Display with % symbol, validate 0-100
- `masked` - Display as `****1234`, reveal full value on edit

---

## R4: Component Reuse Strategy

**Question**: Which components can be reused from guests/table/?

**Decision**: Copy and adapt components from `src/components/guests/table/`

**Components to Copy (Generic)**:
| Component | Reusability | Changes Needed |
|-----------|-------------|----------------|
| `ColumnFilterDropdown.tsx` | 100% | None - fully generic |
| `ActiveFiltersBar.tsx` | 100% | None - fully generic |
| `ViewToggle.tsx` | 95% | Update localStorage key |

**Components to Create New (Vendor-Specific)**:
| Component | Reason |
|-----------|--------|
| `VendorTableView.tsx` | Container with vendor-specific layout |
| `VendorTableHeader.tsx` | Vendor column categories |
| `VendorTableRow.tsx` | Vendor row structure |
| `VendorTableCell.tsx` | All cell types including new ones |
| `tableColumns.ts` | Vendor-specific column definitions |

---

## R5: Validation Rules

**Question**: What validation rules apply to vendor fields?

**Decision**: Implement in VendorTableCell using Zod validation before save

| Field | Rule | Error Message |
|-------|------|---------------|
| `vendor_type` | Required, must be valid enum | "Vendor type is required" |
| `company_name` | Required, non-empty | "Company name is required" |
| `contact_name` | Required, non-empty | "Contact name is required" |
| `contact_email` | Optional, valid email format | "Invalid email format" |
| `website` | Optional, must start with http:// or https:// | "Website must start with http:// or https://" |
| `contract_expiry_date` | Must be >= contract_date | "Expiry date must be after contract date" |
| `insurance_expiry_date` | Warning if past when insurance_required=true | "Insurance has expired" (warning) |
| `contract_value` | Must be positive number or null | "Contract value must be positive" |
| `cancellation_fee_percentage` | Must be 0-100 or null | "Percentage must be between 0 and 100" |
| `status` | Must be 'active', 'inactive', or 'backup' | "Invalid status" |

---

## R6: Related Tables Structure

**Question**: What related tables affect vendor display?

**Findings**:

### vendor_contacts (10 fields)
- `id`, `vendor_id`, `wedding_id`
- `name`, `role`, `email`, `phone`, `notes`
- `is_primary`
- `created_at`

### vendor_payment_schedule (13 fields)
- `id`, `vendor_id`, `wedding_id`
- `milestone_name`, `description`
- `amount`, `percentage_of_total`
- `due_date`, `status`, `paid_date`
- `payment_method`, `notes`
- `created_at`

### vendor_invoices (16 fields)
- `id`, `vendor_id`, `wedding_id`
- `invoice_number`, `invoice_date`, `due_date`
- `amount`, `tax_amount`, `total_amount`
- `status`, `paid_date`
- `description`, `notes`, `file_url`
- `created_at`, `updated_at`

**Implementation Note**: Aggregate counts are computed with separate Supabase count queries for performance.

---

## R7: Enum Values

**Question**: What are the valid enum values for vendor fields?

**Verified Values**:

### vendor_type (from database)
```
Catering, Photography, Videography, Flowers, Florist, Music/DJ, Entertainment,
Venue, Transportation, Officiant, Hair/Makeup, Hair & Makeup, Rentals, Decor,
Cake, Stationery, Beverages, Other
```

### status
```
active, inactive, backup
```

**Note**: `vendor_type` has some duplicates (Flowers/Florist, Hair/Makeup/Hair & Makeup) due to historical data. The defensive fallback pattern handles unknown types.

---

## Summary

All research questions answered. Key findings:
1. Follow CARD-TABLE-VIEW-PATTERN.md exactly
2. 27 vendor fields + 3 computed aggregates = 30 columns
3. 6 new cell types needed (phone, url, currency, percentage, masked, email)
4. 2 generic components can be copied as-is
5. 5 vendor-specific components must be created
6. 10 validation rules to implement
