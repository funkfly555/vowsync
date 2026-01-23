/**
 * Vendor Table View Types
 * @feature 027-vendor-view-toggle
 * Types for the Table View of the Vendors page
 */

import type { Vendor, VendorType, VendorStatus } from './vendor';

// =============================================================================
// View Mode
// =============================================================================

/**
 * View mode for the Vendors page
 */
export type VendorViewMode = 'card' | 'table';

// =============================================================================
// Column Categories & Cell Types
// =============================================================================

/**
 * Column category for grouping in table header
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
 * Cell data type for rendering and editing
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

// =============================================================================
// Column Definition
// =============================================================================

/**
 * Column definition for the vendor table
 */
export interface VendorTableColumnDef {
  /** Unique column identifier */
  id: string;
  /** Display header text */
  header: string;
  /** Database field name */
  field: keyof VendorTableRow;
  /** Column category for grouping */
  category: VendorColumnCategory;
  /** Data type for rendering */
  type: VendorCellType;
  /** Whether the cell is editable */
  editable: boolean;
  /** Default width in pixels */
  width: number;
  /** Minimum width when resizing */
  minWidth: number;
  /** Options for enum fields */
  enumOptions?: readonly string[];
  /** Whether field is required for validation */
  required?: boolean;
}

// =============================================================================
// Row Data
// =============================================================================

/**
 * Vendor table row - extends base vendor with computed aggregates
 */
export interface VendorTableRow extends Vendor {
  // Computed Aggregates (read-only)
  contacts_count: number;
  payments_count: number;
  invoices_count: number;
}

// =============================================================================
// Filter Types
// =============================================================================

/**
 * Filter operator type
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
 * Column filter configuration
 */
export interface VendorColumnFilter {
  column: string;
  operator: VendorFilterOperator;
  value: string | boolean | number | string[] | null;
}

// =============================================================================
// Sort Configuration
// =============================================================================

/**
 * Sort configuration for table
 */
export interface VendorSortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

// =============================================================================
// Edit Payload
// =============================================================================

/**
 * Cell edit event payload
 */
export interface VendorCellEditPayload {
  vendorId: string;
  weddingId: string;
  field: keyof Vendor;
  value: string | boolean | number | null;
}

// =============================================================================
// Hook Types
// =============================================================================

/**
 * Existing filter state (from VendorFilters component)
 */
export interface VendorFiltersState {
  search: string;
  vendorType: VendorType | 'all';
  status: VendorStatus | 'all';
  contractStatus: string;
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

// =============================================================================
// Table State
// =============================================================================

/**
 * Table state for managing view
 */
export interface VendorTableState {
  sortConfig: VendorSortConfig | null;
  columnFilters: VendorColumnFilter[];
  columnWidths: Record<string, number>;
}

// =============================================================================
// Constants
// =============================================================================

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
export const VENDOR_STATUS_OPTIONS = ['active', 'inactive', 'backup'] as const;
