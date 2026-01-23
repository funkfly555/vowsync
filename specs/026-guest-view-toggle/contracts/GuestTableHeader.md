# Component Contract: GuestTableHeader

**Location**: `src/components/guests/table/GuestTableHeader.tsx`
**Type**: Header Component
**Priority**: P1

## Purpose

Renders the table header with category groupings, column headers, sort icons, and filter controls.

## Props Interface

```typescript
interface GuestTableHeaderProps {
  /** Column definitions */
  columns: TableColumnDef[];
  /** Event metadata for color coding */
  events: EventColumnMeta[];
  /** Current sort configuration */
  sortConfig: SortConfig;
  /** Callback when sort changes */
  onSortChange: (columnId: string) => void;
  /** Active column filters */
  columnFilters: ColumnFilter[];
  /** Callback when filter changes */
  onFilterChange: (filter: ColumnFilter | null, columnId: string) => void;
  /** Column widths */
  columnWidths: Record<string, number>;
  /** Callback when column resize starts */
  onResizeStart: (columnId: string) => void;
  /** All guests selected state */
  allSelected: boolean;
  /** Some guests selected state */
  someSelected: boolean;
  /** Callback for select all */
  onSelectAll: (checked: boolean) => void;
}
```

## Visual Specification

```
Category Header Row:
┌────┬──────────────────────────────────────────────────────────────────────────────────┐
│    │ Basic Info (8)          │ RSVP (8)           │ Seating │ Dietary │ Meals │ Events │
│    │ colspan=8               │ colspan=8          │ (2)     │ (3)     │ (6)   │ (dyn)  │
└────┴──────────────────────────────────────────────────────────────────────────────────┘

Column Header Row:
┌────┬────────────────┬──────────────────┬────────────┬─────────────────────────────────┐
│ ☐  │ Name     ↕ ⋮ │ Email      ↕ ⋮ │ Phone ↕ ⋮ │ ... │ Event1-Att │ Event1-To │ ... │
│    │ [resize]      │ [resize]         │ [resize]   │     │ (colored)  │ (colored) │     │
└────┴────────────────┴──────────────────┴────────────┴─────────────────────────────────┘

Category Headers:
- Basic Info: bg-[#F5F5F5]
- RSVP: bg-[#F5F5F5]
- Seating: bg-[#F5F5F5]
- Dietary: bg-[#F5F5F5]
- Meals: bg-[#F5F5F5]
- Events: Individual colors per event (HSL rotation)

Sort Icon States:
- No sort: ↕ (gray)
- Ascending: ↑ (primary color)
- Descending: ↓ (primary color)

Filter Icon States:
- No filter: ⋮ (gray)
- Active filter: ⋮ (primary color with dot indicator)
```

## Category Configuration

```typescript
const CATEGORY_CONFIG: Record<ColumnCategory, { label: string; className: string }> = {
  basic: { label: 'Basic Info', className: 'bg-[#F5F5F5]' },
  rsvp: { label: 'RSVP', className: 'bg-[#F5F5F5]' },
  seating: { label: 'Seating', className: 'bg-[#F5F5F5]' },
  dietary: { label: 'Dietary', className: 'bg-[#F5F5F5]' },
  meals: { label: 'Meals', className: 'bg-[#F5F5F5]' },
  other: { label: 'Other', className: 'bg-[#F5F5F5]' },
  event: { label: 'Events', className: '' }, // Color per event
};

// Group columns by category
function groupColumnsByCategory(columns: TableColumnDef[]) {
  const groups: { category: ColumnCategory; columns: TableColumnDef[]; eventId?: string }[] = [];
  let currentGroup: typeof groups[0] | null = null;

  for (const col of columns) {
    // For event columns, group by event
    if (col.category === 'event' && col.eventId) {
      if (!currentGroup || currentGroup.eventId !== col.eventId) {
        currentGroup = { category: 'event', columns: [], eventId: col.eventId };
        groups.push(currentGroup);
      }
      currentGroup.columns.push(col);
    } else {
      // Regular category grouping
      if (!currentGroup || currentGroup.category !== col.category) {
        currentGroup = { category: col.category, columns: [] };
        groups.push(currentGroup);
      }
      currentGroup.columns.push(col);
    }
  }

  return groups;
}
```

## Implementation

