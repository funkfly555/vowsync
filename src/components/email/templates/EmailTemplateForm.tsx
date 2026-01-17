/**
 * EmailTemplateForm - Form for creating/editing email templates
 * @feature 016-email-campaigns
 * @task T014
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RichTextEditor } from '../shared/RichTextEditor';
import { VariableHelperInline } from './VariableHelper';
import { Loader2 } from 'lucide-react';
import type { EmailTemplateFormData, RecipientType } from '@/types/email';
import {
  emailTemplateFormSchema,
  TEMPLATE_TYPES,
  TEMPLATE_TYPE_LABELS,
} from '@/schemas/emailTemplate';
import { useState } from 'react';

interface EmailTemplateFormProps {
  initialData?: EmailTemplateFormData;
  onSubmit: (data: EmailTemplateFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

/**
 * Form component for creating and editing email templates
 * Includes rich text editor and variable insertion
 */
export function EmailTemplateForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: EmailTemplateFormProps) {
  // Track recipient type for variable filtering (guest by default)
  const [recipientType, setRecipientType] = useState<RecipientType>('guest');

  const form = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateFormSchema),
    defaultValues: initialData || {
      template_name: '',
      template_type: 'custom',
      subject: '',
      body_html: '',
      body_text: null,
      is_default: false,
      is_active: true,
    },
  });

  const handleSubmit = async (data: EmailTemplateFormData) => {
    await onSubmit(data);
  };

  const insertVariableIntoSubject = (variable: string) => {
    const currentSubject = form.getValues('subject');
    form.setValue('subject', currentSubject + variable);
  };

  const insertVariableIntoBody = (variable: string) => {
    const currentBody = form.getValues('body_html');
    form.setValue('body_html', currentBody + variable);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Template Name & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="template_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., RSVP Reminder - Formal"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="template_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TEMPLATE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {TEMPLATE_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Subject Line */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Line *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., {{guest.name}}, please RSVP for {{wedding.bride_name}} & {{wedding.groom_name}}'s Wedding"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="flex items-center justify-between">
                <span>Use variables to personalize the subject</span>
                <VariableHelperInline
                  recipientType={recipientType}
                  onInsertVariable={insertVariableIntoSubject}
                />
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recipient Type Selector (for variable filtering) */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium">Preview variables for:</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={recipientType === 'guest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRecipientType('guest')}
            >
              Guests
            </Button>
            <Button
              type="button"
              variant={recipientType === 'vendor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRecipientType('vendor')}
            >
              Vendors
            </Button>
          </div>
        </div>

        {/* Email Body */}
        <FormField
          control={form.control}
          name="body_html"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Content *</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Write your email content here..."
                  recipientType={recipientType}
                  onInsertVariable={insertVariableIntoBody}
                  minHeight={300}
                  maxHeight={500}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Options */}
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium text-sm text-gray-700">Template Options</h4>

          <FormField
            control={form.control}
            name="is_default"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Set as Default</FormLabel>
                  <FormDescription className="text-xs">
                    This template will be pre-selected for its type
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Active</FormLabel>
                  <FormDescription className="text-xs">
                    Inactive templates won't appear in selection lists
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
