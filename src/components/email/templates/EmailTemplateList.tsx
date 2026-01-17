/**
 * EmailTemplateList - List component for email templates
 * @feature 016-email-campaigns
 * @task T018
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmailTemplateCard } from './EmailTemplateCard';
import { EmailTemplateModal } from './EmailTemplateModal';
import { DeleteEmailTemplateDialog } from './DeleteEmailTemplateDialog';
import { useEmailTemplates, type EmailTemplatesFilters } from '@/hooks/useEmailTemplates';
import { useEmailTemplateMutations } from '@/hooks/useEmailTemplateMutations';
import { Plus, Search, FileText } from 'lucide-react';
import type { EmailTemplate, TemplateType } from '@/types/email';
import { TEMPLATE_TYPES, TEMPLATE_TYPE_LABELS } from '@/schemas/emailTemplate';

interface EmailTemplateListProps {
  consultantId: string;
  onCreateClick?: () => void;
  onEditClick?: (template: EmailTemplate) => void;
  onCloneClick?: (template: EmailTemplate) => void;
  onDeleteClick?: (template: EmailTemplate) => void;
}

/**
 * List component for displaying and managing email templates
 * Includes search, filtering, and CRUD operations
 */
export function EmailTemplateList({
  consultantId,
}: EmailTemplateListProps) {
  // State
  const [filters, setFilters] = useState<EmailTemplatesFilters>({
    templateType: 'all',
    search: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Data fetching
  const { templates, isLoading, refetch } = useEmailTemplates({
    consultantId,
    filters,
  });

  // Mutations
  const mutations = useEmailTemplateMutations(consultantId);

  // Handlers
  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditModalOpen(true);
  };

  const handleClone = async (template: EmailTemplate) => {
    await mutations.clone.mutateAsync(template.id);
  };

  const handleDelete = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedTemplate) {
      await mutations.delete.mutateAsync(selectedTemplate.id);
    }
  };

  const handleSetDefault = async (template: EmailTemplate) => {
    await mutations.setDefault.mutateAsync({
      templateId: template.id,
      templateType: template.template_type,
    });
  };

  const handleToggleActive = async (template: EmailTemplate, isActive: boolean) => {
    await mutations.toggleActive.mutateAsync({
      templateId: template.id,
      isActive,
    });
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleTypeFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      templateType: value as TemplateType | 'all',
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create reusable templates with personalization variables
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.templateType || 'all'}
          onValueChange={handleTypeFilterChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TEMPLATE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {TEMPLATE_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 p-4 border rounded-lg">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          hasFilters={!!filters.search || filters.templateType !== 'all'}
          onClearFilters={() => setFilters({ templateType: 'all', search: '' })}
          onCreateClick={handleCreate}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <EmailTemplateCard
              key={template.id}
              template={template}
              onEdit={() => handleEdit(template)}
              onClone={() => handleClone(template)}
              onDelete={() => handleDelete(template)}
              onSetDefault={() => handleSetDefault(template)}
              onToggleActive={(isActive) => handleToggleActive(template, isActive)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <EmailTemplateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        consultantId={consultantId}
        onSuccess={handleSuccess}
      />

      <EmailTemplateModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        template={selectedTemplate || undefined}
        consultantId={consultantId}
        onSuccess={handleSuccess}
      />

      {selectedTemplate && (
        <DeleteEmailTemplateDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          template={selectedTemplate}
          onConfirm={handleConfirmDelete}
          isLoading={mutations.delete.isPending}
        />
      )}
    </div>
  );
}

// =============================================================================
// Empty State Component
// =============================================================================

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateClick: () => void;
}

function EmptyState({ hasFilters, onClearFilters, onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-lg">
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        <FileText className="h-6 w-6 text-gray-400" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="text-lg font-medium text-gray-900">No matching templates</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button variant="outline" onClick={onClearFilters} className="mt-4">
            Clear filters
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900">No templates yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Create your first email template to start sending personalized emails to guests and vendors.
          </p>
          <Button onClick={onCreateClick} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </>
      )}
    </div>
  );
}
