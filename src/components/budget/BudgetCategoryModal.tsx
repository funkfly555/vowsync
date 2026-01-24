/**
 * BudgetCategoryModal Component
 * @feature 011-budget-tracking
 * @feature 029-budget-vendor-integration
 * T016, T019-T020, T022: Add/edit category modal with React Hook Form + Zod
 * T031-T032: Category type selector with conditional custom name
 *
 * FR-005: Add new categories (name, projected amount, notes)
 * FR-006: Edit existing categories (projected, actual, notes)
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { BudgetCategory } from '@/types/budget';
import {
  useCreateBudgetCategory,
  useUpdateBudgetCategory,
} from '@/hooks/useBudgetCategoryMutations';
import { CategoryTypeSelector } from './CategoryTypeSelector';
import {
  useBudgetCategoryTypes,
  isOtherCustomType,
} from '@/hooks/useBudgetCategoryTypes';

// T033: Form schema with category_type_id and conditional custom_name validation
const budgetCategoryFormSchema = z
  .object({
    category_type_id: z.string().min(1, 'Please select a category type'),
    custom_name: z
      .string()
      .max(100, 'Custom name must be less than 100 characters')
      .optional()
      .nullable(),
    category_name: z
      .string()
      .min(1, 'Category name is required')
      .max(100, 'Category name must be less than 100 characters'),
    projected_amount: z
      .number({ message: 'Projected amount must be a number' })
      .min(0, 'Projected amount cannot be negative')
      .max(9999999.99, 'Projected amount cannot exceed R 9,999,999.99'),
    actual_amount: z
      .number({ message: 'Actual amount must be a number' })
      .min(0, 'Actual amount cannot be negative')
      .max(9999999.99, 'Actual amount cannot exceed R 9,999,999.99'),
    notes: z
      .string()
      .max(1000, 'Notes must be less than 1000 characters')
      .optional()
      .nullable(),
    // Flag for form logic
    _isOtherCustom: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If Other/Custom is selected, custom_name is required
      if (data._isOtherCustom && (!data.custom_name || data.custom_name.trim() === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Custom name is required when "Other/Custom" is selected',
      path: ['custom_name'],
    }
  );

type BudgetCategoryFormValues = z.infer<typeof budgetCategoryFormSchema>;

const defaultValues: BudgetCategoryFormValues = {
  category_type_id: '',
  custom_name: '',
  category_name: '',
  projected_amount: 0,
  actual_amount: 0,
  notes: '',
  _isOtherCustom: false,
};

interface BudgetCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: BudgetCategory | null;
  weddingId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function BudgetCategoryModal({
  open,
  onOpenChange,
  category,
  weddingId,
  onSuccess,
  onClose,
}: BudgetCategoryModalProps) {
  const isEditing = !!category;
  const { categoryTypes } = useBudgetCategoryTypes();

  const createMutation = useCreateBudgetCategory();
  const updateMutation = useUpdateBudgetCategory();

  const form = useForm<BudgetCategoryFormValues>({
    resolver: zodResolver(budgetCategoryFormSchema),
    defaultValues,
  });

  // Watch category_type_id to show/hide custom name field
  const watchCategoryTypeId = form.watch('category_type_id');
  const isOtherCustomSelected = isOtherCustomType(watchCategoryTypeId, categoryTypes);

  // Update _isOtherCustom flag when category type changes
  useEffect(() => {
    form.setValue('_isOtherCustom', isOtherCustomSelected);
  }, [isOtherCustomSelected, form]);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        const categoryIsOther = isOtherCustomType(category.category_type_id || '', categoryTypes);
        form.reset({
          category_type_id: category.category_type_id || '',
          custom_name: category.custom_name || '',
          category_name: category.category_name,
          projected_amount: category.projected_amount,
          actual_amount: category.actual_amount,
          notes: category.notes || '',
          _isOtherCustom: categoryIsOther,
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [open, category, form, categoryTypes]);

  const onSubmit = async (data: BudgetCategoryFormValues) => {
    try {
      // T034: Include category_type_id and custom_name in mutation
      const mutationData = {
        category_name: data.category_name,
        projected_amount: data.projected_amount,
        actual_amount: data.actual_amount,
        notes: data.notes,
        category_type_id: data.category_type_id,
        custom_name: isOtherCustomSelected ? data.custom_name : null,
      };

      if (isEditing && category) {
        await updateMutation.mutateAsync({
          categoryId: category.id,
          weddingId,
          data: mutationData,
        });
      } else {
        await createMutation.mutateAsync({
          weddingId,
          data: mutationData,
        });
      }
      onSuccess();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Budget Category' : 'Add Budget Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the budget category details below.'
              : 'Add a new budget category to track your wedding expenses.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* T031: Category Type Selector */}
            <FormField
              control={form.control}
              name="category_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Type *</FormLabel>
                  <FormControl>
                    <CategoryTypeSelector
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a category type"
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a predefined category type for better organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* T032: Conditional custom name field when "Other/Custom" is selected */}
            {isOtherCustomSelected && (
              <FormField
                control={form.control}
                name="custom_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Category Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a custom category name"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a name for your custom category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Category Name - Display name (auto-filled from type when not custom) */}
            <FormField
              control={form.control}
              name="category_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Venue, Catering, Flowers"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The name displayed in budget reports
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Projected Amount */}
            <FormField
              control={form.control}
              name="projected_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projected Amount (R) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="50000"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actual Amount - Only show when editing */}
            {isEditing && (
              <FormField
                control={form.control}
                name="actual_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Amount (R)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this category..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
