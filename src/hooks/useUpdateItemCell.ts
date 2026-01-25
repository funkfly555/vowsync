/**
 * useUpdateItemCell Hook - Mutation for inline item cell editing
 * @feature 031-items-card-table-view
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ItemCellEditPayload } from '@/types/item-table';
import { weddingItemKeys } from './useWeddingItems';

/**
 * Mutation hook for updating individual item cells
 * Supports both item fields and event quantity fields
 */
export function useUpdateItemCell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ItemCellEditPayload) => {
      if (payload.eventId) {
        // Update event quantity - upsert into wedding_item_event_quantities
        const { error } = await supabase
          .from('wedding_item_event_quantities')
          .upsert(
            {
              wedding_item_id: payload.itemId,
              event_id: payload.eventId,
              quantity_required: payload.value as number,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'wedding_item_id,event_id' }
          );

        if (error) throw error;

        // Now we need to recalculate total_required
        // Fetch all event quantities for this item
        const { data: quantities, error: fetchError } = await supabase
          .from('wedding_item_event_quantities')
          .select('quantity_required')
          .eq('wedding_item_id', payload.itemId);

        if (fetchError) throw fetchError;

        // Get the item's aggregation method
        const { data: item, error: itemError } = await supabase
          .from('wedding_items')
          .select('aggregation_method, cost_per_unit')
          .eq('id', payload.itemId)
          .single();

        if (itemError) throw itemError;

        // Calculate new total_required
        const qtyValues = (quantities || []).map((q) => q.quantity_required);
        let totalRequired = 0;
        if (qtyValues.length > 0) {
          if (item.aggregation_method === 'ADD') {
            totalRequired = qtyValues.reduce((sum, q) => sum + q, 0);
          } else {
            totalRequired = Math.max(...qtyValues);
          }
        }

        // Calculate new total_cost
        const totalCost = item.cost_per_unit !== null
          ? totalRequired * item.cost_per_unit
          : null;

        // Update the item with new totals
        const { error: updateError } = await supabase
          .from('wedding_items')
          .update({
            total_required: totalRequired,
            total_cost: totalCost,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.itemId);

        if (updateError) throw updateError;
      } else {
        // Update item field directly
        const updateData: Record<string, unknown> = {
          [payload.field]: payload.value,
          updated_at: new Date().toISOString(),
        };

        // If updating cost_per_unit, also recalculate total_cost
        if (payload.field === 'cost_per_unit') {
          // Fetch current total_required
          const { data: item, error: fetchError } = await supabase
            .from('wedding_items')
            .select('total_required')
            .eq('id', payload.itemId)
            .single();

          if (fetchError) throw fetchError;

          const costPerUnit = payload.value as number | null;
          updateData.total_cost = costPerUnit !== null
            ? item.total_required * costPerUnit
            : null;
        }

        // If updating aggregation_method, recalculate total_required and total_cost
        if (payload.field === 'aggregation_method') {
          // Fetch all event quantities
          const { data: quantities, error: qtyError } = await supabase
            .from('wedding_item_event_quantities')
            .select('quantity_required')
            .eq('wedding_item_id', payload.itemId);

          if (qtyError) throw qtyError;

          const { data: item, error: itemError } = await supabase
            .from('wedding_items')
            .select('cost_per_unit')
            .eq('id', payload.itemId)
            .single();

          if (itemError) throw itemError;

          const qtyValues = (quantities || []).map((q) => q.quantity_required);
          let totalRequired = 0;
          if (qtyValues.length > 0) {
            if (payload.value === 'ADD') {
              totalRequired = qtyValues.reduce((sum, q) => sum + q, 0);
            } else {
              totalRequired = Math.max(...qtyValues);
            }
          }

          updateData.total_required = totalRequired;
          updateData.total_cost = item.cost_per_unit !== null
            ? totalRequired * item.cost_per_unit
            : null;
        }

        const { error } = await supabase
          .from('wedding_items')
          .update(updateData)
          .eq('id', payload.itemId);

        if (error) throw error;
      }

      return payload;
    },
    onSuccess: (_data, payload) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey: weddingItemKeys.list(payload.weddingId),
      });
    },
    onError: (error) => {
      console.error('Error updating item cell:', error);
    },
  });
}
