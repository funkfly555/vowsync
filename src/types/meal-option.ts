/**
 * Meal Option TypeScript Types & Zod Schemas
 * @feature 024-guest-menu-management
 */

import { z } from 'zod';

// =============================================================================
// Core Types
// =============================================================================

export type CourseType = 'starter' | 'main' | 'dessert';

export interface MealOption {
  id: string;
  wedding_id: string;
  course_type: CourseType;
  option_number: number; // 1-5
  meal_name: string;
  description: string | null;
  dietary_info: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Form Types
// =============================================================================

export interface MealOptionInput {
  wedding_id: string;
  course_type: CourseType;
  option_number: number;
  meal_name: string;
  description?: string | null;
  dietary_info?: string | null;
}

export interface MealOptionFormData {
  meal_name: string;
  description: string;
  dietary_info: string;
}

// =============================================================================
// Grouped Types
// =============================================================================

export interface MealOptionsByWedding {
  starters: MealOption[];
  mains: MealOption[];
  desserts: MealOption[];
}

export interface MealOptionsByCourse {
  starter: MealOption[];
  main: MealOption[];
  dessert: MealOption[];
}

// =============================================================================
// Guest Meal Selection Types
// =============================================================================

export interface GuestMealSelections {
  starter_choice: number | null;
  main_choice: number | null;
  dessert_choice: number | null;
  plus_one_starter_choice: number | null;
  plus_one_main_choice: number | null;
  plus_one_dessert_choice: number | null;
}

// =============================================================================
// Display Types
// =============================================================================

export interface MealOptionDisplay {
  optionNumber: number;
  mealName: string;
  description: string | null;
  dietaryInfo: string | null;
  guestCount: number;
  plusOneCount: number;
}

export interface CourseDisplay {
  courseType: CourseType;
  label: string;
  options: MealOptionDisplay[];
  totalSelections: number;
}

// =============================================================================
// Zod Schemas
// =============================================================================

export const courseTypeSchema = z.enum(['starter', 'main', 'dessert']);

export const mealOptionSchema = z.object({
  wedding_id: z.string().uuid(),
  course_type: courseTypeSchema,
  option_number: z.number().int().min(1).max(5),
  meal_name: z.string().min(1, 'Meal name is required').max(100, 'Meal name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').nullable().optional(),
  dietary_info: z.string().max(100, 'Dietary info must be 100 characters or less').nullable().optional(),
});

export const mealOptionFormSchema = z.object({
  meal_name: z.string().min(1, 'Meal name is required').max(100, 'Meal name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less'),
  dietary_info: z.string().max(100, 'Dietary info must be 100 characters or less'),
});

export const guestMealSelectionSchema = z.object({
  starter_choice: z.number().int().min(1).max(5).nullable(),
  main_choice: z.number().int().min(1).max(5).nullable(),
  dessert_choice: z.number().int().min(1).max(5).nullable(),
  plus_one_starter_choice: z.number().int().min(1).max(5).nullable(),
  plus_one_main_choice: z.number().int().min(1).max(5).nullable(),
  plus_one_dessert_choice: z.number().int().min(1).max(5).nullable(),
});

export type MealOptionSchemaType = z.infer<typeof mealOptionSchema>;
export type MealOptionFormSchemaType = z.infer<typeof mealOptionFormSchema>;
export type GuestMealSelectionSchemaType = z.infer<typeof guestMealSelectionSchema>;

// =============================================================================
// Constants
// =============================================================================

export const COURSE_TYPES: CourseType[] = ['starter', 'main', 'dessert'];

export const COURSE_LABELS: Record<CourseType, string> = {
  starter: 'Starter',
  main: 'Main Course',
  dessert: 'Dessert',
};

export const MAX_OPTIONS_PER_COURSE = 5;

export const OPTION_NUMBERS = [1, 2, 3, 4, 5] as const;
export type OptionNumber = (typeof OPTION_NUMBERS)[number];

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Group meal options by course type
 */
export function groupMealOptionsByCourse(options: MealOption[]): MealOptionsByCourse {
  return {
    starter: options.filter((o) => o.course_type === 'starter').sort((a, b) => a.option_number - b.option_number),
    main: options.filter((o) => o.course_type === 'main').sort((a, b) => a.option_number - b.option_number),
    dessert: options.filter((o) => o.course_type === 'dessert').sort((a, b) => a.option_number - b.option_number),
  };
}

/**
 * Get the display name for a meal selection
 * Returns "No Selection" if no option selected, or the meal name if found
 */
export function getMealOptionLabel(
  options: MealOption[],
  courseType: CourseType,
  optionNumber: number | null
): string {
  if (optionNumber === null) return 'No Selection';

  const option = options.find(
    (o) => o.course_type === courseType && o.option_number === optionNumber
  );

  return option?.meal_name ?? `Option ${optionNumber} (Removed)`;
}

/**
 * Get the next available option number for a course
 */
export function getNextAvailableOptionNumber(
  options: MealOption[],
  courseType: CourseType
): number | null {
  const usedNumbers = new Set(
    options.filter((o) => o.course_type === courseType).map((o) => o.option_number)
  );

  for (let i = 1; i <= MAX_OPTIONS_PER_COURSE; i++) {
    if (!usedNumbers.has(i)) return i;
  }

  return null; // All 5 slots used
}

/**
 * Check if a course has reached the maximum number of options
 */
export function isCourseAtMaxCapacity(options: MealOption[], courseType: CourseType): boolean {
  const count = options.filter((o) => o.course_type === courseType).length;
  return count >= MAX_OPTIONS_PER_COURSE;
}

/**
 * Get meal options for a specific course
 */
export function getMealOptionsForCourse(options: MealOption[], courseType: CourseType): MealOption[] {
  return options
    .filter((o) => o.course_type === courseType)
    .sort((a, b) => a.option_number - b.option_number);
}
