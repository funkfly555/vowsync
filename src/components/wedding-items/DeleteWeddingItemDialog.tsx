/**
 * DeleteWeddingItemDialog - Confirmation dialog for deleting a wedding item
 * @feature 013-wedding-items
 * @task T015
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
import type { WeddingItemWithQuantities } from '@/types/weddingItem';

interface DeleteWeddingItemDialogProps {
  item: WeddingItemWithQuantities | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation dialog shown before deleting a wedding item
 * Warns user that event quantities will also be deleted
 */
export function DeleteWeddingItemDialog({
  item,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteWeddingItemDialogProps) {
  const quantityCount = item?.event_quantities?.length || 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Item</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to delete{' '}
                <span className="font-medium text-foreground">
                  {item?.description || 'this item'}
                </span>
                ?
              </p>
              {quantityCount > 0 && (
                <p className="text-orange-600">
                  This will also delete {quantityCount} event{' '}
                  {quantityCount === 1 ? 'quantity' : 'quantities'} associated with this
                  item.
                </p>
              )}
              <p>This action cannot be undone.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
