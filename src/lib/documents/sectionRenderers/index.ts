/**
 * Section Renderers Index
 * Feature: 017-document-generation
 *
 * Exports all PDF and DOCX section renderers for document generation.
 */

// PDF Renderers
export { renderWeddingOverviewPDF } from './weddingOverview';
export { renderEventSummaryPDF } from './eventSummary';
export { renderGuestListPDF } from './guestList';
export { renderAttendanceMatrixPDF } from './attendanceMatrix';
export { renderMealSelectionsPDF } from './mealSelections';
export { renderBarOrdersPDF } from './barOrders';
export { renderFurnitureEquipmentPDF } from './furnitureEquipment';
export { renderRepurposingPDF } from './repurposing';
export { renderStaffRequirementsPDF } from './staffRequirements';
export { renderTransportationPDF } from './transportation';
export { renderStationeryPDF } from './stationery';
export { renderBeautyServicesPDF } from './beautyServices';
export { renderAccommodationPDF } from './accommodation';
export { renderShoppingListPDF } from './shoppingList';
export { renderBudgetSummaryPDF } from './budgetSummary';
export { renderVendorContactsPDF } from './vendorContacts';
export { renderTimelinePDF } from './timeline';

// DOCX Renderers
export { renderWeddingOverviewDOCX } from './weddingOverview';
export { renderEventSummaryDOCX } from './eventSummary';
export { renderGuestListDOCX } from './guestList';
export { renderAttendanceMatrixDOCX } from './attendanceMatrix';
export { renderMealSelectionsDOCX } from './mealSelections';
export { renderBarOrdersDOCX } from './barOrders';
export { renderFurnitureEquipmentDOCX } from './furnitureEquipment';
export { renderRepurposingDOCX } from './repurposing';
export { renderStaffRequirementsDOCX } from './staffRequirements';
export { renderTransportationDOCX } from './transportation';
export { renderStationeryDOCX } from './stationery';
export { renderBeautyServicesDOCX } from './beautyServices';
export { renderAccommodationDOCX } from './accommodation';
export { renderShoppingListDOCX } from './shoppingList';
export { renderBudgetSummaryDOCX } from './budgetSummary';
export { renderVendorContactsDOCX } from './vendorContacts';
export { renderTimelineDOCX } from './timeline';

/**
 * Section metadata for UI display
 */
export const SECTION_METADATA: Record<
  string,
  { label: string; description: string; category: 'overview' | 'guests' | 'logistics' | 'vendors' | 'finance' }
> = {
  wedding_overview: {
    label: 'Wedding Overview',
    description: 'Couple names, date, venue, and key details',
    category: 'overview',
  },
  event_summary: {
    label: 'Event Summary',
    description: 'All events with dates, times, and locations',
    category: 'overview',
  },
  guest_list: {
    label: 'Guest List',
    description: 'Complete guest list with contact information',
    category: 'guests',
  },
  attendance_matrix: {
    label: 'Attendance Matrix',
    description: 'Guest attendance across all events',
    category: 'guests',
  },
  meal_selections: {
    label: 'Meal Selections',
    description: 'Dietary requirements and meal choices',
    category: 'guests',
  },
  bar_orders: {
    label: 'Bar Orders',
    description: 'Beverage orders and bar inventory',
    category: 'logistics',
  },
  furniture_equipment: {
    label: 'Furniture & Equipment',
    description: 'Tables, chairs, and rental items',
    category: 'logistics',
  },
  repurposing: {
    label: 'Repurposing Schedule',
    description: 'Item movement between events',
    category: 'logistics',
  },
  staff_requirements: {
    label: 'Staff Requirements',
    description: 'Staffing needs per event',
    category: 'logistics',
  },
  transportation: {
    label: 'Transportation',
    description: 'Guest transportation arrangements',
    category: 'logistics',
  },
  stationery: {
    label: 'Stationery',
    description: 'Invitations, programs, and printed materials',
    category: 'logistics',
  },
  beauty_services: {
    label: 'Beauty Services',
    description: 'Hair, makeup, and spa appointments',
    category: 'logistics',
  },
  accommodation: {
    label: 'Accommodation',
    description: 'Guest lodging and room assignments',
    category: 'logistics',
  },
  shopping_list: {
    label: 'Shopping List',
    description: 'Items to purchase with costs',
    category: 'logistics',
  },
  budget_summary: {
    label: 'Budget Summary',
    description: 'Financial overview and category breakdown',
    category: 'finance',
  },
  vendor_contacts: {
    label: 'Vendor Contacts',
    description: 'All vendor contact information',
    category: 'vendors',
  },
  timeline: {
    label: 'Timeline',
    description: 'Events and pre/post wedding tasks',
    category: 'overview',
  },
};

/**
 * Default sections for Function Sheet
 */
export const DEFAULT_FUNCTION_SHEET_SECTIONS = [
  'wedding_overview',
  'event_summary',
  'guest_list',
  'attendance_matrix',
  'meal_selections',
  'vendor_contacts',
  'timeline',
] as const;

/**
 * All available sections
 */
export const ALL_SECTIONS = [
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
] as const;
