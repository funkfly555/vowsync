/**
 * EmailTemplateModal - Modal for creating/editing email templates
 * @feature 016-email-campaigns
 * @task T015
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmailTemplateForm } from './EmailTemplateForm';
import { useEmailTemplate } from '@/hooks/useEmailTemplate';
import { useEmailTemplateMutations } from '@/hooks/useEmailTemplateMutations';
import { Skeleton } from '@/components/ui/skeleton';
import type { EmailTemplate, EmailTemplateFormData } from '@/types/email';

interface EmailTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate; // undefined = create mode
  consultantId: string;
  onSuccess: () => void;
}

/**
 * Modal dialog for creating or editing email templates
 * Loads template data in edit mode, provides clean form in create mode
 */
export function EmailTemplateModal({
  open,
  onOpenChange,
  template,
  consultantId,
  onSuccess,
}: EmailTemplateModalProps) {
  const isEditMode = !!template;

  // Fetch full template data in edit mode
  const { template: fullTemplate, isLoading: isLoadingTemplate } = useEmailTemplate(
    template?.id
  );

  // Get mutation functions
  const mutations = useEmailTemplateMutations(consultantId);

  const handleSubmit = async (data: EmailTemplateFormData) => {
    if (isEditMode && template) {
      await mutations.update.mutateAsync({
        templateId: template.id,
        data,
      });
    } else {
      await mutations.create.mutateAsync(data);
    }
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Loading state for edit mode
  const isLoading = mutations.create.isPending || mutations.update.isPending;

  // Convert template to form data format
  const initialData: EmailTemplateFormData | undefined = fullTemplate
    ? {
        template_name: fullTemplate.template_name,
        template_type: fullTemplate.template_type,
        subject: fullTemplate.subject,
        body_html: fullTemplate.body_html,
        body_text: fullTemplate.body_text,
        is_default: fullTemplate.is_default,
        is_active: fullTemplate.is_active,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Email Template' : 'Create Email Template'}
          </DialogTitle>
        </DialogHeader>

        {isEditMode && isLoadingTemplate ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <EmailTemplateForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
