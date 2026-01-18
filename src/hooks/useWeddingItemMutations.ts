/**
 * useWeddingItemMutations Hook - CRUD mutations for wedding items and event quantities
 * @feature 013-wedding-items
 * @task T006
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { WeddingItemFormData, AggregationMethod } from '@/types/weddingItem';
import { calculateTotalRequired, calculateTotalCost } from '@/types/weddingItem';
import { weddingItemKeys } from './useWeddingItems';
import { logActivity, activityDescriptions } from '@/lib/activityLog';

// =============================================================================
// Types
// =============================================================================

interface UseWeddingItemMutationsParams {
  weddingId: string;
}

interface CreateItemData extends Omit<WeddingItemFormData, 'event_quantities'> {
  event_quantities?: Record<string, number>;
}

interface UpdateItemData {
  itemId: string;
  data: Partial<WeddingItemFormData>;
}

// =============================================================================
// Hook
// =============================================================================

export function useWeddingItemMutations({ weddingId }: UseWeddingItemMutationsParams) {
  const queryClient = useQueryClient();

  // Helper to invalidate queries
  const invalidateItems = () => {
    queryClient.invalidateQueries({ queryKey: weddingItemKeys.list(weddingId) });
  };

  const invalidateItem = (itemId: string) => {
    queryClient.invalidateQueries({ queryKey: weddingItemKeys.detail(itemId) });
    invalidateItems();
  };

  // =============================================================================
  // Wedding Item Mutations
  // =============================================================================

  /**
   * Create a new wedding item with optional event quantities
   */
  const createItem = useMutation({
    mutationFn: async (data: CreateItemData) => {
      const { event_quantities, ...itemData } = data;

      // Calculate initial totals from event quantities
      const quantities = event_quantities ? Object.values(event_quantities).filter(q => q > 0) : [];
      const totalRequired = calculateTotalRequired(itemData.aggregation_method, quantities);
      const totalCost = calculateTotalCost(totalRequired, itemData.cost_per_unit);

      // 1. Create the wedding item
      const { data: item, error: itemError } = await supabase
        .from('wedding_items')
        .insert([{
          wedding_id: weddingId,
          ...itemData,
          total_required: totalRequired,
          total_cost: totalCost,
        }])
        .select()
        .single();

      if (itemError) {
        console.error('Error creating wedding item:', itemError);
        throw itemError;
      }

      // 2. Create event quantities if provided
      if (event_quantities && Object.keys(event_quantities).length > 0) {
        const quantityRows = Object.entries(event_quantities)
          .filter(([, qty]) => qty > 0)
          .map(([eventId, qty]) => ({
            wedding_item_id: item.id,
            event_id: eventId,
            quantity_required: qty,
          }));

        if (quantityRows.length > 0) {
          const { error: qtyError } = await supabase
            .from('wedding_item_event_quantities')
            .insert(quantityRows);

          if (qtyError) {
            console.error('Error creating event quantities:', qtyError);
            // Don't throw - item was created, quantities failed
            toast.error('Item created but event quantities failed to save');
          }
        }
      }

      // Log activity (fire-and-forget)
      logActivity({
        weddingId,
        actionType: 'created',
        entityType: 'wedding_item',
        entityId: item.id,
        description: activityDescriptions.wedding_item.created(item.description),
      });

      return item;
    },
    onSuccess: () => {
      toast.success('Item created successfully');
      invalidateItems();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create item: ${error.message}`);
    },
  });

  /**
   * Update an existing wedding item
   */
  const updateItem = useMutation({
    mutationFn: async ({ itemId, data }: UpdateItemData) => {
      const { event_quantities, ...itemData } = data;

      // If aggregation method or cost_per_unit changed, we need to recalculate
      let updateData: Record<string, unknown> = {
        ...itemData,
        updated_at: new Date().toISOString(),
      };

      // If event_quantities are provided, update them and recalculate totals
      if (event_quantities !== undefined) {
        // Get current item to know aggregation method
        const { data: currentItem, error: getError } = await supabase
          .from('wedding_items')
          .select('aggregation_method, cost_per_unit')
          .eq('id', itemId)
          .single();

        if (getError) {
          throw new Error(`Failed to get current item: ${getError.message}`);
        }

        const aggMethod = (itemData.aggregation_method || currentItem?.aggregation_method || 'MAX') as AggregationMethod;
        const costPerUnit = itemData.cost_per_unit !== undefined ? itemData.cost_per_unit : currentItem?.cost_per_unit;

        // Delete existing quantities and insert new ones
        const { error: deleteError } = await supabase
          .from('wedding_item_event_quantities')
          .delete()
          .eq('wedding_item_id', itemId);

        if (deleteError) {
          throw new Error(`Failed to delete event quantities: ${deleteError.message}`);
        }

        const quantityRows = Object.entries(event_quantities)
          .filter(([, qty]) => qty > 0)
          .map(([eventId, qty]) => ({
            wedding_item_id: itemId,
            event_id: eventId,
            quantity_required: qty,
          }));

        if (quantityRows.length > 0) {
          const { error: insertError } = await supabase
            .from('wedding_item_event_quantities')
            .insert(quantityRows);

          if (insertError) {
            throw new Error(`Failed to insert event quantities: ${insertError.message}`);
          }
        }

        // Recalculate totals
        const quantities = Object.values(event_quantities).filter(q => q > 0);
        const totalRequired = calculateTotalRequired(aggMethod, quantities);
        const totalCost = calculateTotalCost(totalRequired, costPerUnit);

        updateData.total_required = totalRequired;
        updateData.total_cost = totalCost;
      }

      const { data: item, error } = await supabase
        .from('wedding_items')
        .update(updateData)
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log activity (fire-and-forget)
      logActivity({
        weddingId,
        actionType: 'updated',
        entityType: 'wedding_item',
        entityId: itemId,
        description: activityDescriptions.wedding_item.updated(item.description),
        changes: data as unknown as Record<string, unknown>,
      });

      return item;
    },
    onSuccess: (_, variables) => {
      toast.success('Item updated successfully');
      invalidateItem(variables.itemId);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });

  /**
   * Delete a wedding item (cascades to event quantities)
   */
  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      // Fetch item info before deleting for activity log
      const { data: item } = await supabase
        .from('wedding_items')
        .select('description')
        .eq('id', itemId)
        .single();

      const { error } = await supabase
        .from('wedding_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error deleting wedding item:', error);
        throw error;
      }

      // Log activity (fire-and-forget)
      if (item) {
        logActivity({
          weddingId,
          actionType: 'deleted',
          entityType: 'wedding_item',
          entityId: itemId,
          description: activityDescriptions.wedding_item.deleted(item.description),
        });
      }
    },
    onSuccess: () => {
      toast.success('Item deleted successfully');
      invalidateItems();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });

  // =============================================================================
  // Event Quantity Mutations
  // =============================================================================

  /**
   * Update a single event quantity and recalculate item totals
   */
  const updateEventQuantity = useMutation({
    mutationFn: async ({
      itemId,
      eventId,
      quantity,
    }: {
      itemId: string;
      eventId: string;
      quantity: number;
    }) => {
      // Upsert the quantity
      const { error: upsertError } = await supabase
        .from('wedding_item_event_quantities')
        .upsert(
          {
            wedding_item_id: itemId,
            event_id: eventId,
            quantity_required: quantity,
          },
          { onConflict: 'wedding_item_id,event_id' }
        );

      if (upsertError) {
        console.error('Error updating event quantity:', upsertError);
        throw upsertError;
      }

      // Recalculate and update parent item
      await recalculateItemTotals(itemId);
    },
    onSuccess: (_, variables) => {
      invalidateItem(variables.itemId);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update quantity: ${error.message}`);
    },
  });

  /**
   * Recalculate total_required and total_cost for an item based on its event quantities
   */
  async function recalculateItemTotals(itemId: string) {
    // 1. Get all quantities
    const { data: quantities } = await supabase
      .from('wedding_item_event_quantities')
      .select('quantity_required')
      .eq('wedding_item_id', itemId);

    // 2. Get item's aggregation method and cost_per_unit
    const { data: item } = await supabase
      .from('wedding_items')
      .select('aggregation_method, cost_per_unit')
      .eq('id', itemId)
      .single();

    if (!item) return;

    // 3. Calculate totals
    const qtyValues = quantities?.map(q => q.quantity_required) || [];
    const totalRequired = calculateTotalRequired(item.aggregation_method as AggregationMethod, qtyValues);
    const totalCost = calculateTotalCost(totalRequired, item.cost_per_unit);

    // 4. Update item
    await supabase
      .from('wedding_items')
      .update({
        total_required: totalRequired,
        total_cost: totalCost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);
  }

  return {
    // Item mutations
    createItem,
    updateItem,
    deleteItem,
    // Quantity mutations
    updateEventQuantity,
    // Utility
    recalculateItemTotals,
  };
}
