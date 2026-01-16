/**
 * CompleteInstructionDialog Component
 * @feature 014-repurposing-timeline
 * @task T027
 *
 * Dialog for entering completed_by when marking instruction complete
 */

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
import type { RepurposingInstructionWithRelations } from '@/types/repurposing';

interface CompleteInstructionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instruction: RepurposingInstructionWithRelations | null;
  onConfirm: (completedBy: string) => void;
  isLoading: boolean;
}

export function CompleteInstructionDialog({
  open,
  onOpenChange,
  instruction,
  onConfirm,
  isLoading,
}: CompleteInstructionDialogProps) {
  const [completedBy, setCompletedBy] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!completedBy.trim()) {
      setError('Please enter who completed this instruction');
      return;
    }
    setError('');
    onConfirm(completedBy.trim());
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCompletedBy('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Complete Instruction
          </AlertDialogTitle>
          <AlertDialogDescription>
            {instruction && (
              <span>
                Mark the movement of <strong>{instruction.wedding_items.description}</strong> as completed.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="completed-by">Completed By *</Label>
          <Input
            id="completed-by"
            value={completedBy}
            onChange={(e) => {
              setCompletedBy(e.target.value);
              setError('');
            }}
            placeholder="Enter your name"
            className="mt-2 min-h-[44px]"
            autoFocus
            disabled={isLoading}
          />
          {error && (
            <p className="text-sm text-destructive mt-1">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="min-h-[44px]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-h-[44px]"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark Complete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
