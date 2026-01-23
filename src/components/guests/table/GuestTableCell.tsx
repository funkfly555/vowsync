/**
 * GuestTableCell - Individual cell renderer with type-specific display and inline editing
 * @feature 026-guest-view-toggle
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { formatEnumLabel } from '@/lib/guest-table-utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TableColumnDef, GuestTableRowData, MealOptionLookup } from '@/types/guest-table';

interface GuestTableCellProps {
  column: TableColumnDef;
  row: GuestTableRowData;
  mealOptions?: MealOptionLookup;
  className?: string;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onEndEdit?: (cancelled?: boolean) => void;
  onValueChange?: (columnId: string, value: unknown) => void;
}

/**
 * Get nested value from object using dot notation path
 */
function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Format date for display
 */
function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

/**
 * Format datetime for display
 */
function formatDateTime(date: string | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
function formatDateForInput(date: string | null | undefined): string {
  if (!date) return '';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return '';
  }
}


/**
 * Check if guest is attending a specific event
 */
function isGuestAttending(row: GuestTableRowData, eventId: string | undefined): boolean {
  if (!eventId) return false;
  return row.eventAttendance?.[eventId]?.attending === true;
}

/**
 * Check if guest has shuttle enabled for a specific event
 */
function isShuttleEnabled(row: GuestTableRowData, eventId: string | undefined): boolean {
  if (!eventId) return false;
  return row.eventAttendance?.[eventId]?.shuttle_to_event === 'Yes';
}

/**
 * Renders a table cell with type-specific formatting and inline editing
 */
