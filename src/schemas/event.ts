import { z } from 'zod';

export const EVENT_TYPES = [
  'ceremony',
  'reception',
  'rehearsal_dinner',
  'welcome_party',
  'brunch',
  'other',
] as const;

export const eventFormSchema = z.object({
  event_order: z
    .number({ error: 'Event order is required' })
    .min(1, 'Event order must be at least 1')
    .max(10, 'Event order cannot exceed 10'),
  event_name: z
    .string({ error: 'Event name is required' })
    .min(1, 'Event name is required')
    .max(100, 'Event name cannot exceed 100 characters'),
  event_type: z.enum(EVENT_TYPES, {
    error: 'Event type is required',
  }),
  event_date: z.date({
    error: 'Event date is required',
  }),
  event_start_time: z
    .string({ error: 'Start time is required' })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format (HH:mm)'),
  event_end_time: z
    .string({ error: 'End time is required' })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format (HH:mm)'),
  event_location: z
    .string({ error: 'Location is required' })
    .min(1, 'Location is required')
    .max(200, 'Location cannot exceed 200 characters'),
  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
  // Shuttle configuration fields (all optional)
  shuttle_from_location: z
    .string()
    .max(200, 'Pickup location cannot exceed 200 characters')
    .optional(),
  shuttle_departure_to_event: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format (HH:mm)')
    .optional()
    .or(z.literal('')),
  shuttle_departure_from_event: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format (HH:mm)')
    .optional()
    .or(z.literal('')),
  shuttle_notes: z
    .string()
    .max(1000, 'Shuttle notes cannot exceed 1000 characters')
    .optional(),
}).refine(
  (data) => {
    const [startH, startM] = data.event_start_time.split(':').map(Number);
    const [endH, endM] = data.event_end_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return endMinutes > startMinutes;
  },
  {
    message: 'End time must be after start time',
    path: ['event_end_time'],
  }
);

export type EventFormValues = z.infer<typeof eventFormSchema>;
