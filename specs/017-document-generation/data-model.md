# Data Model: Document Generation

**Feature Branch**: `017-document-generation`
**Date**: 2026-01-17

## Overview

This feature does not create new database tables. It reads from 16 existing tables to aggregate data for document generation. This document defines the TypeScript interfaces for document generation options and aggregated data structures.

## No Database Changes

**Important**: All data is sourced from existing tables via read-only Supabase queries. The existing RLS policies protect all data access.

## TypeScript Interfaces

### Document Section Types

```typescript
// src/types/document.ts

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
```

### Document Generation Options

```typescript
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
```

### Aggregated Data Types

```typescript
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
```

### Section-Specific Data Types

```typescript
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
  duration_hours: number; // GENERATED column
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
  attendance_confirmed: boolean;
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
  total_servings_per_person: number; // GENERATED
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
  total_cost: number; // GENERATED
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
  total_staff: number; // GENERATED
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
  total_cost: number; // GENERATED
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
  variance: number; // GENERATED
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
```

### Vendor Brief Data Type

```typescript
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
```

## Validation Schemas (Zod)

```typescript
// src/schemas/documentSchema.ts

import { z } from 'zod';
import { ALL_DOCUMENT_SECTIONS } from '@/types/document';

/**
 * Document section validation
 */
export const documentSectionSchema = z.enum([
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
]);

/**
 * Document format validation
 */
export const documentFormatSchema = z.enum(['pdf', 'docx', 'both']);

/**
 * Branding options validation
 */
export const documentBrandingSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
    .default('#D4A5A5'),
  logo: z.string().optional(),
});

/**
 * Function Sheet generation options validation
 */
export const functionSheetOptionsSchema = z.object({
  weddingId: z.string().uuid('Invalid wedding ID'),
  sections: z
    .array(documentSectionSchema)
    .min(1, 'At least one section must be selected'),
  format: documentFormatSchema,
  branding: documentBrandingSchema,
});

/**
 * Vendor Brief generation options validation
 */
export const vendorBriefOptionsSchema = z.object({
  vendorId: z.string().uuid('Invalid vendor ID'),
  weddingId: z.string().uuid('Invalid wedding ID'),
  format: documentFormatSchema,
  branding: documentBrandingSchema,
});

/**
 * Logo file validation
 */
export const logoFileSchema = z
  .instanceof(File)
  .refine(
    (file) => ['image/png', 'image/jpeg'].includes(file.type),
    'Logo must be PNG or JPG format'
  )
  .refine(
    (file) => file.size <= 2 * 1024 * 1024,
    'Logo must be less than 2MB'
  );
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  GenerateFunctionSheetModal                                          │    │
│  │  - Section checkboxes (17 options)                                   │    │
│  │  - Format selector (PDF/DOCX/Both)                                   │    │
│  │  - Branding controls (logo upload, color picker)                     │    │
│  │  - Section counts preview                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     useDocumentGeneration HOOK                               │
│  - Validates options via Zod schemas                                         │
│  - Manages generation state (loading, error)                                 │
│  - Coordinates data aggregation and document generation                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│      aggregateDocumentData()     │  │      getSectionCounts()          │
│  - Parallel Supabase queries     │  │  - Quick count queries           │
│  - Section-conditional fetching  │  │  - For preview display           │
│  - Returns FunctionSheetData     │  │  - Returns SectionCounts         │
└──────────────────────────────────┘  └──────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DOCUMENT GENERATORS                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐       │
│  │     generatePDF()           │  │     generateDOCX()              │       │
│  │  - jsPDF + jspdf-autotable  │  │  - docx library                 │       │
│  │  - Section renderers        │  │  - Section renderers            │       │
│  │  - Branding application     │  │  - Branding application         │       │
│  │  - Returns Blob             │  │  - Returns Blob                 │       │
│  └─────────────────────────────┘  └─────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          downloadFile()                                      │
│  - Creates Blob URL                                                          │
│  - Triggers browser download                                                 │
│  - Cleans up URL                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Source Tables Summary

| Table | Used In Sections | Relationships |
|-------|------------------|---------------|
| weddings | All (header) | Parent |
| events | event_summary, timeline | wedding_id → weddings |
| guests | guest_list, attendance_matrix, meal_selections | wedding_id → weddings |
| guest_event_attendance | attendance_matrix | guest_id → guests, event_id → events |
| vendors | vendor_contacts | wedding_id → weddings |
| vendor_payment_schedule | vendor_contacts | vendor_id → vendors |
| bar_orders | bar_orders | wedding_id → weddings, event_id → events |
| bar_order_items | bar_orders | bar_order_id → bar_orders |
| wedding_items | furniture_equipment | wedding_id → weddings |
| wedding_item_event_quantities | furniture_equipment | wedding_item_id → wedding_items, event_id → events |
| repurposing_instructions | repurposing | wedding_id → weddings, wedding_item_id → wedding_items |
| staff_requirements | staff_requirements | wedding_id → weddings, event_id → events |
| shuttle_transport | transportation | wedding_id → weddings, event_id → events |
| stationery_items | stationery | wedding_id → weddings |
| beauty_services | beauty_services | wedding_id → weddings, vendor_id → vendors |
| cottages | accommodation | wedding_id → weddings |
| cottage_rooms | accommodation | cottage_id → cottages |
| shopping_list_items | shopping_list | wedding_id → weddings |
| budget_categories | budget_summary | wedding_id → weddings |
| budget_line_items | budget_summary | budget_category_id → budget_categories |
| pre_post_wedding_tasks | timeline | wedding_id → weddings |
