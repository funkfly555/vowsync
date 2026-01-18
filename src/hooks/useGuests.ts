/**
 * useGuests Hook - TanStack Query hooks for guest data
 * @feature 006-guest-list
 * @feature 007-guest-crud-attendance
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Guest,
  GuestDisplayItem,
  GuestFilters,
  PAGE_SIZE,
  toGuestDisplayItem,
  GuestWithAttendance,
  GuestEventAttendance,
} from '@/types/guest';

interface UseGuestsParams {
  weddingId: string;
  page: number;
  filters: GuestFilters;
}

interface UseGuestsReturn {
  guests: GuestDisplayItem[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchGuests(
  weddingId: string,
  page: number,
  filters: GuestFilters
): Promise<{ guests: Guest[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Build query based on filters
  let query = supabase
    .from('guests')
    .select('*', { count: 'exact' })
    .eq('wedding_id', weddingId)
    .order('name', { ascending: true });

  // Apply type filter
  if (filters.type !== 'all') {
    query = query.eq('guest_type', filters.type);
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching guests:', error);
    throw error;
  }

  return {
    guests: data || [],
    total: count || 0,
  };
}

async function fetchGuestsForEvent(
  weddingId: string,
  eventId: string,
  page: number,
  filters: GuestFilters
): Promise<{ guests: Guest[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('guests')
    .select(
      `
      *,
      guest_event_attendance!inner(event_id, attending)
    `,
      { count: 'exact' }
    )
    .eq('wedding_id', weddingId)
    .eq('guest_event_attendance.event_id', eventId)
    .eq('guest_event_attendance.attending', true)
    .order('name', { ascending: true });

  // Apply type filter
  if (filters.type !== 'all') {
    query = query.eq('guest_type', filters.type);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching guests for event:', error);
    throw error;
  }

  return {
    guests: data || [],
    total: count || 0,
  };
}

export function useGuests({ weddingId, page, filters }: UseGuestsParams): UseGuestsReturn {
  const queryKey = ['guests', weddingId, page, filters];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      // Use event-specific query if event filter is set
      if (filters.eventId) {
        return fetchGuestsForEvent(weddingId, filters.eventId, page, filters);
      }
      return fetchGuests(weddingId, page, filters);
    },
    enabled: !!weddingId,
  });

  // Transform guests and apply client-side filters (search, invitation status)
  const transformedGuests: GuestDisplayItem[] = (data?.guests || [])
    .map(toGuestDisplayItem)
    .filter((guest) => {
      // Apply search filter (client-side for real-time)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!guest.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Apply invitation status filter
      if (filters.invitationStatus !== 'all') {
        if (guest.invitation_status !== filters.invitationStatus) {
          return false;
        }
      }

      return true;
    });

  return {
    guests: transformedGuests,
    total: data?.total || 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Fetch events for the event filter dropdown
 */
export function useWeddingEvents(weddingId: string) {
  return useQuery({
    queryKey: ['events', weddingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, event_name')
        .eq('wedding_id', weddingId)
        .order('event_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!weddingId,
  });
}

// =============================================================================
// Single Guest Fetch (Phase 6B - Edit Mode)
// =============================================================================

interface UseGuestReturn {
  guest: GuestWithAttendance | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fetch a single guest with their event attendance records
 * Used for edit mode in GuestModal
 */
export function useGuest(guestId: string | undefined): UseGuestReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['guest', guestId],
    queryFn: async (): Promise<GuestWithAttendance> => {
      if (!guestId) throw new Error('Guest ID is required');

      // Fetch guest
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('id', guestId)
        .single();

      if (guestError) {
        console.error('Error fetching guest:', guestError);
        throw guestError;
      }

      // Fetch attendance records
      const { data: attendance, error: attendanceError } = await supabase
        .from('guest_event_attendance')
        .select('*')
        .eq('guest_id', guestId);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
        // Don't throw - guest exists, attendance is secondary
      }

      return {
        ...guest,
        event_attendance: (attendance as GuestEventAttendance[]) || [],
      };
    },
    enabled: !!guestId,
  });

  return {
    guest: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch all events for a wedding for attendance tracking
 * Used for Events tab in GuestModal
 */
export function useWeddingEventsForAttendance(weddingId: string) {
  return useQuery({
    queryKey: ['events-attendance', weddingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, event_name, event_order, event_date')
        .eq('wedding_id', weddingId)
        .order('event_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!weddingId,
  });
}
