# Quickstart Guide: Vendors View Toggle

**Branch**: `027-vendor-view-toggle` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)

## Prerequisites

- Branch `027-vendor-view-toggle` checked out
- Dev server running (`npm run dev`)
- Familiarity with CARD-TABLE-VIEW-PATTERN.md

---

## Implementation Order

### Phase 1: Foundation (Types, Utils, Hook)

**Step 1: Create TypeScript Types**

Create `src/types/vendor-table.ts`:

```typescript
// Copy interfaces from data-model.md
export type VendorViewMode = 'card' | 'table';
export interface VendorTableRow { /* ... */ }
export interface VendorTableColumnDef { /* ... */ }
export interface VendorColumnFilter { /* ... */ }
export interface VendorSortConfig { /* ... */ }
export interface VendorCellEditPayload { /* ... */ }
```

**Step 2: Create Utility Functions**

Create `src/lib/vendor-table-utils.ts`:

```typescript
// localStorage persistence
const VIEW_PREFERENCE_KEY = 'vendorsViewPreference';

export function getVendorViewPreference(): VendorViewMode {
  try {
    const stored = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return stored === 'table' ? 'table' : 'card';
  } catch {
    return 'card';
  }
}

export function setVendorViewPreference(mode: VendorViewMode): void {
  try {
    localStorage.setItem(VIEW_PREFERENCE_KEY, mode);
  } catch {
    // Silent fail
  }
}

// Filter utilities
export function applyVendorFilters(
  rows: VendorTableRow[],
  filters: VendorFiltersState
): VendorTableRow[] { /* ... */ }

export function applyColumnFilters(
  rows: VendorTableRow[],
  columnFilters: VendorColumnFilter[]
): VendorTableRow[] { /* ... */ }

// Sort utility
export function sortVendorRows(
  rows: VendorTableRow[],
  sortConfig: VendorSortConfig | undefined
): VendorTableRow[] { /* ... */ }

// Mask account number
export function maskAccountNumber(accountNumber: string | null): string {
  if (!accountNumber) return '';
  return '****' + accountNumber.slice(-4);
}

// Format currency
export function formatCurrency(value: number | null): string {
  if (value === null) return '';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

// Format percentage
export function formatPercentage(value: number | null): string {
  if (value === null) return '';
  return `${value}%`;
}
```

**Step 3: Create Data Hook**

Create `src/hooks/useVendorTableData.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { VENDOR_TABLE_COLUMNS } from '@/components/vendors/table/tableColumns';

export function useVendorTableData({
  weddingId,
  filters,
  columnFilters = [],
  enabled = true,
}: UseVendorTableDataParams): UseVendorTableDataReturn {
  const query = useQuery({
    queryKey: ['vendor-table-data', weddingId],
    queryFn: async () => {
      // Parallel fetch
      const [vendorsRes, contactsRes, paymentsRes, invoicesRes] = await Promise.all([
        supabase.from('vendors').select('*').eq('wedding_id', weddingId),
        supabase.from('vendor_contacts').select('vendor_id').eq('wedding_id', weddingId),
        supabase.from('vendor_payment_schedule').select('vendor_id').eq('wedding_id', weddingId),
        supabase.from('vendor_invoices').select('vendor_id').eq('wedding_id', weddingId),
      ]);

      // Count aggregates
      const contactsCounts = countByVendorId(contactsRes.data);
      const paymentsCounts = countByVendorId(paymentsRes.data);
      const invoicesCounts = countByVendorId(invoicesRes.data);

      // Transform to rows
      return vendorsRes.data?.map((vendor) => ({
        ...vendor,
        contacts_count: contactsCounts[vendor.id] || 0,
        payments_count: paymentsCounts[vendor.id] || 0,
        invoices_count: invoicesCounts[vendor.id] || 0,
      })) || [];
    },
    staleTime: 30_000,
    enabled: !!weddingId && enabled,
  });

  // Apply filters
  const filteredRows = useMemo(() => {
    let rows = applyVendorFilters(query.data || [], filters);
    rows = applyColumnFilters(rows, columnFilters);
    return rows;
  }, [query.data, filters, columnFilters]);

  return {
    rows: filteredRows,
    columns: VENDOR_TABLE_COLUMNS,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useUpdateVendorCell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: VendorCellEditPayload) => {
      const { error } = await supabase
        .from('vendors')
        .update({ [payload.field]: payload.value })
        .eq('id', payload.vendorId)
        .eq('wedding_id', payload.weddingId);

      if (error) throw error;
    },
    onMutate: async (payload) => {
      // Optimistic update (see api-contracts.md)
    },
    onError: (err, payload, context) => {
      // Rollback (see api-contracts.md)
    },
    onSettled: (_, __, payload) => {
      // Invalidate caches
    },
  });
}
```

