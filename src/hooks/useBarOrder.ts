/**
 * useBarOrder Hook - TanStack Query hook for single bar order with items
 * @feature 012-bar-order-management
 * @task T007
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BarOrderWithRelations } from '@/types/barOrder';
import { barOrderKeys } from './useBarOrders';

// =============================================================================
// Fetch Single Bar Order
// =============================================================================

interface UseBarOrderReturn {
  barOrder: BarOrderWithRelations | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchBarOrder(orderId: string): Promise<BarOrderWithRelations | null> {
  const { data, error } = await supabase
    .from('bar_orders')
    .select(`
      *,
      event:events(id, event_name, event_start_time, event_end_time, expected_guests_adults),
      vendor:vendors(id, company_name),
      items:bar_order_items(*)
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching bar order:', error);
    throw error;
  }

  // Transform data to match expected type interface
  if (!data) return null;

  return {
    ...data,
    event: data.event
      ? {
          id: data.event.id,
          name: data.event.event_name,
          start_time: data.event.event_start_time,
          end_time: data.event.event_end_time,
        }
      : null,
    vendor: data.vendor
      ? {
          id: data.vendor.id,
          business_name: data.vendor.company_name,
        }
      : null,
  } as BarOrderWithRelations;
}

/**
 * Hook to fetch a single bar order by ID with all relations
 */
export function useBarOrder(orderId: string | undefined): UseBarOrderReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: barOrderKeys.detail(orderId!),
    queryFn: () => fetchBarOrder(orderId!),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    barOrder: data || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Helper Hooks for Related Entities
// =============================================================================

interface EventOption {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  expected_guests_adults: number | null;
  duration_hours: number | null;
}

interface VendorOption {
  id: string;
  business_name: string;
  category: string | null;
}

/**
 * Hook to fetch events for dropdown selection
 */
export function useEventsForDropdown(weddingId: string) {
  return useQuery({
    queryKey: ['events', weddingId, 'dropdown'],
    queryFn: async (): Promise<EventOption[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('id, event_name, event_start_time, event_end_time, expected_guests_adults, duration_hours')
        .eq('wedding_id', weddingId)
        .order('event_start_time', { ascending: true });

      if (error) throw error;
      // Map to expected interface
      return (data || []).map((e) => ({
        id: e.id,
        name: e.event_name,
        start_time: e.event_start_time,
        end_time: e.event_end_time,
        expected_guests_adults: e.expected_guests_adults,
        duration_hours: e.duration_hours,
      }));
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch vendors for dropdown selection
 */
export function useVendorsForDropdown(weddingId: string) {
  return useQuery({
    queryKey: ['vendors', weddingId, 'dropdown'],
    queryFn: async (): Promise<VendorOption[]> => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, company_name, vendor_type')
        .eq('wedding_id', weddingId)
        .order('company_name', { ascending: true });

      if (error) throw error;
      // Map to expected interface
      return (data || []).map((v) => ({
        id: v.id,
        business_name: v.company_name,
        category: v.vendor_type,
      }));
    },
    enabled: !!weddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get adult guest count for an event
 */
export function useEventGuestCount(eventId: string | null) {
  return useQuery({
    queryKey: ['event-guest-count', eventId],
    queryFn: async (): Promise<number> => {
      if (!eventId) return 0;

      const { data, error } = await supabase
        .from('guest_event_attendance')
        .select('guest:guests(type)')
        .eq('event_id', eventId)
        .eq('attending', true);

      if (error) throw error;

      // Filter for adults (type !== 'child')
      const adultCount = (data || []).filter(
        (attendance) => {
          const guest = attendance.guest as unknown as { type: string } | null;
          return guest?.type !== 'child';
        }
      ).length;

      return adultCount;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
