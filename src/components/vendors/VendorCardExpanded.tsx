/**
 * VendorCardExpanded - Expanded view wrapper with CSS transition animation
 * Contains the 5-tab interface with form content and auto-save status
 * @feature 028-vendor-card-expandable
 * @task T040-T045
 */

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { VendorTabs, VendorTabName } from './VendorTabs';
import { Loader2, Check, AlertCircle, Cloud } from 'lucide-react';

// Auto-save status type (exported for use in VendorCard)
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface VendorCardExpandedProps {
  isExpanded: boolean;
  saveStatus: SaveStatus;
  children: (activeTab: VendorTabName) => ReactNode;
}

export function VendorCardExpanded({
  isExpanded,
  saveStatus,
  children,
}: VendorCardExpandedProps) {
  const [activeTab, setActiveTab] = useState<VendorTabName>('overview');

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        isExpanded ? 'max-h-[2000px] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
      )}
    >
      <div className="border-t border-gray-200">
        {/* Tab navigation */}
        <VendorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content */}
        <div className="p-4">
          {children(activeTab)}
        </div>

        {/* Auto-save status footer */}
        <div className="flex justify-end items-center gap-2 px-4 py-2 bg-gray-50 border-t border-gray-200">
          <AutoSaveIndicator status={saveStatus} />
        </div>
      </div>
    </div>
  );
}

/**
 * Auto-save status indicator component
 */
function AutoSaveIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-[#D4A5A5]" />
          <span>Saving...</span>
        </div>
      );
    case 'saved':
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          <span>All changes saved</span>
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to save</span>
        </div>
      );
    case 'idle':
    default:
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Cloud className="h-4 w-4" />
          <span>Auto-save enabled</span>
        </div>
      );
  }
}
