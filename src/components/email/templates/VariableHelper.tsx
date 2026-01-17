/**
 * VariableHelper - Variable insertion helper for email templates
 * @feature 016-email-campaigns
 * @task T013
 */

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Variable, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { RecipientType, TemplateVariable } from '@/types/email';
import { AVAILABLE_VARIABLES } from '@/types/email';
import { cn } from '@/lib/utils';

interface VariableHelperProps {
  recipientType: RecipientType;
  onInsertVariable: (variable: string) => void;
}

/**
 * Entity labels for display
 */
const entityLabels: Record<string, string> = {
  guest: 'Guest',
  vendor: 'Vendor',
  wedding: 'Wedding',
  event: 'Event',
};

/**
 * Entity icons/emojis
 */
const entityIcons: Record<string, string> = {
  guest: '👤',
  vendor: '🏢',
  wedding: '💒',
  event: '📅',
};

/**
 * Variable helper component for inserting template variables
 * Shows available variables based on recipient type and allows insertion
 */
export function VariableHelper({
  recipientType,
  onInsertVariable,
}: VariableHelperProps) {
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Filter variables based on recipient type
  const availableVariables = AVAILABLE_VARIABLES.filter((v) => {
    if (recipientType === 'guest') {
      return v.entity !== 'vendor';
    }
    if (recipientType === 'vendor') {
      return v.entity !== 'guest';
    }
    return true;
  });

  // Group variables by entity
  const groupedVariables = availableVariables.reduce(
    (acc, variable) => {
      if (!acc[variable.entity]) {
        acc[variable.entity] = [];
      }
      acc[variable.entity].push(variable);
      return acc;
    },
    {} as Record<string, TemplateVariable[]>
  );

  const handleCopy = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVariable(variable);
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  const handleInsert = (variable: string) => {
    onInsertVariable(variable);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Variable className="h-4 w-4" />
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Available Variables</h4>
          <p className="text-xs text-gray-500 mt-1">
            Click to insert, or copy to clipboard
          </p>
        </div>
        <ScrollArea className="h-72">
          <div className="p-2">
            {Object.entries(groupedVariables).map(([entity, variables]) => (
              <div key={entity} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                  <span>{entityIcons[entity]}</span>
                  <span>{entityLabels[entity]}</span>
                </div>
                <div className="space-y-1">
                  {variables.map((v) => (
                    <VariableItem
                      key={v.placeholder}
                      variable={v}
                      isCopied={copiedVariable === v.placeholder}
                      onInsert={() => handleInsert(v.placeholder)}
                      onCopy={() => handleCopy(v.placeholder)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="px-4 py-3 border-t bg-gray-50">
          <p className="text-xs text-gray-500">
            Variables will be replaced with actual values when sending
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// =============================================================================
// Variable Item Component
// =============================================================================

interface VariableItemProps {
  variable: TemplateVariable;
  isCopied: boolean;
  onInsert: () => void;
  onCopy: () => void;
}

function VariableItem({ variable, isCopied, onInsert, onCopy }: VariableItemProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 px-2 py-2 rounded-md',
        'hover:bg-gray-100 transition-colors group cursor-pointer'
      )}
      onClick={onInsert}
    >
      <div className="flex-1 min-w-0">
        <code className="text-xs bg-gray-100 group-hover:bg-gray-200 px-1.5 py-0.5 rounded font-mono">
          {variable.placeholder}
        </code>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {variable.description}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        title="Copy to clipboard"
      >
        {isCopied ? (
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}

// =============================================================================
// Compact Variable Helper (inline version)
// =============================================================================

interface VariableHelperInlineProps {
  recipientType: RecipientType;
  onInsertVariable: (variable: string) => void;
}

/**
 * Compact inline variable helper - displays as a row of clickable chips
 */
export function VariableHelperInline({
  recipientType,
  onInsertVariable,
}: VariableHelperInlineProps) {
  // Get top 5 most useful variables
  const topVariables = AVAILABLE_VARIABLES
    .filter((v) => {
      if (recipientType === 'guest') return v.entity !== 'vendor';
      if (recipientType === 'vendor') return v.entity !== 'guest';
      return true;
    })
    .slice(0, 5);

  return (
    <div className="flex flex-wrap gap-1.5">
      {topVariables.map((v) => (
        <button
          key={v.placeholder}
          type="button"
          onClick={() => onInsertVariable(v.placeholder)}
          className={cn(
            'inline-flex items-center px-2 py-1 rounded-md text-xs',
            'bg-gray-100 hover:bg-gray-200 transition-colors',
            'font-mono text-gray-700'
          )}
          title={v.description}
        >
          {v.placeholder}
        </button>
      ))}
      <VariableHelper
        recipientType={recipientType}
        onInsertVariable={onInsertVariable}
      />
    </div>
  );
}