```tsx
export function GuestTableHeader({
  columns,
  events,
  sortConfig,
  onSortChange,
  columnFilters,
  onFilterChange,
  columnWidths,
  onResizeStart,
  allSelected,
  someSelected,
  onSelectAll,
}: GuestTableHeaderProps) {
  const groups = useMemo(() => groupColumnsByCategory(columns), [columns]);
  const eventColorMap = useMemo(() =>
    Object.fromEntries(events.map(e => [e.id, e.color])),
    [events]
  );

  return (
    <thead className="sticky top-0 z-10">
      {/* Category Header Row */}
      <tr>
        {/* Select all checkbox column */}
        <th className="sticky left-0 z-20 bg-[#F5F5F5] w-12" rowSpan={2}>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onCheckedChange={onSelectAll}
          />
        </th>

        {/* Category spans */}
        {groups.map((group, idx) => {
          const isEvent = group.category === 'event' && group.eventId;
          const bgColor = isEvent
            ? eventColorMap[group.eventId!]
            : CATEGORY_CONFIG[group.category].className;
          const label = isEvent
            ? events.find(e => e.id === group.eventId)?.name || 'Event'
            : CATEGORY_CONFIG[group.category].label;

          return (
            <th
              key={`cat-${idx}`}
              colSpan={group.columns.length}
              className={cn(
                'px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-r',
                !isEvent && bgColor
              )}
              style={isEvent ? { backgroundColor: bgColor } : undefined}
            >
              {label}
              {!isEvent && ` (${group.columns.length})`}
            </th>
          );
        })}
      </tr>

      {/* Column Header Row */}
      <tr className="bg-[#F5F5F5] border-b-2 border-[#E8E8E8]">
        {columns.map((column) => {
          const isEvent = column.category === 'event';
          const bgColor = isEvent && column.eventId ? eventColorMap[column.eventId] : undefined;
          const isSorted = sortConfig.column === column.id;
          const hasFilter = columnFilters.some(f => f.column === column.id);

          return (
            <th
              key={column.id}
              className={cn(
                'relative px-3 py-2 text-left text-xs font-medium text-gray-700 border-r last:border-r-0',
                !isEvent && 'bg-[#F5F5F5]'
              )}
              style={{
                width: columnWidths[column.id] || column.width,
                minWidth: column.minWidth,
                ...(isEvent ? { backgroundColor: bgColor } : {}),
              }}
            >
              <div className="flex items-center gap-1">
                {/* Column Label */}
                <span className="truncate flex-1">{column.header}</span>

                {/* Sort Button */}
                <button
                  onClick={() => onSortChange(column.id)}
                  className={cn(
                    'p-0.5 rounded hover:bg-black/10',
                    isSorted && 'text-[#D4A5A5]'
                  )}
                  title={`Sort by ${column.header}`}
                >
                  {isSorted ? (
                    sortConfig.direction === 'asc' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  )}
                </button>

                {/* Filter Button */}
                <ColumnFilterPopover
                  column={column}
                  activeFilter={columnFilters.find(f => f.column === column.id)}
                  onFilterChange={(filter) => onFilterChange(filter, column.id)}
                  hasFilter={hasFilter}
                />

                {/* Resize Handle */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#D4A5A5]"
                  onMouseDown={() => onResizeStart(column.id)}
                />
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
```

## Column Filter Popover

```tsx
function ColumnFilterPopover({
  column,
  activeFilter,
  onFilterChange,
  hasFilter,
}: {
  column: TableColumnDef;
  activeFilter?: ColumnFilter;
  onFilterChange: (filter: ColumnFilter | null) => void;
  hasFilter: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'p-0.5 rounded hover:bg-black/10 relative',
            hasFilter && 'text-[#D4A5A5]'
          )}
          title={`Filter ${column.header}`}
        >
          <MoreVertical className="h-3 w-3" />
          {hasFilter && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D4A5A5] rounded-full" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60">
        <ColumnFilterContent
          column={column}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />
      </PopoverContent>
    </Popover>
  );
}

function ColumnFilterContent({
  column,
  activeFilter,
  onFilterChange,
}: {
  column: TableColumnDef;
  activeFilter?: ColumnFilter;
  onFilterChange: (filter: ColumnFilter | null) => void;
}) {
  const [value, setValue] = useState(activeFilter?.value || '');

  const applyFilter = () => {
    if (!value) {
      onFilterChange(null);
    } else {
      onFilterChange({
        column: column.id,
        operator: column.type === 'text' ? 'contains' : 'equals',
        value,
      });
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Filter {column.header}</p>

      {column.type === 'enum' && column.enumOptions ? (
        <Select
          value={String(value)}
          onValueChange={(v) => {
            setValue(v);
            onFilterChange(v ? { column: column.id, operator: 'equals', value: v } : null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {column.enumOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {formatEnumLabel(opt)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : column.type === 'boolean' ? (
        <Select
          value={String(value)}
          onValueChange={(v) => {
            setValue(v);
            onFilterChange(v ? { column: column.id, operator: 'equals', value: v === 'true' } : null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder={`Filter by ${column.header}...`}
            value={String(value)}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
          />
          <Button size="sm" onClick={applyFilter}>
            Apply
          </Button>
        </div>
      )}

      {activeFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            setValue('');
            onFilterChange(null);
          }}
        >
          Clear Filter
        </Button>
      )}
    </div>
  );
}
```

## Test Cases

1. **Category headers**: Correct colspan for each category
2. **Event color coding**: Each event group has unique color
3. **Sort icon states**: Shows correct icon for sort state
4. **Sort interaction**: Clicking column toggles sort
5. **Filter popover**: Opens on filter icon click
6. **Filter types**: Different UI for text/enum/boolean
7. **Active filter indicator**: Shows dot when filtered
8. **Resize handle**: Visible on column border hover
9. **Sticky header**: Header stays fixed on scroll
10. **Select all checkbox**: Correct checked/indeterminate state
