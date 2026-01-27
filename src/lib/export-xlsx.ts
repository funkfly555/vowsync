/**
 * Excel Export - Matches Table View structure exactly
 * Two header rows (category + column), merged cells, dynamic event columns
 * @feature 033-guest-page-tweaks
 */

import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import {
  BASE_COLUMNS,
  generateEventColumns,
  groupColumnsByCategory,
  CATEGORY_CONFIG,
} from '@/components/guests/table/tableColumns';
import type {
  TableColumnDef,
  EventColumnMeta,
  GuestTableRowData,
  MealOptionLookup,
} from '@/types/guest-table';

/**
 * Get nested value from an object using dot-notation field path
 * e.g. "eventAttendance.abc123.attending"
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc === null || acc === undefined) return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
}

/**
 * Format a cell value for Excel output
 */
function formatCellValue(
  value: unknown,
  col: TableColumnDef,
  mealOptions: MealOptionLookup
): string | number | boolean {
  if (value === null || value === undefined) return '';

  switch (col.type) {
    case 'boolean':
      return value ? 'Yes' : 'No';

    case 'date':
      if (typeof value === 'string' && value) {
        try {
          return format(new Date(value), 'yyyy-MM-dd');
        } catch {
          return String(value);
        }
      }
      return '';

    case 'datetime':
      if (typeof value === 'string' && value) {
        try {
          return format(new Date(value), 'yyyy-MM-dd HH:mm');
        } catch {
          return String(value);
        }
      }
      return '';

    case 'enum':
      return formatEnum(String(value));

    case 'meal': {
      // Look up meal name from options
      const courseType = col.courseType;
      if (courseType && typeof value === 'number') {
        const lookup = mealOptions[courseType];
        return lookup?.[value] || `Option ${value}`;
      }
      return value ? String(value) : '';
    }

    case 'shuttle-toggle':
      return value === 'Yes' || value === true ? 'Yes' : 'No';

    case 'shuttle-info':
      // Use displayValue from column definition (pre-computed from events table)
      return col.displayValue || '';

    default:
      return String(value);
  }
}

/**
 * Format enum values to human-readable labels
 */
function formatEnum(value: string): string {
  const enumMap: Record<string, string> = {
    adult: 'Adult',
    child: 'Child',
    vendor: 'Vendor',
    staff: 'Staff',
    pending: 'Pending',
    invited: 'Invited',
    confirmed: 'Confirmed',
    declined: 'Declined',
    email: 'Email',
    phone: 'Phone',
    in_person: 'In Person',
    online: 'Online',
    male: 'Male',
    female: 'Female',
    bride: 'Bride',
    groom: 'Groom',
    best_man: 'Best Man',
    groomsmen: 'Groomsmen',
    maid_of_honor: 'Maid of Honor',
    bridesmaids: 'Bridesmaids',
    parent: 'Parent',
    close_relative: 'Close Relative',
    relative: 'Relative',
    other: 'Other',
  };
  return enumMap[value] || value;
}

/**
 * Generate filename in format: GuestsDetails_{WeddingName}_{dd-MMM-yy}.xlsx
 */
function generateFilename(brideName: string, groomName: string): string {
  const weddingName = `${brideName}-${groomName} Wedding`;
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = monthNames[today.getMonth()];
  const year = String(today.getFullYear()).slice(-2);
  const dateStr = `${day}-${month}-${year}`;

  // Sanitize for filename
  const sanitized = weddingName.replace(/[/\\:*?"<>|]/g, '_');
  return `GuestsDetails_${sanitized}_${dateStr}.xlsx`;
}

/**
 * Export guests to Excel with Table View structure
 * - Row 1: Category headers (merged cells)
 * - Row 2: Column headers
 * - Row 3+: Data rows
 */
export function exportGuestsToXlsx(
  rows: GuestTableRowData[],
  events: EventColumnMeta[],
  mealOptions: MealOptionLookup,
  brideName: string,
  groomName: string
): void {
  // Build full column list (same as table view)
  const columns: TableColumnDef[] = [
    ...BASE_COLUMNS,
    ...generateEventColumns(events),
  ];

  // Group columns by category (same logic as table header)
  const groups = groupColumnsByCategory(columns);

  // Build Row 1: Category headers
  const categoryRow: string[] = [];
  const merges: XLSX.Range[] = [];
  let colIdx = 0;

  for (const group of groups) {
    const startCol = colIdx;
    const span = group.columns.length;

    // Determine category label
    let label: string;
    if (group.category === 'event' && group.eventName) {
      label = group.eventName;
    } else {
      label = CATEGORY_CONFIG[group.category]?.label || group.category;
    }

    categoryRow.push(label);
    for (let i = 1; i < span; i++) {
      categoryRow.push('');
    }

    // Merge if spanning multiple columns
    if (span > 1) {
      merges.push({
        s: { r: 0, c: startCol },
        e: { r: 0, c: startCol + span - 1 },
      });
    }

    colIdx += span;
  }

  // Build Row 2: Column headers
  const headerRow = columns.map((col) => col.header);

  // Build data rows
  const dataRows = rows.map((row) => {
    return columns.map((col) => {
      // For shuttle-info columns, the display value is static (from event meta)
      // but only shown when guest is attending + has shuttle
      if (col.type === 'shuttle-info' && col.eventId) {
        const attendance = row.eventAttendance[col.eventId];
        const isAttending = attendance?.attending;
        const hasShuttle = attendance?.shuttle_to_event === 'Yes';
        if (!isAttending || !hasShuttle) return '';
        return col.displayValue || '';
      }

      const value = getNestedValue(row as unknown as Record<string, unknown>, col.field);
      return formatCellValue(value, col, mealOptions);
    });
  });

  // Assemble worksheet data
  const wsData = [categoryRow, headerRow, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Apply merged cells for category row
  ws['!merges'] = merges;

  // Set column widths based on column definitions
  ws['!cols'] = columns.map((col) => ({ wch: Math.max(Math.round(col.width / 7), 10) }));

  // Create workbook and download
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Guests');

  const filename = generateFilename(brideName, groomName);
  XLSX.writeFile(wb, filename);
}
