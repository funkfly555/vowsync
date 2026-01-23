/**
 * Vendor Table Utilities
 * @feature 027-vendor-view-toggle
 * Transform, filter, and sort functions for the vendor table view
 */

import type {
  VendorTableRow,
  VendorFiltersState,
  VendorColumnFilter,
  VendorSortConfig,
  VendorViewMode,
} from '@/types/vendor-table';
import type { Vendor } from '@/types/vendor';

// =============================================================================
// View Preference (localStorage)
// =============================================================================

const VIEW_PREFERENCE_KEY = 'vendorsViewPreference';

/**
 * Get saved view preference from localStorage
 * Defaults to 'card' if not set or on error
 */
export function getVendorViewPreference(): VendorViewMode {
  try {
    const stored = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return stored === 'table' ? 'table' : 'card';
  } catch {
    return 'card';
  }
}

/**
 * Save view preference to localStorage
 */
export function setVendorViewPreference(mode: VendorViewMode): void {
  try {
    localStorage.setItem(VIEW_PREFERENCE_KEY, mode);
  } catch {
    // Silent fail if localStorage unavailable
  }
}

// =============================================================================
// Display Formatting
// =============================================================================

/**
 * Mask account number for display (show last 4 digits only)
 * Returns empty string if account number is null/empty
 */
export function maskAccountNumber(accountNumber: string | null): string {
  if (!accountNumber || accountNumber.length < 4) return '';
  return '****' + accountNumber.slice(-4);
}

/**
 * Format currency value for display
 * Returns formatted string with $ symbol
 */
export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '';
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format percentage value for display
 * Returns formatted string with % symbol
 */
export function formatPercentage(value: number | null): string {
  if (value === null || value === undefined) return '';
  return `${value}%`;
}

/**
 * Format date value for display
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format datetime value for display
 */
export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format enum value to display label
 * Converts snake_case to Title Case
 */
export function formatEnumLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// =============================================================================
// Vendor Filters (shared between Card and Table views)
// =============================================================================

/**
 * Apply shared vendor filters to rows
 * This matches the existing VendorFilters component behavior
 */
export function applyVendorFilters(
  rows: VendorTableRow[],
  filters?: VendorFiltersState
): VendorTableRow[] {
  if (!filters) return rows;

  let result = [...rows];

  // Search filter (company_name, contact_name, contact_email)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (row) =>
        row.company_name.toLowerCase().includes(searchLower) ||
        row.contact_name.toLowerCase().includes(searchLower) ||
        row.contact_email?.toLowerCase().includes(searchLower) ||
        row.notes?.toLowerCase().includes(searchLower)
    );
  }

  // Vendor type filter
  if (filters.vendorType && filters.vendorType !== 'all') {
    result = result.filter((row) => row.vendor_type === filters.vendorType);
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    result = result.filter((row) => row.status === filters.status);
  }

  // Contract status filter
  if (filters.contractStatus && filters.contractStatus !== 'all') {
    result = result.filter((row) => {
      switch (filters.contractStatus) {
        case 'signed':
          return row.contract_signed === true;
        case 'unsigned':
          return row.contract_signed === false;
        default:
          return true;
      }
    });
  }

  return result;
}

// =============================================================================
// Column Filters (Table view specific)
// =============================================================================

/**
 * Normalize a value for filter comparison
 * Must match the normalization used in ColumnFilterDropdown
 */
function normalizeValueForFilter(value: unknown): string {
  if (value === null || value === undefined) {
    return '__null__';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
}

/**
 * Get nested value from object using dot notation path
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((curr: unknown, key: string) => {
    if (curr === null || curr === undefined) return undefined;
    return (curr as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Apply column-specific filters to rows
 * Uses AND logic - all filters must pass for a row to be included
 */
export function applyColumnFilters(
  rows: VendorTableRow[],
  filters: VendorColumnFilter[]
): VendorTableRow[] {
  if (filters.length === 0) return rows;

  return rows.filter((row) => {
    return filters.every((filter) => {
      const value = getNestedValue(row, filter.column);
      const normalizedValue = normalizeValueForFilter(value);

      switch (filter.operator) {
        case 'equals':
          return normalizedValue === String(filter.value);
        case 'contains':
          return String(value || '')
            .toLowerCase()
            .includes(String(filter.value).toLowerCase());
        case 'in':
          // The filter.value is an array of normalized strings
          return (
            Array.isArray(filter.value) && filter.value.includes(normalizedValue)
          );
        case 'greaterThan':
          return (value as number) > (filter.value as number);
        case 'lessThan':
          return (value as number) < (filter.value as number);
        case 'isNull':
          return value === null || value === undefined || value === '';
        case 'isNotNull':
          return value !== null && value !== undefined && value !== '';
        default:
          return true;
      }
    });
  });
}

// =============================================================================
// Sorting
// =============================================================================

/**
 * Sort vendor rows by column
 * Null values are sorted to the end
 */
export function sortVendorRows(
  rows: VendorTableRow[],
  sortConfig: VendorSortConfig | undefined
): VendorTableRow[] {
  if (!sortConfig || !sortConfig.column) return rows;

  const sorted = [...rows].sort((a, b) => {
    const aValue = getNestedValue(a, sortConfig.column);
    const bValue = getNestedValue(b, sortConfig.column);

    // Null values always sort to end
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Handle booleans
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return aValue === bValue ? 0 : aValue ? -1 : 1;
    }

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue;
    }

    // Handle strings (including dates as ISO strings)
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return aStr.localeCompare(bStr);
  });

  return sortConfig.direction === 'desc' ? sorted.reverse() : sorted;
}

// =============================================================================
// Data Transformation
// =============================================================================

/**
 * Transform raw vendors with aggregate counts into table rows
 */
export function transformToTableRows(
  vendors: Vendor[],
  contactsCounts: Record<string, number>,
  paymentsCounts: Record<string, number>,
  invoicesCounts: Record<string, number>
): VendorTableRow[] {
  return vendors.map((vendor) => ({
    ...vendor,
    contacts_count: contactsCounts[vendor.id] || 0,
    payments_count: paymentsCounts[vendor.id] || 0,
    invoices_count: invoicesCounts[vendor.id] || 0,
  }));
}

/**
 * Count records by vendor_id
 * Takes an array of records with vendor_id and returns counts
 */
export function countByVendorId(
  records: { vendor_id: string }[] | null | undefined
): Record<string, number> {
  if (!records) return {};

  return records.reduce(
    (acc, record) => {
      acc[record.vendor_id] = (acc[record.vendor_id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format (must start with http:// or https://)
 */
export function isValidUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return value > 0;
}
