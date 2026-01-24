/**
 * BudgetImpactPreview - Shows budget impact before recording a payment
 * @feature 029-budget-vendor-integration
 * @task T024: Show current → new actual in RecordPaymentModal
 */

import { ArrowRight, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/budgetCalculations';
import { cn } from '@/lib/utils';

interface BudgetImpactPreviewProps {
  categoryName: string;
  currentActual: number;
  newActual: number;
  projected: number;
  paymentAmount: number;
}

export function BudgetImpactPreview({
  categoryName,
  currentActual,
  newActual,
  projected,
  paymentAmount,
}: BudgetImpactPreviewProps) {
  const currentPercentage = projected > 0 ? (currentActual / projected) * 100 : 0;
  const newPercentage = projected > 0 ? (newActual / projected) * 100 : 0;

  const willTriggerWarning = newPercentage >= 90 && newPercentage < 100;
  const willExceedBudget = newActual > projected;

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Budget Impact</span>
        <span className="text-xs text-gray-500">{categoryName}</span>
      </div>

      {/* Current → New actual display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-center">
            <div className="text-xs text-gray-500">Current Actual</div>
            <div className="font-mono text-sm">{formatCurrency(currentActual)}</div>
            <div className="text-xs text-gray-400">{currentPercentage.toFixed(0)}%</div>
          </div>

          <ArrowRight className="h-4 w-4 text-gray-400" />

          <div className="text-center">
            <div className="text-xs text-gray-500">After Payment</div>
            <div
              className={cn(
                'font-mono text-sm font-semibold',
                willExceedBudget && 'text-red-600',
                willTriggerWarning && !willExceedBudget && 'text-orange-600',
                !willExceedBudget && !willTriggerWarning && 'text-green-600'
              )}
            >
              {formatCurrency(newActual)}
            </div>
            <div className="text-xs text-gray-400">{newPercentage.toFixed(0)}%</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">Payment</div>
          <div className="font-mono text-sm text-[#D4A5A5]">
            +{formatCurrency(paymentAmount)}
          </div>
        </div>
      </div>

      {/* Progress bar visualization */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Budget: {formatCurrency(projected)}</span>
          <span>Remaining: {formatCurrency(Math.max(0, projected - newActual))}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              willExceedBudget && 'bg-red-500',
              willTriggerWarning && !willExceedBudget && 'bg-orange-400',
              !willExceedBudget && !willTriggerWarning && 'bg-green-500'
            )}
            style={{ width: `${Math.min(100, newPercentage)}%` }}
          />
        </div>
      </div>

      {/* Warning messages */}
      {willExceedBudget && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>This payment will exceed the budget by {formatCurrency(newActual - projected)}</span>
        </div>
      )}

      {willTriggerWarning && !willExceedBudget && (
        <div className="flex items-center gap-2 text-orange-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>Budget will be at {newPercentage.toFixed(0)}% after this payment</span>
        </div>
      )}
    </div>
  );
}
