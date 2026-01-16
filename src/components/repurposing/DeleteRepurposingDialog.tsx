/**
 * DeleteRepurposingDialog Component
 * @feature 014-repurposing-timeline
 * @task T029
 *
 * Confirmation dialog for deleting repurposing instructions
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
import { Loader2, Trash2 } from 'lucide-react';
import type { RepurposingInstructionWithRelations } from '@/types/repurposing';

interface DeleteRepurposingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instruction: RepurposingInstructionWithRelations | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteRepurposingDialog({
  open,
  onOpenChange,
  instruction,
  onConfirm,
  isDeleting,
}: DeleteRepurposingDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Instruction
          </AlertDialogTitle>
          <AlertDialogDescription>
            {instruction && (
              <span>
                Are you sure you want to delete the repurposing instruction for{' '}
                <strong>{instruction.wedding_items.description}</strong>?
                <br />
                <br />
                This will remove the instruction to move this item from{' '}
                <strong>{instruction.from_event.event_name}</strong> to{' '}
                <strong>{instruction.to_event.event_name}</strong>.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="min-h-[44px]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="min-h-[44px] bg-destructive hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