export function GuestTableCell({
  column,
  row,
  mealOptions,
  className,
  isEditing = false,
  onStartEdit,
  onEndEdit,
  onValueChange,
}: GuestTableCellProps) {
  const value = getValueByPath(row as unknown as Record<string, unknown>, column.field);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const editEndedRef = useRef(false); // Track if edit was ended by keyboard

  // Check attendance and shuttle status for event columns
  const isAttending = isGuestAttending(row, column.eventId);
  const hasShuttle = isShuttleEnabled(row, column.eventId);

  // Check plus-one status for plus-one dependent columns
  const hasPlusOne = row.has_plus_one === true;

  // Sync local value when props change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      editEndedRef.current = false; // Reset flag when editing starts
    }
  }, [isEditing]);

  // Handle value change for editable fields
  const handleChange = useCallback(
    (newValue: unknown) => {
      setLocalValue(newValue);
      onValueChange?.(column.id, newValue);
    },
    [column.id, onValueChange]
  );

  // Handle checkbox toggle (immediate save)
  // Supports boolean for regular checkboxes and string | null for shuttle toggle
  const handleCheckboxChange = useCallback(
    (checked: boolean | string | null) => {
      onValueChange?.(column.id, checked);
    },
    [column.id, onValueChange]
  );

  // Handle blur to end editing
  const handleBlur = useCallback(() => {
    // Don't fire if already ended by Enter/Escape
    if (editEndedRef.current) return;
    onEndEdit?.(false); // Not cancelled
  }, [onEndEdit]);

  // Handle key press for navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        editEndedRef.current = true;
        onEndEdit?.(false); // Confirm edit
      } else if (e.key === 'Escape') {
        editEndedRef.current = true;
        setLocalValue(value); // Reset to original
        onEndEdit?.(true); // Cancel edit
      }
    },
    [onEndEdit, value]
  );

  // Render editing UI based on column type
  const renderEditingValue = () => {
    switch (column.type) {
      case 'boolean':
        return (
          <Checkbox
            checked={localValue as boolean}
            onCheckedChange={handleCheckboxChange}
            className="data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
          />
        );

      case 'enum':
        return (
          <Select
            value={localValue as string || '__none__'}
            onValueChange={(val) => {
              handleChange(val === '__none__' ? null : val);
              // End editing after selection
              setTimeout(() => onEndEdit?.(false), 0);
            }}
            onOpenChange={(open) => {
              // End editing when dropdown closes
              if (!open) {
                setTimeout(() => onEndEdit?.(false), 0);
              }
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {column.enumOptions?.map((option) => (
                <SelectItem key={option} value={option}>
                  {formatEnumLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            ref={inputRef}
            type="date"
            value={formatDateForInput(localValue as string)}
            onChange={(e) => handleChange(e.target.value || null)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
          />
        );

      case 'number':
        return (
          <Input
            ref={inputRef}
            type="number"
            value={localValue as number || ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
          />
        );

      case 'meal': {
        // Get meal options for this course type
        const courseOptions = mealOptions && column.courseType
          ? Object.entries(mealOptions[column.courseType])
          : [];

        return (
          <Select
            value={localValue !== null && localValue !== undefined ? String(localValue) : '__none__'}
            onValueChange={(val) => {
              handleChange(val === '__none__' ? null : Number(val));
              // End editing after selection
              setTimeout(() => onEndEdit?.(false), 0);
            }}
            onOpenChange={(open) => {
              // End editing when dropdown closes
              if (!open) {
                setTimeout(() => onEndEdit?.(false), 0);
              }
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select meal..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {courseOptions.map(([optionNum, name]) => (
                <SelectItem key={optionNum} value={optionNum}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case 'shuttle-toggle':
        // Shuttle toggle - same as boolean checkbox, toggles "Yes" or null
        // Only enabled when guest is ATTENDING this event
        // The actual update logic in GuestTableRow handles setting both shuttle_to_event and shuttle_from_event
        return (
          <Checkbox
            checked={localValue === 'Yes'}
            onCheckedChange={(checked) => handleCheckboxChange(checked ? 'Yes' : null)}
            disabled={!isAttending}
            className={cn(
              "data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]",
              !isAttending && "opacity-50 cursor-not-allowed"
            )}
          />
        );

      case 'text':
      default:
        return (
          <Input
            ref={inputRef}
            type="text"
            value={(localValue as string) || ''}
            onChange={(e) => handleChange(e.target.value || null)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
          />
        );
    }
  };

  // Render display value based on column type
  const renderDisplayValue = () => {
    // Special handling for shuttle-info columns (PICKUP, EVENT, RETURN)
    // Only show data when BOTH attending AND shuttle are enabled
    if (column.type === 'shuttle-info') {
      if (!isAttending || !hasShuttle) {
        return <span className="text-gray-400 text-xs italic">Shuttle not required</span>;
      }
      // Show the actual displayValue when both conditions are met
      return <span className="text-gray-500 text-xs">{column.displayValue || '-'}</span>;
    }

    // Special handling for plus-one dependent columns
    // Only show data when has_plus_one is true
    if (column.requiresPlusOne && !hasPlusOne) {
      return <span className="text-gray-400 text-xs italic">No Plus One</span>;
    }

    // For other columns with pre-computed displayValue (shuttle-info already handled above)
    if (column.displayValue !== undefined) {
      return <span className="text-gray-500 text-xs">{column.displayValue}</span>;
    }

    // Handle null/undefined - but NOT for boolean or shuttle-toggle (they show checkboxes)
    if (value === null || value === undefined) {
      // Boolean and shuttle-toggle should still render their checkboxes
      if (column.type !== 'boolean' && column.type !== 'shuttle-toggle') {
        return <span className="text-gray-400">-</span>;
      }
    }

    // Type-specific rendering
    switch (column.type) {
      case 'boolean':
        // For booleans, always show checkbox for quick toggle
        if (column.editable) {
          return (
            <Checkbox
              checked={value as boolean ?? false}
              onCheckedChange={handleCheckboxChange}
              className="data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
            />
          );
        }
        return value ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-gray-400" />
        );

      case 'date':
        return <span>{formatDate(value as string)}</span>;

      case 'datetime':
        return <span className="text-gray-500">{formatDateTime(value as string)}</span>;

      case 'number':
        return <span>{String(value)}</span>;

      case 'enum':
        return (
          <span className="capitalize">
            {formatEnumLabel(value as string)}
          </span>
        );

      case 'meal': {
        if (!mealOptions || !column.courseType) {
          return <span>{String(value)}</span>;
        }
        const mealName = mealOptions[column.courseType]?.[value as number];
        return <span>{mealName || String(value)}</span>;
      }


      case 'shuttle-toggle': {
        // Shuttle toggle - show checkbox for quick toggle
        // Value is "Yes" or null
        // Only enabled when guest is ATTENDING this event
        if (column.editable) {
          return (
            <Checkbox
              checked={value === 'Yes'}
              onCheckedChange={(checked) => handleCheckboxChange(checked ? 'Yes' : null)}
              disabled={!isAttending}
              className={cn(
                "data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]",
                !isAttending && "opacity-50 cursor-not-allowed"
              )}
            />
          );
        }
        return value === 'Yes' ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-gray-400" />
        );
      }

      case 'text':
      default: {
        const textValue = String(value);
        // Truncate long text
        if (textValue.length > 50) {
          return (
            <span title={textValue}>
              {textValue.substring(0, 50)}...
            </span>
          );
        }
        return <span>{textValue}</span>;
      }
    }
  };

  // Check if column is clickable for editing
  // Disable for boolean types (they have checkbox), shuttle-toggle when not attending,
  // and plus-one columns when no plus one
  const isPlusOneDisabled = column.requiresPlusOne && !hasPlusOne;
  const isShuttleDisabled = column.type === 'shuttle-toggle' && !isAttending;
  const isClickable = column.editable &&
    column.type !== 'boolean' &&
    column.type !== 'shuttle-toggle' &&
    !isPlusOneDisabled;

  return (
    <td
      className={cn(
        'px-4 py-2 text-sm whitespace-nowrap',
        column.type === 'boolean' && 'text-center',
        column.type === 'shuttle-toggle' && 'text-center',
        isClickable && !isEditing && 'cursor-pointer hover:bg-gray-50',
        className
      )}
      style={{ minWidth: column.minWidth, width: column.width }}
      onClick={isClickable && !isEditing ? onStartEdit : undefined}
    >
      {isEditing && column.editable && !isPlusOneDisabled && !isShuttleDisabled ? renderEditingValue() : renderDisplayValue()}
    </td>
  );
}
