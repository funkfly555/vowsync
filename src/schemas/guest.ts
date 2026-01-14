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

export const rsvpStatusSchema = z.enum(['yes', 'overdue', 'pending']);

// =============================================================================
// Database Entity Schema
// =============================================================================

export const guestSchema = z.object({
  id: z.string().uuid(),
  wedding_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  guest_type: guestTypeSchema,
  invitation_status: invitationStatusSchema,
  attendance_confirmed: z.boolean(),
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
  rsvpStatus: rsvpStatusSchema.or(z.literal('all')),
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
  invitation_status: invitationStatusSchema,
  attendance_confirmed: z.boolean(),
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
 */
export const guestFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  guest_type: guestTypeSchema,
  email: z.string().email('Invalid email format').or(z.literal('')),
  phone: z.string().max(50, 'Phone number is too long'),
  invitation_status: invitationStatusSchema,
  attendance_confirmed: z.boolean(),

  // RSVP
  rsvp_deadline: z.date().nullable(),
  rsvp_received_date: z.date().nullable(),
  rsvp_method: rsvpMethodSchema.nullable(),
  has_plus_one: z.boolean(),
  plus_one_name: z.string().max(255),
  plus_one_confirmed: z.boolean(),

  // Dietary
  dietary_restrictions: z.string().max(500),
  allergies: z.string().max(500),
  dietary_notes: z.string().max(1000),

  // Meal
  starter_choice: z.number().min(1).max(5).nullable(),
  main_choice: z.number().min(1).max(5).nullable(),
  dessert_choice: z.number().min(1).max(5).nullable(),

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
