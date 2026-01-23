# Component Contract: GuestTableRow

**Location**: `src/components/guests/table/GuestTableRow.tsx`
**Type**: Row Component
**Priority**: P1

## Purpose

Renders a single guest row in the table view with inline editing support for all editable cells.

## Props Interface

```typescript
interface GuestTableRowProps {
  /** Guest data with pivoted event attendance */
  guest: GuestTableRowData;
  /** Column definitions for rendering cells */
  columns: TableColumnDef[];
  /** Column widths (overrides default) */
  columnWidths: Record<string, number>;
  /** Meal option lookup for name display */
  mealOptions: MealOptionLookup;
  /** Whether this row is selected */
  isSelected: boolean;
  /** Callback when selection changes */
  onSelectChange: (selected: boolean) => void;
  /** Callback when cell value changes */
  onCellChange: (payload: CellEditPayload) => void;
  /** Row index for virtualization */
  rowIndex: number;
}
```

## Visual Specification

```
┌────┬──────────────┬──────────────────┬────────────┬─────┬─────────────────┐
│ ☐  │ John Smith   │ john@example.com │ 555-1234   │ ... │ ☑ Shuttle A    │
└────┴──────────────┴──────────────────┴────────────┴─────┴─────────────────┘

Normal State:
- Background: white (even rows) or #FAFAFA (odd rows optional)
- Border: 1px solid #E8E8E8 bottom

Hover State:
- Background: #FAFAFA

Selected State:
- Background: #F0E8E8 (light rose tint)
```

## Cell Rendering by Type

### Text Cell (Default)
```tsx
// Display mode
<span className="truncate" title={value}>{value || '-'}</span>

// Edit mode
<Input
  value={editValue}
  onChange={(e) => setEditValue(e.target.value)}
  onBlur={handleSave}
  autoFocus
  className="h-8"
/>
```

### Boolean Cell
```tsx
<Checkbox
  checked={value}
  onCheckedChange={(checked) => handleSave(checked)}
/>
```

### Enum Cell (Dropdown)
```tsx
// Display mode
<span className="truncate">{formatEnumValue(value)}</span>

// Edit mode
<Select value={value} onValueChange={handleSave}>
  <SelectTrigger className="h-8">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {enumOptions.map(option => (
      <SelectItem key={option} value={option}>
        {formatEnumValue(option)}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Date Cell
```tsx
// Display mode
<span>{value ? format(new Date(value), 'MMM d, yyyy') : '-'}</span>

// Edit mode
<DatePicker
  value={value ? new Date(value) : undefined}
  onChange={(date) => handleSave(date?.toISOString().split('T')[0])}
/>
```

### Meal Cell (Number → Name)
```tsx
// Display mode
const mealName = mealOptions[courseType]?.[value] || `Option ${value}`;
<span className="truncate" title={mealName}>{mealName}</span>

// Edit mode
<Select value={String(value)} onValueChange={(v) => handleSave(Number(v))}>
  <SelectTrigger className="h-8">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {[1, 2, 3, 4, 5].map(num => (
      <SelectItem key={num} value={String(num)}>
        {mealOptions[courseType]?.[num] || `Option ${num}`}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### DateTime Cell (Read-only)
```tsx
<span className="text-gray-500">
  {format(new Date(value), 'MMM d, yyyy h:mm a')}
</span>
```

## State Management

```typescript
// Edit state for each cell
const [editingCell, setEditingCell] = useState<string | null>(null);
const [editValue, setEditValue] = useState<unknown>(null);

// Debounced save
const debouncedSave = useDebouncedCallback(
  (payload: CellEditPayload) => {
    onCellChange(payload);
  },
  500
);

// Click to edit
const handleCellClick = (columnId: string, value: unknown) => {
  const column = columns.find(c => c.id === columnId);
  if (column?.editable) {
    setEditingCell(columnId);
    setEditValue(value);
  }
};

// Save on blur or change (for checkboxes)
const handleSave = (columnId: string, newValue: unknown) => {
  const column = columns.find(c => c.id === columnId);
  if (!column) return;

  // Create payload based on column type
  const payload: CellEditPayload = {
    guestId: guest.id,
    field: column.field,
    value: newValue,
  };

  // For event attendance columns
  if (column.eventId) {
    payload.eventId = column.eventId;
    payload.attendanceField = column.field.split('.').pop() as 'attending' | 'shuttle_to' | 'shuttle_from';
  }

  debouncedSave(payload);
  setEditingCell(null);
};
```

## Implementation

```tsx
export function GuestTableRow({
  guest,
  columns,
  columnWidths,
  mealOptions,
  isSelected,
  onSelectChange,
  onCellChange,
  rowIndex,
}: GuestTableRowProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);

  return (
    <tr
      className={cn(
        'border-b border-[#E8E8E8] hover:bg-[#FAFAFA] transition-colors',
        isSelected && 'bg-[#F0E8E8]'
      )}
    >
      {/* Selection checkbox */}
      <td className="sticky left-0 z-10 bg-inherit px-3 py-2 w-12">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectChange}
        />
      </td>

      {/* Data cells */}
      {columns.map(column => (
        <td
          key={column.id}
          style={{ width: columnWidths[column.id] || column.width, minWidth: column.minWidth }}
          className="px-3 py-2 border-r border-[#E8E8E8] last:border-r-0"
        >
          <GuestTableCell
            column={column}
            value={getNestedValue(guest, column.field)}
            mealOptions={mealOptions}
            isEditing={editingCell === column.id}
            onStartEdit={() => column.editable && setEditingCell(column.id)}
            onSave={(value) => {
              handleSave(column.id, value);
              setEditingCell(null);
            }}
            onCancel={() => setEditingCell(null)}
          />
        </td>
      ))}
    </tr>
  );
}

// Helper to get nested value (for eventAttendance.{eventId}.attending)
function getNestedValue(obj: any, path: string): unknown {
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}
```

## Test Cases

1. **Renders all columns**: Each column has corresponding cell
2. **Cell widths match**: Custom widths applied correctly
3. **Selection checkbox**: Reflects isSelected, triggers callback
4. **Text edit**: Click opens input, blur saves
5. **Boolean toggle**: Click checkbox saves immediately
6. **Enum dropdown**: Click opens select, change saves
7. **Date picker**: Click opens picker, select saves
8. **Meal names**: Displays meal name not number
9. **Readonly cells**: created_at, updated_at, id not editable
10. **Hover state**: Background changes on hover
11. **Selected state**: Background tint when selected
12. **Debounce**: Multiple rapid changes result in single save
13. **Event attendance**: Correctly handles nested event fields
