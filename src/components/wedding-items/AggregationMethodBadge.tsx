/**
 * AggregationMethodBadge - Badge component displaying ADD/MAX aggregation method
 * @feature 013-wedding-items
 * @task T012
 */

import { ArrowUp, ArrowUpDown } from 'lucide-react';
import type { AggregationMethod } from '@/types/weddingItem';

interface AggregationMethodBadgeProps {
  method: AggregationMethod;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Badge displaying the aggregation method (ADD or MAX) with appropriate styling
 * - ADD: Orange badge with up arrow (sum all quantities)
 * - MAX: Blue badge with up-down arrow (take maximum)
 */
export function AggregationMethodBadge({
  method,
  showIcon = true,
  showLabel = true,
  size = 'sm',
}: AggregationMethodBadgeProps) {
  const isADD = method === 'ADD';

  const baseClasses = 'inline-flex items-center gap-1 font-medium rounded';
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  const colorClasses = isADD
    ? 'bg-orange-100 text-orange-800'
    : 'bg-blue-100 text-blue-800';

  const Icon = isADD ? ArrowUp : ArrowUpDown;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`${baseClasses} ${sizeClasses} ${colorClasses}`}>
      {showIcon && <Icon size={iconSize} />}
      {showLabel && <span>{method}</span>}
    </span>
  );
}

/**
 * Tooltip text explaining the aggregation method
 */
export function getAggregationMethodTooltip(method: AggregationMethod): string {
  if (method === 'ADD') {
    return 'ADD: Sum of all event quantities (for consumables like napkins)';
  }
  return 'MAX: Maximum quantity needed across events (for reusables like tables)';
}
