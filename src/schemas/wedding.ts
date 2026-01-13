import { z } from 'zod';

export const weddingFormSchema = z.object({
  bride_name: z.string()
    .min(1, 'Bride name is required')
    .max(100, 'Bride name must be 100 characters or less'),

  groom_name: z.string()
    .min(1, 'Groom name is required')
    .max(100, 'Groom name must be 100 characters or less'),

  wedding_date: z.date({ error: 'Wedding date is required' }).refine(
    (date) => date > new Date(),
    { message: 'Wedding date must be in the future' }
  ),

  venue_name: z.string()
    .min(1, 'Venue name is required')
    .max(200, 'Venue name must be 200 characters or less'),

  venue_address: z.string()
    .max(500, 'Address must be 500 characters or less')
    .optional()
    .or(z.literal('')),

  venue_contact_name: z.string()
    .max(100, 'Contact name must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  venue_contact_phone: z.string()
    .max(20, 'Phone must be 20 characters or less')
    .optional()
    .or(z.literal('')),

  venue_contact_email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),

  number_of_events: z.number()
    .int('Must be a whole number')
    .min(1, 'Minimum 1 event')
    .max(10, 'Maximum 10 events'),

  status: z.enum(['planning', 'confirmed', 'completed', 'cancelled'], {
    error: 'Status is required',
  }),

  notes: z.string()
    .max(2000, 'Notes must be 2000 characters or less')
    .optional()
    .or(z.literal('')),
});

// Edit schema - allows past dates for existing weddings
export const weddingEditSchema = weddingFormSchema.omit({ wedding_date: true }).extend({
  wedding_date: z.date({ error: 'Wedding date is required' }),
});

export type WeddingFormValues = z.infer<typeof weddingFormSchema>;
export type WeddingEditValues = z.infer<typeof weddingEditSchema>;
