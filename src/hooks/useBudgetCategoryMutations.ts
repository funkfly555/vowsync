/**
 * useBudgetCategoryMutations Hook - TanStack Query mutations for budget categories
 * @feature 011-budget-tracking
 * T006: Create/update/delete mutations with wedding totals sync
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { BudgetCategory } from '@/types/budget';
import {
  toBudgetCategoryInsert,
  toBudgetCategoryUpdate,
  type BudgetCategoryFormValues,
} from '@/schemas/budgetCategory';
import { logActivity, activityDescriptions } from '@/lib/activityLog';

// =============================================================================
// Wedding Totals Sync Helper (T034-T038)
// =============================================================================

/**
 * Recalculate and update wedding budget totals from all categories
 * Called after every create/update/delete operation
 */
async function updateWeddingBudgetTotals(weddingId: string): Promise<void> {
  // Fetch all categories for this wedding
  const { data: categories, error: fetchError } = await supabase
    .from('budget_categories')
    .select('projected_amount, actual_amount')
    .eq('wedding_id', weddingId);

  if (fetchError) {
    console.error('Error fetching categories for totals:', fetchError);
    throw fetchError;
  }

  // Calculate totals
  const budget_total = categories?.reduce((sum, c) => sum + (c.projected_amount || 0), 0) ?? 0;
  const budget_actual = categories?.reduce((sum, c) => sum + (c.actual_amount || 0), 0) ?? 0;

  // Update wedding record
  const { error: updateError } = await supabase
    .from('weddings')
    .update({ budget_total, budget_actual })
    .eq('id', weddingId);

  if (updateError) {
    console.error('Error updating wedding totals:', updateError);
    throw updateError;
  }
}

// =============================================================================
// Create Budget Category Mutation
// =============================================================================

interface CreateCategoryVariables {
  weddingId: string;
  data: BudgetCategoryFormValues;
}

async function createCategory({ weddingId, data }: CreateCategoryVariables): Promise<BudgetCategory> {
  const insertData = toBudgetCategoryInsert(data, weddingId);

  const { data: category, error } = await supabase
    .from('budget_categories')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating budget category:', error);
    throw error;
  }

  // Sync wedding totals after create
  await updateWeddingBudgetTotals(weddingId);

  // Log activity (fire-and-forget)
  logActivity({
    weddingId,
    actionType: 'created',
    entityType: 'budget',
    entityId: category.id,
    description: activityDescriptions.budget.created(category.category_name),
  });

  return category;
}

export function useCreateBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (_, variables) => {
      // Invalidate budget categories query
      queryClient.invalidateQueries({ queryKey: ['budget-categories', variables.weddingId] });
      // Invalidate wedding query for updated totals
      queryClient.invalidateQueries({ queryKey: ['wedding', variables.weddingId] });
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
      toast.success('Budget category added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add budget category', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// Update Budget Category Mutation
// =============================================================================

interface UpdateCategoryVariables {
  categoryId: string;
  weddingId: string;
  data: BudgetCategoryFormValues;
}

async function updateCategory({
  categoryId,
  weddingId,
  data,
}: UpdateCategoryVariables): Promise<BudgetCategory> {
  const updateData = toBudgetCategoryUpdate(data);

  const { data: category, error } = await supabase
    .from('budget_categories')
    .update(updateData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating budget category:', error);
    throw error;
  }

  // Sync wedding totals after update
  await updateWeddingBudgetTotals(weddingId);

  // Log activity (fire-and-forget)
  logActivity({
    weddingId,
    actionType: 'updated',
    entityType: 'budget',
    entityId: categoryId,
    description: activityDescriptions.budget.updated(category.category_name),
    changes: data as unknown as Record<string, unknown>,
  });

  return category;
}

export function useUpdateBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (_, variables) => {
      // Invalidate budget categories query
      queryClient.invalidateQueries({ queryKey: ['budget-categories', variables.weddingId] });
      // Invalidate single category query
      queryClient.invalidateQueries({ queryKey: ['budget-category', variables.categoryId] });
      // Invalidate wedding query for updated totals
      queryClient.invalidateQueries({ queryKey: ['wedding', variables.weddingId] });
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
      toast.success('Budget category updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update budget category', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}

// =============================================================================
// Delete Budget Category Mutation
// =============================================================================

interface DeleteCategoryVariables {
  categoryId: string;
  weddingId: string;
}

async function deleteCategory({ categoryId, weddingId }: DeleteCategoryVariables): Promise<void> {
  // Fetch category info before deleting for activity log
  const { data: category } = await supabase
    .from('budget_categories')
    .select('category_name')
    .eq('id', categoryId)
    .single();

  const { error } = await supabase
    .from('budget_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting budget category:', error);
    throw error;
  }

  // Sync wedding totals after delete
  await updateWeddingBudgetTotals(weddingId);

  // Log activity (fire-and-forget)
  if (category) {
    logActivity({
      weddingId,
      actionType: 'deleted',
      entityType: 'budget',
      entityId: categoryId,
      description: activityDescriptions.budget.deleted(category.category_name),
    });
  }
}

export function useDeleteBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_, variables) => {
      // Invalidate budget categories query
      queryClient.invalidateQueries({ queryKey: ['budget-categories', variables.weddingId] });
      // Invalidate wedding query for updated totals
      queryClient.invalidateQueries({ queryKey: ['wedding', variables.weddingId] });
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
      toast.success('Budget category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete budget category', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
}
