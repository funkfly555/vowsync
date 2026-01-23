/**
 * VendorTableCell - Individual cell renderer with type-specific display and inline editing
 * @feature 027-vendor-view-toggle
 *
 * Supports 12 cell types:
 * - text, email, phone, url (input fields)
 * - enum (select dropdown)
 * - boolean (checkbox)
 * - date (date picker)
 * - currency (number input with $ formatting)
 * - percentage (number input with % suffix)
 * - masked (masked display, reveal on edit)
 * - number, datetime (read-only)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Eye, EyeOff, ExternalLink } from 'lucide-react';
import {
  formatEnumLabel,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateTime,
  maskAccountNumber,
  isValidEmail,
  isValidUrl,
  isValidPercentage,
  isPositiveNumber,
} from '@/lib/vendor-table-utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VendorTableColumnDef, VendorTableRow } from '@/types/vendor-table';

interface VendorTableCellProps {
  column: VendorTableColumnDef;
  row: VendorTableRow;
  className?: string;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onEndEdit?: (cancelled?: boolean) => void;
  onValueChange?: (columnId: string, value: unknown) => void;
  isSaving?: boolean;
  saveError?: string | null;
  /** When true, renders content only without <td> wrapper */
  asContent?: boolean;
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
 * Validates a field value based on column definition
 */
function validateField(
  value: unknown,
  column: VendorTableColumnDef
): string | null {
  // Required field check
  if (column.required && (value === null || value === undefined || value === '')) {
    return `${column.header} is required`;
  }

  // Skip validation if value is empty and not required
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (column.type) {
    case 'email':
      if (!isValidEmail(value as string)) {
        return 'Invalid email format';
      }
      break;

    case 'url':
      if (!isValidUrl(value as string)) {
        return 'URL must start with http:// or https://';
      }
      break;

    case 'percentage':
      if (!isValidPercentage(value as number)) {
        return 'Percentage must be between 0 and 100';
      }
      break;

    case 'currency':
      if (!isPositiveNumber(value as number)) {
        return 'Value must be positive';
      }
      break;
  }

  return null;
}

/**
 * Renders a table cell with type-specific formatting and inline editing
 */
