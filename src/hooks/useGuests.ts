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
  GuestCardDisplayItem,
  GuestFiltersState,
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

// =============================================================================
// Guest Cards Hook (Phase 021 - Guest Page Redesign)
// =============================================================================

interface UseGuestCardsParams {
  weddingId: string;
  filters: GuestFiltersState;
}

interface UseGuestCardsReturn {
  guests: GuestCardDisplayItem[];
  totalEvents: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch guests with event attendance for expandable card display
 * Returns GuestCardDisplayItem[] with attendance counts
 */
export function useGuestCards({ weddingId, filters }: UseGuestCardsParams): UseGuestCardsReturn {
  // Fetch all events to get total count
  const { data: events = [] } = useWeddingEvents(weddingId);
  const totalEvents = events.length;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['guest-cards', weddingId, filters],
    queryFn: async (): Promise<GuestCardDisplayItem[]> => {
      // Fetch guests with their event attendance
      const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .select(`
          *,
          guest_event_attendance (
            event_id,
            attending,
            shuttle_to_event,
            shuttle_from_event,
            notes
          )
        `)
        .eq('wedding_id', weddingId)
        .order('name', { ascending: true });

      if (guestsError) {
        console.error('Error fetching guests:', guestsError);
        throw guestsError;
      }

      // Transform to GuestCardDisplayItem
      return (guests || []).map((guest) => {
        const attendance = (guest.guest_event_attendance as GuestEventAttendance[]) || [];
        const attendingCount = attendance.filter((a) => a.attending).length;

        return {
          ...guest,
          eventAttendance: attendance,
          attendingEventsCount: attendingCount,
          totalEventsCount: totalEvents,
        } as GuestCardDisplayItem;
      });
    },
    enabled: !!weddingId,
  });

  // Apply client-side filters
  const filteredGuests = (data || []).filter((guest) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!guest.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Type filter
    if (filters.type !== 'all' && guest.guest_type !== filters.type) {
      return false;
    }

    // Invitation status filter
    if (filters.invitationStatus !== 'all' && guest.invitation_status !== filters.invitationStatus) {
      return false;
    }

    // Table filter
    if (filters.tableNumber === 'none' && guest.table_number) {
      return false;
    }
    if (filters.tableNumber !== 'all' && filters.tableNumber !== 'none' && guest.table_number !== filters.tableNumber) {
      return false;
    }

    // Event filter
    if (filters.eventId) {
      const isAttending = guest.eventAttendance.some(
        (a) => a.event_id === filters.eventId && a.attending
      );
      if (!isAttending) {
        return false;
      }
    }

    return true;
  });

  return {
    guests: filteredGuests,
    totalEvents,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Guests by Table Hook (Phase 021 - Visual Seating Arrangement)
// =============================================================================

interface SeatedGuest {
  id: string;
  name: string;
  table_position: number | null;
}

interface UseGuestsByTableReturn {
  guests: SeatedGuest[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Fetch guests at a specific table for seating arrangement
 * Returns minimal guest info (id, name, table_position)
 */
export function useGuestsByTable(
  weddingId: string,
  tableNumber: string | null
): UseGuestsByTableReturn {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['guests-by-table', weddingId, tableNumber],
    queryFn: async (): Promise<SeatedGuest[]> => {
      if (!tableNumber) return [];

      const { data: guests, error } = await supabase
        .from('guests')
        .select('id, name, table_position')
        .eq('wedding_id', weddingId)
        .eq('table_number', tableNumber)
        .order('table_position', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('Error fetching guests by table:', error);
        throw error;
      }

      return guests || [];
    },
    enabled: !!weddingId && !!tableNumber,
  });

  return {
    guests: data || [],
    isLoading,
    isError,
  };
}
