/**
 * DeleteBudgetCategoryDialog Component
 * @feature 011-budget-tracking
 * T017: Delete confirmation dialog for budget categories
 *
 * FR-007: Delete categories with confirmation dialog
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { BudgetCategory } from '@/types/budget';
import { useDeleteBudgetCategory } from '@/hooks/useBudgetCategoryMutations';
import { formatCurrency } from '@/lib/budgetStatus';

interface DeleteBudgetCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: BudgetCategory | null;
  weddingId: string;
  onSuccess: () => void;
}

export function DeleteBudgetCategoryDialog({
  open,
  onOpenChange,
  category,
  weddingId,
  onSuccess,
}: DeleteBudgetCategoryDialogProps) {
  const deleteMutation = useDeleteBudgetCategory();

  const handleDelete = async () => {
    if (!category) return;

    try {
      await deleteMutation.mutateAsync({
        categoryId: category.id,
        weddingId,
      });
      onSuccess();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  if (!category) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Budget Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the &quot;{category.category_name}&quot;
            category? This will remove {formatCurrency(category.projected_amount)} from
            your projected budget and {formatCurrency(category.actual_amount)} from
            actual spending.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Category'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
