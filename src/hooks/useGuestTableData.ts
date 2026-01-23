/**
 * useGuestTableData Hook - Data fetching for Guest Table View
 * @feature 026-guest-view-toggle
 *
 * Uses the SAME data structure as the card view (EventsShuttlesTab)
 * Shuttle info comes from the events table, not a separate shuttle_transport table
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  transformToTableRows,
  applyGuestFilters,
  applyColumnFilters,
  buildColumnFieldMap,
} from '@/lib/guest-table-utils';
import {
  BASE_COLUMNS,
  generateEventColumns,
} from '@/components/guests/table/tableColumns';
import type {
  GuestTableRowData,
  TableColumnDef,
  EventColumnMeta,
  MealOptionLookup,
  CellEditPayload,
  ColumnFilter,
} from '@/types/guest-table';
import type { GuestFiltersState } from '@/types/guest';

interface UseGuestTableDataParams {
  weddingId: string;
  filters: GuestFiltersState;
  columnFilters?: ColumnFilter[];
  enabled?: boolean;
}

interface UseGuestTableDataReturn {
  rows: GuestTableRowData[];
  /** All rows (before column filters, for unique value extraction in filter dropdowns) */
  allRows: GuestTableRowData[];
  columns: TableColumnDef[];
  events: EventColumnMeta[];
  mealOptions: MealOptionLookup;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  totalCount: number;
}

interface TransformedData {
  rows: GuestTableRowData[];
  eventMeta: EventColumnMeta[];
  mealLookup: MealOptionLookup;
}

/**
 * Fetches and transforms guest data for the Table View
 * Uses SAME data structure as card view (EventsShuttlesTab)
 * Shuttle info comes from events table directly
 */
export function useGuestTableData({
  weddingId,
  filters,
  columnFilters = [],
  enabled = true,
}: UseGuestTableDataParams): UseGuestTableDataReturn {
  const query = useQuery({
    queryKey: ['guest-table-data', weddingId],
    queryFn: async (): Promise<TransformedData> => {
      // First fetch guests to get their IDs
      const guestsResult = await supabase
        .from('guests')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('name');

      if (guestsResult.error) throw guestsResult.error;

      const guestIds = (guestsResult.data || []).map((g) => g.id);

      // Parallel fetch for remaining data
      // Events query matches card view (useWeddingEventsForAttendance)
      const [eventsResult, attendanceResult, mealOptionsResult] =
        await Promise.all([
          // Events with shuttle info - SAME as card view
          supabase
            .from('events')
            .select(`
              id,
              event_name,
              event_order,
              event_date,
              event_start_time,
              event_end_time,
              event_location,
              shuttle_from_location,
              shuttle_departure_to_event,
              shuttle_departure_from_event
            `)
            .eq('wedding_id', weddingId)
            .order('event_order')
            .limit(10),

          // All attendance records for this wedding's guests
          guestIds.length > 0
            ? supabase
                .from('guest_event_attendance')
                .select('guest_id, event_id, attending, shuttle_to_event, shuttle_from_event')
                .in('guest_id', guestIds)
            : Promise.resolve({ data: [], error: null }),

          // Meal options for name display
          supabase
            .from('meal_options')
            .select('option_number, meal_name, course_type')
            .eq('wedding_id', weddingId),
        ]);

      // Error handling
      if (eventsResult.error) throw eventsResult.error;
      if (mealOptionsResult.error) throw mealOptionsResult.error;

      return transformToTableRows(
        guestsResult.data || [],
        eventsResult.data || [],
        attendanceResult.data || [],
        mealOptionsResult.data || []
      );
    },
    enabled: enabled && !!weddingId,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes (formerly cacheTime)
  });

  // Extract data for memoization (satisfies React Compiler)
  const queryRows = query.data?.rows;
  const queryEventMeta = query.data?.eventMeta;

  // Real-time subscription for events changes (INSERT, UPDATE, DELETE)
  // This ensures event columns update automatically when events are modified
  useEffect(() => {
    if (!weddingId || !enabled) return;

    const eventsSubscription = supabase
      .channel(`events-changes-${weddingId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'events',
          filter: `wedding_id=eq.${weddingId}`,
        },
        (payload) => {
          console.log('[GuestTableData] Event changed:', payload.eventType);
          // Refetch to get updated events in correct order
          query.refetch();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount or weddingId change
    return () => {
      eventsSubscription.unsubscribe();
    };
  }, [weddingId, enabled, query.refetch]);

  // Generate columns including event columns
  const columns = useMemo(() => {
    if (!queryEventMeta) return BASE_COLUMNS;
    return [...BASE_COLUMNS, ...generateEventColumns(queryEventMeta)];
  }, [queryEventMeta]);

  // Build column ID to field path mapping for filtering
  const columnFieldMap = useMemo(() => buildColumnFieldMap(columns), [columns]);

  // Apply shared guest filters only (for filter dropdowns to show all possible values)
  const rowsAfterGuestFilters = useMemo(() => {
    if (!queryRows) return [];
    return applyGuestFilters(queryRows, filters);
  }, [queryRows, filters]);

  // Apply column-specific filters on top of guest filters (for display)
  const filteredRows = useMemo(() => {
    if (columnFilters.length === 0) return rowsAfterGuestFilters;
    return applyColumnFilters(rowsAfterGuestFilters, columnFilters, columnFieldMap);
  }, [rowsAfterGuestFilters, columnFilters, columnFieldMap]);

  return {
    rows: filteredRows,
    allRows: rowsAfterGuestFilters,
    columns,
    events: query.data?.eventMeta || [],
    mealOptions: query.data?.mealLookup || { starter: {}, main: {}, dessert: {} },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    totalCount: query.data?.rows.length || 0,
  };
}

/**
 * Mutation hook for updating individual guest cells
 * Supports both guest fields and event attendance fields
 */
export function useUpdateGuestCell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CellEditPayload) => {
      if (payload.eventId && payload.attendanceField) {
        // Update event attendance
        const { error } = await supabase
          .from('guest_event_attendance')
          .upsert(
            {
              guest_id: payload.guestId,
              event_id: payload.eventId,
              [payload.attendanceField]: payload.value,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'guest_id,event_id' }
          );

        if (error) throw error;
      } else {
        // Update guest field
        const { error } = await supabase
          .from('guests')
          .update({
            [payload.field]: payload.value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.guestId);

        if (error) throw error;
      }

      return payload;
    },
    onMutate: async (payload) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['guest-table-data'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TransformedData>([
        'guest-table-data',
        payload.weddingId,
      ]);

      // Optimistically update cache
      queryClient.setQueryData<TransformedData>(
        ['guest-table-data', payload.weddingId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            rows: old.rows.map((row) => {
              if (row.id !== payload.guestId) return row;

              if (payload.eventId && payload.attendanceField) {
                return {
                  ...row,
                  eventAttendance: {
                    ...row.eventAttendance,
                    [payload.eventId]: {
                      ...row.eventAttendance[payload.eventId],
                      [payload.attendanceField]: payload.value,
                    },
                  },
                };
              } else {
                return { ...row, [payload.field]: payload.value };
              }
            }),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, payload, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ['guest-table-data', payload.weddingId],
          context.previousData
        );
      }
    },
    onSettled: (_data, _error, payload) => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['guest-table-data', payload.weddingId],
      });
      // Also invalidate guest-cards for Card View consistency
      queryClient.invalidateQueries({
        queryKey: ['guest-cards', payload.weddingId],
      });
    },
  });
}
