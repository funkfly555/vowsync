/**
 * BulkDeleteDialog - Confirmation dialog for bulk delete operations
 * @feature 031-items-card-table-view
 * @task T038
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
import { AlertTriangle, Loader2 } from 'lucide-react';

interface BulkDeleteDialogProps {
  isOpen: boolean;
  itemCount: number;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation dialog for bulk delete
 * AC6.5: Shows "Delete X items?" with confirm/cancel options
 */
export function BulkDeleteDialog({
  isOpen,
  itemCount,
  isDeleting,
  onClose,
  onConfirm,
}: BulkDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>
              Delete {itemCount} {itemCount === 1 ? 'item' : 'items'}?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            This action cannot be undone. This will permanently delete the selected{' '}
            {itemCount === 1 ? 'item' : 'items'} and all associated event quantities.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>Delete {itemCount === 1 ? 'Item' : 'Items'}</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
