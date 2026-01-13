export type WeddingStatus = 'planning' | 'confirmed' | 'completed' | 'cancelled';

export interface Wedding {
  id: string;
  consultant_id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string | null;
  venue_contact_name: string | null;
  venue_contact_phone: string | null;
  venue_contact_email: string | null;
  number_of_events: number;
  guest_count_adults: number;
  guest_count_children: number;
  status: WeddingStatus;
  budget_total: number;
  budget_actual: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeddingFormData {
  bride_name: string;
  groom_name: string;
  wedding_date: Date;
  venue_name: string;
  venue_address?: string;
  venue_contact_name?: string;
  venue_contact_phone?: string;
  venue_contact_email?: string;
  number_of_events: number;
  status: WeddingStatus;
  notes?: string;
}

export interface WeddingListFilters {
  search: string;
  status: WeddingStatus | 'all';
  sortBy: 'wedding_date';
  sortOrder: 'asc' | 'desc';
}
