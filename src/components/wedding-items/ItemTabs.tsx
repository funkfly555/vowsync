/**
 * ItemTabs - Tab navigation component for expanded item cards
 * 4 tabs: Details, Quantities, Costs, Notes
 * @feature 031-items-card-table-view
 * @task T050
 */

import { cn } from '@/lib/utils';
import { Info, Hash, DollarSign, FileText } from 'lucide-react';

export type ItemTabName = 'details' | 'quantities' | 'costs' | 'notes';

interface ItemTabsProps {
  activeTab: ItemTabName;
  onTabChange: (tab: ItemTabName) => void;
}

const TABS: { id: ItemTabName; label: string; icon: React.ReactNode }[] = [
  { id: 'details', label: 'Details', icon: <Info className="h-4 w-4" /> },
  { id: 'quantities', label: 'Quantities', icon: <Hash className="h-4 w-4" /> },
  { id: 'costs', label: 'Costs', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="h-4 w-4" /> },
];

export function ItemTabs({ activeTab, onTabChange }: ItemTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px overflow-x-auto" aria-label="Item details tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'border-[#D4A5A5] text-[#D4A5A5]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
