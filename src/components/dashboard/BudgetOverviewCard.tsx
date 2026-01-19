/**
 * BudgetOverviewCard - Circular progress chart showing budget percentage
 * 180px SVG with gradient stroke and legend showing Total/Spent/Remaining
 * @feature 022-dashboard-visual-metrics
 * @task T003, T021-T028
 */

import { useCurrency } from '@/contexts/CurrencyContext';

interface BudgetOverviewCardProps {
  budgetTotal: number;
  budgetSpent: number;
  budgetPercentage: number;
  isLoading?: boolean;
}

// SVG specifications (T021)
const SVG_SIZE = 180;
const RADIUS = 80;
const STROKE_WIDTH = 12;
const CENTER = SVG_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Loading skeleton for budget card (T027)
 */
function BudgetOverviewSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
      <div className="flex items-center justify-center">
        <div className="w-[180px] h-[180px] rounded-full bg-gray-200" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );
}

/**
 * BudgetOverviewCard - Circular progress chart with legend
 */
export function BudgetOverviewCard({
  budgetTotal,
  budgetSpent,
  budgetPercentage,
  isLoading = false,
}: BudgetOverviewCardProps) {
  const { formatCurrency } = useCurrency();

  if (isLoading) {
    return <BudgetOverviewSkeleton />;
  }

  // Handle edge case: budgetTotal=0 (T026)
  const safePercentage = budgetTotal === 0 ? 0 : Math.min(budgetPercentage, 100);
  const budgetRemaining = budgetTotal - budgetSpent;

  // Calculate stroke-dashoffset for progress (T023)
  const offset = CIRCUMFERENCE - (safePercentage / 100) * CIRCUMFERENCE;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6"
      role="img"
      aria-label={`Budget spent: ${Math.round(safePercentage)} percent`}
    >
      <h3 className="text-base font-semibold text-gray-900 mb-4">Budget Overview</h3>

      {/* SVG Circular Progress Chart (T021-T024) */}
      <div className="flex items-center justify-center">
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="w-[180px] h-[180px]"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Gradient definition (T022) */}
          <defs>
            <linearGradient id="budgetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4CAF50" />
              <stop offset="100%" stopColor="#81C784" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#F5F5F5"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Progress circle */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="url(#budgetGradient)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center text (T024) - positioned absolutely over SVG */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{ width: SVG_SIZE, height: SVG_SIZE }}
        >
          <span className="text-[42px] font-bold text-gray-900 leading-none">
            {Math.round(safePercentage)}%
          </span>
          <span className="text-[13px] text-gray-500 mt-1">spent</span>
        </div>
      </div>

      {/* Legend (T025) */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Total Budget</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(budgetTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm text-gray-600">Spent</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(budgetSpent)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-sm text-gray-600">Remaining</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(budgetRemaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
