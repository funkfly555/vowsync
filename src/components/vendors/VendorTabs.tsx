/**
 * VendorTabs - Tab navigation component for expanded vendor cards
 * 4 tabs: Overview, Contract, Payments & Invoices, Contacts
 * @feature 028-vendor-card-expandable
 * @task T035-T039
 */

import { cn } from '@/lib/utils';
import { Building2, FileText, CreditCard, Users } from 'lucide-react';

export type VendorTabName = 'overview' | 'contract' | 'payments-invoices' | 'contacts';

interface VendorTabsProps {
  activeTab: VendorTabName;
  onTabChange: (tab: VendorTabName) => void;
}

const TABS: { id: VendorTabName; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Building2 className="h-4 w-4" /> },
  { id: 'contract', label: 'Contract', icon: <FileText className="h-4 w-4" /> },
  { id: 'payments-invoices', label: 'Payments & Invoices', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'contacts', label: 'Contacts', icon: <Users className="h-4 w-4" /> },
];

export function VendorTabs({ activeTab, onTabChange }: VendorTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px overflow-x-auto" aria-label="Vendor details tabs">
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
