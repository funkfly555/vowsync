/**
 * BudgetStatCards Component
 * @feature 011-budget-tracking
 * T009: 4 summary stat cards (Total Budget, Total Spent, Remaining, % Spent)
 *
 * FR-002: Display 4 summary stat cards
 */

import { Wallet, TrendingDown, TrendingUp, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { BudgetOverview } from '@/types/budget';
import { formatCurrency } from '@/lib/budgetStatus';

interface BudgetStatCardsProps {
  overview: BudgetOverview;
}

export function BudgetStatCards({ overview }: BudgetStatCardsProps) {
  const { totalBudget, totalSpent, remaining, percentSpent } = overview;

  // Determine remaining status color
  const remainingColor = remaining < 0 ? 'text-red-600' : 'text-green-600';
  const remainingIcon = remaining < 0 ? TrendingDown : TrendingUp;
  const RemainingIcon = remainingIcon;

  // Determine percent status color
  const percentColor =
    percentSpent >= 100
      ? 'text-red-600'
      : percentSpent >= 90
        ? 'text-orange-600'
        : 'text-green-600';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Budget */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Total Budget
              </p>
              <p className="text-xl font-semibold text-gray-900 truncate">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Total Spent
              </p>
              <p className="text-xl font-semibold text-gray-900 truncate">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remaining */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${remaining < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <RemainingIcon className={`h-5 w-5 ${remainingColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                Remaining
              </p>
              <p className={`text-xl font-semibold truncate ${remainingColor}`}>
                {formatCurrency(Math.abs(remaining))}
                {remaining < 0 && ' over'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Percentage Spent */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                percentSpent >= 100
                  ? 'bg-red-100'
                  : percentSpent >= 90
                    ? 'bg-orange-100'
                    : 'bg-green-100'
              }`}
            >
              <Percent
                className={`h-5 w-5 ${percentColor}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">
                % Spent
              </p>
              <p className={`text-xl font-semibold truncate ${percentColor}`}>
                {percentSpent}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
