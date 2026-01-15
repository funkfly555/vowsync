/**
 * BudgetStatusBadge Component
 * @feature 011-budget-tracking
 * T014, T024, T026-T028: Status badge showing budget health
 *
 * FR-008: Status badges (On Track/90% Spent/Over by R X)
 */

import { Badge } from '@/components/ui/badge';
import type { BudgetStatusBadge as BudgetStatusBadgeType } from '@/types/budget';
import { calculateBudgetStatus } from '@/lib/budgetStatus';

interface BudgetStatusBadgeProps {
  projectedAmount: number;
  actualAmount: number;
}

export function BudgetStatusBadge({
  projectedAmount,
  actualAmount,
}: BudgetStatusBadgeProps) {
  const statusBadge: BudgetStatusBadgeType = calculateBudgetStatus(
    projectedAmount,
    actualAmount
  );

  return (
    <Badge
      variant="outline"
      className={`${statusBadge.bgColor} ${statusBadge.color} border-0 font-medium`}
    >
      {statusBadge.label}
    </Badge>
  );
}
