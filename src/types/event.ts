// src/types/event.ts

export type EventType =
  | 'ceremony'
  | 'reception'
  | 'rehearsal_dinner'
  | 'welcome_party'
  | 'brunch'
  | 'other';

export interface Event {
  id: string;
  wedding_id: string;
  event_order: number;
  event_name: string;
  event_type: EventType | null;
  event_date: string; // ISO date string
  event_start_time: string; // HH:mm format
  event_end_time: string; // HH:mm format
  event_location: string;
  expected_guests_adults: number;
  expected_guests_children: number;
  duration_hours: number | null;
  notes: string | null;
  // Shuttle configuration fields
  shuttle_from_location: string | null;
  shuttle_departure_to_event: string | null; // TIME stored as "HH:mm:ss" or "HH:mm"
  shuttle_departure_from_event: string | null; // TIME stored as "HH:mm:ss" or "HH:mm"
  shuttle_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  event_order: number;
  event_name: string;
  event_type: EventType;
  event_date: Date;
  event_start_time: string; // HH:mm
  event_end_time: string; // HH:mm
  event_location: string;
  notes?: string;
  // Shuttle configuration
  shuttle_from_location?: string;
  shuttle_departure_to_event?: string; // HH:mm
  shuttle_departure_from_event?: string; // HH:mm
  shuttle_notes?: string;
}

export interface EventWithWedding extends Event {
  wedding: {
    id: string;
    bride_name: string;
    groom_name: string;
    wedding_date: string;
  };
}
