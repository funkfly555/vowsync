/**
 * PercentageWarning - Displays warning/error for item percentage totals
 * @feature 012-bar-order-management
 * @task T032, T033, T034
 */

import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { validateItemsPercentage, formatPercentage } from '@/lib/barOrderCalculations';
import type { BarOrderItem } from '@/types/barOrder';

interface PercentageWarningProps {
  items: BarOrderItem[];
}

/**
 * Component showing percentage validation status
 * - Green checkmark when exactly 100%
 * - Yellow warning when 90-110%
 * - Red error when outside 90-110%
 */
export function PercentageWarning({ items }: PercentageWarningProps) {
  const validation = validateItemsPercentage(items);
  const displayPercentage = formatPercentage(validation.total);

  // Perfect - 100%
  if (!validation.isWarning && !validation.isError) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-200">
          Percentages Total: {displayPercentage}
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          All beverage percentages add up to 100%. Ready to proceed.
        </AlertDescription>
      </Alert>
    );
  }

  // Warning - 90-110%
  if (validation.isWarning) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
          Percentages Total: {displayPercentage}
        </AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          {validation.message} You can still save, but consider adjusting.
        </AlertDescription>
      </Alert>
    );
  }

  // Error - outside 90-110%
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Percentages Total: {displayPercentage}</AlertTitle>
      <AlertDescription>
        {validation.message} Please adjust item percentages before saving.
      </AlertDescription>
    </Alert>
  );
}
