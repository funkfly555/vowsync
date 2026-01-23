# Card View + Table View Design Pattern

**Extracted from:** Guests Page (Phase 026)
**Purpose:** Reusable pattern for implementing dual-view (Card + Table) interfaces
**Applicable to:** Vendors, Items, Bar Orders, and other list pages

---

## Table of Contents

1. [Component Structure](#1-component-structure)
2. [View Toggle Implementation](#2-view-toggle-implementation)
3. [Card View Pattern](#3-card-view-pattern)
4. [Table View Pattern](#4-table-view-pattern)
5. [Shared Functionality](#5-shared-functionality)
6. [Styling Approach](#6-styling-approach)
7. [Key Technical Decisions](#7-key-technical-decisions)
8. [Reusability Guidelines](#8-reusability-guidelines)
9. [Code Examples](#9-code-examples)

---

## 1. Component Structure

### File Organization

```
src/
├── pages/
│   └── GuestListPage.tsx              # Main page component (orchestrates both views)
│
├── components/guests/
│   ├── ViewToggle.tsx                 # Card/Table toggle buttons
│   ├── GuestCard.tsx                  # Card view - main card component
│   ├── GuestCardCollapsed.tsx         # Card collapsed state
│   ├── GuestCardExpanded.tsx          # Card expanded state (tabs)
│   ├── GuestFilters.tsx               # Shared filter bar
│   ├── BulkActionsBar.tsx             # Shared bulk actions
│   ├── EmptyGuestState.tsx            # Empty state component
│   ├── NoSearchResults.tsx            # No results component
│   │
│   └── table/                         # Table view components
│       ├── index.ts                   # Barrel export
│       ├── GuestTableView.tsx         # Main table container
│       ├── GuestTableHeader.tsx       # Table header with sorting/filtering
│       ├── GuestTableBody.tsx         # Table body container
│       ├── GuestTableRow.tsx          # Individual row with inline editing
│       ├── GuestTableCell.tsx         # Cell renderer with type-specific display
│       ├── ColumnFilterDropdown.tsx   # Excel-style column filter
│       ├── ActiveFiltersBar.tsx       # Active filter badges
│       └── tableColumns.ts            # Column definitions
│
├── hooks/
│   └── useGuestTableData.ts           # Data fetching hook for table view
│
├── lib/
│   └── guest-table-utils.ts           # Transform, filter, sort utilities
│
└── types/
    └── guest-table.ts                 # TypeScript types for table view
```

### Component Hierarchy

```
GuestListPage
├── ViewToggle                    # View mode switch
├── GuestFiltersComponent         # Shared search/filters
├── BulkActionsBar               # Shared bulk actions
│
├── [Card View]                   # viewMode === 'card'
│   └── GuestCard[]
│       ├── GuestCardCollapsed
│       └── GuestCardExpanded
│
└── [Table View]                  # viewMode === 'table'
    └── GuestTableView
        ├── ActiveFiltersBar
        ├── GuestTableHeader
        │   └── ColumnFilterDropdown[]
        └── GuestTableBody
            └── GuestTableRow[]
                └── GuestTableCell[]
```

---

## 2. View Toggle Implementation

### State Management

The view mode is managed at the page level with localStorage persistence:

```typescript
// In GuestListPage.tsx
const [viewMode, setViewMode] = useState<GuestViewMode>(() => getViewPreference());

// Persist to localStorage on change
useEffect(() => {
  setViewPreference(viewMode);
}, [viewMode]);
```

### ViewToggle Component

**Location:** `src/components/guests/ViewToggle.tsx`

**Props Interface:**
```typescript
interface ViewToggleProps {
  activeView: GuestViewMode;           // 'card' | 'table'
  onViewChange: (view: GuestViewMode) => void;
  className?: string;
}
```

**Key Features:**
- Accessible radio group (`role="radiogroup"`)
- Visual feedback with brand colors
- Icons for each view mode (LayoutGrid, Table2 from lucide-react)

### localStorage Persistence

**Location:** `src/lib/guest-table-utils.ts`

```typescript
const VIEW_PREFERENCE_KEY = 'guestsViewPreference';

export function getViewPreference(): 'card' | 'table' {
  try {
    const stored = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return stored === 'table' ? 'table' : 'card';
  } catch {
    return 'card'; // Default to card view
  }
}

export function setViewPreference(mode: 'card' | 'table'): void {
  try {
    localStorage.setItem(VIEW_PREFERENCE_KEY, mode);
  } catch {
    // Silent fail if localStorage unavailable
  }
}
```

---

## 3. Card View Pattern

### Component Structure

The card view uses expandable cards with a collapsed/expanded state:

```
GuestCard
├── Checkbox (selection)
├── GuestCardCollapsed (always visible)
│   ├── Name, badges, summary info
│   └── Expand/collapse chevron
│
└── GuestCardExpanded (when expanded)
    └── TabsContainer (5 tabs)
        ├── Details Tab
        ├── RSVP Tab
        ├── Dietary Tab
        ├── Events & Shuttles Tab
        └── Meals Tab
```

### State Management

```typescript
// Expanded cards tracked as Set<string> for O(1) lookup
const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

// Toggle individual card
const handleToggleExpand = useCallback((guestId: string) => {
  setExpandedCards((prev) => {
    const next = new Set(prev);
    if (next.has(guestId)) {
      next.delete(guestId);
    } else {
      next.add(guestId);
    }
    return next;
  });
}, []);

// Expand/collapse all
const handleExpandAll = () => setExpandedCards(new Set(guests.map(g => g.id)));
const handleCollapseAll = () => setExpandedCards(new Set());
```

### Selection State

```typescript
const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

const handleToggleSelect = useCallback((guestId: string) => {
  setSelectedGuests((prev) => {
    const next = new Set(prev);
    if (next.has(guestId)) {
      next.delete(guestId);
    } else {
      next.add(guestId);
    }
    return next;
  });
}, []);
```

### Card Actions

Each card supports:
- **Toggle expand/collapse** - via chevron button
- **Toggle selection** - via checkbox
- **Delete** - triggers confirmation dialog
- **Inline editing** - within expanded tab content

---

## 4. Table View Pattern

### Main Container (GuestTableView)

**Location:** `src/components/guests/table/GuestTableView.tsx`

**Props Interface:**
```typescript
interface GuestTableViewProps {
  weddingId: string;
  filters: GuestFiltersState;
  selectedGuests?: Set<string>;
  onToggleSelect?: (guestId: string) => void;
  onSelectAll?: () => void;
}
```

**Features:**
- Horizontal scroll for wide tables
- Vertical scroll with max-height
- Footer with stats (row count, column count, filter count)

### Column Definitions

**Location:** `src/components/guests/table/tableColumns.ts`

**Column Definition Interface:**
```typescript
interface TableColumnDef {
  id: string;                      // Unique identifier
  header: string;                  // Display header text
  field: string;                   // Database field or nested path
  category: ColumnCategory;        // For grouping in header
  type: CellType;                  // For rendering/editing
  editable: boolean;               // Allow inline editing
  width: number;                   // Default width in pixels
  minWidth: number;                // Minimum width for resizing
  enumOptions?: string[];          // For enum dropdowns
  eventId?: string;                // For event columns
  courseType?: 'starter' | 'main' | 'dessert'; // For meal columns
  requiresPlusOne?: boolean;       // Conditional display
  displayValue?: string;           // Pre-computed read-only value
}
```

**Cell Types:**
```typescript
type CellType =
  | 'text'           // Plain text input
  | 'boolean'        // Checkbox
  | 'enum'           // Select dropdown
  | 'date'           // Date picker
  | 'number'         // Number input
  | 'datetime'       // Read-only datetime display
  | 'meal'           // Meal option dropdown
  | 'shuttle-toggle' // Shuttle yes/no checkbox
  | 'shuttle-info';  // Read-only shuttle info
```

**Category Grouping:**
```typescript
type ColumnCategory =
  | 'basic'    // Name, email, phone, type, etc.
  | 'rsvp'     // Invitation status, plus one, notes
  | 'seating'  // Table number, seat position
  | 'dietary'  // Restrictions, allergies
  | 'meals'    // Starter, main, dessert choices
  | 'other'    // Created/updated timestamps, ID
  | 'event';   // Dynamic event attendance columns
```

### Dynamic Event Columns

Events generate 5 columns each:
1. **Attending** - boolean checkbox
2. **Shuttle** - toggle (sets both shuttle_to and shuttle_from)
3. **Pickup** - read-only info (location + time)
4. **Event** - read-only info (location + time)
5. **Return** - read-only info (location + time)

```typescript
function generateEventColumns(events: EventColumnMeta[]): TableColumnDef[] {
  return events.flatMap((event) => [
    {
      id: `event_${event.id}_attending`,
      header: 'Attending',
      field: `eventAttendance.${event.id}.attending`,
      category: 'event',
      type: 'boolean',
      editable: true,
      eventId: event.id,
      // ...
    },
    // ... shuttle, pickup, event, return columns
  ]);
}
```

### Column Filtering

**Component:** `ColumnFilterDropdown.tsx`

**Features:**
- Excel-style checkbox list of unique values
- Search within filter values
- Select all / deselect all
- Shows value counts
- Filter state stored as `ColumnFilter[]`

**Filter Interface:**
```typescript
interface ColumnFilter {
  column: string;                              // Column ID
  operator: FilterOperator;                    // 'equals' | 'contains' | 'in' | etc.
  value: string | boolean | number | string[] | null;
}
```

### Column Sorting

Sorting uses a cycle: none → asc → desc → none

```typescript
const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(undefined);

const handleSort = useCallback((column: string) => {
  setSortConfig((prev) => {
    if (prev?.column !== column) {
      return { column, direction: 'asc' };
    }
    if (prev.direction === 'asc') {
      return { column, direction: 'desc' };
    }
    return undefined; // Third click clears
  });
}, []);
```

### Inline Editing

**Component:** `GuestTableCell.tsx`

**Editing Flow:**
1. Click cell to start editing (non-boolean types)
2. Value changes stored in `pendingChangesRef`
3. On blur/Enter → save pending changes
4. On Escape → discard pending changes
5. Boolean/shuttle checkboxes save immediately

**Cell Edit Payload:**
```typescript
interface CellEditPayload {
  guestId: string;
  weddingId: string;
  field: string;
  value: string | boolean | number | null;
  eventId?: string;
  attendanceField?: 'attending' | 'shuttle_to_event' | 'shuttle_from_event';
}
```

### Sticky Header (Z-Index Fix)

The header uses proper z-index layering to stay above content when scrolling:

```tsx
<thead className="sticky top-0 z-30 bg-white">
  {/* Category row */}
  <tr className="border-b border-[#E8E8E8] bg-white relative z-30">
    {/* Checkbox column is sticky left with higher z-index */}
    <th className="sticky left-0 z-40 bg-white">...</th>
  </tr>

  {/* Column header row */}
  <tr className="bg-[#D4A5A5] relative z-30">
    <th className="sticky left-0 z-40 bg-[#D4A5A5]">...</th>
  </tr>
</thead>
```

**Z-Index Hierarchy:**
- `z-10`: Row checkbox cells (sticky left)
- `z-30`: Header rows (sticky top)
- `z-40`: Header checkbox cell (sticky top + left intersection)

### Row Selection

Selection state is shared between views and managed at the page level:

```tsx
<GuestTableView
  selectedGuests={selectedGuests}
  onToggleSelect={handleToggleSelect}
  onSelectAll={allSelected ? deselectAll : selectAll}
/>
```

---

## 5. Shared Functionality

### Search Bar Integration

Both views use the same debounced search filter:

```typescript
const [filters, setFilters] = useState<GuestFiltersState>(DEFAULT_GUEST_FILTERS_STATE);
const debouncedSearch = useDebounce(filters.search, 300);
const debouncedFilters = { ...filters, search: debouncedSearch };
```

### Filter State Interface

```typescript
interface GuestFiltersState {
  search: string;
  type: 'all' | 'adult' | 'child' | 'vendor' | 'staff';
  invitationStatus: 'all' | 'pending' | 'invited' | 'confirmed' | 'declined';
  tableNumber: string; // 'all' | 'none' | specific number
  eventId: string | null;
}
```

### Data Fetching Hook

**Location:** `src/hooks/useGuestTableData.ts`

**Features:**
- TanStack Query for caching and deduplication
- Parallel fetching of guests, events, attendance, meal options
- Real-time subscription for event changes
- Optimistic updates for cell edits
- Automatic cache invalidation

```typescript
function useGuestTableData({
  weddingId,
  filters,
  columnFilters = [],
  enabled = true,
}: UseGuestTableDataParams): UseGuestTableDataReturn {
  // Fetch data
  const query = useQuery({
    queryKey: ['guest-table-data', weddingId],
    queryFn: async () => {
      // Parallel fetch guests, events, attendance, meal options
      // Transform to table rows
      return transformToTableRows(guests, events, attendance, mealOptions);
    },
    staleTime: 30_000,
  });

  // Apply filters
  const filteredRows = useMemo(() => {
    let rows = applyGuestFilters(query.data?.rows, filters);
    rows = applyColumnFilters(rows, columnFilters, columnFieldMap);
    return rows;
  }, [query.data, filters, columnFilters]);

  return { rows: filteredRows, columns, events, mealOptions, ... };
}
```

### Auto-Save Implementation

```typescript
// In useGuestTableData.ts
export function useUpdateGuestCell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CellEditPayload) => {
      if (payload.eventId && payload.attendanceField) {
        // Update guest_event_attendance table
        await supabase.from('guest_event_attendance').upsert({...});
      } else {
        // Update guests table
        await supabase.from('guests').update({...});
      }
    },

    // Optimistic update
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['guest-table-data'] });
      const previousData = queryClient.getQueryData([...]);
      queryClient.setQueryData([...], (old) => {
        // Update row optimistically
      });
      return { previousData };
    },

    // Rollback on error
    onError: (err, payload, context) => {
      queryClient.setQueryData([...], context.previousData);
    },

    // Invalidate on settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-table-data'] });
      queryClient.invalidateQueries({ queryKey: ['guest-cards'] });
    },
  });
}
```

### Empty State Handling

```tsx
{!isLoading && !isError && guests.length === 0 && (
  hasActiveFilters(filters) ? (
    <NoSearchResults searchTerm={filters.search || undefined} />
  ) : (
    <EmptyGuestState />
  )
)}
```

---

## 6. Styling Approach

### Brand Colors

```css
/* Primary brand color (dusty rose) */
--brand-primary: #D4A5A5;
--brand-primary-hover: #C99595;
--brand-primary-light: #D4A5A5/10; /* 10% opacity for selection bg */

/* Text colors */
--text-primary: #5C4B4B;
--text-secondary: #2C2C2C;

/* Border colors */
--border-default: #E8E8E8;
--border-header: #C99595;

/* Background colors */
--bg-secondary: #F5F5F5;
```

### Table Header Styling

```tsx
{/* Category row */}
<tr className="border-b border-[#E8E8E8] bg-white">
  <th className="bg-[#F5F5F5] text-[#5C4B4B] text-xs font-semibold">
    {categoryLabel}
  </th>
</tr>

{/* Column header row - dusty rose */}
<tr className="bg-[#D4A5A5] border-b border-[#C99595]">
  <th className="text-white text-xs font-semibold uppercase tracking-wider">
    {columnHeader}
  </th>
</tr>
```

### Spacing System (8px Grid)

```css
/* Common spacing values */
px-2 = 8px
px-4 = 16px
py-2 = 8px
py-3 = 12px
gap-2 = 8px
gap-4 = 16px
```

### Row Hover/Selection States

```tsx
<tr className={cn(
  'border-b border-[#E8E8E8] transition-colors',
  isSelected ? 'bg-[#D4A5A5]/10' : 'hover:bg-gray-50'
)}>
```

### Checkbox Styling

```tsx
<Checkbox
  className="data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
/>
```

---

## 7. Key Technical Decisions

### Why TanStack Query?

- **Automatic caching** - Prevents redundant API calls
- **Optimistic updates** - Instant UI feedback
- **Background refetching** - Keeps data fresh
- **Query invalidation** - Easy cross-component updates
- **Built-in loading/error states**

### Why Set<string> for Selection?

- **O(1) lookup** - Fast check if item is selected
- **O(1) add/remove** - Fast toggle operations
- **Memory efficient** - Only stores IDs, not full objects

### Why localStorage for View Preference?

- **Persists across sessions** - User doesn't have to re-select
- **No server dependency** - Works offline
- **Instant load** - No async needed

### Why Memoization?

```typescript
// Memoize filtered rows
const filteredRows = useMemo(() => {
  return applyColumnFilters(rows, columnFilters, columnFieldMap);
}, [rows, columnFilters, columnFieldMap]);

// Memoize row components
export const GuestTableRow = memo(function GuestTableRow({...}) {
  // Only re-render when props change
});
```

### Accessibility Considerations

- **ARIA roles** - `role="radiogroup"`, `aria-checked`, `aria-label`
- **Keyboard navigation** - Enter to confirm, Escape to cancel
- **Focus management** - Auto-focus input when editing
- **Screen reader support** - Descriptive labels for actions

### Mobile Responsiveness

- **Horizontal scroll** - Table scrolls horizontally on small screens
- **Touch-friendly** - Adequate tap targets (min 44px)
- **Responsive breakpoints** - Different layouts for sm/md/lg

---

## 8. Reusability Guidelines

### What's Generic/Reusable

1. **ViewToggle component** - Just change labels/icons
2. **Table structure** - Header, Body, Row, Cell hierarchy
3. **Column filter pattern** - Works with any data type
4. **Sort pattern** - Generic sort utilities
5. **Selection pattern** - Set<string> with toggle callbacks
6. **Auto-save pattern** - Optimistic updates with TanStack Query
7. **localStorage persistence** - Generic key-value storage

### What Needs Customization Per Page

1. **Column definitions** - Specific to each data type
2. **Data transformation** - Specific to data shape
3. **Cell types** - May need new types (e.g., 'currency' for vendors)
4. **Supabase queries** - Table names, field names
5. **Filter fields** - Specific to each domain
6. **Event columns** - Only applicable if has related events

### Required Configuration for New Pages

```typescript
// 1. Define your view mode type
type VendorViewMode = 'card' | 'table';

// 2. Define your column types
type VendorCellType = 'text' | 'boolean' | 'enum' | 'currency' | 'date';

// 3. Define column definitions
const VENDOR_COLUMNS: TableColumnDef[] = [
  { id: 'name', header: 'Vendor Name', field: 'name', type: 'text', ... },
  { id: 'category', header: 'Category', field: 'category', type: 'enum', ... },
  { id: 'total_cost', header: 'Total Cost', field: 'total_cost', type: 'currency', ... },
];

// 4. Define filter state
interface VendorFiltersState {
  search: string;
  category: 'all' | 'venue' | 'catering' | 'photography' | ...;
  paymentStatus: 'all' | 'pending' | 'partial' | 'paid';
}

// 5. Create data hook
function useVendorTableData({ weddingId, filters }) {
  return useQuery({
    queryKey: ['vendor-table-data', weddingId],
    queryFn: () => fetchAndTransformVendors(weddingId),
  });
}
```

### Data Shape Requirements

**Row Data Interface:**
```typescript
interface TableRowData {
  id: string;                    // Required for selection/updates
  [field: string]: unknown;      // Dynamic fields matching column definitions
}
```

**For Nested Fields (like event attendance):**
```typescript
interface GuestTableRowData {
  id: string;
  name: string;
  // Nested data accessed via dot notation
  eventAttendance: Record<string, {
    attending: boolean;
    shuttle_to_event: string | null;
  }>;
}

// Column field: 'eventAttendance.${eventId}.attending'
```

---

## 9. Code Examples

### Example: Creating a New Table View

```typescript
// vendors/table/VendorTableView.tsx
export function VendorTableView({ weddingId, filters }: Props) {
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>();

  const { rows, columns, isLoading } = useVendorTableData({
    weddingId,
    filters,
    columnFilters,
  });

  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;
    return sortRows(rows, sortConfig);
  }, [rows, sortConfig]);

  return (
    <div className="border border-[#E8E8E8] rounded-lg bg-white overflow-hidden">
      <ActiveFiltersBar
        filters={columnFilters}
        columns={columns}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={() => setColumnFilters([])}
      />

      <div className="overflow-auto max-h-[calc(100vh-320px)]">
        <table className="w-full border-collapse min-w-max">
          <VendorTableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            onFilterChange={handleFilterChange}
          />
          <VendorTableBody
            rows={sortedRows}
            columns={columns}
            weddingId={weddingId}
          />
        </table>
      </div>
    </div>
  );
}
```

### Example: Adding a New Cell Type

```typescript
// In VendorTableCell.tsx
case 'currency':
  if (isEditing) {
    return (
      <Input
        type="number"
        step="0.01"
        value={localValue as number || ''}
        onChange={(e) => handleChange(parseFloat(e.target.value) || null)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-8 text-sm"
      />
    );
  }
  return (
    <span className="text-green-600 font-medium">
      ${(value as number)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
    </span>
  );
```

### Example: View Toggle with Different Icons

```typescript
// For Vendors page
const views: { value: VendorViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'card', label: 'Card View', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'table', label: 'Table View', icon: <Table2 className="h-4 w-4" /> },
];
```

### Example: Custom Column Definition

```typescript
// For Bar Orders
const BAR_ORDER_COLUMNS: TableColumnDef[] = [
  {
    id: 'order_number',
    header: 'Order #',
    field: 'order_number',
    category: 'basic',
    type: 'text',
    editable: false,
    width: 100,
    minWidth: 80,
  },
  {
    id: 'status',
    header: 'Status',
    field: 'status',
    category: 'basic',
    type: 'enum',
    editable: true,
    width: 120,
    minWidth: 100,
    enumOptions: ['draft', 'submitted', 'confirmed', 'delivered'],
  },
  {
    id: 'total_bottles',
    header: 'Total Bottles',
    field: 'total_bottles',
    category: 'items',
    type: 'number',
    editable: false,
    width: 120,
    minWidth: 100,
  },
  {
    id: 'total_cost',
    header: 'Total Cost',
    field: 'total_cost',
    category: 'financial',
    type: 'currency',
    editable: false,
    width: 140,
    minWidth: 120,
  },
];
```

---

## Quick Reference Checklist

When implementing Card/Table view for a new page:

- [ ] Create `ViewToggle` component or reuse generic one
- [ ] Add `viewMode` state with localStorage persistence
- [ ] Create column definitions in `tableColumns.ts`
- [ ] Create data fetching hook with TanStack Query
- [ ] Implement `TableView` container with scroll handling
- [ ] Implement `TableHeader` with sorting and filtering
- [ ] Implement `TableRow` with inline editing
- [ ] Implement `TableCell` with type-specific rendering
- [ ] Add `ColumnFilterDropdown` for each filterable column
- [ ] Add `ActiveFiltersBar` to show active filters
- [ ] Share selection state between Card and Table views
- [ ] Share filter state between Card and Table views
- [ ] Apply brand colors (#D4A5A5) consistently
- [ ] Test sticky header z-index layering
- [ ] Test horizontal scroll behavior
- [ ] Test inline editing (save on blur/Enter, cancel on Escape)
- [ ] Test optimistic updates and error rollback

---

**Last Updated:** Phase 026 - Guest View Toggle
**Author:** Claude Code
**Version:** 1.0
