/**
 * BudgetStatusBadge Component
 * @feature 011-budget-tracking
 * T014, T024, T026-T028: Status badge showing budget health
 *
 * FR-008: Status badges (On Track/Near Budget/At Budget/Over by X)
 */

import { Badge } from '@/components/ui/badge';
import type { BudgetStatusBadge as BudgetStatusBadgeType } from '@/types/budget';
import { calculateBudgetStatus } from '@/lib/budgetStatus';
import { useCurrency } from '@/contexts/CurrencyContext';

interface BudgetStatusBadgeProps {
  projectedAmount: number;
  actualAmount: number;
}

export function BudgetStatusBadge({
  projectedAmount,
  actualAmount,
}: BudgetStatusBadgeProps) {
  const { formatCurrency } = useCurrency();
  const statusBadge: BudgetStatusBadgeType = calculateBudgetStatus(
    projectedAmount,
    actualAmount
  );

  // For over-budget status, format the label with user's currency
  const displayLabel = statusBadge.status === 'over-budget' && statusBadge.overAmount
    ? `Over by ${formatCurrency(statusBadge.overAmount)}`
    : statusBadge.label;

  return (
    <Badge
      variant="outline"
      className={`${statusBadge.bgColor} ${statusBadge.color} border-0 font-medium`}
    >
      {displayLabel}
    </Badge>
  );
}
