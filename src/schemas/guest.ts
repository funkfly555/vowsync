/**
 * Guest Zod Validation Schemas
 * @feature 006-guest-list
 * @feature 007-guest-crud-attendance
 */

import { z } from 'zod';

// =============================================================================
// Base Type Schemas
// =============================================================================

export const guestTypeSchema = z.enum(['adult', 'child', 'vendor', 'staff']);

export const invitationStatusSchema = z.enum(['pending', 'invited', 'confirmed', 'declined']);

export const rsvpMethodSchema = z.enum(['email', 'phone', 'in_person', 'online']);

// =============================================================================
// Wedding Party Schemas (025-guest-page-fixes)
// =============================================================================

/**
 * Gender validation schema
 * @feature 025-guest-page-fixes
 */
export const genderSchema = z.enum(['male', 'female']).nullable();

/**
 * Wedding party side validation schema
 * @feature 025-guest-page-fixes
 */
export const weddingPartySideSchema = z.enum(['bride', 'groom']).nullable();

/**
 * Wedding party role validation schema
 * @feature 025-guest-page-fixes
 */
export const weddingPartyRoleSchema = z.enum([
  'best_man',
  'groomsmen',
  'maid_of_honor',
  'bridesmaids',
  'parent',
  'close_relative',
  'relative',
  'other',
]).nullable();

// =============================================================================
// Database Entity Schema
// =============================================================================

export const guestSchema = z.object({
  id: z.string().uuid(),
  wedding_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  guest_type: guestTypeSchema,
  invitation_status: invitationStatusSchema,
  rsvp_deadline: z.string().nullable(),
  rsvp_received_date: z.string().nullable(),
  rsvp_method: rsvpMethodSchema.nullable(),
  rsvp_notes: z.string().nullable(),
  last_reminder_sent_date: z.string().nullable(),
  has_plus_one: z.boolean(),
  plus_one_name: z.string().nullable(),
  plus_one_confirmed: z.boolean(),
  table_number: z.string().nullable(),
  table_position: z.number().nullable(),
  dietary_restrictions: z.string().nullable(),
  allergies: z.string().nullable(),
  dietary_notes: z.string().nullable(),
  starter_choice: z.number().min(1).max(5).nullable(),
  main_choice: z.number().min(1).max(5).nullable(),
  dessert_choice: z.number().min(1).max(5).nullable(),
  email: z.string().email().nullable().or(z.literal('')),
  phone: z.string().nullable(),
  email_valid: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const guestFiltersSchema = z.object({
  search: z.string(),
  type: guestTypeSchema.or(z.literal('all')),
  invitationStatus: invitationStatusSchema.or(z.literal('all')),
  eventId: z.string().uuid().nullable(),
});

export type GuestSchemaType = z.infer<typeof guestSchema>;
export type GuestFiltersSchemaType = z.infer<typeof guestFiltersSchema>;

// =============================================================================
// Form Validation Schemas (Phase 6B - Guest CRUD)
// =============================================================================

/**
 * Basic Info tab validation schema
 */
export const basicInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  guest_type: guestTypeSchema,
  email: z.string().email('Invalid email format').or(z.literal('')),
  phone: z.string().max(50, 'Phone number is too long'),
});

/**
 * RSVP tab validation schema
 */
