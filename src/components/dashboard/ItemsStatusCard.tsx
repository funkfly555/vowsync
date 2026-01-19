/**
 * ItemsStatusCard - Wedding items availability summary
 * Shows total items, shortage count, and total cost
 * @feature 022-dashboard-visual-metrics
 * @task T007, T054, T056, T058, T059
 */

import { Armchair, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ItemsStatusCardProps {
  total: number;
  shortage: number;
  totalCost?: number;
  isLoading?: boolean;
}

/**
 * Loading skeleton (T059)
 */
function ItemsStatusSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6 animate-pulse">
      <div className="h-5 w-28 bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state (T058)
 */
function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Armchair className="w-5 h-5" />
        Items Status
      </h3>
      <div className="flex flex-col items-center justify-center py-4 text-gray-500">
        <Armchair className="w-10 h-10 text-gray-300 mb-2" />
        <p className="text-sm">No items added yet</p>
      </div>
    </div>
  );
}

/**
 * ItemsStatusCard - Total items, shortage count, total cost
 */
export function ItemsStatusCard({
  total,
  shortage,
  totalCost,
  isLoading = false,
}: ItemsStatusCardProps) {
  const { formatCurrency } = useCurrency();

  if (isLoading) {
    return <ItemsStatusSkeleton />;
  }

  // Empty state (T058)
  if (total === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Armchair className="w-5 h-5" />
        Items Status
      </h3>

      <div className="space-y-3">
        {/* Total Items */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Items</span>
          <span className="text-sm font-medium text-gray-900">{total}</span>
        </div>

        {/* Shortage count with warning styling (T056) */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            Items Short
            {shortage > 0 && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </span>
          <span
            className={cn(
              'text-sm font-medium flex items-center gap-1',
              shortage > 0 ? 'text-red-600' : 'text-green-600'
            )}
          >
            {shortage === 0 && <CheckCircle className="w-4 h-4" />}
            {shortage}
          </span>
        </div>

        {/* Total Cost (if provided) */}
        {totalCost !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Total Cost</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(totalCost)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
