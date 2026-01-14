/**
 * Vendor TypeScript Types
 * @feature 008-vendor-management
 */

// =============================================================================
// Database Entity Types
// =============================================================================

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

// =============================================================================
// Badge Types
// =============================================================================

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

// =============================================================================
// Display Types
// =============================================================================

/**
 * Extended vendor with computed display properties
 */
export interface VendorDisplay extends Vendor {
  contractStatus: ContractStatusBadge;
  paymentStatus: PaymentStatusBadge;
  maskedAccountNumber: string | null;
}

// =============================================================================
// Filter Types
// =============================================================================

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

// =============================================================================
// Form Types
// =============================================================================

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

// =============================================================================
// Utility Functions
// =============================================================================

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculatePaymentStatus(_vendor: Vendor): PaymentStatusBadge {
  // Phase 7A placeholder - will be implemented in Phase 7B
  return { label: 'Pending', color: 'blue' };
}

/**
 * Mask account number for card display
 */
export function maskAccountNumber(accountNumber: string | null): string | null {
  if (!accountNumber || accountNumber.length < 4) return null;
  return `****${accountNumber.slice(-4)}`;
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

// =============================================================================
// Display Configuration
// =============================================================================

export const CONTRACT_STATUS_CONFIG: Record<
  ContractStatusLabel,
  { label: string; color: string; bgColor: string }
> = {
  Signed: {
    label: 'Signed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  Unsigned: {
    label: 'Unsigned',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  'Expiring Soon': {
    label: 'Expiring Soon',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  Expired: {
    label: 'Expired',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatusLabel,
  { label: string; color: string; bgColor: string }
> = {
  Paid: {
    label: 'Paid',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  Pending: {
    label: 'Pending',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  'Due Soon': {
    label: 'Due Soon',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  Overdue: {
    label: 'Overdue',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
};

export const VENDOR_TYPE_CONFIG: Record<VendorType, { label: string; icon: string }> = {
  Catering: { label: 'Catering', icon: 'UtensilsCrossed' },
  Photography: { label: 'Photography', icon: 'Camera' },
  Videography: { label: 'Videography', icon: 'Video' },
  Flowers: { label: 'Flowers', icon: 'Flower2' },
  'Music/DJ': { label: 'Music/DJ', icon: 'Music' },
  Venue: { label: 'Venue', icon: 'Building2' },
  Transportation: { label: 'Transportation', icon: 'Car' },
  Officiant: { label: 'Officiant', icon: 'Users' },
  'Hair/Makeup': { label: 'Hair/Makeup', icon: 'Scissors' },
  Rentals: { label: 'Rentals', icon: 'Package' },
  Decor: { label: 'Decor', icon: 'Palette' },
  Other: { label: 'Other', icon: 'MoreHorizontal' },
};

export const VENDOR_STATUS_CONFIG: Record<VendorStatus, { label: string }> = {
  active: { label: 'Active' },
  inactive: { label: 'Inactive' },
  backup: { label: 'Backup' },
};
