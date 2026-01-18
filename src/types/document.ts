/**
 * Document Generation Types
 * Feature: 017-document-generation
 *
 * Types for Function Sheet and Vendor Brief document generation.
 * No new database tables - all data sourced from existing tables.
 */

// ============================================================================
// Document Section Types
// ============================================================================

/**
 * Available document sections for Function Sheet generation
 */
export type DocumentSection =
  | 'wedding_overview'
  | 'event_summary'
  | 'guest_list'
  | 'attendance_matrix'
  | 'meal_selections'
  | 'bar_orders'
  | 'furniture_equipment'
  | 'repurposing'
  | 'staff_requirements'
  | 'transportation'
  | 'stationery'
  | 'beauty_services'
  | 'accommodation'
  | 'shopping_list'
  | 'budget_summary'
  | 'vendor_contacts'
  | 'timeline';

/**
 * All 17 available sections
 */
export const ALL_DOCUMENT_SECTIONS: DocumentSection[] = [
  'wedding_overview',
  'event_summary',
  'guest_list',
  'attendance_matrix',
  'meal_selections',
  'bar_orders',
  'furniture_equipment',
  'repurposing',
  'staff_requirements',
  'transportation',
  'stationery',
  'beauty_services',
  'accommodation',
  'shopping_list',
  'budget_summary',
  'vendor_contacts',
  'timeline',
];

/**
 * Human-readable section labels
 */
export const SECTION_LABELS: Record<DocumentSection, string> = {
  wedding_overview: 'Wedding Overview',
  event_summary: 'Event Summary',
  guest_list: 'Guest List',
  attendance_matrix: 'Attendance Matrix',
  meal_selections: 'Meal Selections',
  bar_orders: 'Bar Orders',
  furniture_equipment: 'Furniture & Equipment',
  repurposing: 'Repurposing Instructions',
  staff_requirements: 'Staff Requirements',
  transportation: 'Transportation',
  stationery: 'Stationery',
  beauty_services: 'Beauty Services',
  accommodation: 'Accommodation',
  shopping_list: 'Shopping List',
  budget_summary: 'Budget Summary',
  vendor_contacts: 'Vendor Contacts',
  timeline: 'Timeline',
};

// ============================================================================
// Document Generation Options
// ============================================================================

/**
 * Output format options
 */
export type DocumentFormat = 'pdf' | 'docx' | 'both';

/**
 * Branding configuration for documents
 */
export interface DocumentBranding {
  /** Primary brand color (hex format, e.g., "#D4A5A5") */
  primaryColor: string;
  /** Optional logo as base64 data URL */
  logo?: string;
  /** Company name displayed in header */
  companyName?: string;
  /** Optional tagline */
  tagline?: string;
  /** Contact email */
  contactEmail?: string;
  /** Contact phone */
  contactPhone?: string;
  /** Website URL */
  website?: string;
}

/**
 * Options for generating a Function Sheet
 */
export interface FunctionSheetOptions {
  weddingId: string;
  sections: DocumentSection[];
  format: DocumentFormat;
  branding: DocumentBranding;
}

/**
 * Options for generating a Vendor Brief
 */
export interface VendorBriefOptions {
  vendorId: string;
  weddingId: string;
  format: DocumentFormat;
  branding: DocumentBranding;
}

// ============================================================================
// Section-Specific Data Types
// ============================================================================

/**
 * Wedding Overview section data
 */
export interface WeddingOverviewData {
  id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue_name: string | null;
  venue_address: string | null;
  venue_contact_name: string | null;
  venue_contact_phone: string | null;
  venue_contact_email: string | null;
  guest_count_adults: number;
  guest_count_children: number;
  status: string;
  notes: string | null;
}

/**
 * Event Summary section data
 */
export interface EventData {
  id: string;
  event_order: number;
  event_name: string;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  event_location: string | null;
  event_type: string;
  expected_guests_adults: number;
  expected_guests_children: number;
  duration_hours: number;
  notes: string | null;
}

/**
 * Guest List section data
 */
export interface GuestData {
  id: string;
  name: string;
  guest_type: string;
  invitation_status: string;
  table_number: string | null;
  dietary_restrictions: string | null;
  allergies: string | null;
  starter_choice: string | null;
  main_choice: string | null;
  dessert_choice: string | null;
  email: string | null;
  phone: string | null;
}

/**
 * Attendance Matrix section data
 */
export interface AttendanceData {
  guest_id: string;
  guest_name: string;
  guest_type: string;
  event_id: string;
  event_name: string;
  event_order: number;
  attending: boolean;
  shuttle_to_event: boolean;
  shuttle_from_event: boolean;
}

/**
 * Meal Selections summary (aggregated counts)
 */
export interface MealSelectionSummary {
  starters: Record<string, number>;
  mains: Record<string, number>;
  desserts: Record<string, number>;
  dietaryRestrictions: Record<string, number>;
}

/**
 * Bar Orders section data
 */
export interface BarOrderData {
  id: string;
  event_id: string;
  event_name: string;
  guest_count_adults: number;
  guest_count_children: number;
  event_duration_hours: number;
  total_servings_per_person: number;
  items: BarOrderItemData[];
}

export interface BarOrderItemData {
  id: string;
  item_name: string;
  percentage: number;
  calculated_servings: number;
  servings_per_unit: number;
  units_needed: number;
  cost_per_unit: number;
  total_cost: number;
}

/**
 * Wedding Items (Furniture & Equipment) section data
 */
