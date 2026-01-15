/**
 * VendorTotalsSummary Component
 * @feature 010-invoice-payment-integration
 * T007: Display financial summary card for a vendor
 *
 * Shows: Total Invoiced, Total Paid, Balance Due
 */

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVendorTotals } from '@/hooks/useVendorTotals';
import { formatCurrency } from '@/lib/vendorInvoiceStatus';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorTotalsSummaryProps {
  vendorId: string;
}

/**
 * T007: Financial summary card displaying vendor totals
 * - Total Invoiced (sum of all invoice amounts)
 * - Total Paid (sum of all paid payment amounts)
 * - Balance Due (difference, highlighted if > 0)
 */
export function VendorTotalsSummary({ vendorId }: VendorTotalsSummaryProps) {
  const { totals, isLoading, isError } = useVendorTotals(vendorId);

  // T013: Loading skeleton state
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !totals) {
    return null; // Gracefully hide on error
  }

  const hasBalance = totals.balanceDue > 0;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Invoiced */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Invoiced</p>
              <p className="text-lg font-semibold" aria-label={`Total invoiced: ${formatCurrency(totals.totalInvoiced)}`}>
                {formatCurrency(totals.totalInvoiced)}
              </p>
            </div>
          </div>

          {/* Total Paid */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-lg font-semibold text-green-600" aria-label={`Total paid: ${formatCurrency(totals.totalPaid)}`}>
                {formatCurrency(totals.totalPaid)}
              </p>
            </div>
          </div>

          {/* Balance Due */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                hasBalance ? 'bg-orange-100' : 'bg-gray-100'
              )}
            >
              <AlertCircle
                className={cn('h-5 w-5', hasBalance ? 'text-orange-600' : 'text-gray-400')}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance Due</p>
              <p
                className={cn(
                  'text-lg font-semibold',
                  hasBalance ? 'text-orange-600' : 'text-gray-500'
                )}
                aria-label={`Balance due: ${formatCurrency(totals.balanceDue)}`}
              >
                {formatCurrency(totals.balanceDue)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VendorTotalsSummary;
