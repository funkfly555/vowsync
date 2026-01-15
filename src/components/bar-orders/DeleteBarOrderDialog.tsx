/**
 * DeleteBarOrderDialog - Confirmation dialog for deleting bar orders
 * @feature 012-bar-order-management
 * @task T040
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
import { Loader2 } from 'lucide-react';
import type { BarOrderWithRelations } from '@/types/barOrder';

interface DeleteBarOrderDialogProps {
  order: BarOrderWithRelations | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation dialog for deleting a bar order
 * Shows warning about cascading delete to items
 */
export function DeleteBarOrderDialog({
  order,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteBarOrderDialogProps) {
  const itemCount = order?.items.length ?? 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bar Order</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold">{order?.name}</span>?
            {itemCount > 0 && (
              <>
                {' '}
                This will also delete {itemCount} item
                {itemCount !== 1 ? 's' : ''}.
              </>
            )}
            <br />
            <span className="text-destructive">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