export const rsvpSchema = z
  .object({
    rsvp_deadline: z.date().nullable(),
    rsvp_received_date: z.date().nullable(),
    rsvp_method: rsvpMethodSchema.nullable(),
    has_plus_one: z.boolean(),
    plus_one_name: z.string().max(255, 'Plus one name is too long'),
    plus_one_confirmed: z.boolean(),
  })
  .refine(
    (data) => {
      // If RSVP received date is set, method should also be set
      if (data.rsvp_received_date && !data.rsvp_method) {
        return false;
      }
      return true;
    },
    {
      message: 'RSVP method is required when RSVP date is set',
      path: ['rsvp_method'],
    }
  )
  .refine(
    (data) => {
      // If has plus one, name should be provided
      if (data.has_plus_one && !data.plus_one_name?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: 'Plus one name is required when plus one is enabled',
      path: ['plus_one_name'],
    }
  );

/**
 * Dietary tab validation schema
 */
export const dietarySchema = z.object({
  dietary_restrictions: z.string().max(500, 'Too long'),
  allergies: z.string().max(500, 'Too long'),
  dietary_notes: z.string().max(1000, 'Too long'),
  plus_one_dietary_restrictions: z.string().max(500, 'Too long'),
  plus_one_allergies: z.string().max(500, 'Too long'),
  plus_one_dietary_notes: z.string().max(1000, 'Too long'),
});

/**
 * Meal tab validation schema
 */
export const mealSchema = z.object({
  starter_choice: z.number().min(1).max(5).nullable(),
  main_choice: z.number().min(1).max(5).nullable(),
  dessert_choice: z.number().min(1).max(5).nullable(),
});

/**
 * Event attendance item schema
 * Note: shuttle fields are TEXT (string) for shuttle group assignment (e.g., "Bus A", "Car 1")
 */
export const eventAttendanceItemSchema = z.object({
  event_id: z.string().uuid(),
  attending: z.boolean(),
  shuttle_to_event: z.string().nullable(),
  shuttle_from_event: z.string().nullable(),
  notes: z.string().nullable(),
});

/**
 * Events tab validation schema
 */
export const eventsSchema = z.object({
  event_attendance: z.array(eventAttendanceItemSchema),
});

/**
 * Complete guest form validation schema
 * Combines all tab schemas for full form validation
 * @feature 024-guest-menu-management - Added seating and plus one meal fields
 */
export const guestFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  guest_type: guestTypeSchema,
  email: z.string().email('Invalid email format').or(z.literal('')),
  phone: z.string().max(50, 'Phone number is too long'),
  invitation_status: invitationStatusSchema,

  // Wedding Party (025-guest-page-fixes)
  gender: genderSchema,
  wedding_party_side: weddingPartySideSchema,
  wedding_party_role: weddingPartyRoleSchema,

  // RSVP
  rsvp_deadline: z.date().nullable(),
  rsvp_received_date: z.date().nullable(),
  rsvp_method: rsvpMethodSchema.nullable(),
  has_plus_one: z.boolean(),
  plus_one_name: z.string().max(255),
  plus_one_confirmed: z.boolean(),

  // Seating
  table_number: z.string().nullable(),
  table_position: z.number().min(1).max(10).nullable(),
  plus_one_table_position: z.number().min(1).max(10).nullable(),

  // Dietary
  dietary_restrictions: z.string().max(500),
  allergies: z.string().max(500),
  dietary_notes: z.string().max(1000),

  // Dietary - Plus One (033-guest-page-tweaks)
  plus_one_dietary_restrictions: z.string().max(500),
  plus_one_allergies: z.string().max(500),
  plus_one_dietary_notes: z.string().max(1000),

  // Meal - Primary Guest
  starter_choice: z.number().min(1).max(5).nullable(),
  main_choice: z.number().min(1).max(5).nullable(),
  dessert_choice: z.number().min(1).max(5).nullable(),

  // Meal - Plus One
  plus_one_starter_choice: z.number().min(1).max(5).nullable(),
  plus_one_main_choice: z.number().min(1).max(5).nullable(),
  plus_one_dessert_choice: z.number().min(1).max(5).nullable(),

  // Events
  event_attendance: z.array(eventAttendanceItemSchema),
}).refine(
  (data) => {
    // If RSVP received date is set, method should also be set
    if (data.rsvp_received_date && !data.rsvp_method) {
      return false;
    }
    return true;
  },
  {
    message: 'RSVP method is required when RSVP date is set',
    path: ['rsvp_method'],
  }
).refine(
  (data) => {
    // If has plus one, name should be provided
    if (data.has_plus_one && !data.plus_one_name?.trim()) {
      return false;
    }
    return true;
  },
  {
    message: 'Plus one name is required when plus one is enabled',
    path: ['plus_one_name'],
  }
);