export function VendorTableCell({
  column,
  row,
  className,
  isEditing = false,
  onStartEdit,
  onEndEdit,
  onValueChange,
  isSaving = false,
  saveError = null,
  asContent = false,
}: VendorTableCellProps) {
  const value = getValueByPath(row as unknown as Record<string, unknown>, column.field);
  const [localValue, setLocalValue] = useState(value);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showMasked, setShowMasked] = useState(true); // For masked fields
  const inputRef = useRef<HTMLInputElement>(null);
  const editEndedRef = useRef(false);

  // Sync local value when props change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      editEndedRef.current = false;
      setValidationError(null);
      // For masked fields, show real value when editing
      if (column.type === 'masked') {
        setShowMasked(false);
      }
    }
  }, [isEditing, column.type]);

  // Handle value change for editable fields
  const handleChange = useCallback(
    (newValue: unknown) => {
      setLocalValue(newValue);
      // Clear validation error on change
      setValidationError(null);
    },
    []
  );

  // Handle checkbox toggle (immediate save)
  const handleCheckboxChange = useCallback(
    (checked: boolean) => {
      onValueChange?.(column.id, checked);
    },
    [column.id, onValueChange]
  );

  // Validate and submit value
  const submitValue = useCallback(() => {
    const error = validateField(localValue, column);
    if (error) {
      setValidationError(error);
      return false;
    }

    onValueChange?.(column.id, localValue);
    return true;
  }, [localValue, column, onValueChange]);

  // Handle blur to end editing
  const handleBlur = useCallback(() => {
    if (editEndedRef.current) return;

    // For masked fields, hide value again
    if (column.type === 'masked') {
      setShowMasked(true);
    }

    if (submitValue()) {
      onEndEdit?.(false);
    }
  }, [onEndEdit, submitValue, column.type]);

  // Handle key press for navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        editEndedRef.current = true;
        if (column.type === 'masked') {
          setShowMasked(true);
        }
        if (submitValue()) {
          onEndEdit?.(false);
        }
      } else if (e.key === 'Escape') {
        editEndedRef.current = true;
        setLocalValue(value); // Reset to original
        setValidationError(null);
        if (column.type === 'masked') {
          setShowMasked(true);
        }
        onEndEdit?.(true); // Cancel edit
      }
    },
    [onEndEdit, value, submitValue, column.type]
  );

  // Render editing UI based on column type
  const renderEditingValue = () => {
    const inputClassName = cn(
      'h-8 text-sm',
      validationError && 'border-red-500 focus:ring-red-500'
    );

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
            value={(localValue as string) || '__none__'}
            onValueChange={(val) => {
              const newVal = val === '__none__' ? null : val;
              handleChange(newVal);
              onValueChange?.(column.id, newVal);
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
              {!column.required && <SelectItem value="__none__">None</SelectItem>}
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
            className={inputClassName}
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input
              ref={inputRef}
              type="number"
              step="0.01"
              min="0"
              value={localValue as number || ''}
              onChange={(e) => handleChange(e.target.value ? parseFloat(e.target.value) : null)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={cn(inputClassName, 'pl-7')}
            />
          </div>
        );

      case 'percentage':
        return (
          <div className="relative">
            <Input
              ref={inputRef}
              type="number"
              step="1"
              min="0"
              max="100"
              value={localValue as number || ''}
              onChange={(e) => handleChange(e.target.value ? parseFloat(e.target.value) : null)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={cn(inputClassName, 'pr-7')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
        );

      case 'masked':
        return (
          <div className="relative">
            <Input
              ref={inputRef}
              type={showMasked ? 'password' : 'text'}
              value={(localValue as string) || ''}
              onChange={(e) => handleChange(e.target.value || null)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={cn(inputClassName, 'pr-8')}
            />
            <button
              type="button"
              onClick={() => setShowMasked(!showMasked)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showMasked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        );

      case 'email':
      case 'phone':
      case 'url':
      case 'text':
      default:
        return (
          <Input
            ref={inputRef}
            type={column.type === 'email' ? 'email' : 'text'}
            value={(localValue as string) || ''}
            onChange={(e) => handleChange(e.target.value || null)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={inputClassName}
          />
        );
    }
  };

  // Render display value based on column type
  const renderDisplayValue = () => {
    // Handle null/undefined for non-boolean types
    if (value === null || value === undefined) {
      if (column.type !== 'boolean') {
        return <span className="text-gray-400">-</span>;
      }
    }

    switch (column.type) {
      case 'boolean':
        if (column.editable) {
          return (
            <Checkbox
              checked={(value as boolean) ?? false}
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
        // Show "0" for aggregate counts, not "-"
        return <span>{value === 0 ? '0' : String(value)}</span>;

      case 'enum':
        return (
          <span className="capitalize">{formatEnumLabel(value as string)}</span>
        );

      case 'currency':
        return <span>{formatCurrency(value as number)}</span>;

      case 'percentage':
        return <span>{formatPercentage(value as number)}</span>;

      case 'masked':
        return <span className="font-mono">{maskAccountNumber(value as string)}</span>;

      case 'url': {
        const urlValue = value as string;
        return (
          <a
            href={urlValue}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()} // Prevent cell click
          >
            <span className="truncate max-w-[150px]">{urlValue.replace(/^https?:\/\//, '')}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        );
      }

      case 'email': {
        const emailValue = value as string;
        return (
          <a
            href={`mailto:${emailValue}`}
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {emailValue}
          </a>
        );
      }

      case 'phone':
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
  const isClickable = column.editable && column.type !== 'boolean';

  // Content to render
  const cellContent = (
    <div className="flex flex-col">
      {isEditing && column.editable ? renderEditingValue() : renderDisplayValue()}
      {validationError && (
        <span className="text-xs text-red-500 mt-0.5">{validationError}</span>
      )}
    </div>
  );

  // If asContent is true, return just the content without <td> wrapper
  if (asContent) {
    return cellContent;
  }

  return (
    <td
      className={cn(
        'px-4 py-2 text-sm whitespace-nowrap',
        column.type === 'boolean' && 'text-center',
        isClickable && !isEditing && 'cursor-pointer hover:bg-gray-50',
        isSaving && 'opacity-50',
        saveError && 'bg-red-50',
        className
      )}
      style={{ minWidth: column.minWidth, width: column.width }}
      onClick={isClickable && !isEditing ? onStartEdit : undefined}
    >
      {cellContent}
    </td>
  );
}
