/**
 * useBarOrderMutations Hook - CRUD mutations for bar orders and items
 * @feature 012-bar-order-management
 * @task T008
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { BarOrderFormData, BarOrderItemFormData } from '@/types/barOrder';
import { barOrderKeys } from './useBarOrders';
import { logActivity, activityDescriptions } from '@/lib/activityLog';

// =============================================================================
// Types
// =============================================================================

interface UseBarOrderMutationsParams {
  weddingId: string;
}

// =============================================================================
// Hook
// =============================================================================

export function useBarOrderMutations({ weddingId }: UseBarOrderMutationsParams) {
  const queryClient = useQueryClient();

  // Helper to invalidate queries
  const invalidateBarOrders = () => {
    queryClient.invalidateQueries({ queryKey: barOrderKeys.list(weddingId) });
  };

  const invalidateBarOrder = (orderId: string) => {
    queryClient.invalidateQueries({ queryKey: barOrderKeys.detail(orderId) });
    invalidateBarOrders();
  };

  // =============================================================================
  // Bar Order Mutations
  // =============================================================================

  /**
   * Create a new bar order
   */
  const createBarOrder = useMutation({
    mutationFn: async (data: BarOrderFormData) => {
      const { data: order, error } = await supabase
        .from('bar_orders')
        .insert([{ wedding_id: weddingId, ...data }])
        .select()
        .single();

      if (error) {
        console.error('Error creating bar order:', error);
        throw error;
      }

      // Log activity (fire-and-forget)
      logActivity({
        weddingId,
        actionType: 'created',
        entityType: 'bar_order',
        entityId: order.id,
        description: activityDescriptions.bar_order.created(order.name),
      });

      return order;
    },
    onSuccess: () => {
      toast.success('Bar order created successfully');
      invalidateBarOrders();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create bar order: ${error.message}`);
    },
  });

  /**
   * Update an existing bar order
   */
  const updateBarOrder = useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: Partial<BarOrderFormData> }) => {
      const { data: order, error } = await supabase
        .from('bar_orders')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating bar order:', error);
        throw error;
      }

      // Log activity (fire-and-forget)
      logActivity({
        weddingId,
        actionType: 'updated',
        entityType: 'bar_order',
        entityId: orderId,
        description: activityDescriptions.bar_order.updated(order.name),
        changes: data as Record<string, unknown>,
      });

      return order;
    },
    onSuccess: (_, variables) => {
      toast.success('Bar order updated successfully');
      invalidateBarOrder(variables.orderId);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bar order: ${error.message}`);
    },
  });

  /**
   * Delete a bar order (cascades to items)
   */
  const deleteBarOrder = useMutation({
    mutationFn: async (orderId: string) => {
      // Fetch order info before deleting for activity log
      const { data: order } = await supabase
        .from('bar_orders')
        .select('name')
        .eq('id', orderId)
        .single();

      const { error } = await supabase
        .from('bar_orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Error deleting bar order:', error);
        throw error;
      }

      // Log activity (fire-and-forget)
      if (order) {
        logActivity({
          weddingId,
          actionType: 'deleted',
          entityType: 'bar_order',
          entityId: orderId,
          description: activityDescriptions.bar_order.deleted(order.name),
        });
      }
    },
    onSuccess: () => {
      toast.success('Bar order deleted successfully');
      invalidateBarOrders();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete bar order: ${error.message}`);
    },
  });

  // =============================================================================
  // Bar Order Item Mutations
  // =============================================================================

  /**
   * Create a new item for a bar order
   */
  const createBarOrderItem = useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: Omit<BarOrderItemFormData, 'sort_order'> & {
        sort_order?: number;
        calculated_servings?: number;
        units_needed?: number;
      };
    }) => {
      const { data: item, error } = await supabase
        .from('bar_order_items')
        .insert([{ bar_order_id: orderId, sort_order: data.sort_order ?? 0, ...data }])
        .select()
        .single();

      if (error) {
        console.error('Error creating bar order item:', error);
        throw error;
      }

      return item;
    },
    onSuccess: (_, variables) => {
      toast.success('Item added successfully');
      invalidateBarOrder(variables.orderId);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  });

  /**
   * Update an existing bar order item
   */
  const updateBarOrderItem = useMutation({
    mutationFn: async ({
      itemId,
      data,
    }: {
      orderId: string;
      itemId: string;
      data: Partial<BarOrderItemFormData> & {
        calculated_servings?: number;
        units_needed?: number;
      };
    }) => {
      const { data: item, error } = await supabase
        .from('bar_order_items')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        console.error('Error updating bar order item:', error);
        throw error;
      }

      return item;
    },
    onSuccess: (_, variables) => {
      toast.success('Item updated successfully');
      invalidateBarOrder(variables.orderId);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });

  /**
   * Delete a bar order item
   */
  const deleteBarOrderItem = useMutation({
    mutationFn: async ({ itemId }: { orderId: string; itemId: string }) => {
      const { error } = await supabase
        .from('bar_order_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error deleting bar order item:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast.success('Item deleted successfully');
      invalidateBarOrder(variables.orderId);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });

  /**
   * Bulk update item sort order
   */
  const updateItemSortOrder = useMutation({
    mutationFn: async ({
      items,
    }: {
      orderId: string;
      items: Array<{ id: string; sort_order: number }>;
    }) => {
      // Update each item's sort_order
      for (const item of items) {
        const { error } = await supabase
          .from('bar_order_items')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id);

        if (error) {
          console.error('Error updating item sort order:', error);
          throw error;
        }
      }
    },
    onSuccess: (_, variables) => {
      invalidateBarOrder(variables.orderId);
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder items: ${error.message}`);
    },
  });

  return {
    // Bar Order mutations
    createBarOrder,
    updateBarOrder,
    deleteBarOrder,
    // Bar Order Item mutations
    createBarOrderItem,
    updateBarOrderItem,
    deleteBarOrderItem,
    updateItemSortOrder,
  };
}