export type GuestFormSchemaType = z.infer<typeof guestFormSchema>;
export type BasicInfoSchemaType = z.infer<typeof basicInfoSchema>;
export type RsvpSchemaType = z.infer<typeof rsvpSchema>;
export type DietarySchemaType = z.infer<typeof dietarySchema>;
export type MealSchemaType = z.infer<typeof mealSchema>;
export type EventsSchemaType = z.infer<typeof eventsSchema>;
export type EventAttendanceItemSchemaType = z.infer<typeof eventAttendanceItemSchema>;

// =============================================================================
// Guest Edit Form Schema (Phase 021 - Guest Page Redesign)
// =============================================================================

/**
 * Validation schema for guest edit form used in expanded card tabs
 * Includes plus one conditional validation
 */
export const guestEditSchema = z.object({
  // Basic Info Tab
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email format').or(z.literal('')),
  phone: z.string().max(50, 'Phone number is too long'),
  guest_type: guestTypeSchema,
  invitation_status: invitationStatusSchema,

  // Wedding Party (025-guest-page-fixes)
  gender: genderSchema,
  wedding_party_side: weddingPartySideSchema,
  wedding_party_role: weddingPartyRoleSchema,

  // Plus One (Basic Info Tab)
  has_plus_one: z.boolean(),
  plus_one_name: z.string().max(255, 'Plus one name is too long'),
  plus_one_confirmed: z.boolean(),

  // RSVP Tab
  rsvp_deadline: z.date().nullable(),
  rsvp_received_date: z.date().nullable(),
  rsvp_method: rsvpMethodSchema.nullable(),
  rsvp_notes: z.string().max(1000, 'Notes too long'),

  // Seating Tab
  table_number: z.string().max(20, 'Table number too long'),
  table_position: z.number().min(1).max(10).nullable(),
  plus_one_table_position: z.number().min(1).max(10).nullable(),

  // Dietary Tab
  dietary_restrictions: z.string().max(500, 'Too long'),
  allergies: z.string().max(500, 'Too long'),
  dietary_notes: z.string().max(1000, 'Too long'),

  // Dietary Tab - Plus One (033-guest-page-tweaks)
  plus_one_dietary_restrictions: z.string().max(500, 'Too long'),
  plus_one_allergies: z.string().max(500, 'Too long'),
  plus_one_dietary_notes: z.string().max(1000, 'Too long'),

  // Meals Tab - Primary Guest
  starter_choice: z.number().min(1).max(5).nullable(),
  main_choice: z.number().min(1).max(5).nullable(),
  dessert_choice: z.number().min(1).max(5).nullable(),

  // Meals Tab - Plus One (025-guest-page-fixes)
  plus_one_starter_choice: z.number().min(1).max(5).nullable(),
  plus_one_main_choice: z.number().min(1).max(5).nullable(),
  plus_one_dessert_choice: z.number().min(1).max(5).nullable(),

  // Events & Shuttle Tab
  event_attendance: z.array(eventAttendanceItemSchema),
}).refine(
  (data) => !data.has_plus_one || (data.plus_one_name && data.plus_one_name.trim().length > 0),
  {
    message: 'Plus one name is required when plus one is enabled',
    path: ['plus_one_name'],
  }
).refine(
  // Validate role matches side (025-guest-page-fixes)
  (data) => {
    if (!data.wedding_party_side || !data.wedding_party_role) return true;

    const brideRoles = ['maid_of_honor', 'bridesmaids', 'parent', 'close_relative', 'relative', 'other'];
    const groomRoles = ['best_man', 'groomsmen', 'parent', 'close_relative', 'relative', 'other'];

    if (data.wedding_party_side === 'bride') {
      return brideRoles.includes(data.wedding_party_role);
    }
    if (data.wedding_party_side === 'groom') {
      return groomRoles.includes(data.wedding_party_role);
    }
    return true;
  },
  {
    message: 'Wedding party role must match the selected side',
    path: ['wedding_party_role'],
  }
);

export type GuestEditSchemaType = z.infer<typeof guestEditSchema>;
