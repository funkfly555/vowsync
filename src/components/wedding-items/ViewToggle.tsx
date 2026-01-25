/**
 * ViewToggle Component - Card/Table view toggle buttons for Items page
 * @feature 031-items-card-table-view
 */

import { cn } from '@/lib/utils';
import { LayoutGrid, Table2 } from 'lucide-react';
import type { ItemViewMode } from '@/types/item-table';

interface ViewToggleProps {
  /** Current active view mode */
  activeView: ItemViewMode;
  /** Callback when view is changed */
  onViewChange: (view: ItemViewMode) => void;
  /** Optional className for container */
  className?: string;
}

/**
 * Toggle buttons for switching between Card View and Table View
 * Uses dusty rose (#D4A5A5) for active state
 */
export function ViewToggle({
  activeView,
  onViewChange,
  className,
}: ViewToggleProps) {
  const views: { value: ItemViewMode; label: string; icon: React.ReactNode }[] = [
    { value: 'card', label: 'Card View', icon: <LayoutGrid className="h-4 w-4" /> },
    { value: 'table', label: 'Table View', icon: <Table2 className="h-4 w-4" /> },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="View selection"
      className={cn('flex gap-1', className)}
    >
      {views.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={activeView === value}
          onClick={() => onViewChange(value)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
            activeView === value
              ? 'bg-[#D4A5A5] text-white'
              : 'bg-white text-[#2C2C2C] border border-[#E8E8E8] hover:bg-gray-50'
          )}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}
