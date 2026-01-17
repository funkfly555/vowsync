/**
 * DeleteEmailTemplateDialog - Confirmation dialog for template deletion
 * @feature 016-email-campaigns
 * @task T016
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
import { Loader2, AlertTriangle } from 'lucide-react';
import type { EmailTemplate } from '@/types/email';

interface DeleteEmailTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplate;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Confirmation dialog for deleting an email template
 * Shows template name and warns about permanent deletion
 */
export function DeleteEmailTemplateDialog({
  open,
  onOpenChange,
  template,
  onConfirm,
  isLoading,
}: DeleteEmailTemplateDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Template
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete the template{' '}
              <strong className="text-gray-900">"{template.template_name}"</strong>?
            </p>
            <p className="text-red-600">
              This action cannot be undone. The template will be permanently removed.
            </p>
            {template.is_default && (
              <p className="text-amber-600">
                ⚠️ This is currently set as the default template for its type.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Template
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
