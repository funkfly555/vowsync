/**
 * GuestCardExpanded - Expanded view wrapper with CSS transition animation
 * Contains the 5-tab interface with form content
 * @feature 021-guest-page-redesign
 * @task T010, T015, T025
 */

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GuestTabs } from './GuestTabs';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { TabName, GuestCardDisplayItem } from '@/types/guest';

interface GuestCardExpandedProps {
  guest: GuestCardDisplayItem;
  isExpanded: boolean;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  children: (activeTab: TabName) => ReactNode;
}

export function GuestCardExpanded({
  guest: _guest,
  isExpanded,
  isDirty,
  isSaving,
  onSave,
  children,
}: GuestCardExpandedProps) {
  const [activeTab, setActiveTab] = useState<TabName>('basic');

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out overflow-hidden',
        isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      )}
    >
      <div className="border-t border-gray-200">
        {/* Tab navigation */}
        <GuestTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content */}
        <div className="p-4">
          {children(activeTab)}
        </div>

        {/* Save button footer */}
        <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
          <Button
            onClick={onSave}
            disabled={!isDirty || isSaving}
            className={cn(
              'min-w-[100px]',
              isDirty
                ? 'bg-[#D4A5A5] hover:bg-[#c99595]'
                : 'bg-gray-300 cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isDirty ? 'Save Changes' : 'Saved'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
