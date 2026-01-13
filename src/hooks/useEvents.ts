import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Event, EventFormData, EventWithWedding } from '@/types/event';
import { toast } from 'sonner';

// List events for a wedding
export function useEvents(weddingId: string) {
  return useQuery({
    queryKey: ['events', weddingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('event_order', { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!weddingId,
  });
}

// Get single event with wedding info
export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          wedding:weddings(id, bride_name, groom_name, wedding_date)
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data as EventWithWedding;
    },
    enabled: !!eventId,
  });
}

// Get used event orders for a wedding (for validation)
export function useUsedEventOrders(weddingId: string) {
  return useQuery({
    queryKey: ['eventOrders', weddingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('event_order')
        .eq('wedding_id', weddingId);

      if (error) throw error;
      return data?.map((e) => e.event_order) ?? [];
    },
    enabled: !!weddingId,
  });
}

// Get next available order number
export function getNextAvailableOrder(usedOrders: number[]): number {
  return (
    Array.from({ length: 10 }, (_, i) => i + 1).find(
      (n) => !usedOrders.includes(n)
    ) ?? 1
  );
}

// Create event
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      weddingId,
      data,
    }: {
      weddingId: string;
      data: EventFormData;
    }) => {
      const { data: event, error } = await supabase
        .from('events')
        .insert({
          wedding_id: weddingId,
          event_order: data.event_order,
          event_name: data.event_name,
          event_type: data.event_type,
          event_date: data.event_date.toISOString().split('T')[0],
          event_start_time: data.event_start_time,
          event_end_time: data.event_end_time,
          event_location: data.event_location,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) {
        // Handle specific constraint violations
        if (error.code === '23505') {
          throw new Error('This event order is already used');
        }
        throw error;
      }
      return event as Event;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.weddingId] });
      queryClient.invalidateQueries({ queryKey: ['eventOrders', variables.weddingId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create event');
    },
  });
}

// Update event
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      eventId: string;
      weddingId: string;
      data: EventFormData;
    }) => {
      const { data: event, error } = await supabase
        .from('events')
        .update({
          event_order: variables.data.event_order,
          event_name: variables.data.event_name,
          event_type: variables.data.event_type,
          event_date: variables.data.event_date.toISOString().split('T')[0],
          event_start_time: variables.data.event_start_time,
          event_end_time: variables.data.event_end_time,
          event_location: variables.data.event_location,
          notes: variables.data.notes || null,
        })
        .eq('id', variables.eventId)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('This event order is already used');
        }
        throw error;
      }
      return event as Event;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.weddingId] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['eventOrders', variables.weddingId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update event');
    },
  });
}

// Delete event
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      eventId: string;
      weddingId: string;
    }) => {
      const { error } = await supabase.from('events').delete().eq('id', variables.eventId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.weddingId] });
      queryClient.invalidateQueries({ queryKey: ['eventOrders', variables.weddingId] });
    },
    onError: () => {
      toast.error('Failed to delete event');
    },
  });
}

// Check if event has guest attendance (for edit warning)
export function useEventHasGuests(eventId: string) {
  return useQuery({
    queryKey: ['eventGuests', eventId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('guest_event_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (error) {
        // Table may not exist yet or no data - return false
        return false;
      }
      return (count ?? 0) > 0;
    },
    enabled: !!eventId,
  });
}
