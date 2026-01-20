/**
 * MenuPage - Wedding Menu Configuration Page
 * @feature 024-guest-menu-management
 * @task T014, T017, T018
 *
 * Configure meal options (5 per course) for starter, main, and dessert.
 * View selection counts per option.
 */

import { useParams } from 'react-router-dom';
import { UtensilsCrossed, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useMealOptions, useMealOptionMutations, useMealSelectionStats } from '@/hooks/useMealOptions';
import { CourseSection } from '@/components/menu/CourseSection';
import { COURSE_TYPES, CourseType } from '@/types/meal-option';

export function MenuPage() {
  const { weddingId } = useParams<{ weddingId: string }>();

  // Fetch meal options
  const {
    mealOptions,
    mealOptionsByCourse,
    isLoading: isLoadingOptions,
    isError: isOptionsError,
    error: optionsError,
  } = useMealOptions({ weddingId: weddingId || '' });

  // Fetch selection stats
  const {
    stats,
    isLoading: isLoadingStats,
    isError: isStatsError,
  } = useMealSelectionStats(weddingId || '');

  // Mutations
  const { createMealOption, updateMealOption, deleteMealOption } = useMealOptionMutations({
    weddingId: weddingId || '',
  });

  const isLoading = isLoadingOptions || isLoadingStats;
  const isError = isOptionsError || isStatsError;

  // Get stats for a specific course
  const getStatsForCourse = (courseType: CourseType) => {
    return stats
      .filter((s) => s.courseType === courseType)
      .map((s) => ({
        optionNumber: s.optionNumber,
        guestCount: s.guestCount,
        plusOneCount: s.plusOneCount,
      }));
  };

  // Calculate totals
  const totalOptions = mealOptions.length;
  const totalSelections = stats.reduce((sum, s) => sum + s.guestCount + s.plusOneCount, 0);

  if (!weddingId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Wedding ID is required</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="h-8 w-8 text-[#5C4B4B]" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Menu Options</h1>
            <p className="text-sm text-muted-foreground">
              Configure meal options for your wedding. Guests will choose from these options.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#5C4B4B]">{totalOptions}</div>
            <p className="text-sm text-muted-foreground">Total Menu Options</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#5C4B4B]">{totalSelections}</div>
            <p className="text-sm text-muted-foreground">Total Selections Made</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#5C4B4B]">
              {15 - totalOptions}
            </div>
            <p className="text-sm text-muted-foreground">Options Remaining (max 15)</p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading menu options</AlertTitle>
          <AlertDescription>
            {optionsError?.message || 'Failed to load menu options. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading menu options...</span>
        </div>
      )}

      {/* Course Sections */}
      {!isLoading && !isError && (
        <div className="space-y-6">
          {COURSE_TYPES.map((courseType) => (
            <CourseSection
              key={courseType}
              courseType={courseType}
              options={mealOptionsByCourse[courseType]}
              allOptions={mealOptions}
              stats={getStatsForCourse(courseType)}
              onCreate={(data) => createMealOption.mutate(data)}
              onUpdate={(id, data) => updateMealOption.mutate({ id, data })}
              onDelete={(id) => deleteMealOption.mutate(id)}
              isCreating={createMealOption.isPending}
              isUpdating={updateMealOption.isPending}
              isDeleting={deleteMealOption.isPending}
            />
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <p className="font-medium">How it works</p>
        <ul className="mt-2 list-disc list-inside space-y-1">
          <li>Add up to 5 options per course (starter, main, dessert)</li>
          <li>Guest meal selections in the Guest Modal will use these options</li>
          <li>Selection counts update automatically as guests choose their meals</li>
          <li>Deleting an option will clear any existing selections for that option</li>
        </ul>
      </div>
    </div>
  );
}
