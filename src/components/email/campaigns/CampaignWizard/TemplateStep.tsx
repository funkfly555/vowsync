/**
 * TemplateStep - First step in campaign wizard for template selection
 * @feature 016-email-campaigns
 * @task T025
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Search, Star, ArrowRight } from 'lucide-react';
import type { EmailTemplate } from '@/types/email';
import { cn } from '@/lib/utils';

interface TemplateStepProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (template: EmailTemplate | null) => void;
  onNext: () => void;
}

/**
 * Template selection step for campaign wizard
 * Shows available active templates for selection
 */
export function TemplateStep({
  selectedTemplateId,
  onSelectTemplate,
  onNext,
}: TemplateStepProps) {
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const consultantId = user?.id || '';

  // Fetch active templates
  const { templates, isLoading } = useEmailTemplates({
    consultantId,
    filters: {
      isActive: true,
    },
  });

  // Filter templates by search
  const filteredTemplates = templates.filter((t) =>
    t.template_name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort: default first, then by name
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return a.template_name.localeCompare(b.template_name);
  });

  // Auto-select default template on mount if none selected
  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      const defaultTemplate = templates.find((t) => t.is_default);
      if (defaultTemplate) {
        onSelectTemplate(defaultTemplate);
      }
    }
  }, [templates, selectedTemplateId, onSelectTemplate]);

  const handleSelect = (templateId: string) => {
    if (templateId === 'blank') {
      onSelectTemplate(null);
    } else {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        onSelectTemplate(template);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Choose a Template</h2>
        <p className="text-sm text-gray-500 mt-1">
          Start with a template or create from scratch
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Template list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <RadioGroup
          value={selectedTemplateId || 'blank'}
          onValueChange={handleSelect}
          className="space-y-3"
        >
          {/* Blank template option */}
          <Label
            htmlFor="blank"
            className={cn(
              'flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
              !selectedTemplateId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <RadioGroupItem value="blank" id="blank" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Start from scratch</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Create a new email without using a template
              </p>
            </div>
          </Label>

          {/* Template options */}
          {sortedTemplates.map((template) => (
            <Label
              key={template.id}
              htmlFor={template.id}
              className={cn(
                'flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
                selectedTemplateId === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <RadioGroupItem value={template.id} id={template.id} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{template.template_name}</span>
                  {template.is_default && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      <Star className="h-3 w-3 mr-1 fill-amber-500" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Subject: {template.subject}
                </p>
              </div>
            </Label>
          ))}

          {/* Empty state */}
          {sortedTemplates.length === 0 && search && (
            <div className="text-center py-8 text-gray-500">
              No templates found matching "{search}"
            </div>
          )}
        </RadioGroup>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onNext}>
          Next: Edit Content
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
