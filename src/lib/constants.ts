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
