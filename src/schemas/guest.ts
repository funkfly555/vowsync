/**
 * Guest Zod Validation Schemas
 * @feature 006-guest-list
 */

import { z } from 'zod';

export const guestTypeSchema = z.enum(['adult', 'child', 'vendor', 'staff']);

export const invitationStatusSchema = z.enum(['pending', 'invited', 'confirmed', 'declined']);

export const rsvpMethodSchema = z.enum(['email', 'phone', 'in_person', 'online']);

export const rsvpStatusSchema = z.enum(['yes', 'overdue', 'pending']);

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
