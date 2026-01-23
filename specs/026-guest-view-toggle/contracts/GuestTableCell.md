# Component Contract: GuestTableCell

**Location**: `src/components/guests/table/GuestTableCell.tsx`
**Type**: Cell Component
**Priority**: P2

## Purpose

Polymorphic cell component that renders different UI based on column type (text, boolean, enum, date, meal, datetime).

## Props Interface

```typescript
interface GuestTableCellProps {
  /** Column definition with type info */
  column: TableColumnDef;
  /** Current cell value */
  value: unknown;
  /** Meal options for meal type cells */
  mealOptions: MealOptionLookup;
  /** Whether cell is in edit mode */
  isEditing: boolean;
  /** Start editing callback */
  onStartEdit: () => void;
  /** Save value callback */
  onSave: (value: unknown) => void;
  /** Cancel editing callback */
  onCancel: () => void;
}
```

## Cell Type Specifications

### Text Cell
```
Display: "John Smith" (truncated with ellipsis if overflow)
Edit: <input type="text" /> with current value
Trigger: Click to edit
Save: On blur or Enter key
Cancel: Escape key
```

### Boolean Cell
```
Display: ☑ (checked) or ☐ (unchecked) checkbox
Edit: N/A - direct toggle
Trigger: Click checkbox
Save: Immediate on change
```

### Enum Cell
```
Display: "Confirmed" (formatted enum label)
Edit: <select> dropdown with options
Trigger: Click to edit
Save: On selection change
Cancel: Click outside or Escape
```

### Date Cell
```
Display: "Jan 15, 2026" (formatted date)
Edit: Date picker popover
Trigger: Click to edit
Save: On date selection
Cancel: Click outside or Escape
```

### Number Cell
```
Display: "3" (number value)
Edit: <input type="number" />
Trigger: Click to edit
Save: On blur or Enter key
Cancel: Escape key
```

### Meal Cell
```
Display: "Grilled Salmon" (meal name from lookup)
Edit: <select> with meal options
Trigger: Click to edit
Save: On selection change
Fallback: "Option 3" if no meal configured
```

### DateTime Cell (Read-only)
```
Display: "Jan 15, 2026 3:45 PM"
Edit: N/A - not editable
```

## Implementation

```tsx
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import type { TableColumnDef, MealOptionLookup } from '@/types/guest-table';

interface GuestTableCellProps {
  column: TableColumnDef;
  value: unknown;
  mealOptions: MealOptionLookup;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: unknown) => void;
  onCancel: () => void;
}

export function GuestTableCell({
  column,
  value,
  mealOptions,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}: GuestTableCellProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value when value prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(localValue);
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      onCancel();
    }
  };

  // Boolean cell - always editable via checkbox
  if (column.type === 'boolean') {
    return (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) => {
            if (column.editable) {
              onSave(checked);
            }
          }}
          disabled={!column.editable}
        />
      </div>
    );
  }

  // DateTime cell - read-only
  if (column.type === 'datetime') {
    return (
      <span className="text-gray-500 text-sm truncate">
        {value ? format(new Date(value as string), 'MMM d, yyyy h:mm a') : '-'}
      </span>
    );
  }

  // Non-editable cells
  if (!column.editable) {
    return (
      <span className="truncate text-gray-600" title={String(value || '')}>
        {formatDisplayValue(column, value, mealOptions)}
      </span>
    );
  }

  // Editable cells in display mode
  if (!isEditing) {
    return (
      <div
        onClick={onStartEdit}
        className="cursor-pointer truncate hover:bg-gray-100 rounded px-1 -mx-1"
        title={String(value || '')}
      >
        {formatDisplayValue(column, value, mealOptions) || (
          <span className="text-gray-400">-</span>
        )}
      </div>
    );
  }

  // Edit mode by type
  switch (column.type) {
    case 'text':
      return (
        <Input
          ref={inputRef}
          value={String(localValue || '')}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => onSave(localValue)}
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
          onChange={(e) => setLocalValue(e.target.value ? Number(e.target.value) : null)}
          onBlur={() => onSave(localValue)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm"
        />
      );

    case 'enum':
      return (
        <Select
          value={String(value || '')}
          onValueChange={(v) => onSave(v || null)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              <span className="text-gray-400">None</span>
            </SelectItem>
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
        <Popover open={isEditing} onOpenChange={(open) => !open && onCancel()}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-8 w-full justify-start text-left font-normal text-sm',
                !value && 'text-gray-400'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(new Date(value as string), 'MMM d, yyyy') : 'Pick date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value ? new Date(value as string) : undefined}
              onSelect={(date) => {
                onSave(date ? date.toISOString().split('T')[0] : null);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );

    case 'meal':
      const courseType = column.courseType || 'main';
      const options = mealOptions[courseType] || {};
      return (
        <Select
          value={String(value || '')}
          onValueChange={(v) => onSave(v ? Number(v) : null)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select meal..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              <span className="text-gray-400">None</span>
            </SelectItem>
            {[1, 2, 3, 4, 5].map((num) => (
              <SelectItem key={num} value={String(num)}>
                {options[num] || `Option ${num}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    default:
      return (
        <Input
          ref={inputRef}
          value={String(localValue || '')}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => onSave(localValue)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm"
        />
      );
  }
}

// Helper: Format value for display
function formatDisplayValue(
  column: TableColumnDef,
  value: unknown,
  mealOptions: MealOptionLookup
): string {
  if (value === null || value === undefined) return '';

  switch (column.type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      return format(new Date(value as string), 'MMM d, yyyy');
    case 'datetime':
      return format(new Date(value as string), 'MMM d, yyyy h:mm a');
    case 'enum':
      return formatEnumLabel(String(value));
    case 'meal':
      const courseType = column.courseType || 'main';
      return mealOptions[courseType]?.[value as number] || `Option ${value}`;
    default:
      return String(value);
  }
}

// Helper: Format enum value to label
function formatEnumLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
```

## Test Cases

1. **Text cell display**: Shows value, truncates with ellipsis
2. **Text cell edit**: Click opens input, Enter saves, Escape cancels
3. **Boolean cell**: Checkbox toggles immediately
4. **Enum cell**: Dropdown shows options, selection saves
5. **Date cell**: Calendar popover, date selection saves
6. **Meal cell**: Shows meal name, dropdown for edit
7. **DateTime cell**: Read-only, formatted display
8. **Empty values**: Shows dash placeholder
9. **Keyboard navigation**: Tab, Enter, Escape work correctly
10. **Focus management**: Input auto-focuses and selects text
