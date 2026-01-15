/**
 * BudgetProgressBar Component
 * @feature 011-budget-tracking
 * T010: Visual spending progress bar with color-coded status
 *
 * FR-003: Progress bar with color status (normal, warning at 90%, danger at 100%+)
 */

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, getProgressBarStatus } from '@/lib/budgetStatus';

interface BudgetProgressBarProps {
  percentSpent: number;
  totalBudget: number;
  totalSpent: number;
}

export function BudgetProgressBar({
  percentSpent,
  totalBudget,
  totalSpent,
}: BudgetProgressBarProps) {
  const { status } = getProgressBarStatus(percentSpent);

  // Determine progress bar color classes
  const progressColorClass =
    status === 'danger'
      ? '[&>div]:bg-red-500'
      : status === 'warning'
        ? '[&>div]:bg-orange-500'
        : '[&>div]:bg-green-500';

  // Cap display at 100% for the visual bar
  const displayPercent = Math.min(percentSpent, 100);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with labels */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Budget Progress</span>
            <span
              className={`font-semibold ${
                status === 'danger'
                  ? 'text-red-600'
                  : status === 'warning'
                    ? 'text-orange-600'
                    : 'text-green-600'
              }`}
            >
              {percentSpent}% spent
            </span>
          </div>

          {/* Progress bar */}
          <Progress
            value={displayPercent}
            className={`h-3 ${progressColorClass}`}
            aria-label={`Budget progress: ${percentSpent}% spent`}
          />

          {/* Footer with amounts */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatCurrency(totalSpent)} spent</span>
            <span>of {formatCurrency(totalBudget)} budget</span>
          </div>

          {/* Warning message if over budget */}
          {percentSpent > 100 && (
            <p className="text-xs text-red-600 font-medium">
              Over budget by {formatCurrency(totalSpent - totalBudget)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
