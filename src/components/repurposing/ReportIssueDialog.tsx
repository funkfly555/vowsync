/**
 * ReportIssueDialog Component
 * @feature 014-repurposing-timeline
 * @task T027
 *
 * Dialog for entering issue description when reporting an issue
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import type { RepurposingInstructionWithRelations } from '@/types/repurposing';

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instruction: RepurposingInstructionWithRelations | null;
  onConfirm: (issueDescription: string) => void;
  isLoading: boolean;
}

export function ReportIssueDialog({
  open,
  onOpenChange,
  instruction,
  onConfirm,
  isLoading,
}: ReportIssueDialogProps) {
  const [issueDescription, setIssueDescription] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!issueDescription.trim()) {
      setError('Please describe the issue');
      return;
    }
    setError('');
    onConfirm(issueDescription.trim());
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIssueDescription('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Report Issue
          </AlertDialogTitle>
          <AlertDialogDescription>
            {instruction && (
              <span>
                Report an issue with the movement of <strong>{instruction.wedding_items.description}</strong>.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="issue-description">Issue Description *</Label>
          <Textarea
            id="issue-description"
            value={issueDescription}
            onChange={(e) => {
              setIssueDescription(e.target.value);
              setError('');
            }}
            placeholder="Describe what went wrong..."
            className="mt-2 min-h-[100px]"
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
            className="min-h-[44px] bg-amber-500 hover:bg-amber-600"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Report Issue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
