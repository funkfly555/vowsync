/**
 * Vendor Table Column Definitions
 * @feature 027-vendor-view-toggle
 *
 * 30 columns organized by category:
 * - Basic Info (4 columns)
 * - Contact (5 columns)
 * - Contract (6 columns)
 * - Insurance (3 columns)
 * - Banking (5 columns)
 * - Aggregates (3 columns - read-only)
 * - Metadata (2 columns - read-only)
 */

import type {
  VendorTableColumnDef,
  VendorColumnCategory,
} from '@/types/vendor-table';
import { VENDOR_TYPE_OPTIONS, VENDOR_STATUS_OPTIONS } from '@/types/vendor-table';

/**
 * All 30 vendor table columns
 */
export const VENDOR_TABLE_COLUMNS: VendorTableColumnDef[] = [
  // =========================================================================
  // Basic Info (4 columns)
  // =========================================================================
  {
    id: 'vendor_type',
    header: 'Type',
    field: 'vendor_type',
    category: 'basic',
    type: 'enum',
    editable: true,
    width: 140,
    minWidth: 120,
    enumOptions: VENDOR_TYPE_OPTIONS,
    required: true,
  },
  {
    id: 'company_name',
    header: 'Company',
    field: 'company_name',
    category: 'basic',
    type: 'text',
    editable: true,
    width: 200,
    minWidth: 150,
    required: true,
  },
  {
    id: 'contact_name',
    header: 'Contact',
    field: 'contact_name',
    category: 'basic',
    type: 'text',
    editable: true,
    width: 160,
    minWidth: 120,
    required: true,
  },
  {
    id: 'status',
    header: 'Status',
    field: 'status',
    category: 'basic',
    type: 'enum',
    editable: true,
    width: 100,
    minWidth: 90,
    enumOptions: VENDOR_STATUS_OPTIONS,
  },

  // =========================================================================
  // Contact (5 columns)
  // =========================================================================
  {
    id: 'contact_email',
    header: 'Email',
    field: 'contact_email',
    category: 'contact',
    type: 'email',
    editable: true,
    width: 200,
    minWidth: 150,
  },
  {
    id: 'contact_phone',
    header: 'Phone',
    field: 'contact_phone',
    category: 'contact',
    type: 'phone',
    editable: true,
    width: 140,
    minWidth: 120,
  },
  {
    id: 'address',
    header: 'Address',
    field: 'address',
    category: 'contact',
    type: 'text',
    editable: true,
    width: 250,
    minWidth: 150,
  },
  {
    id: 'website',
    header: 'Website',
    field: 'website',
    category: 'contact',
    type: 'url',
    editable: true,
    width: 200,
    minWidth: 150,
  },
  {
    id: 'notes',
    header: 'Notes',
    field: 'notes',
    category: 'contact',
    type: 'text',
    editable: true,
    width: 250,
    minWidth: 150,
  },

  // =========================================================================
  // Contract (6 columns)
  // =========================================================================
  {
    id: 'contract_signed',
    header: 'Signed',
    field: 'contract_signed',
    category: 'contract',
    type: 'boolean',
    editable: true,
    width: 80,
    minWidth: 70,
  },
  {
    id: 'contract_date',
    header: 'Contract Date',
    field: 'contract_date',
    category: 'contract',
    type: 'date',
    editable: true,
    width: 130,
    minWidth: 110,
  },
  {
    id: 'contract_expiry_date',
    header: 'Expiry Date',
    field: 'contract_expiry_date',
    category: 'contract',
    type: 'date',
    editable: true,
    width: 130,
    minWidth: 110,
  },
  {
    id: 'contract_value',
    header: 'Value',
    field: 'contract_value',
    category: 'contract',
    type: 'currency',
    editable: true,
    width: 120,
    minWidth: 100,
  },
  {
    id: 'cancellation_policy',
    header: 'Cancellation Policy',
    field: 'cancellation_policy',
    category: 'contract',
    type: 'text',
    editable: true,
    width: 200,
    minWidth: 150,
  },
  {
    id: 'cancellation_fee_percentage',
    header: 'Cancel Fee %',
    field: 'cancellation_fee_percentage',
    category: 'contract',
    type: 'percentage',
    editable: true,
    width: 110,
    minWidth: 90,
  },

  // =========================================================================
  // Insurance (3 columns)
  // =========================================================================
  {
    id: 'insurance_required',
    header: 'Required',
    field: 'insurance_required',
    category: 'insurance',
    type: 'boolean',
    editable: true,
    width: 90,
    minWidth: 80,
  },
  {
    id: 'insurance_verified',
    header: 'Verified',
    field: 'insurance_verified',
    category: 'insurance',
    type: 'boolean',
    editable: true,
    width: 90,
    minWidth: 80,
  },
  {
    id: 'insurance_expiry_date',
    header: 'Insurance Expiry',
    field: 'insurance_expiry_date',
    category: 'insurance',
    type: 'date',
    editable: true,
    width: 140,
    minWidth: 120,
  },

  // =========================================================================
  // Banking (5 columns)
  // =========================================================================
  {
    id: 'bank_name',
    header: 'Bank',
    field: 'bank_name',
    category: 'banking',
    type: 'text',
    editable: true,
    width: 150,
    minWidth: 120,
  },
  {
    id: 'account_name',
    header: 'Account Name',
    field: 'account_name',
    category: 'banking',
    type: 'text',
    editable: true,
    width: 180,
    minWidth: 140,
  },
  {
    id: 'account_number',
    header: 'Account #',
    field: 'account_number',
    category: 'banking',
    type: 'masked',
    editable: true,
    width: 120,
    minWidth: 100,
  },
  {
    id: 'branch_code',
    header: 'Branch Code',
    field: 'branch_code',
    category: 'banking',
    type: 'text',
    editable: true,
    width: 110,
    minWidth: 90,
  },
  {
    id: 'swift_code',
    header: 'SWIFT',
    field: 'swift_code',
    category: 'banking',
    type: 'text',
    editable: true,
    width: 110,
    minWidth: 90,
  },

  // =========================================================================
  // Aggregates (3 columns - read-only)
  // =========================================================================
  {
    id: 'contacts_count',
    header: 'Contacts',
    field: 'contacts_count',
    category: 'aggregates',
    type: 'number',
    editable: false,
    width: 90,
    minWidth: 80,
  },
  {
    id: 'payments_count',
    header: 'Payments',
    field: 'payments_count',
    category: 'aggregates',
    type: 'number',
    editable: false,
    width: 90,
    minWidth: 80,
  },
  {
    id: 'invoices_count',
    header: 'Invoices',
    field: 'invoices_count',
    category: 'aggregates',
    type: 'number',
    editable: false,
    width: 90,
    minWidth: 80,
  },

  // =========================================================================
  // Metadata (2 columns - read-only)
  // =========================================================================
  {
    id: 'created_at',
    header: 'Created',
    field: 'created_at',
    category: 'metadata',
    type: 'datetime',
    editable: false,
    width: 160,
    minWidth: 140,
  },
  {
    id: 'updated_at',
    header: 'Updated',
    field: 'updated_at',
    category: 'metadata',
    type: 'datetime',
    editable: false,
    width: 160,
    minWidth: 140,
  },
];

