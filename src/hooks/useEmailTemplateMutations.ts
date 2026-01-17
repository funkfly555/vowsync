/**
 * useEmailTemplateMutations Hook - Template CRUD operations
 * @feature 016-email-campaigns
 * @task T012
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { EmailTemplate, EmailTemplateFormData } from '@/types/email';
import { extractVariables } from '@/types/email';
import { emailTemplateKeys } from './useEmailTemplates';

// =============================================================================
// Types
// =============================================================================

interface CreateTemplateParams {
  consultantId: string;
  data: EmailTemplateFormData;
}

interface UpdateTemplateParams {
  templateId: string;
  data: EmailTemplateFormData;
}

interface DeleteTemplateParams {
  templateId: string;
}

interface CloneTemplateParams {
  templateId: string;
  consultantId: string;
}

interface SetDefaultParams {
  templateId: string;
  consultantId: string;
  templateType: string;
}

// =============================================================================
// Mutation Functions
// =============================================================================

async function createTemplate({
  consultantId,
  data,
}: CreateTemplateParams): Promise<EmailTemplate> {
  // Extract variables from content
  const variables = [
    ...extractVariables(data.subject),
    ...extractVariables(data.body_html),
  ];

  const { data: template, error } = await supabase
    .from('email_templates')
    .insert({
      consultant_id: consultantId,
      template_name: data.template_name,
      template_type: data.template_type,
      subject: data.subject,
      body_html: data.body_html,
      body_text: data.body_text,
      variables: [...new Set(variables)],
      is_default: data.is_default,
      is_active: data.is_active,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating template:', error);
    throw error;
  }

  // If this template is set as default, unset others
  if (data.is_default && template) {
    await supabase
      .from('email_templates')
      .update({ is_default: false })
      .eq('consultant_id', consultantId)
      .eq('template_type', data.template_type)
      .neq('id', template.id);
  }

  return template;
}

async function updateTemplate({
  templateId,
  data,
}: UpdateTemplateParams): Promise<EmailTemplate> {
  // Get the template first to know consultant_id and template_type
  const { data: existing, error: fetchError } = await supabase
    .from('email_templates')
    .select('consultant_id, template_type')
    .eq('id', templateId)
    .single();

  if (fetchError) {
    console.error('Error fetching template for update:', fetchError);
    throw fetchError;
  }

  // Extract variables from content
  const variables = [
    ...extractVariables(data.subject),
    ...extractVariables(data.body_html),
  ];

  const { data: template, error } = await supabase
    .from('email_templates')
    .update({
      template_name: data.template_name,
      template_type: data.template_type,
      subject: data.subject,
      body_html: data.body_html,
      body_text: data.body_text,
      variables: [...new Set(variables)],
      is_default: data.is_default,
      is_active: data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .select()
    .single();

  if (error) {
    console.error('Error updating template:', error);
    throw error;
  }

  // If this template is set as default, unset others
  if (data.is_default && template) {
    await supabase
      .from('email_templates')
      .update({ is_default: false })
      .eq('consultant_id', existing.consultant_id)
      .eq('template_type', data.template_type)
      .neq('id', template.id);
  }

  return template;
}

async function deleteTemplate({ templateId }: DeleteTemplateParams): Promise<void> {
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', templateId);

  if (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

async function cloneTemplate({
  templateId,
  consultantId,
}: CloneTemplateParams): Promise<EmailTemplate> {
  // Fetch original template
  const { data: original, error: fetchError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (fetchError) {
    console.error('Error fetching template for clone:', fetchError);
    throw fetchError;
  }

  // Insert clone with modified name
  const { data: clone, error } = await supabase
    .from('email_templates')
    .insert({
      consultant_id: consultantId,
      template_name: `${original.template_name} (Copy)`,
      template_type: original.template_type,
      subject: original.subject,
      body_html: original.body_html,
      body_text: original.body_text,
      variables: original.variables,
      is_default: false, // Never clone default status
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error cloning template:', error);
    throw error;
  }

  return clone;
}

async function setDefault({
  templateId,
  consultantId,
  templateType,
}: SetDefaultParams): Promise<void> {
  // First, unset all defaults for this template type
  await supabase
    .from('email_templates')
    .update({ is_default: false })
    .eq('consultant_id', consultantId)
    .eq('template_type', templateType);

  // Then set this template as default
  const { error } = await supabase
    .from('email_templates')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', templateId);

  if (error) {
    console.error('Error setting template as default:', error);
    throw error;
  }
}

async function toggleActive(templateId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('email_templates')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', templateId);

  if (error) {
    console.error('Error toggling template active status:', error);
    throw error;
  }
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook providing mutation functions for email template CRUD operations
 */
export function useEmailTemplateMutations(consultantId: string) {
  const queryClient = useQueryClient();

  const invalidateTemplates = () => {
    queryClient.invalidateQueries({
      queryKey: emailTemplateKeys.lists(),
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: EmailTemplateFormData) =>
      createTemplate({ consultantId, data }),
    onSuccess: () => {
      invalidateTemplates();
      toast.success('Template created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: EmailTemplateFormData }) =>
      updateTemplate({ templateId, data }),
    onSuccess: () => {
      invalidateTemplates();
      toast.success('Template updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (templateId: string) => deleteTemplate({ templateId }),
    onSuccess: () => {
      invalidateTemplates();
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  const cloneMutation = useMutation({
    mutationFn: (templateId: string) => cloneTemplate({ templateId, consultantId }),
    onSuccess: () => {
      invalidateTemplates();
      toast.success('Template cloned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to clone template: ${error.message}`);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: ({ templateId, templateType }: { templateId: string; templateType: string }) =>
      setDefault({ templateId, consultantId, templateType }),
    onSuccess: () => {
      invalidateTemplates();
      toast.success('Default template updated');
    },
    onError: (error) => {
      toast.error(`Failed to set default: ${error.message}`);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ templateId, isActive }: { templateId: string; isActive: boolean }) =>
      toggleActive(templateId, isActive),
    onSuccess: (_, variables) => {
      invalidateTemplates();
      toast.success(
        variables.isActive ? 'Template activated' : 'Template deactivated'
      );
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    clone: cloneMutation,
    setDefault: setDefaultMutation,
    toggleActive: toggleActiveMutation,
  };
}