export interface WeddingItemData {
  id: string;
  category: string;
  description: string;
  aggregation_method: 'ADD' | 'MAX';
  number_available: number;
  total_required: number;
  cost_per_unit: number;
  total_cost: number;
  supplier_name: string | null;
  eventQuantities: EventQuantityData[];
}

export interface EventQuantityData {
  event_id: string;
  event_name: string;
  quantity_required: number;
}

/**
 * Repurposing Instructions section data
 */
export interface RepurposingData {
  id: string;
  item_description: string;
  from_event_name: string;
  to_event_name: string;
  pickup_location: string;
  pickup_time: string;
  dropoff_location: string;
  dropoff_time: string;
  responsible_party: string | null;
  handling_notes: string | null;
  status: string;
}

/**
 * Staff Requirements section data
 */
export interface StaffRequirementData {
  id: string;
  event_id: string;
  event_name: string;
  vendor_name: string | null;
  supervisors: number;
  waiters: number;
  bartenders: number;
  runners: number;
  scullers: number;
  total_staff: number;
  staff_notes: string | null;
}

/**
 * Transportation section data
 */
export interface TransportData {
  id: string;
  event_id: string;
  event_name: string;
  transport_type: string;
  shuttle_name: string | null;
  collection_location: string;
  dropoff_location: string;
  collection_time: string;
  number_of_guests: number;
  guest_names: string | null;
}

/**
 * Stationery section data
 */
export interface StationeryData {
  id: string;
  item_name: string;
  details: string | null;
  quantity: number;
  cost_per_item: number;
  total_cost: number;
  content: string | null;
}

/**
 * Beauty Services section data
 */
export interface BeautyServiceData {
  id: string;
  vendor_name: string | null;
  person_name: string;
  role: string;
  requires_hair: boolean;
  requires_makeup: boolean;
  appointment_time: string | null;
}

/**
 * Accommodation section data
 */
export interface AccommodationData {
  cottages: CottageData[];
}

export interface CottageData {
  id: string;
  cottage_name: string;
  charge_per_room_per_night: number;
  rooms: CottageRoomData[];
}

export interface CottageRoomData {
  id: string;
  room_name: string;
  bed_type: string;
  bathroom_type: string;
  guest_name: string | null;
  is_occupied: boolean;
  number_of_nights: number;
  room_cost: number;
}

/**
 * Shopping List section data
 */
export interface ShoppingItemData {
  id: string;
  item_name: string;
  category: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  estimated_cost: number;
  actual_cost: number | null;
  store: string | null;
  purchased: boolean;
}

/**
 * Budget section data
 */
export interface BudgetData {
  categories: BudgetCategoryData[];
  totals: {
    projected: number;
    actual: number;
    variance: number;
  };
}

export interface BudgetCategoryData {
  id: string;
  category_name: string;
  projected_amount: number;
  actual_amount: number;
  variance: number;
  lineItems: BudgetLineItemData[];
}

export interface BudgetLineItemData {
  id: string;
  item_description: string;
  vendor_name: string | null;
  projected_cost: number;
  actual_cost: number | null;
  payment_status: string;
}

/**
 * Vendor Contacts section data
 */
export interface VendorData {
  id: string;
  vendor_type: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website: string | null;
  contract_signed: boolean;
  contract_date: string | null;
  contract_value: number | null;
  payments: VendorPaymentData[];
}

export interface VendorPaymentData {
  id: string;
  milestone_name: string;
  due_date: string;
  amount: number;
  status: string;
  paid_date: string | null;
}

/**
 * Timeline section data (events + tasks)
 */
export interface TaskData {
  id: string;
  task_type: string;
  title: string;
  description: string | null;
  due_date: string;
  due_time: string | null;
  is_pre_wedding: boolean;
  assigned_to: string | null;
  location: string | null;
  status: string;
  priority: string;
}

// ============================================================================
// Aggregated Data Types
// ============================================================================

/**
 * Aggregated wedding data for Function Sheet generation
 * Each field corresponds to a section and is populated only if selected
 */
export interface FunctionSheetData {
  // Always included (needed for header)
  wedding: WeddingOverviewData;

  // Conditionally included based on selected sections
  events?: EventData[];
  guests?: GuestData[];
  attendance?: AttendanceData[];
  mealSelections?: MealSelectionSummary;
  barOrders?: BarOrderData[];
  weddingItems?: WeddingItemData[];
  repurposing?: RepurposingData[];
  staffRequirements?: StaffRequirementData[];
  transportation?: TransportData[];
  stationery?: StationeryData[];
  beautyServices?: BeautyServiceData[];
  accommodation?: AccommodationData;
  shoppingList?: ShoppingItemData[];
  budget?: BudgetData;
  vendors?: VendorData[];
  tasks?: TaskData[];
}

/**
 * Section preview counts for UI display
 */
export interface SectionCounts {
  events: number;
  guests: number;
  adultsGuests: number;
  childrenGuests: number;
  vendors: number;
  barOrders: number;
  weddingItems: number;
  repurposingInstructions: number;
  staffPositions: number;
  shuttles: number;
  stationeryItems: number;
  beautyAppointments: number;
  cottages: number;
  rooms: number;
  shoppingItems: number;
  budgetCategories: number;
  tasks: number;
}

/**
 * Aggregated vendor data for Vendor Brief generation
 */
export interface VendorBriefData {
  vendor: VendorData;
  wedding: WeddingOverviewData;
  events: EventData[];
  payments: VendorPaymentData[];
  specialInstructions: string | null;
}
