/**
 * useAttendanceMatrix - Hook for fetching and managing event attendance matrix
 * @feature 007-guest-crud-attendance
 * @task T041, T045
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  AttendanceMatrixData,
  AttendanceMatrixGuest,
  GuestEventAttendance,
  EventAttendanceFormData,
} from '@/types/guest';

interface UseAttendanceMatrixOptions {
  weddingId: string;
}

interface AttendanceRecord {
  id: string;
  guest_id: string;
  event_id: string;
  attending: boolean;
  shuttle_to_event: string | null;
  shuttle_from_event: string | null;
  notes: string | null;
}

interface Event {
  id: string;
  event_name: string;
  event_date: string | null;
}

interface GuestRow {
  id: string;
  name: string;
  guest_type: string;
}

/**
 * Fetch all data needed for the attendance matrix
 */
async function fetchAttendanceMatrix(weddingId: string): Promise<AttendanceMatrixData> {
  // Fetch events for this wedding
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, event_name, event_date')
    .eq('wedding_id', weddingId)
    .order('event_date', { ascending: true });

  if (eventsError) throw eventsError;

  // Fetch all guests for this wedding
  const { data: guests, error: guestsError } = await supabase
    .from('guests')
    .select('id, name, guest_type')
    .eq('wedding_id', weddingId)
    .order('name', { ascending: true });

  if (guestsError) throw guestsError;

  // Fetch all attendance records for this wedding's guests
  const guestIds = guests?.map((g: GuestRow) => g.id) || [];

  let attendance: AttendanceRecord[] = [];
  if (guestIds.length > 0) {
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('guest_event_attendance')
      .select('id, guest_id, event_id, attending, shuttle_to_event, shuttle_from_event, notes')
      .in('guest_id', guestIds);

    if (attendanceError) throw attendanceError;
    attendance = attendanceData || [];
  }

  // Build attendance map for quick lookup
  const attendanceMap = new Map<string, AttendanceRecord>();
  attendance.forEach((record: AttendanceRecord) => {
    const key = `${record.guest_id}-${record.event_id}`;
    attendanceMap.set(key, record);
  });

  // Transform guests into matrix format
  const matrixGuests: AttendanceMatrixGuest[] = (guests || []).map((guest: GuestRow) => {
    const eventAttendance: Record<string, GuestEventAttendance> = {};

    (events || []).forEach((event: Event) => {
      const key = `${guest.id}-${event.id}`;
      const record = attendanceMap.get(key);

      eventAttendance[event.id] = {
        event_id: event.id,
        attending: record?.attending ?? false,
        shuttle_to_event: record?.shuttle_to_event ?? null,
        shuttle_from_event: record?.shuttle_from_event ?? null,
        notes: record?.notes ?? null,
      };
    });

    return {
      id: guest.id,
      name: guest.name,
      guest_type: guest.guest_type,
      eventAttendance,
    };
  });

  return {
    events: (events || []).map((e: Event) => ({
      id: e.id,
      event_name: e.event_name,
      event_date: e.event_date,
    })),
    guests: matrixGuests,
  };
}

/**
 * Hook for fetching and managing the event attendance matrix
 *
 * Provides:
 * - Fetching all guests, events, and attendance records for a wedding
 * - Batch UPSERT mutation for saving multiple attendance changes at once
 * - Automatic query invalidation after successful saves
 *
 * The batch UPSERT uses PostgreSQL's ON CONFLICT clause with (guest_id, event_id)
 * composite key to either insert new records or update existing ones.
 *
 * @param options.weddingId - The wedding ID to fetch attendance matrix for
 * @returns Object containing data, loading states, and saveAttendance mutation
 *
 * @example
 * const { data, saveAttendance } = useAttendanceMatrix({ weddingId: '123' });
 * // Save multiple changes
 * await saveAttendance.mutateAsync([
 *   { guestId: 'g1', attendance: [{ event_id: 'e1', attending: true, ... }] }
 * ]);
 */
export function useAttendanceMatrix({ weddingId }: UseAttendanceMatrixOptions) {
  const queryClient = useQueryClient();

  // Query for fetching matrix data
  const query = useQuery({
    queryKey: ['attendanceMatrix', weddingId],
    queryFn: () => fetchAttendanceMatrix(weddingId),
    enabled: !!weddingId,
  });

  // Mutation for batch saving attendance changes
  const saveAttendance = useMutation({
    mutationFn: async (changes: {
      guestId: string;
      attendance: EventAttendanceFormData[];
    }[]) => {
      // Build upsert records
      const records = changes.flatMap((change) =>
        change.attendance.map((att) => ({
          guest_id: change.guestId,
          event_id: att.event_id,
          attending: att.attending,
          shuttle_to_event: att.shuttle_to_event,
          shuttle_from_event: att.shuttle_from_event,
          notes: att.notes || null,
        }))
      );

      if (records.length === 0) return;

      // Batch upsert using onConflict
      const { error } = await supabase
        .from('guest_event_attendance')
        .upsert(records, { onConflict: 'guest_id,event_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate matrix query to refresh data
      queryClient.invalidateQueries({ queryKey: ['attendanceMatrix', weddingId] });
      // Also invalidate guest queries in case attendance affects display
      queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    saveAttendance,
  };
}