/**
 * Category configuration for header rendering
 */
export const CATEGORY_CONFIG: Record<
  VendorColumnCategory,
  { label: string; color: string }
> = {
  basic: {
    label: 'Basic Info',
    color: 'bg-[#D4A5A5]/30',
  },
  contact: {
    label: 'Contact',
    color: 'bg-blue-100',
  },
  contract: {
    label: 'Contract',
    color: 'bg-green-100',
  },
  insurance: {
    label: 'Insurance',
    color: 'bg-yellow-100',
  },
  banking: {
    label: 'Banking',
    color: 'bg-purple-100',
  },
  aggregates: {
    label: 'Aggregates',
    color: 'bg-orange-100',
  },
  metadata: {
    label: 'Metadata',
    color: 'bg-gray-100',
  },
};

/**
 * Get columns grouped by category (for header rendering)
 */
export function groupColumnsByCategory(
  columns: VendorTableColumnDef[]
): Map<VendorColumnCategory, VendorTableColumnDef[]> {
  const groups = new Map<VendorColumnCategory, VendorTableColumnDef[]>();

  for (const column of columns) {
    if (!groups.has(column.category)) {
      groups.set(column.category, []);
    }
    groups.get(column.category)!.push(column);
  }

  return groups;
}

/**
 * Category order for consistent display
 */
export const CATEGORY_ORDER: VendorColumnCategory[] = [
  'basic',
  'contact',
  'contract',
  'insurance',
  'banking',
  'aggregates',
  'metadata',
];
