# Hook Contract: useGuestTableData

**Location**: `src/hooks/useGuestTableData.ts`
**Type**: Data Fetching Hook
**Priority**: P1

## Purpose

Fetches and transforms guest data for the Table View, including pivoting event attendance into columns and resolving meal option names.

## Interface

```typescript
interface UseGuestTableDataParams {
  /** Wedding ID to fetch guests for */
  weddingId: string;
  /** Shared filter state from GuestListPage */
  filters: GuestFiltersState;
  /** Whether to enable the query */
  enabled?: boolean;
}

interface UseGuestTableDataReturn {
  /** Guest rows with pivoted event attendance */
  rows: GuestTableRowData[];
  /** All column definitions including dynamic event columns */
  columns: TableColumnDef[];
  /** Event metadata for column rendering */
  events: EventColumnMeta[];
  /** Meal option lookup for name display */
  mealOptions: MealOptionLookup;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  isError: boolean;
  /** Error object if isError */
  error: Error | null;
  /** Refetch function */
  refetch: () => void;
  /** Total guest count before filters */
  totalCount: number;
}
```

## Implementation

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BASE_COLUMNS, generateEventColumns } from '@/components/guests/table/tableColumns';
import { transformToTableRows, applyGuestFilters } from '@/lib/guest-table-utils';
import type {
  GuestTableRowData,
  TableColumnDef,
  EventColumnMeta,
  MealOptionLookup,
} from '@/types/guest-table';
import type { GuestFiltersState } from '@/types/guest';

export function useGuestTableData({
  weddingId,
  filters,
  enabled = true,
}: UseGuestTableDataParams): UseGuestTableDataReturn {
  const query = useQuery({
    queryKey: ['guest-table-data', weddingId],
    queryFn: async () => {
      // Parallel fetch for performance
      const [guestsResult, eventsResult, attendanceResult, mealOptionsResult] =
        await Promise.all([
          // 1. All guests with all fields
          supabase
            .from('guests')
            .select('*')
            .eq('wedding_id', weddingId)
            .order('name'),

          // 2. Events for column generation (max 10)
          supabase
            .from('events')
            .select('id, event_name, event_order')
            .eq('wedding_id', weddingId)
            .order('event_order')
            .limit(10),

          // 3. All attendance records for this wedding
          supabase
            .from('guest_event_attendance')
            .select('guest_id, event_id, attending, shuttle_to, shuttle_from')
            .in(
              'guest_id',
              (await supabase
                .from('guests')
                .select('id')
                .eq('wedding_id', weddingId)
              ).data?.map(g => g.id) || []
            ),

          // 4. Meal options for name display
          supabase
            .from('meal_options')
            .select('option_number, meal_name, course_type')
            .eq('wedding_id', weddingId),
        ]);

      // Error handling
      if (guestsResult.error) throw guestsResult.error;
      if (eventsResult.error) throw eventsResult.error;
      if (attendanceResult.error) throw attendanceResult.error;
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
    gcTime: 5 * 60_000, // 5 minutes
  });

  // Apply shared filters to rows
  const filteredRows = useMemo(() => {
    if (!query.data?.rows) return [];
    return applyGuestFilters(query.data.rows, filters);
  }, [query.data?.rows, filters]);

  // Generate columns including event columns
  const columns = useMemo(() => {
    if (!query.data?.eventMeta) return BASE_COLUMNS;
    return [...BASE_COLUMNS, ...generateEventColumns(query.data.eventMeta)];
  }, [query.data?.eventMeta]);

  return {
    rows: filteredRows,
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
```

## Filter Application

```typescript
// In guest-table-utils.ts
export function applyGuestFilters(
  rows: GuestTableRowData[],
  filters: GuestFiltersState
): GuestTableRowData[] {
  let result = [...rows];

  // Search filter (name)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(row =>
      row.name.toLowerCase().includes(searchLower) ||
      row.email?.toLowerCase().includes(searchLower) ||
      row.plus_one_name?.toLowerCase().includes(searchLower)
    );
  }

  // Guest type filter
  if (filters.type !== 'all') {
    result = result.filter(row => row.guest_type === filters.type);
  }

  // Invitation status filter
  if (filters.invitationStatus !== 'all') {
    result = result.filter(row => row.invitation_status === filters.invitationStatus);
  }

  // Table number filter
  if (filters.tableNumber === 'none') {
    result = result.filter(row => !row.table_number);
  } else if (filters.tableNumber !== 'all') {
    result = result.filter(row => row.table_number === filters.tableNumber);
  }

  // Event filter (attending specific event)
  if (filters.eventId) {
    result = result.filter(row =>
      row.eventAttendance[filters.eventId!]?.attending === true
    );
  }

  return result;
}
```

## Query Key Structure

```typescript
// Base query key for data
['guest-table-data', weddingId]

// Filtered data is derived client-side (no separate query)
// This allows instant filter changes without refetching
```

## Optimistic Update Support

```typescript
// For inline editing, use query cache directly
export function useUpdateGuestCell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CellEditPayload) => {
      if (payload.eventId && payload.attendanceField) {
        // Update event attendance
        return supabase
          .from('guest_event_attendance')
          .upsert({
            guest_id: payload.guestId,
            event_id: payload.eventId,
            [payload.attendanceField]: payload.value,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'guest_id,event_id' });
      } else {
        // Update guest field
        return supabase
          .from('guests')
          .update({
            [payload.field]: payload.value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.guestId);
      }
    },
    onMutate: async (payload) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['guest-table-data'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['guest-table-data', payload.weddingId]);

      // Optimistically update cache
      queryClient.setQueryData(['guest-table-data', payload.weddingId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          rows: old.rows.map((row: GuestTableRowData) => {
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
      });

      return { previousData };
    },
    onError: (err, payload, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['guest-table-data', payload.weddingId], context.previousData);
      }
    },
    onSettled: (data, error, payload) => {
      // Invalidate after mutation settles (for consistency)
      queryClient.invalidateQueries({ queryKey: ['guest-table-data', payload.weddingId] });
    },
  });
}
```

## Test Cases

1. **Fetches all guests**: Returns all guests for wedding
2. **Fetches events**: Returns up to 10 events
3. **Pivots attendance**: Event attendance mapped to rows
4. **Resolves meal names**: Meal options populated
5. **Generates event columns**: Dynamic columns for each event
6. **Applies search filter**: Filters by name/email
7. **Applies type filter**: Filters by guest type
8. **Applies status filter**: Filters by invitation status
9. **Applies table filter**: Filters by table number or unassigned
10. **Applies event filter**: Filters by event attendance
11. **Handles empty data**: Returns empty arrays gracefully
12. **Error handling**: Sets isError and error on failure
13. **Refetch works**: refetch() triggers new fetch
14. **Stale time**: Doesn't refetch within 30s
