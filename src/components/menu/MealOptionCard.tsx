/**
 * MealOptionCard - Displays a single meal option with edit/delete actions
 * @feature 024-guest-menu-management
 * @task T013
 */

import { useState } from 'react';
import { Pencil, Trash2, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { MealOption } from '@/types/meal-option';

interface MealOptionCardProps {
  option: MealOption;
  guestCount: number;
  plusOneCount: number;
  onEdit: (option: MealOption) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function MealOptionCard({
  option,
  guestCount,
  plusOneCount,
  onEdit,
  onDelete,
  isDeleting = false,
}: MealOptionCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const totalSelections = guestCount + plusOneCount;
  const hasSelections = totalSelections > 0;

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete(option.id);
  };

  return (
    <>
      <Card className="group relative hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Option Number Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Badge
                variant="outline"
                className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center bg-[#5C4B4B] text-white border-0"
              >
                {option.option_number}
              </Badge>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {option.meal_name}
                </h4>
                {option.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {option.description}
                  </p>
                )}
                {option.dietary_info && (
                  <p className="text-xs text-amber-700 mt-1">
                    {option.dietary_info}
                  </p>
                )}
              </div>
            </div>

            {/* Actions - visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(option)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>

          {/* Selection Count */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{guestCount} guest{guestCount !== 1 ? 's' : ''}</span>
            </div>
            {plusOneCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <UserPlus className="h-4 w-4" />
                <span>{plusOneCount} plus one{plusOneCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            {totalSelections > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalSelections} total
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal Option</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{option.meal_name}"?
              {hasSelections && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Warning: {totalSelections} guest{totalSelections !== 1 ? 's have' : ' has'} selected this option.
                  Their selection will be cleared.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
