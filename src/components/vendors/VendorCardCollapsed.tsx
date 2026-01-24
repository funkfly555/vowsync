/**
 * VendorCardCollapsed - Collapsed card view with horizontal layout
 * Shows company name, type, contract status, and payment summary
 * @feature 028-vendor-card-expandable
 * @feature 029-budget-vendor-integration
 * @task T022-T034
 * @task T041: Show linked budget category badge
 */

import { ChevronRight, ChevronDown, MoreVertical, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { VendorDisplay, VENDOR_TYPE_CONFIG, CONTRACT_STATUS_CONFIG } from '@/types/vendor';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { BudgetCategoryBadge } from './BudgetCategoryBadge';

interface VendorCardCollapsedProps {
  vendor: VendorDisplay;
  isExpanded: boolean;
  isSelected: boolean;
  paymentSummary: string;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onDelete?: () => void;
}

export function VendorCardCollapsed({
  vendor,
  isExpanded,
  isSelected,
  paymentSummary,
  onToggleExpand,
  onToggleSelect,
  onDelete,
}: VendorCardCollapsedProps) {
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

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Get vendor type config with fallback
  const typeConfig = VENDOR_TYPE_CONFIG[vendor.vendor_type] || {
    label: vendor.vendor_type || 'Unknown',
    color: 'gray'
  };

  // Get contract status config
  const contractConfig = CONTRACT_STATUS_CONFIG[vendor.contractStatus.label];

  return (
    <div
      className={cn(
        'border-b border-gray-200 px-6 py-4 cursor-pointer transition-colors',
        isSelected ? 'bg-rose-50' : 'hover:bg-gray-50'
      )}
      onClick={onToggleExpand}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${vendor.company_name}, ${isExpanded ? 'collapse' : 'expand'} details`}
    >
      {/* SINGLE ROW - Everything horizontal */}
      <div className="flex items-center gap-4">

        {/* Left: Checkbox + Arrow + Company Name */}
        <div className="flex items-center gap-3 min-w-[250px]">
          <div onClick={handleCheckboxClick} className="flex-shrink-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect()}
              aria-label={`Select ${vendor.company_name}`}
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
            {/* Company Name */}
            <div className="text-base font-medium text-gray-900 truncate">
              {vendor.company_name}
            </div>

            {/* Contact Name - Below company name */}
            <div className="text-sm text-gray-500 truncate">
              {vendor.contact_name}
            </div>
          </div>
        </div>

        {/* Type Column */}
        <div className="min-w-[100px]">
          <div className="text-xs text-gray-500 uppercase">Type</div>
          <div className="text-sm text-gray-900">{typeConfig.label}</div>
        </div>

        {/* Contract Status Column */}
        <div className="min-w-[120px]">
          <div className="text-xs text-gray-500 uppercase">Contract</div>
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              contractConfig?.bgColor || 'bg-gray-100',
              contractConfig?.color || 'text-gray-700'
            )}
          >
            {vendor.contractStatus.label}
          </span>
        </div>

        {/* Payments Column */}
        <div className="min-w-[100px]">
          <div className="text-xs text-gray-500 uppercase">Payments</div>
          <div className="text-sm text-gray-900">{paymentSummary}</div>
        </div>

        {/* T041: Budget Category Column */}
        {vendor.defaultBudgetCategory && (
          <div className="min-w-[140px]">
            <div className="text-xs text-gray-500 uppercase">Budget</div>
            <BudgetCategoryBadge
              categoryName={vendor.defaultBudgetCategory.category_name}
            />
          </div>
        )}

        {/* Right: Delete + Menu */}
        <div className="ml-auto flex-shrink-0 flex items-center gap-1" onClick={handleMenuClick}>
          {/* Delete Button */}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
              aria-label={`Delete ${vendor.company_name}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onToggleExpand}>
                {isExpanded ? 'Collapse' : 'Expand'} Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleSelect}>
                {isSelected ? 'Deselect' : 'Select'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </div>
  );
}
