/**
 * Export utilities for guest data
 * @feature 007-guest-crud-attendance
 * @task T037
 */

import { GuestDisplayItem, InvitationStatus, INVITATION_STATUS_CONFIG } from '@/types/guest';
import { format } from 'date-fns';

/**
 * Escape a value for CSV format
 * - Wrap in quotes if contains comma, newline, or quote
 * - Escape quotes by doubling them
 */
function escapeCSVValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Check if value needs quoting
  if (
    stringValue.includes(',') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r') ||
    stringValue.includes('"')
  ) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Export columns configuration for GuestDisplayItem
 */
const CSV_COLUMNS: { key: keyof GuestDisplayItem; header: string }[] = [
  { key: 'name', header: 'Name' },
  { key: 'guest_type', header: 'Type' },
  { key: 'invitation_status', header: 'Invitation Status' },
  { key: 'rsvp_deadline', header: 'RSVP Deadline' },
  { key: 'rsvp_received_date', header: 'RSVP Received' },
  { key: 'table_number', header: 'Table Number' },
];

/**
 * Format invitation status for display
 */
function formatInvitationStatus(status: InvitationStatus): string {
  return INVITATION_STATUS_CONFIG[status]?.label ?? status;
}

/**
 * Format a guest field value for CSV export
 */
function formatGuestValue(
  guest: GuestDisplayItem,
  key: keyof GuestDisplayItem
): string | number | boolean | null {
  const value = guest[key];

  // Format dates
  if (key === 'rsvp_deadline' || key === 'rsvp_received_date') {
    if (value) {
      return format(new Date(value as string), 'yyyy-MM-dd');
    }
    return null;
  }

  // Format invitation status
  if (key === 'invitation_status') {
    return formatInvitationStatus(value as InvitationStatus);
  }

  // Format guest type
  if (key === 'guest_type' && value) {
    const typeMap: Record<string, string> = {
      adult: 'Adult',
      child: 'Child',
      vendor: 'Vendor',
      staff: 'Staff',
    };
    return typeMap[value as string] || (value as string);
  }

  return value as string | number | boolean | null;
}

/**
 * Convert guest data to CSV string
 */
function guestsToCSV(guests: GuestDisplayItem[]): string {
  // Build header row
  const headerRow = CSV_COLUMNS.map((col) => escapeCSVValue(col.header)).join(',');

  // Build data rows
  const dataRows = guests.map((guest) => {
    return CSV_COLUMNS.map((col) => {
      const value = formatGuestValue(guest, col.key);
      return escapeCSVValue(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Generate timestamped filename for export
 */
function generateExportFilename(prefix: string, extension: string): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Export guests to a downloadable CSV file
 *
 * Creates a properly escaped CSV file with UTF-8 BOM for Excel compatibility.
 * Downloads a file named "guests_YYYY-MM-DD_HH-mm-ss.csv".
 *
 * Columns exported: Name, Type, RSVP Status, RSVP Deadline, RSVP Received, Table Number
 *
 * @param guests - Array of GuestDisplayItem objects to export (typically filtered data from the current view)
 * @example
 * // Export all visible/filtered guests to CSV
 * exportToCsv(filteredGuests);
 */
export function exportToCsv(guests: GuestDisplayItem[]): void {
  // Convert to CSV string
  const csvContent = guestsToCSV(guests);

  // Create Blob with BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });

  // Generate filename with timestamp
  const filename = generateExportFilename('guests', 'csv');

  // Use msSaveBlob for IE/Edge legacy support, otherwise use standard approach
  if (typeof (window.navigator as Navigator & { msSaveBlob?: (blob: Blob, filename: string) => boolean }).msSaveBlob !== 'undefined') {
    (window.navigator as Navigator & { msSaveBlob: (blob: Blob, filename: string) => boolean }).msSaveBlob(blob, filename);
    return;
  }

  // Create object URL
  const url = URL.createObjectURL(blob);

  // Create and configure download link
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Required for Firefox - link must be in DOM
  link.style.display = 'none';
  document.body.appendChild(link);

  // Trigger download
  link.click();

  // Cleanup - delay to ensure download starts
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export type for external use
 */
export type { GuestDisplayItem };
