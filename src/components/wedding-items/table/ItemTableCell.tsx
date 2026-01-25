/**
 * ItemTableCell - Cell renderer with type-specific display and inline editing
 * Follows GuestTableCell pattern for full inline editing support
 * @feature 031-items-card-table-view
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber, checkAvailability } from '@/types/weddingItem';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ItemTableColumnDef, ItemTableRow } from '@/types/item-table';
import { AggregationMethodBadge } from '../AggregationMethodBadge';
import { AvailabilityStatusBadge } from '../AvailabilityStatusBadge';

interface ItemTableCellProps {
  row: ItemTableRow;
  column: ItemTableColumnDef;
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
 * Format enum label for display
 */
function formatEnumLabel(value: string): string {
  if (!value) return '';
  // Handle special cases
  if (value === 'ADD' || value === 'MAX') return value;
  // Convert snake_case to Title Case
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Renders a table cell with type-specific formatting and inline editing
 */
export function ItemTableCell({
  row,
  column,
  className,
  isEditing = false,
  onStartEdit,
  onEndEdit,
  onValueChange,
}: ItemTableCellProps) {
  const value = getValueByPath(row as unknown as Record<string, unknown>, column.field);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const editEndedRef = useRef(false);

  // Sync local value when props change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
      editEndedRef.current = false;
    }
  }, [isEditing]);

  // Handle value change
  const handleChange = useCallback(
    (newValue: unknown) => {
      setLocalValue(newValue);
      onValueChange?.(column.id, newValue);
    },
    [column.id, onValueChange]
  );

  // Handle blur to end editing
  const handleBlur = useCallback(() => {
    if (editEndedRef.current) return;
    onEndEdit?.(false);
  }, [onEndEdit]);

  // Handle key press for navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && column.type !== 'textarea') {
        editEndedRef.current = true;
        onEndEdit?.(false);
      } else if (e.key === 'Escape') {
        editEndedRef.current = true;
        setLocalValue(value);
        onEndEdit?.(true);
      }
    },
    [onEndEdit, value, column.type]
  );

  // Render editing UI based on column type
  const renderEditingValue = () => {
    switch (column.type) {
      case 'text':
        return (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={(localValue as string) || ''}
            onChange={(e) => handleChange(e.target.value || null)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
          />
        );

      case 'textarea':
        return (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={(localValue as string) || ''}
            onChange={(e) => handleChange(e.target.value || null)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              // Only handle Escape for textarea (allow Enter for newlines)
              if (e.key === 'Escape') {
                editEndedRef.current = true;
                setLocalValue(value);
                onEndEdit?.(true);
              }
            }}
            className="text-sm min-h-[60px]"
            rows={2}
          />
        );

      case 'number':
      case 'event-quantity':
        return (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={localValue !== null && localValue !== undefined ? Number(localValue) : ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm text-right"
            min={0}
          />
        );

      case 'currency':
        return (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={localValue !== null && localValue !== undefined ? Number(localValue) : ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm text-right"
            min={0}
            step={0.01}
          />
        );

      case 'enum':
        return (
          <Select
            value={(localValue as string) || '__none__'}
            onValueChange={(val) => {
              handleChange(val === '__none__' ? null : val);
              setTimeout(() => onEndEdit?.(false), 0);
            }}
            onOpenChange={(open) => {
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

      default:
        return (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={String(localValue || '')}
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
    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    switch (column.type) {
      case 'checkbox':
        // Checkbox is rendered by the row component
        return null;

      case 'text':
        return (
          <span className="truncate" title={String(value)}>
            {String(value)}
          </span>
        );

      case 'textarea': {
        const textValue = String(value);
        if (textValue.length > 50) {
          return (
            <span className="truncate" title={textValue}>
              {textValue.substring(0, 50)}...
            </span>
          );
        }
        return <span className="truncate">{textValue}</span>;
      }

      case 'badge':
        if (column.id === 'category') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
              {String(value)}
            </span>
          );
        }
        if (column.id === 'aggregation_method') {
          return (
            <AggregationMethodBadge
              method={value as 'ADD' | 'MAX'}
              size="sm"
            />
          );
        }
        if (column.id === 'availability_status') {
          const availabilityStatus = checkAvailability(
            row.total_required,
            row.number_available
          );
          return (
            <AvailabilityStatusBadge status={availabilityStatus} size="sm" />
          );
        }
        return String(value);

      case 'number':
        return (
          <span className="tabular-nums">{formatNumber(value as number)}</span>
        );

      case 'event-quantity':
        return (
          <span className="tabular-nums">{formatNumber(value as number)}</span>
        );

      case 'currency':
        return (
          <span className="tabular-nums">{formatCurrency(value as number)}</span>
        );

      case 'datetime':
        return <span className="text-gray-500">{formatDateTime(value as string)}</span>;

      case 'enum':
        return (
          <span className="capitalize">
            {column.id === 'aggregation_method' ? (
              <AggregationMethodBadge method={value as 'ADD' | 'MAX'} size="sm" />
            ) : (
              formatEnumLabel(value as string)
            )}
          </span>
        );

      case 'actions':
        // Actions are rendered by the row component
        return null;

      default:
        return String(value);
    }
  };

  // Check if column is clickable for editing
  const isClickable = column.editable && !isEditing;

  return (
    <td
      className={cn(
        'px-3 py-2 text-sm whitespace-nowrap',
        column.type === 'number' || column.type === 'currency' || column.type === 'event-quantity'
          ? 'text-right'
          : 'text-left',
        isClickable && 'cursor-pointer hover:bg-gray-50',
        className
      )}
      style={{ width: column.width, minWidth: column.minWidth || column.width }}
      onClick={isClickable ? onStartEdit : undefined}
    >
      {isEditing && column.editable ? renderEditingValue() : renderDisplayValue()}
    </td>
  );
}
