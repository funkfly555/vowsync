/**
 * Wedding Items Table Components - Barrel Export
 * @feature 031-items-card-table-view
 */

// Table view components (FLAT spreadsheet with inline editing - like Guest table)
export { ItemTableView } from './ItemTableView';
export { ItemTableHeader } from './ItemTableHeader';
export { ItemTableBody } from './ItemTableBody';
export { ItemTableRow } from './ItemTableRow';
export { ItemTableCell } from './ItemTableCell';

// Filter components
export { ColumnFilterDropdown } from './ColumnFilterDropdown';
export { ActiveFiltersBar } from './ActiveFiltersBar';

// Column definitions
export {
  BASE_ITEM_COLUMNS,
  ITEM_TABLE_COLUMNS,
  buildItemTableColumns,
  generateEventQuantityColumns,
  getFilterableColumns,
  getSortableColumns,
  buildColumnFieldMap,
  ITEM_CATEGORY_CONFIG,
} from './itemTableColumns';
