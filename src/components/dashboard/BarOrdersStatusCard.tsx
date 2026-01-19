/**
 * BarOrdersStatusCard - Bar orders status summary
 * Shows total orders with draft/confirmed/delivered breakdown
 * @feature 022-dashboard-visual-metrics
 * @task T008, T055, T057, T058, T059
 */

import { Wine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BarOrdersStatusCardProps {
  total: number;
  draft: number;
  confirmed: number;
  delivered: number;
  isLoading?: boolean;
}

// Status colors (T057)
const STATUS_COLORS = {
  draft: { dot: 'bg-yellow-500', text: 'text-yellow-600' },
  confirmed: { dot: 'bg-blue-500', text: 'text-blue-600' },
  delivered: { dot: 'bg-green-500', text: 'text-green-600' },
} as const;

/**
 * Loading skeleton (T059)
 */
function BarOrdersSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6 animate-pulse">
      <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-8 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-8 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-8 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-8 bg-gray-200 rounded" />
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
        <Wine className="w-5 h-5" />
        Bar Orders
      </h3>
      <div className="flex flex-col items-center justify-center py-4 text-gray-500">
        <Wine className="w-10 h-10 text-gray-300 mb-2" />
        <p className="text-sm">No bar orders yet</p>
      </div>
    </div>
  );
}

/**
 * StatusRow - Status with colored dot indicator
 */
function StatusRow({
  label,
  count,
  colorConfig,
}: {
  label: string;
  count: number;
  colorConfig: { dot: string; text: string };
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full', colorConfig.dot)} />
        {label}
      </span>
      <span className={cn('text-sm font-medium', colorConfig.text)}>
        {count}
      </span>
    </div>
  );
}

/**
 * BarOrdersStatusCard - Total, draft, confirmed, delivered counts
 */
export function BarOrdersStatusCard({
  total,
  draft,
  confirmed,
  delivered,
  isLoading = false,
}: BarOrdersStatusCardProps) {
  if (isLoading) {
    return <BarOrdersSkeleton />;
  }

  // Empty state (T058)
  if (total === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Wine className="w-5 h-5" />
        Bar Orders
      </h3>

      <div className="space-y-3">
        {/* Total Orders */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Orders</span>
          <span className="text-sm font-bold text-gray-900">{total}</span>
        </div>

        {/* Status breakdown (T057) */}
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <StatusRow
            label="Draft"
            count={draft}
            colorConfig={STATUS_COLORS.draft}
          />
          <StatusRow
            label="Confirmed"
            count={confirmed}
            colorConfig={STATUS_COLORS.confirmed}
          />
          <StatusRow
            label="Delivered"
            count={delivered}
            colorConfig={STATUS_COLORS.delivered}
          />
        </div>
      </div>
    </div>
  );
}
