/**
 * BulkDeleteDialog - Confirmation dialog for bulk guest deletion
 * @feature 025-guest-page-fixes
 * @task T043
 */

import { Loader2 } from 'lucide-react';
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

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  isDeleting,
}: BulkDeleteDialogProps) {
  if (selectedCount === 0) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90vw] max-w-md mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {selectedCount} Guest{selectedCount > 1 ? 's' : ''}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{selectedCount} guest{selectedCount > 1 ? 's' : ''}</strong>? This
            action cannot be undone. All associated data including event
            attendance records will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : `Delete ${selectedCount} Guest${selectedCount > 1 ? 's' : ''}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
