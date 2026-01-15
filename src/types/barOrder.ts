/**
 * Bar Order TypeScript Types
 * @feature 012-bar-order-management
 */

// =============================================================================
// Database Entity Types
// =============================================================================

/**
 * Bar order status enumeration
 * Workflow: draft -> confirmed -> ordered -> delivered
 */
export type BarOrderStatus = 'draft' | 'confirmed' | 'ordered' | 'delivered';

/**
 * Database entity - mirrors Supabase bar_orders table
 */
export interface BarOrder {
  id: string;
  wedding_id: string;
  event_id: string | null;
  vendor_id: string | null;
  name: string;
  guest_count_adults: number;
  event_duration_hours: number;
  first_hours: number;
  first_hours_drinks_per_hour: number;
  remaining_hours_drinks_per_hour: number;
  total_servings_per_person: number; // GENERATED column
  status: BarOrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database entity - mirrors Supabase bar_order_items table
 */
export interface BarOrderItem {
  id: string;
  bar_order_id: string;
  item_name: string;
  percentage: number;
  servings_per_unit: number;
  cost_per_unit: number | null;
  calculated_servings: number; // GENERATED column
  units_needed: number; // GENERATED column
  total_cost: number | null; // GENERATED column
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Extended Types with Relations
// =============================================================================

/**
 * Bar order with related entities for list/detail views
 */
export interface BarOrderWithRelations extends BarOrder {
  event: {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
  } | null;
  vendor: {
    id: string;
    business_name: string;
  } | null;
  items: BarOrderItem[];
}

// =============================================================================
// Form Types
// =============================================================================

/**
 * Form data for create/edit bar order modal
 */
export interface BarOrderFormData {
  name: string;
  event_id: string | null;
  vendor_id: string | null;
  guest_count_adults: number;
  event_duration_hours: number;
  first_hours: number;
  first_hours_drinks_per_hour: number;
  remaining_hours_drinks_per_hour: number;
  status: BarOrderStatus;
  notes: string | null;
}

/**
 * Form data for create/edit bar order item modal
 */
export interface BarOrderItemFormData {
  item_name: string;
  percentage: number;
  servings_per_unit: number;
  cost_per_unit: number | null;
  sort_order: number;
}

/**
 * Default form values for new bar order
 */
export const DEFAULT_BAR_ORDER_FORM: BarOrderFormData = {
  name: '',
  event_id: null,
  vendor_id: null,
  guest_count_adults: 0,
  event_duration_hours: 5,
  first_hours: 2,
  first_hours_drinks_per_hour: 2,
  remaining_hours_drinks_per_hour: 1,
  status: 'draft',
  notes: null,
};

/**
 * Default form values for new bar order item
 */
export const DEFAULT_BAR_ORDER_ITEM_FORM: BarOrderItemFormData = {
  item_name: '',
  percentage: 0,
  servings_per_unit: 1,
  cost_per_unit: null,
  sort_order: 0,
};

// =============================================================================
// Summary Types
// =============================================================================

/**
 * Aggregated totals for bar order summary display
 */
export interface BarOrderSummary {
  totalUnits: number;
  totalCost: number;
  totalPercentage: number;
  itemCount: number;
}

// =============================================================================
// Display Types
// =============================================================================

/**
 * Status badge display configuration
 */
export interface BarOrderStatusBadge {
  label: string;
  color: string;
  bgColor: string;
}

/**
 * Percentage validation result
 */
export interface PercentageValidation {
  total: number;
  isValid: boolean;
  isWarning: boolean;
  isError: boolean;
  message: string | null;
}

// =============================================================================
// Event Selection Types (for dropdown)
// =============================================================================

/**
 * Event option for dropdown selection
 */
export interface EventOption {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  adult_guest_count: number;
}

/**
 * Vendor option for dropdown selection
 */
export interface VendorOption {
  id: string;
  business_name: string;
  category: string | null;
}
