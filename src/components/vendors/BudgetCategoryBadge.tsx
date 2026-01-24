/**
 * BudgetCategoryBadge - Displays the linked budget category for a vendor
 * @feature 029-budget-vendor-integration
 * @task T040: Create budget category badge component
 */

import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetCategoryBadgeProps {
  categoryName: string;
  className?: string;
}

export function BudgetCategoryBadge({ categoryName, className }: BudgetCategoryBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
        'bg-purple-50 text-purple-700 border border-purple-200',
        className
      )}
    >
      <Tag className="h-3 w-3" />
      <span className="truncate max-w-[120px]">{categoryName}</span>
    </div>
  );
}
