/**
 * ItemCardCollapsed - Collapsed card view with horizontal layout
 * All data columns on same line as item description (flexbox, like GuestCardCollapsed)
 * @feature 031-items-card-table-view
 * @task T016
 */

import { ChevronRight, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { WeddingItemWithQuantities } from '@/types/weddingItem';
import { checkAvailability, formatCurrency, formatNumber } from '@/types/weddingItem';
import { AggregationMethodBadge } from './AggregationMethodBadge';
import { AvailabilityStatusBadge } from './AvailabilityStatusBadge';

interface ItemCardCollapsedProps {
  item: WeddingItemWithQuantities;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
}

/**
 * Collapsed card view showing summary info in horizontal layout
 * Pattern copied from GuestCardCollapsed
 * - Checkbox on left
 * - Chevron indicator (right/down)
 * - Item info columns across the row
 * - Click anywhere to expand
 */
export function ItemCardCollapsed({
  item,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
}: ItemCardCollapsedProps) {
  const availabilityStatus = checkAvailability(item.total_required, item.number_available);

  // Only stop propagation - don't call onToggleSelect here
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onToggleExpand();
    } else if (e.key === ' ') {
      e.preventDefault();
      onToggleSelect();
    }
  };

  return (
    <div
      className={cn(
        'border-b border-gray-200 px-6 py-4 cursor-pointer transition-colors',
        isSelected ? 'bg-[#D4A5A5]/10' : 'hover:bg-gray-50'
      )}
      onClick={onToggleExpand}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${item.description}, ${isExpanded ? 'collapse' : 'expand'} details`}
    >
      {/* SINGLE ROW - Everything horizontal */}
      <div className="flex items-center gap-4">

        {/* Left: Checkbox + Arrow + Description */}
        <div className="flex items-center gap-3 min-w-[280px]">
          <div onClick={handleCheckboxClick} className="flex-shrink-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect()}
              aria-label={`Select ${item.description}`}
              className="border-2 data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
            />
          </div>

          <div className="flex-shrink-0 text-gray-400">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Item Description */}
            <div className="text-base font-medium text-gray-900 truncate">{item.description}</div>

            {/* Category - Below description */}
            {item.category && (
              <div className="text-sm text-gray-500">
                {item.category}
              </div>
            )}
          </div>
        </div>

        {/* Method Column - Same row */}
        <div className="min-w-[80px]">
          <div className="text-xs text-gray-500 uppercase">Method</div>
          <AggregationMethodBadge method={item.aggregation_method} size="sm" />
        </div>

        {/* Quantity Column - Same row */}
        <div className="min-w-[100px]">
          <div className="text-xs text-gray-500 uppercase">Need / Have</div>
          <div className="text-sm text-gray-900">
            {formatNumber(item.total_required)} / {item.number_available !== null ? formatNumber(item.number_available) : '?'}
          </div>
        </div>

        {/* Status Column - Same row */}
        <div className="min-w-[100px]">
          <div className="text-xs text-gray-500 uppercase">Status</div>
          <AvailabilityStatusBadge status={availabilityStatus} size="sm" />
        </div>

        {/* Cost Column - Same row */}
        <div className="min-w-[100px]">
          <div className="text-xs text-gray-500 uppercase">Cost</div>
          <div className="text-sm text-gray-900">
            {item.total_cost !== null ? formatCurrency(item.total_cost) : '—'}
          </div>
        </div>

        {/* Supplier Column - Same row */}
        <div className="min-w-[120px] flex-1">
          <div className="text-xs text-gray-500 uppercase">Supplier</div>
          <div className="text-sm text-gray-900 truncate">
            {item.supplier_name || '—'}
          </div>
        </div>

      </div>
    </div>
  );
}
