# Component Contract: GuestTableView

**Location**: `src/components/guests/table/GuestTableView.tsx`
**Type**: Container Component
**Priority**: P1

## Purpose

Main container component for the Table View displaying all guests in a comprehensive data table with dynamic event columns.

## Props Interface

```typescript
interface GuestTableViewProps {
  /** Wedding ID for data fetching */
  weddingId: string;
  /** Applied filters from shared filter controls */
  filters: GuestFiltersState;
  /** Selected guest IDs for bulk actions */
  selectedGuests: Set<string>;
  /** Callback when guest selection changes */
  onSelectionChange: (selected: Set<string>) => void;
  /** Optional className for container */
  className?: string;
}
```

## Visual Specification

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Category Headers (sticky)                                                         │
│ ┌────────────────────────────────────────────────────────────────────────────────┐
│ │ Basic Info           │ RSVP              │ Seating │ Dietary │ Meals │ Events  │
│ └────────────────────────────────────────────────────────────────────────────────┘
│ Column Headers (sticky)                                                           │
│ ┌────────────────────────────────────────────────────────────────────────────────┐
│ │ ☐ │ Name ↕ │ Email ↕ │ Phone ↕ │ ... │ Table ↕ │ Seat ↕ │ Event1 │ Event2... │
│ └────────────────────────────────────────────────────────────────────────────────┘
│ Table Body (scrollable)                                                           │
│ ┌────────────────────────────────────────────────────────────────────────────────┐
│ │ ☐ │ John Smith │ john@... │ 555-... │ ... │ 1 │ 3 │ ☑ │ │ ☐ │ ... │           │
│ │ ☐ │ Jane Doe   │ jane@... │ 555-... │ ... │ 2 │ 1 │ ☐ │ │ ☑ │ ... │           │
│ │ ...                                                                             │
│ └────────────────────────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────────────────────┘

← Horizontal Scroll →
```

## Sub-Components

```
GuestTableView
├── GuestTableHeader
│   ├── Category header row (grouped column spans)
│   └── Column headers with sort/filter icons
├── GuestTableBody (virtualized with @tanstack/react-virtual)
│   └── GuestTableRow (repeated for each guest)
│       └── GuestTableCell (repeated for each column)
└── ColumnResizer (between columns)
```

## State Management

```typescript
// Internal state
const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: 'asc' });
const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

// Data fetching
const { rows, columns, events, mealOptions, isLoading, isError, refetch } = useGuestTableData({
  weddingId,
  filters, // Use shared filters
});

// Derived data (client-side sort/filter for performance)
const processedRows = useMemo(() => {
  let result = [...rows];

  // Apply column filters
  result = applyColumnFilters(result, columnFilters);

  // Apply sort
  if (sortConfig.column) {
    result = sortRows(result, sortConfig);
  }

  return result;
}, [rows, columnFilters, sortConfig]);
```

## Behavior

1. **Initial Load**: Fetch all guest data with events and meal options
2. **Horizontal Scroll**: Entire table scrolls horizontally when wider than viewport
3. **Sticky Headers**: Category and column headers stay fixed during vertical scroll
4. **Virtual Scrolling**: Only render visible rows for performance (500+ guests)
5. **Inline Editing**: Click cell to edit, auto-save on blur with 500ms debounce
6. **Selection**: Checkbox column for bulk actions
7. **Sorting**: Click column header to toggle sort (asc/desc/none)
8. **Filtering**: Click filter icon to show column-specific filter UI
9. **Column Resize**: Drag column borders to resize

## Styling

```tsx
// Container styles
<div className="w-full overflow-x-auto border rounded-lg">
  <table className="w-full border-collapse">
    {/* Headers */}
    <thead className="sticky top-0 z-10">
      <tr className="bg-[#F5F5F5]">
        {/* Category headers */}
      </tr>
      <tr className="bg-[#F5F5F5] border-b">
        {/* Column headers */}
      </tr>
    </thead>

    {/* Body */}
    <tbody>
      {/* Virtualized rows */}
      <tr className="hover:bg-[#FAFAFA] border-b">
        {/* Cells */}
      </tr>
    </tbody>
  </table>
</div>
```

## Data Fetching Hook

```typescript
// useGuestTableData.ts
export function useGuestTableData({
  weddingId,
  filters,
}: {
  weddingId: string;
  filters: GuestFiltersState;
}) {
  return useQuery({
    queryKey: ['guest-table-data', weddingId, filters],
    queryFn: () => fetchGuestTableData(weddingId),
    select: (data) => {
      // Apply filters from shared filter state
      const filteredRows = applyGuestFilters(data.rows, filters);
      return { ...data, rows: filteredRows };
    },
  });
}
```

## Event Handlers

```typescript
// Sort handler
const handleSort = (columnId: string) => {
  setSortConfig(prev => {
    if (prev.column === columnId) {
      // Toggle direction or clear
      if (prev.direction === 'asc') return { column: columnId, direction: 'desc' };
      if (prev.direction === 'desc') return { column: null, direction: 'asc' };
    }
    return { column: columnId, direction: 'asc' };
  });
};

// Column resize handler
const handleColumnResize = (columnId: string, width: number) => {
  setColumnWidths(prev => ({
    ...prev,
    [columnId]: Math.max(width, columns.find(c => c.id === columnId)?.minWidth || 80),
  }));
};

// Selection handler
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    onSelectionChange(new Set(processedRows.map(r => r.id)));
  } else {
    onSelectionChange(new Set());
  }
};

const handleSelectRow = (guestId: string, checked: boolean) => {
  const newSelection = new Set(selectedGuests);
  if (checked) {
    newSelection.add(guestId);
  } else {
    newSelection.delete(guestId);
  }
  onSelectionChange(newSelection);
};
```

## Test Cases

1. **Renders all columns**: 30 base columns + event columns visible
2. **Groups columns by category**: Category headers span correct columns
3. **Horizontal scroll**: Table scrolls when wider than container
4. **Virtual scrolling**: Only visible rows rendered (check DOM count)
5. **Sort functionality**: Click header sorts, click again reverses
6. **Filter functionality**: Column filters reduce visible rows
7. **Selection sync**: Checkbox state matches selectedGuests prop
8. **Loading state**: Shows skeleton/spinner while loading
9. **Error state**: Shows error message on fetch failure
10. **Empty state**: Shows message when no guests match filters
