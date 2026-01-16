/**
 * WeddingItemsSummary - Summary statistics card for wedding items
 * @feature 013-wedding-items
 * @task T040, T041, T031
 */

import { useMemo } from 'react';
import { Package, DollarSign, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import { calculateSummary, formatCurrency } from '@/types/weddingItem';

interface WeddingItemsSummaryProps {
  items: WeddingItemWithQuantities[];
}

/**
 * Summary statistics card showing:
 * - Total items count
 * - Total cost across all items
 * - Availability status breakdown (sufficient, shortage, unknown)
 */
export function WeddingItemsSummary({ items }: WeddingItemsSummaryProps) {
  // T041: Calculate summary statistics
  const summary = useMemo(() => calculateSummary(items), [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Total Items */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{summary.totalItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Cost */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">
                {summary.itemsWithCost > 0 ? formatCurrency(summary.totalCost) : '—'}
              </p>
              {summary.itemsWithoutCost > 0 && (
                <p className="text-xs text-muted-foreground">
                  {summary.itemsWithoutCost} items without cost
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* T031: Availability Status - Shortages */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shortages</p>
              <p className="text-2xl font-bold text-orange-600">{summary.shortageCount}</p>
              {summary.shortageCount > 0 && (
                <p className="text-xs text-muted-foreground">items need attention</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Status - Sufficient */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sufficient</p>
              <p className="text-2xl font-bold text-green-600">{summary.sufficientCount}</p>
              {summary.unknownAvailabilityCount > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  {summary.unknownAvailabilityCount} unknown
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
