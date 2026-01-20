/**
 * CourseSection - Displays meal options for a single course type
 * @feature 024-guest-menu-management
 * @task T012
 */

import { useState } from 'react';
import { Plus, ChefHat, Salad, IceCream, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  MealOption,
  CourseType,
  COURSE_LABELS,
  MAX_OPTIONS_PER_COURSE,
  mealOptionFormSchema,
  MealOptionFormSchemaType,
  getNextAvailableOptionNumber,
} from '@/types/meal-option';
import { MealOptionCard } from './MealOptionCard';

interface CourseSectionProps {
  courseType: CourseType;
  options: MealOption[];
  allOptions: MealOption[];
  stats: { optionNumber: number; guestCount: number; plusOneCount: number }[];
  onCreate: (data: { course_type: CourseType; option_number: number; meal_name: string; description: string | null; dietary_info: string | null }) => void;
  onUpdate: (id: string, data: Partial<MealOption>) => void;
  onDelete: (id: string) => void;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const courseIcons: Record<CourseType, typeof ChefHat> = {
  starter: Salad,
  main: ChefHat,
  dessert: IceCream,
};

export function CourseSection({
  courseType,
  options,
  allOptions,
  stats,
  onCreate,
  onUpdate,
  onDelete,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
}: CourseSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<MealOption | null>(null);

  const Icon = courseIcons[courseType];
  const label = COURSE_LABELS[courseType];
  const isAtCapacity = options.length >= MAX_OPTIONS_PER_COURSE;
  const nextOptionNumber = getNextAvailableOptionNumber(allOptions, courseType);

  const form = useForm<MealOptionFormSchemaType>({
    resolver: zodResolver(mealOptionFormSchema),
    defaultValues: {
      meal_name: '',
      description: '',
      dietary_info: '',
    },
  });

  const handleOpenCreate = () => {
    form.reset({
      meal_name: '',
      description: '',
      dietary_info: '',
    });
    setEditingOption(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (option: MealOption) => {
    form.reset({
      meal_name: option.meal_name,
      description: option.description || '',
      dietary_info: option.dietary_info || '',
    });
    setEditingOption(option);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingOption(null);
    form.reset();
  };

  const onSubmit = (data: MealOptionFormSchemaType) => {
    if (editingOption) {
      onUpdate(editingOption.id, {
        meal_name: data.meal_name,
        description: data.description || null,
        dietary_info: data.dietary_info || null,
      });
    } else {
      if (nextOptionNumber === null) return;
      onCreate({
        course_type: courseType,
        option_number: nextOptionNumber,
        meal_name: data.meal_name,
        description: data.description || null,
        dietary_info: data.dietary_info || null,
      });
    }
    handleClose();
  };

  // Get stats for each option
  const getOptionStats = (optionNumber: number) => {
    const stat = stats.find((s) => s.optionNumber === optionNumber);
    return {
      guestCount: stat?.guestCount || 0,
      plusOneCount: stat?.plusOneCount || 0,
    };
  };

  // Calculate total selections for this course
  const totalSelections = stats.reduce((sum, s) => sum + s.guestCount + s.plusOneCount, 0);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-[#5C4B4B]" />
              <CardTitle className="text-lg">{label}</CardTitle>
              <span className="text-sm text-muted-foreground">
                ({options.length}/{MAX_OPTIONS_PER_COURSE} options)
              </span>
            </div>
            <div className="flex items-center gap-3">
              {totalSelections > 0 && (
                <span className="text-sm text-muted-foreground">
                  {totalSelections} selection{totalSelections !== 1 ? 's' : ''}
                </span>
              )}
              <Button
                size="sm"
                onClick={handleOpenCreate}
                disabled={isAtCapacity}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {options.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No {label.toLowerCase()} options configured yet.</p>
              <p className="text-sm mt-1">Add up to {MAX_OPTIONS_PER_COURSE} options.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {options.map((option) => {
                const { guestCount, plusOneCount } = getOptionStats(option.option_number);
                return (
                  <MealOptionCard
                    key={option.id}
                    option={option}
                    guestCount={guestCount}
                    plusOneCount={plusOneCount}
                    onEdit={handleOpenEdit}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOption ? `Edit ${label} Option` : `Add ${label} Option`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meal_name">Meal Name *</Label>
              <Input
                id="meal_name"
                {...form.register('meal_name')}
                placeholder={`e.g., ${courseType === 'starter' ? 'Garden Salad' : courseType === 'main' ? 'Grilled Salmon' : 'Chocolate Cake'}`}
              />
              {form.formState.errors.meal_name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.meal_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Brief description of the dish..."
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary_info">Dietary Info</Label>
              <Input
                id="dietary_info"
                {...form.register('dietary_info')}
                placeholder="e.g., Vegetarian, Gluten-Free, Contains Nuts"
              />
              {form.formState.errors.dietary_info && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.dietary_info.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingOption ? 'Save Changes' : 'Add Option'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
