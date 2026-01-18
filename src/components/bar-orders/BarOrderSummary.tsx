/**
 * BarOrderSummary - Displays totals for bar order items
 * @feature 012-bar-order-management
 * @task T042, T043, T044
 */

import { Package, PiggyBank, Percent, ListChecks } from 'lucide-react';
import { calculateBarOrderSummary, formatCurrency, formatPercentage } from '@/lib/barOrderCalculations';
import type { BarOrderItem } from '@/types/barOrder';

interface BarOrderSummaryProps {
  items: BarOrderItem[];
}

/**
 * Summary card showing order totals
 */
export function BarOrderSummary({ items }: BarOrderSummaryProps) {
  const summary = calculateBarOrderSummary(items);
  const hasAnyCost = items.some((item) => item.cost_per_unit !== null);

  return (
    <div className="border rounded-lg p-4 bg-muted/50">
      <h3 className="text-sm font-medium mb-4">Order Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Item Count */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-background">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Items</p>
            <p className="font-semibold">{summary.itemCount}</p>
          </div>
        </div>

        {/* Total Units */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-background">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Units</p>
            <p className="font-semibold">{summary.totalUnits}</p>
          </div>
        </div>

        {/* Total Percentage */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-background">
            <Percent className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Coverage</p>
            <p className="font-semibold">{formatPercentage(summary.totalPercentage)}</p>
          </div>
        </div>

        {/* Total Cost */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-background">
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Est. Total</p>
            <p className="font-semibold">
              {hasAnyCost ? formatCurrency(summary.totalCost) : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
