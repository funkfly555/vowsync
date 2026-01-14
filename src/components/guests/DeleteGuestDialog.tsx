/**
 * DeleteGuestDialog - Confirmation dialog for guest deletion
 * @feature 007-guest-crud-attendance
 * @task T023
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

interface DeleteGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: { id: string; name: string } | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteGuestDialog({
  open,
  onOpenChange,
  guest,
  onConfirm,
  isDeleting,
}: DeleteGuestDialogProps) {
  if (!guest) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90vw] max-w-md mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Guest</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{guest.name}</strong>? This
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
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
