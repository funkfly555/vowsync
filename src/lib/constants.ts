// Temporary user ID until authentication (Phase 14)
export const TEMP_USER_ID = 'a3fb1821-52bb-4f2a-9e7e-b09148ad44ce';

export const WEDDING_STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', color: 'blue' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const EVENTS_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} event${i > 0 ? 's' : ''}`,
}));

// Event type options for dropdown
export const EVENT_TYPE_OPTIONS = [
  { value: 'ceremony', label: 'Ceremony' },
  { value: 'reception', label: 'Reception' },
  { value: 'rehearsal_dinner', label: 'Rehearsal Dinner' },
  { value: 'welcome_party', label: 'Welcome Party' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'other', label: 'Other' },
] as const;

// Event order options (1-10)
export const EVENT_ORDER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `Event ${i + 1}`,
}));

// Event colors by order (from design system)
export const EVENT_COLORS = [
  '#E8B4B8', // Order 1 - pink
  '#F5E6D3', // Order 2 - cream
  '#C9D4C5', // Order 3 - sage
  '#E5D4EF', // Order 4 - lavender
  '#FFE5CC', // Order 5 - peach
  '#D4E5F7', // Order 6 - blue
  '#F7D4E5', // Order 7 - rose
] as const;
