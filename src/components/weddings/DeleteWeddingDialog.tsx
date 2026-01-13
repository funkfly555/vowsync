import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { Wedding } from '@/types/wedding';

interface DeleteWeddingDialogProps {
  wedding: Wedding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteWeddingDialog({
  wedding,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteWeddingDialogProps) {
  if (!wedding) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Delete Wedding</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete the wedding for{' '}
            <strong>{wedding.bride_name}</strong> and{' '}
            <strong>{wedding.groom_name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <strong>Warning:</strong> This action cannot be undone. All associated data
          including events, guests, and vendors will be permanently deleted.
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Wedding'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