---

### Phase 2: Table Components

**Step 4: Copy Generic Components**

Copy from `src/components/guests/table/`:
- `ColumnFilterDropdown.tsx` → `src/components/vendors/table/`
- `ActiveFiltersBar.tsx` → `src/components/vendors/table/`

No changes needed - these are generic.

**Step 5: Create Column Definitions**

Create `src/components/vendors/table/tableColumns.ts`:

```typescript
import { VendorTableColumnDef } from '@/types/vendor-table';
import { VENDOR_TYPE_OPTIONS, VENDOR_STATUS_OPTIONS } from '@/types/vendor';

export const VENDOR_TABLE_COLUMNS: VendorTableColumnDef[] = [
  // Basic Info
  {
    id: 'vendor_type',
    header: 'Type',
    field: 'vendor_type',
    category: 'basic',
    type: 'enum',
    editable: true,
    width: 140,
    minWidth: 120,
    enumOptions: VENDOR_TYPE_OPTIONS,
    required: true,
  },
  {
    id: 'company_name',
    header: 'Company',
    field: 'company_name',
    category: 'basic',
    type: 'text',
    editable: true,
    width: 200,
    minWidth: 150,
    required: true,
  },
  // ... remaining 28 columns (see data-model.md)
];
```

**Step 6: Create VendorTableCell**

Create `src/components/vendors/table/VendorTableCell.tsx`:

Handle all cell types:
- `text`, `email`, `phone`, `url` - Input fields
- `enum` - Select dropdown
- `boolean` - Checkbox (immediate save)
- `date` - Date picker
- `currency` - Number input with formatting
- `percentage` - Number input with % suffix
- `masked` - Masked display, reveal on edit
- `number`, `datetime` - Read-only display

**Step 7: Create VendorTableRow**

Create `src/components/vendors/table/VendorTableRow.tsx`:

```typescript
export const VendorTableRow = memo(function VendorTableRow({
  row,
  columns,
  weddingId,
  isSelected,
  onToggleSelect,
}: Props) {
  return (
    <tr className={cn(
      'border-b border-[#E8E8E8] transition-colors',
      isSelected ? 'bg-[#D4A5A5]/10' : 'hover:bg-gray-50'
    )}>
      {/* Selection checkbox */}
      <td className="sticky left-0 z-10 bg-white px-4 py-2">
        <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(row.id)} />
      </td>

      {/* Data cells */}
      {columns.map((column) => (
        <VendorTableCell
          key={column.id}
          row={row}
          column={column}
          weddingId={weddingId}
        />
      ))}
    </tr>
  );
});
```

**Step 8: Create VendorTableHeader**

Create `src/components/vendors/table/VendorTableHeader.tsx`:

- Category row (Basic Info, Contact, Contract, Insurance, Banking, Aggregates, Metadata)
- Column header row with dusty rose (#D4A5A5) background
- Sort indicators and filter dropdowns
- Sticky positioning with z-index layering

**Step 9: Create VendorTableView**

Create `src/components/vendors/table/VendorTableView.tsx`:

```typescript
export function VendorTableView({
  weddingId,
  filters,
  selectedVendors,
  onToggleSelect,
  onSelectAll,
}: Props) {
  const [columnFilters, setColumnFilters] = useState<VendorColumnFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<VendorSortConfig>();

  const { rows, columns, isLoading } = useVendorTableData({
    weddingId,
    filters,
    columnFilters,
  });

  const sortedRows = useMemo(() => sortVendorRows(rows, sortConfig), [rows, sortConfig]);

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="border border-[#E8E8E8] rounded-lg bg-white overflow-hidden">
      <ActiveFiltersBar
        filters={columnFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={() => setColumnFilters([])}
      />

      <div className="overflow-auto max-h-[calc(100vh-320px)]">
        <table className="w-full border-collapse min-w-max">
          <VendorTableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            columnFilters={columnFilters}
            onFilterChange={handleFilterChange}
            allSelected={allSelected}
            onSelectAll={onSelectAll}
          />
          <tbody>
            {sortedRows.map((row) => (
              <VendorTableRow
                key={row.id}
                row={row}
                columns={columns}
                weddingId={weddingId}
                isSelected={selectedVendors?.has(row.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </tbody>
        </table>
      </div>

      <TableFooter rowCount={sortedRows.length} columnCount={columns.length + 1} />
    </div>
  );
}
```

**Step 10: Create Barrel Export**

Create `src/components/vendors/table/index.ts`:

```typescript
export { VendorTableView } from './VendorTableView';
export { VendorTableHeader } from './VendorTableHeader';
export { VendorTableRow } from './VendorTableRow';
export { VendorTableCell } from './VendorTableCell';
export { ColumnFilterDropdown } from './ColumnFilterDropdown';
export { ActiveFiltersBar } from './ActiveFiltersBar';
export { VENDOR_TABLE_COLUMNS } from './tableColumns';
```

---

### Phase 3: Page Integration

**Step 11: Create/Adapt ViewToggle**

Create `src/components/vendors/ViewToggle.tsx`:

```typescript
import { LayoutGrid, Table2 } from 'lucide-react';
import { VendorViewMode } from '@/types/vendor-table';

export function ViewToggle({ activeView, onViewChange }: Props) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-gray-100" role="radiogroup">
      <button
        role="radio"
        aria-checked={activeView === 'card'}
        onClick={() => onViewChange('card')}
        className={cn(/* styling */)}
      >
        <LayoutGrid className="h-4 w-4" />
        <span>Card</span>
      </button>
      <button
        role="radio"
        aria-checked={activeView === 'table'}
        onClick={() => onViewChange('table')}
        className={cn(/* styling */)}
      >
        <Table2 className="h-4 w-4" />
        <span>Table</span>
      </button>
    </div>
  );
}
```

**Step 12: Update VendorsPage**

Update `src/pages/vendors/VendorsPage.tsx`:

```typescript
import { VendorTableView } from '@/components/vendors/table';
import { ViewToggle } from '@/components/vendors/ViewToggle';
import { getVendorViewPreference, setVendorViewPreference } from '@/lib/vendor-table-utils';

export function VendorsPage() {
  const [viewMode, setViewMode] = useState<VendorViewMode>(() => getVendorViewPreference());
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());

  useEffect(() => {
    setVendorViewPreference(viewMode);
  }, [viewMode]);

  return (
    <div>
      {/* Header with ViewToggle */}
      <div className="flex justify-between items-center mb-6">
        <h1>Vendors</h1>
        <div className="flex gap-4">
          <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
          <Button onClick={openAddModal}>Add Vendor</Button>
        </div>
      </div>

      {/* Filters */}
      <VendorFilters filters={filters} onFilterChange={setFilters} />

      {/* Conditional View */}
      {viewMode === 'card' ? (
        <VendorList
          vendors={vendors}
          selectedVendors={selectedVendors}
          onToggleSelect={handleToggleSelect}
        />
      ) : (
        <VendorTableView
          weddingId={weddingId}
          filters={filters}
          selectedVendors={selectedVendors}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
      )}
    </div>
  );
}
```

---

### Phase 4: Testing & Polish

**Step 13: Manual Testing Checklist**

Using Playwright MCP:

- [ ] View toggle switches between Card and Table
- [ ] View preference persists across page refresh
- [ ] All 30 columns render correctly
- [ ] Horizontal scroll works with sticky columns
- [ ] Vertical scroll works with sticky header
- [ ] Inline editing works for all editable cell types
- [ ] Auto-save triggers after 500ms debounce
- [ ] Validation errors display correctly
- [ ] Column filtering works
- [ ] Column sorting works
- [ ] Selection state syncs between views
- [ ] Filter state syncs between views

**Step 14: Fix Any Issues**

Common issues to watch for:
- Z-index conflicts (use z-10, z-30, z-40 pattern)
- Date formatting inconsistencies
- Currency display locale issues
- Account number masking edge cases

**Step 15: Verify All Columns**

Ensure all 30 columns work:
- 27 database fields
- 3 aggregate counts

---

## Quick Reference

### File Locations

| File | Purpose |
|------|---------|
| `src/types/vendor-table.ts` | TypeScript interfaces |
| `src/lib/vendor-table-utils.ts` | Utility functions |
| `src/hooks/useVendorTableData.ts` | Data fetching hook |
| `src/components/vendors/ViewToggle.tsx` | View toggle component |
| `src/components/vendors/table/` | All table components |
| `src/pages/vendors/VendorsPage.tsx` | Main page (update) |

### Key Patterns

- localStorage key: `vendorsViewPreference`
- Query key: `['vendor-table-data', weddingId]`
- Z-index: Row cells (10), Header rows (30), Intersection (40)
- Brand color: `#D4A5A5` (dusty rose)
- Debounce: 500ms for auto-save

### Dependencies

No new npm packages required - uses existing:
- TanStack Query v5
- Shadcn/ui components
- Tailwind CSS
- date-fns
- Lucide React
- Zod
